import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS, INITIAL_ADMIN_EMAIL } from '../services/seedData';
import { 
  auth, 
  isFirebaseConfigured, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from '../services/firebase';
import { 
  fetchSharedServerState, 
  pushSharedServerUpdate, 
  subscribeToRealtimeSync 
} from '../services/apiService';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isFirebaseMode: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    email: string;
    pass: string;
    displayName: string;
    collegeName: string;
    department: string;
    academicYear: string;
    phoneNumber?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  usersList: UserProfile[];
  updateUserStatus: (uid: string, updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'campus_help_zone_users_v2';
const CURRENT_USER_KEY = 'campus_help_zone_current_user_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      try { 
        return JSON.parse(saved); 
      } catch (e) { /* ignore */ }
    }
    // No auto-login on new devices/browsers! Users must log in or register.
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const isFirebaseMode = isFirebaseConfigured();

  // Save current user to localStorage whenever changed
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  // Load and periodically sync users from server (cross-device & cross-deployment sync)
  useEffect(() => {
    let isMounted = true;

    // 1. Instant realtime sync from Firestore
    const unsubscribeRealtime = subscribeToRealtimeSync((type, payload) => {
      if (!isMounted || type !== 'users' || !Array.isArray(payload) || payload.length === 0) return;

      setUsers(payload);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(payload));

      setCurrentUser(curr => {
        if (!curr) return null;
        const matched = payload.find((u: UserProfile) => u.uid === curr.uid || u.email.toLowerCase() === curr.email.toLowerCase());
        return matched || curr;
      });
    });

    // 2. HTTP sync polling fallback
    const syncUsersFromServer = async () => {
      const serverState = await fetchSharedServerState();
      if (!isMounted || !serverState) return;

      if (Array.isArray(serverState.users) && serverState.users.length > 0) {
        setUsers(serverState.users);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(serverState.users));

        // If current user is logged in, ensure their latest profile details are synced
        setCurrentUser(curr => {
          if (!curr) return null;
          const matched = serverState.users.find((u: UserProfile) => u.uid === curr.uid || u.email.toLowerCase() === curr.email.toLowerCase());
          return matched || curr;
        });
      }
    };

    syncUsersFromServer();
    const interval = setInterval(syncUsersFromServer, 5000);
    return () => {
      isMounted = false;
      unsubscribeRealtime();
      clearInterval(interval);
    };
  }, []);

  // Handle Firebase Auth Listener if configured
  useEffect(() => {
    if (isFirebaseMode && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const existing = users.find(u => u.uid === fbUser.uid || u.email.toLowerCase() === (fbUser.email || '').toLowerCase());
          if (existing) {
            setCurrentUser(existing);
          } else {
            const role: UserRole = fbUser.email?.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'student';
            const newUser: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'ক্যাম্পাস শিক্ষার্থী',
              photoURL: fbUser.photoURL || undefined,
              collegeName: 'ঢাকা বিশ্ববিদ্যালয়',
              department: 'সাধারণ',
              academicYear: '১ম বর্ষ',
              role,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            const updatedList = [newUser, ...users];
            setUsers(updatedList);
            setCurrentUser(newUser);
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedList));
            pushSharedServerUpdate('users', updatedList);
          }
        } else {
          setCurrentUser(null);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [isFirebaseMode]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      if (isFirebaseMode && auth) {
        await signInWithEmailAndPassword(auth, email, pass);
        setIsLoading(false);
        return { success: true };
      }

      // Local / Cross-device database authentication
      const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!found) {
        setIsLoading(false);
        return { success: false, message: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে নিবন্ধন করুন।' };
      }
      if (found.isBanned) {
        setIsLoading(false);
        return { success: false, message: 'আপনার অ্যাকাউন্টটি এডমিন কর্তৃক নিষিদ্ধ (Banned) করা হয়েছে।' };
      }
      if (found.isSuspended) {
        setIsLoading(false);
        return { success: false, message: 'আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত (Suspended) রয়েছে।' };
      }

      setCurrentUser(found);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err?.message || 'লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' };
    }
  };

  const register = async (data: {
    email: string;
    pass: string;
    displayName: string;
    collegeName: string;
    department: string;
    academicYear: string;
    phoneNumber?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = data.email.trim().toLowerCase();
      // Admin safety rule: User CANNOT make themselves admin
      const role: UserRole = cleanEmail === INITIAL_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'student';

      if (isFirebaseMode && auth) {
        const userCred = await createUserWithEmailAndPassword(auth, data.email, data.pass);
        const newUser: UserProfile = {
          uid: userCred.user.uid,
          email: cleanEmail,
          displayName: data.displayName.trim(),
          collegeName: data.collegeName.trim(),
          department: data.department.trim(),
          academicYear: data.academicYear.trim(),
          phoneNumber: data.phoneNumber?.trim(),
          role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updatedList = [newUser, ...users];
        setUsers(updatedList);
        setCurrentUser(newUser);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedList));
        pushSharedServerUpdate('users', updatedList);
        setIsLoading(false);
        return { success: true };
      }

      // Check existing email
      const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        setIsLoading(false);
        return { success: false, message: 'এই ইমেইলটি ইতোমধ্যে নিবন্ধিত রয়েছে। অনুগ্রহ করে লগইন করুন।' };
      }

      const newUser: UserProfile = {
        uid: 'user_' + Date.now(),
        email: cleanEmail,
        displayName: data.displayName.trim(),
        collegeName: data.collegeName.trim(),
        department: data.department.trim(),
        academicYear: data.academicYear.trim(),
        phoneNumber: data.phoneNumber?.trim(),
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedList = [newUser, ...users];
      setUsers(updatedList);
      setCurrentUser(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedList));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      await pushSharedServerUpdate('users', updatedList);

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err?.message || 'নিবন্ধনে সমস্যা হয়েছে।' };
    }
  };

  const logout = async () => {
    if (isFirebaseMode && auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (isFirebaseMode && auth) {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।' };
      }
      return { success: true, message: 'পাসওয়ার্ড রিসেটের লিংকটি পাঠানো হয়েছে।' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'পাসওয়ার্ড রিসেট করা সম্ভব হয়নি।' };
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      ...data,
      // Ensure role is never overwritten by student edit
      role: currentUser.role,
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(updated);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));

    const updatedList = users.map(u => u.uid === updated.uid ? updated : u);
    setUsers(updatedList);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedList));

    // Push update to server so other devices see the changes
    await pushSharedServerUpdate('users', updatedList);
  };

  const updateUserStatus = (uid: string, updates: Partial<UserProfile>) => {
    const updatedList = users.map(u => {
      if (u.uid === uid) {
        return { ...u, ...updates, updatedAt: new Date().toISOString() };
      }
      return u;
    });
    setUsers(updatedList);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedList));

    if (currentUser?.uid === uid) {
      const updatedSelf = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };
      setCurrentUser(updatedSelf);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedSelf));
    }

    pushSharedServerUpdate('users', updatedList);
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isLoading,
        isFirebaseMode,
        login,
        register,
        logout,
        resetPassword,
        updateUserProfile,
        usersList: users,
        updateUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
