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
  switchUserRoleForDemo: (uid: string) => void;
  usersList: UserProfile[];
  updateUserStatus: (uid: string, updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'campus_help_zone_users_v1';
const CURRENT_USER_KEY = 'campus_help_zone_current_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_USERS[0]; // Default logged in as admin/founder for rich exploration
  });

  const [isLoading, setIsLoading] = useState(true);
  const isFirebaseMode = isFirebaseConfigured();

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Save current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  // Handle Firebase Auth Listener if configured
  useEffect(() => {
    if (isFirebaseMode && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const existing = users.find(u => u.uid === fbUser.uid || u.email === fbUser.email);
          if (existing) {
            setCurrentUser(existing);
          } else {
            const role: UserRole = fbUser.email === INITIAL_ADMIN_EMAIL ? 'admin' : 'student';
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
            setUsers(prev => [...prev, newUser]);
            setCurrentUser(newUser);
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

      // Local / Offline authentication simulation
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        setIsLoading(false);
        return { success: false, message: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।' };
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
      // Role safety rule: User CANNOT make themselves admin
      const role: UserRole = data.email.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'student';

      if (isFirebaseMode && auth) {
        const userCred = await createUserWithEmailAndPassword(auth, data.email, data.pass);
        const newUser: UserProfile = {
          uid: userCred.user.uid,
          email: data.email,
          displayName: data.displayName,
          collegeName: data.collegeName,
          department: data.department,
          academicYear: data.academicYear,
          phoneNumber: data.phoneNumber,
          role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        setIsLoading(false);
        return { success: true };
      }

      // Check existing email
      const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
      if (existing) {
        setIsLoading(false);
        return { success: false, message: 'এই ইমেইলটি ইতোমধ্যে নিবন্ধিত রয়েছে।' };
      }

      const newUser: UserProfile = {
        uid: 'user_' + Date.now(),
        email: data.email,
        displayName: data.displayName,
        collegeName: data.collegeName,
        department: data.department,
        academicYear: data.academicYear,
        phoneNumber: data.phoneNumber,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
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
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (isFirebaseMode && auth) {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।' };
      }
      return { success: true, message: 'পাসওয়ার্ড রিসেটের লিংকটি পাঠানো হয়েছে (সিমুলেশন)।' };
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
    setUsers(prev => prev.map(u => u.uid === updated.uid ? updated : u));
  };

  const switchUserRoleForDemo = (uid: string) => {
    const target = users.find(u => u.uid === uid);
    if (target) {
      setCurrentUser(target);
    }
  };

  const updateUserStatus = (uid: string, updates: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => {
      if (u.uid === uid) {
        const res = { ...u, ...updates, updatedAt: new Date().toISOString() };
        if (currentUser?.uid === uid) {
          setCurrentUser(res);
        }
        return res;
      }
      return u;
    }));
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin,
      isLoading,
      isFirebaseMode,
      login,
      register,
      logout,
      resetPassword,
      updateUserProfile,
      switchUserRoleForDemo,
      usersList: users,
      updateUserStatus,
    }}>
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
