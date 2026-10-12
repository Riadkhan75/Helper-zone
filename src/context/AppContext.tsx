import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  CommunityPost, 
  StudyMaterial, 
  BookListing, 
  LostFoundItem, 
  CollegeNotice, 
  NotificationItem, 
  ReportItem, 
  SiteSettings, 
  ActivityLog,
  PostComment,
  VerificationRequest,
  SavedBookmarks,
  ClassRoutineSlot,
  ExamCountdownItem,
  SavedCGPARecord,
  ChatMessage,
  ChatConversation,
  CampusGroupRoom
} from '../types';
import { 
  INITIAL_POSTS, 
  INITIAL_STUDY_MATERIALS, 
  INITIAL_BOOKS, 
  INITIAL_LOST_FOUND, 
  INITIAL_NOTICES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_REPORTS, 
  INITIAL_SETTINGS, 
  INITIAL_LOGS,
  INITIAL_COMMENTS,
  INITIAL_VERIFICATION_REQUESTS,
  INITIAL_CAMPUS_GROUPS,
  INITIAL_CHAT_CONVERSATIONS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_CLASS_ROUTINE,
  INITIAL_EXAMS,
  INITIAL_BOOKMARKS
} from '../services/seedData';
import { 
  fetchSharedServerState, 
  pushSharedServerUpdate, 
  subscribeToRealtimeSync,
  isFirebaseConfigured
} from '../services/apiService';
import { useAuth } from './AuthContext';

export type ActiveTab = 
  | 'home' 
  | 'study' 
  | 'books' 
  | 'lostfound' 
  | 'community' 
  | 'notifications' 
  | 'profile' 
  | 'admin'
  | 'academic'
  | 'leaderboard'
  | 'chat';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Site Settings & Notices
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;
  notices: CollegeNotice[];
  addNotice: (notice: Omit<CollegeNotice, 'id' | 'createdAt'>) => void;
  updateNotice: (id: string, updates: Partial<CollegeNotice>) => void;
  deleteNotice: (id: string) => void;

  // Community Posts
  posts: CommunityPost[];
  comments: Record<string, PostComment[]>;
  createPost: (post: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'commentCount'>) => void;
  updatePost: (id: string, updates: Partial<CommunityPost>) => void;
  deletePost: (id: string) => void;
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  addReply: (postId: string, commentId: string, content: string) => void;
  votePoll: (postId: string, optionId: string) => void;

  // Study Materials
  studyMaterials: StudyMaterial[];
  uploadStudyMaterial: (mat: Omit<StudyMaterial, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'isApproved'>) => void;
  approveStudyMaterial: (id: string) => void;
  rejectStudyMaterial: (id: string, reason: string) => void;
  deleteStudyMaterial: (id: string) => void;
  incrementDownload: (id: string) => void;

  // Book Listings
  books: BookListing[];
  addBookListing: (book: Omit<BookListing, 'id' | 'createdAt' | 'updatedAt' | 'isApproved'>) => void;
  updateBookStatus: (id: string, status: BookListing['status']) => void;
  deleteBookListing: (id: string) => void;

  // Lost & Found
  lostFoundItems: LostFoundItem[];
  addLostFoundItem: (item: Omit<LostFoundItem, 'id' | 'createdAt' | 'updatedAt' | 'isApproved'>) => void;
  updateLostFoundStatus: (id: string, status: LostFoundItem['status']) => void;
  deleteLostFoundItem: (id: string) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotifCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Reports
  reports: ReportItem[];
  submitReport: (report: Omit<ReportItem, 'id' | 'status' | 'createdAt'>) => void;
  resolveReport: (id: string, resolution: 'resolved' | 'dismissed') => void;

  // Activity Logs
  activityLogs: ActivityLog[];
  logAdminAction: (action: string, details: string) => void;

  // Dark Mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Student ID Verification
  verificationRequests: VerificationRequest[];
  submitVerificationRequest: (req: { studentIdNumber: string; idCardImageUrl: string }) => Promise<boolean>;
  reviewVerificationRequest: (requestId: string, status: 'verified' | 'rejected', rejectionReason?: string) => Promise<boolean>;

  // Bookmarks & Saved Items
  savedBookmarks: SavedBookmarks;
  toggleBookmark: (type: 'material' | 'post' | 'book', id: string) => void;
  isBookmarked: (type: 'material' | 'post' | 'book', id: string) => boolean;

  // Academic Tools (Routine, Exams, CGPA)
  routineSlots: ClassRoutineSlot[];
  addRoutineSlot: (slot: Omit<ClassRoutineSlot, 'id'>) => void;
  deleteRoutineSlot: (id: string) => void;
  exams: ExamCountdownItem[];
  addExam: (exam: Omit<ExamCountdownItem, 'id' | 'createdAt'>) => void;
  deleteExam: (id: string) => void;
  toggleSyllabusTopic: (examId: string, topicId: string) => void;
  savedCGPARecords: SavedCGPARecord[];
  saveCGPARecord: (record: Omit<SavedCGPARecord, 'id' | 'updatedAt'>) => void;
  deleteCGPARecord: (id: string) => void;

  // Chat & Messaging
  chatConversations: ChatConversation[];
  chatMessages: Record<string, ChatMessage[]>;
  campusGroups: CampusGroupRoom[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  openDirectChatWithUser: (targetUser: { uid: string; displayName: string; photoURL?: string; collegeName?: string; department?: string; isVerified?: boolean }, contextItem?: ChatConversation['contextItem']) => void;
  sendMessage: (conversationId: string, content: string, contextItem?: ChatMessage['contextItem']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, updateUserStatus, usersList } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('chz_theme');
    if (saved) return saved === 'dark';
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('chz_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('chz_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Persistent States initialized from localStorage or seed fallback
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('chz_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [notices, setNotices] = useState<CollegeNotice[]>(() => {
    const saved = localStorage.getItem('chz_notices');
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('chz_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [comments, setComments] = useState<Record<string, PostComment[]>>(() => {
    const saved = localStorage.getItem('chz_comments');
    if (saved) return JSON.parse(saved);
    const initialMap: Record<string, PostComment[]> = {};
    INITIAL_COMMENTS.forEach(c => {
      if (!initialMap[c.postId]) initialMap[c.postId] = [];
      initialMap[c.postId].push(c);
    });
    return initialMap;
  });

  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(() => {
    const saved = localStorage.getItem('chz_study');
    return saved ? JSON.parse(saved) : INITIAL_STUDY_MATERIALS;
  });

  const [books, setBooks] = useState<BookListing[]>(() => {
    const saved = localStorage.getItem('chz_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>(() => {
    const saved = localStorage.getItem('chz_lostfound');
    return saved ? JSON.parse(saved) : INITIAL_LOST_FOUND;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('chz_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [reports, setReports] = useState<ReportItem[]>(() => {
    const saved = localStorage.getItem('chz_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('chz_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Student ID Verification Requests
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    const saved = localStorage.getItem('chz_verifications');
    return saved ? JSON.parse(saved) : INITIAL_VERIFICATION_REQUESTS;
  });

  // Bookmarks
  const [savedBookmarks, setSavedBookmarks] = useState<SavedBookmarks>(() => {
    const saved = localStorage.getItem('chz_bookmarks');
    return saved ? JSON.parse(saved) : INITIAL_BOOKMARKS;
  });

  // Routine & Exam Countdown Tracker
  const [routineSlots, setRoutineSlots] = useState<ClassRoutineSlot[]>(() => {
    const saved = localStorage.getItem('chz_routines');
    return saved ? JSON.parse(saved) : INITIAL_CLASS_ROUTINE;
  });

  const [exams, setExams] = useState<ExamCountdownItem[]>(() => {
    const saved = localStorage.getItem('chz_exams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });

  const [savedCGPARecords, setSavedCGPARecords] = useState<SavedCGPARecord[]>(() => {
    const saved = localStorage.getItem('chz_cgpa');
    return saved ? JSON.parse(saved) : [];
  });

  // Direct & Campus Group Chat
  const [campusGroups] = useState<CampusGroupRoom[]>(INITIAL_CAMPUS_GROUPS);
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>(() => {
    const saved = localStorage.getItem('chz_chat_convos');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_CONVERSATIONS;
  });

  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('chz_chat_msgs');
    if (saved) return JSON.parse(saved);
    const initialMap: Record<string, ChatMessage[]> = {};
    INITIAL_CHAT_MESSAGES.forEach(m => {
      if (!initialMap[m.conversationId]) initialMap[m.conversationId] = [];
      initialMap[m.conversationId].push(m);
    });
    return initialMap;
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Track server version to avoid overwriting and prevent redundant state sets
  const lastServerTimestampRef = useRef<string>('');
  const isInitialLoadDoneRef = useRef<boolean>(false);

  // Cross-Tab Instant Sync via Window Storage Events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        const val = JSON.parse(e.newValue);
        if (e.key === 'chz_posts' && Array.isArray(val)) setPosts(val);
        else if (e.key === 'chz_notices' && Array.isArray(val)) setNotices(val);
        else if (e.key === 'chz_books' && Array.isArray(val)) setBooks(val);
        else if (e.key === 'chz_study' && Array.isArray(val)) setStudyMaterials(val);
        else if (e.key === 'chz_lostfound' && Array.isArray(val)) setLostFoundItems(val);
        else if (e.key === 'chz_settings' && typeof val === 'object') setSettings(val);
        else if (e.key === 'chz_comments' && typeof val === 'object') setComments(val);
        else if (e.key === 'chz_notifs' && Array.isArray(val)) setNotifications(val);
        else if (e.key === 'chz_verifications' && Array.isArray(val)) setVerificationRequests(val);
        else if (e.key === 'chz_chat_convos' && Array.isArray(val)) setChatConversations(val);
        else if (e.key === 'chz_chat_msgs' && typeof val === 'object') setChatMessages(val);
        else if (e.key === 'chz_routines' && Array.isArray(val)) setRoutineSlots(val);
        else if (e.key === 'chz_exams' && Array.isArray(val)) setExams(val);
        else if (e.key === 'chz_bookmarks' && typeof val === 'object') setSavedBookmarks(val);
        else if (e.key === 'chz_cgpa' && Array.isArray(val)) setSavedCGPARecords(val);
      } catch {
        /* ignore */
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Multi-tier Auto Live Sync: BroadcastChannel + Server-Sent Events (SSE) + Firestore + Active Polling
  useEffect(() => {
    let isMounted = true;

    // Helper: Only mutate React state and localStorage if data has genuinely changed
    // This stops infinite loops, unwanted auto-changes, and continuous re-renders
    const applyIfChanged = (key: string, payload: any, setter: (val: any) => void) => {
      if (!isMounted || payload === undefined) return;
      try {
        const serialized = JSON.stringify(payload);
        const existing = localStorage.getItem(key);
        if (existing !== serialized) {
          setter(payload);
          localStorage.setItem(key, serialized);
        }
      } catch {
        setter(payload);
      }
    };

    // 1. Subscribe to Real-time cloud & local sync (instant sub-second updates across all tabs & devices)
    const unsubscribeRealtime = subscribeToRealtimeSync((type, payload) => {
      if (!isMounted || payload === undefined) return;

      if (type === 'settings' && typeof payload === 'object') {
        applyIfChanged('chz_settings', payload, setSettings);
      } else if (type === 'notices' && Array.isArray(payload)) {
        applyIfChanged('chz_notices', payload, setNotices);
      } else if (type === 'posts' && Array.isArray(payload)) {
        applyIfChanged('chz_posts', payload, setPosts);
      } else if (type === 'comments' && typeof payload === 'object') {
        applyIfChanged('chz_comments', payload, setComments);
      } else if (type === 'studyMaterials' && Array.isArray(payload)) {
        applyIfChanged('chz_study', payload, setStudyMaterials);
      } else if (type === 'books' && Array.isArray(payload)) {
        applyIfChanged('chz_books', payload, setBooks);
      } else if (type === 'lostFoundItems' && Array.isArray(payload)) {
        applyIfChanged('chz_lostfound', payload, setLostFoundItems);
      } else if (type === 'notifications' && Array.isArray(payload)) {
        applyIfChanged('chz_notifs', payload, setNotifications);
      } else if (type === 'reports' && Array.isArray(payload)) {
        applyIfChanged('chz_reports', payload, setReports);
      } else if (type === 'activityLogs' && Array.isArray(payload)) {
        applyIfChanged('chz_logs', payload, setActivityLogs);
      } else if (type === 'verifications' && Array.isArray(payload)) {
        applyIfChanged('chz_verifications', payload, setVerificationRequests);
      } else if (type === 'chatConversations' && Array.isArray(payload)) {
        applyIfChanged('chz_chat_convos', payload, setChatConversations);
      } else if (type === 'chatMessages' && typeof payload === 'object') {
        applyIfChanged('chz_chat_msgs', payload, setChatMessages);
      } else if (type === 'routines' && Array.isArray(payload)) {
        applyIfChanged('chz_routines', payload, setRoutineSlots);
      } else if (type === 'exams' && Array.isArray(payload)) {
        applyIfChanged('chz_exams', payload, setExams);
      } else if (type === 'bookmarks' && typeof payload === 'object') {
        applyIfChanged('chz_bookmarks', payload, setSavedBookmarks);
      } else if (type === 'cgpa' && Array.isArray(payload)) {
        applyIfChanged('chz_cgpa', payload, setSavedCGPARecords);
      }
    });

    // 2. HTTP Sync Bridge: fetches initial consolidated state once on mount & on window focus
    const syncFromServer = async () => {
      const serverState = await fetchSharedServerState();
      if (!serverState || !isMounted) return;

      const serverTimestamp = serverState.updatedAt || '';
      if (!isInitialLoadDoneRef.current || (serverTimestamp && serverTimestamp !== lastServerTimestampRef.current)) {
        lastServerTimestampRef.current = serverTimestamp;

        if (serverState.settings) applyIfChanged('chz_settings', serverState.settings, setSettings);
        if (Array.isArray(serverState.notices)) applyIfChanged('chz_notices', serverState.notices, setNotices);
        if (Array.isArray(serverState.posts)) applyIfChanged('chz_posts', serverState.posts, setPosts);
        if (serverState.comments && typeof serverState.comments === 'object') applyIfChanged('chz_comments', serverState.comments, setComments);
        if (Array.isArray(serverState.studyMaterials)) applyIfChanged('chz_study', serverState.studyMaterials, setStudyMaterials);
        if (Array.isArray(serverState.books)) applyIfChanged('chz_books', serverState.books, setBooks);
        if (Array.isArray(serverState.lostFoundItems)) applyIfChanged('chz_lostfound', serverState.lostFoundItems, setLostFoundItems);
        if (Array.isArray(serverState.notifications)) applyIfChanged('chz_notifs', serverState.notifications, setNotifications);
        if (Array.isArray(serverState.reports)) applyIfChanged('chz_reports', serverState.reports, setReports);
        if (Array.isArray(serverState.activityLogs)) applyIfChanged('chz_logs', serverState.activityLogs, setActivityLogs);
        if (Array.isArray((serverState as any).verifications)) applyIfChanged('chz_verifications', (serverState as any).verifications, setVerificationRequests);
        if (Array.isArray((serverState as any).chatConversations)) applyIfChanged('chz_chat_convos', (serverState as any).chatConversations, setChatConversations);
        if ((serverState as any).chatMessages && typeof (serverState as any).chatMessages === 'object') applyIfChanged('chz_chat_msgs', (serverState as any).chatMessages, setChatMessages);
        if (Array.isArray((serverState as any).routines)) applyIfChanged('chz_routines', (serverState as any).routines, setRoutineSlots);
        if (Array.isArray((serverState as any).exams)) applyIfChanged('chz_exams', (serverState as any).exams, setExams);
        if ((serverState as any).bookmarks && typeof (serverState as any).bookmarks === 'object') applyIfChanged('chz_bookmarks', (serverState as any).bookmarks, setSavedBookmarks);
        if (Array.isArray((serverState as any).cgpa)) applyIfChanged('chz_cgpa', (serverState as any).cgpa, setSavedCGPARecords);

        isInitialLoadDoneRef.current = true;
      }
    };

    // Initial load
    syncFromServer();

    // Gentle window focus refresh when tab becomes active
    window.addEventListener('focus', syncFromServer);

    return () => {
      isMounted = false;
      unsubscribeRealtime();
      window.removeEventListener('focus', syncFromServer);
    };
  }, []);

  // Toast Helpers
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const logAdminAction = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      adminEmail: currentUser?.email || 'admin@campushelp.zone',
      action,
      details,
      timestamp: new Date().toLocaleString('bn-BD', { hour12: true }),
    };
    const updated = [newLog, ...activityLogs];
    setActivityLogs(updated);
    localStorage.setItem('chz_logs', JSON.stringify(updated));
    pushSharedServerUpdate('activityLogs', updated);
  };

  // Settings
  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<boolean> => {
    const updated = { ...settings, ...newSettings };
    const success = await pushSharedServerUpdate('settings', updated);
    if (!success && isFirebaseConfigured()) {
      addToast('সার্ভারে সেটিংস আপডেট ব্যর্থ হয়েছে। অনুগ্রহ করে ইন্টারনেট ও অনুমতি চেক করুন।', 'error');
      return false;
    }
    setSettings(updated);
    localStorage.setItem('chz_settings', JSON.stringify(updated));
    logAdminAction('Site Settings Updated', 'ওয়েবসাইট কনফিগারেশন ক্লাউডে আপডেট করা হয়েছে');
    addToast('ওয়েবসাইট সেটিংস সফলভাবে ক্লাউডে সংরক্ষিত হয়েছে।', 'success');
    return true;
  };

  // Notices
  const addNotice = (notice: Omit<CollegeNotice, 'id' | 'createdAt'>) => {
    const newNotice: CollegeNotice = {
      ...notice,
      id: 'notice_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updatedNotices = [newNotice, ...notices];
    setNotices(updatedNotices);
    localStorage.setItem('chz_notices', JSON.stringify(updatedNotices));
    pushSharedServerUpdate('notices', updatedNotices);

    logAdminAction('Notice Created', `নতুন নোটিশ: ${notice.title}`);
    addToast('নতুন কলেজ নোটিশ প্রকাশিত হয়েছে।', 'success');

    // Broadcast notification to students
    const broadcastNotif: NotificationItem = {
      id: 'notif_' + Date.now(),
      userId: 'all',
      title: 'নতুন জরুরি কলেজ নোটিশ',
      message: notice.title,
      type: 'announcement',
      linkTab: 'home',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    const updatedNotifs = [broadcastNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('chz_notifs', JSON.stringify(updatedNotifs));
    pushSharedServerUpdate('notifications', updatedNotifs);
  };

  const updateNotice = (id: string, updates: Partial<CollegeNotice>) => {
    const updated = notices.map(n => n.id === id ? { ...n, ...updates } : n);
    setNotices(updated);
    localStorage.setItem('chz_notices', JSON.stringify(updated));
    pushSharedServerUpdate('notices', updated);
    logAdminAction('Notice Updated', `আইডি: ${id}`);
    addToast('নোটিশ আপডেট করা হয়েছে।', 'success');
  };

  const deleteNotice = (id: string) => {
    const updated = notices.filter(n => n.id !== id);
    setNotices(updated);
    localStorage.setItem('chz_notices', JSON.stringify(updated));
    pushSharedServerUpdate('notices', updated);
    logAdminAction('Notice Deleted', `নোটিশ মোছা হয়েছে: ${id}`);
    addToast('নোটিশ মুছে ফেলা হয়েছে।', 'info');
  };

  // Community Posts
  const createPost = (post: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'commentCount'>) => {
    const newPost: CommunityPost = {
      ...post,
      id: 'post_' + Date.now(),
      likes: [],
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('chz_posts', JSON.stringify(updatedPosts));
    pushSharedServerUpdate('posts', updatedPosts);
    addToast('কমিউনিটিতে পোস্ট সফলভাবে প্রকাশিত হয়েছে।', 'success');
  };

  const updatePost = (id: string, updates: Partial<CommunityPost>) => {
    const updated = posts.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
    setPosts(updated);
    localStorage.setItem('chz_posts', JSON.stringify(updated));
    pushSharedServerUpdate('posts', updated);
    addToast('পোস্ট আপডেট করা হয়েছে।', 'success');
  };

  const deletePost = (id: string) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    localStorage.setItem('chz_posts', JSON.stringify(updated));
    pushSharedServerUpdate('posts', updated);
    if (isAdmin) {
      logAdminAction('Post Deleted', `পোস্ট রিমুভ করা হয়েছে: ${id}`);
    }
    addToast('পোস্টটি মুছে ফেলা হয়েছে।', 'info');
  };

  const toggleLikePost = (postId: string) => {
    if (!currentUser) {
      addToast('লাইক দিতে অনুগ্রহ করে লগইন করুন।', 'error');
      return;
    }
    const updated = posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(currentUser.uid);
        const nextLikes = isLiked 
          ? post.likes.filter(uid => uid !== currentUser.uid)
          : [...post.likes, currentUser.uid];
        return { ...post, likes: nextLikes };
      }
      return post;
    });
    setPosts(updated);
    localStorage.setItem('chz_posts', JSON.stringify(updated));
    pushSharedServerUpdate('posts', updated);
  };

  const addComment = (postId: string, content: string) => {
    if (!currentUser) {
      addToast('মন্তব্য করতে অনুগ্রহ করে লগইন করুন।', 'error');
      return;
    }
    const newComment: PostComment = {
      id: 'comm_' + Date.now(),
      postId,
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorAvatar: currentUser.photoURL,
      content,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    const currentList = comments[postId] ? [...comments[postId], newComment] : [newComment];
    const updatedComments = { ...comments, [postId]: currentList };
    setComments(updatedComments);
    localStorage.setItem('chz_comments', JSON.stringify(updatedComments));
    pushSharedServerUpdate('comments', updatedComments);

    const updatedPosts = posts.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p);
    setPosts(updatedPosts);
    localStorage.setItem('chz_posts', JSON.stringify(updatedPosts));
    pushSharedServerUpdate('posts', updatedPosts);

    addToast('মন্তব্য যুক্ত হয়েছে।', 'success');

    // Notify author if not commenting on own post
    const post = posts.find(p => p.id === postId);
    if (post && post.authorId !== currentUser.uid) {
      const notif: NotificationItem = {
        id: 'notif_' + Date.now(),
        userId: post.authorId,
        title: 'আপনার পোস্টে নতুন মন্তব্য',
        message: `${currentUser.displayName} আপনার পোস্টে মন্তব্য করেছেন: "${content.substring(0, 30)}..."`,
        type: 'comment',
        linkTab: 'community',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      const updatedNotifs = [notif, ...notifications];
      setNotifications(updatedNotifs);
      localStorage.setItem('chz_notifs', JSON.stringify(updatedNotifs));
      pushSharedServerUpdate('notifications', updatedNotifs);
    }
  };

  const addReply = (postId: string, commentId: string, content: string) => {
    if (!currentUser) {
      addToast('রিপ্লাই করতে অনুগ্রহ করে লগইন করুন।', 'error');
      return;
    }
    const newReply = {
      id: 'rep_' + Date.now(),
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorAvatar: currentUser.photoURL,
      content,
      createdAt: new Date().toISOString(),
    };

    const currentPostComments = comments[postId] || [];
    const updatedList = currentPostComments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReply],
        };
      }
      return c;
    });

    const updatedComments = { ...comments, [postId]: updatedList };
    setComments(updatedComments);
    localStorage.setItem('chz_comments', JSON.stringify(updatedComments));
    pushSharedServerUpdate('comments', updatedComments);

    const updatedPosts = posts.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p);
    setPosts(updatedPosts);
    localStorage.setItem('chz_posts', JSON.stringify(updatedPosts));
    pushSharedServerUpdate('posts', updatedPosts);

    addToast('রিপ্লাই যুক্ত হয়েছে।', 'success');
  };

  const votePoll = (postId: string, optionId: string) => {
    if (!currentUser) {
      addToast('ভোট দিতে অনুগ্রহ করে লগইন করুন।', 'error');
      return;
    }
    const updated = posts.map(post => {
      if (post.id === postId && post.poll) {
        const hasVoted = post.poll.options.some(opt => opt.votes.includes(currentUser.uid));
        if (hasVoted) {
          addToast('আপনি ইতোমধ্যে এই পোলে ভোট দিয়েছেন।', 'info');
          return post;
        }
        const updatedOptions = post.poll.options.map(opt => {
          if (opt.id === optionId) {
            return { ...opt, votes: [...opt.votes, currentUser.uid] };
          }
          return opt;
        });
        return {
          ...post,
          poll: {
            ...post.poll,
            options: updatedOptions,
          },
        };
      }
      return post;
    });
    setPosts(updated);
    localStorage.setItem('chz_posts', JSON.stringify(updated));
    pushSharedServerUpdate('posts', updated);
    addToast('ভোট সফলভাবে গণনা করা হয়েছে!', 'success');
  };

  // Study Materials
  const uploadStudyMaterial = (mat: Omit<StudyMaterial, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'isApproved'>) => {
    // Admin uploads are auto-approved; students require admin moderation
    const isApproved = isAdmin;
    const newMaterial: StudyMaterial = {
      ...mat,
      id: 'study_' + Date.now(),
      downloadCount: 0,
      isApproved,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newMaterial, ...studyMaterials];
    setStudyMaterials(updated);
    localStorage.setItem('chz_study', JSON.stringify(updated));
    pushSharedServerUpdate('studyMaterials', updated);

    if (isApproved) {
      addToast('স্টাডি মেটেরিয়াল সফলভাবে পাবলিক করা হয়েছে!', 'success');
    } else {
      addToast('ফাইল আপলোড সফল হয়েছে। এডমিন পর্যালোচনার পর এটি সক্রিয় হবে।', 'info');
    }
  };

  const approveStudyMaterial = (id: string) => {
    let approvedTitle = '';
    let targetUploaderId = '';

    const updated = studyMaterials.map(m => {
      if (m.id === id) {
        approvedTitle = m.title;
        targetUploaderId = m.uploaderId;
        return { ...m, isApproved: true, updatedAt: new Date().toISOString() };
      }
      return m;
    });

    setStudyMaterials(updated);
    localStorage.setItem('chz_study', JSON.stringify(updated));
    pushSharedServerUpdate('studyMaterials', updated);

    logAdminAction('Material Approved', `আইডি: ${id} (${approvedTitle})`);
    addToast('স্টাডি মেটেরিয়াল অনুমোদিত হয়েছে।', 'success');

    // Notify uploader
    if (targetUploaderId) {
      const notif: NotificationItem = {
        id: 'notif_' + Date.now(),
        userId: targetUploaderId,
        title: 'ফাইল অনুমোদিত হয়েছে! 🎉',
        message: `আপনার আপলোডকৃত "${approvedTitle}" ফাইলটি এডমিন কর্তৃক অনুমোদিত ও সবার জন্য উন্মুক্ত করা হয়েছে।`,
        type: 'approval',
        linkTab: 'study',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      const updatedNotifs = [notif, ...notifications];
      setNotifications(updatedNotifs);
      localStorage.setItem('chz_notifs', JSON.stringify(updatedNotifs));
      pushSharedServerUpdate('notifications', updatedNotifs);
    }
  };

  const rejectStudyMaterial = (id: string, reason: string) => {
    const item = studyMaterials.find(m => m.id === id);
    const updated = studyMaterials.filter(m => m.id !== id);
    setStudyMaterials(updated);
    localStorage.setItem('chz_study', JSON.stringify(updated));
    pushSharedServerUpdate('studyMaterials', updated);

    logAdminAction('Material Rejected', `আইডি: ${id}, কারণ: ${reason}`);
    addToast('স্টাডি মেটেরিয়াল বাতিল করা হয়েছে।', 'info');

    if (item) {
      const notif: NotificationItem = {
        id: 'notif_' + Date.now(),
        userId: item.uploaderId,
        title: 'ফাইল অনুমোদন বাতিল',
        message: `আপনার আপলোডকৃত "${item.title}" ফাইলটি নীতিমালার পরিপন্থী হওয়ায় বাতিল করা হয়েছে। কারণ: ${reason}`,
        type: 'rejection',
        linkTab: 'study',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      const updatedNotifs = [notif, ...notifications];
      setNotifications(updatedNotifs);
      localStorage.setItem('chz_notifs', JSON.stringify(updatedNotifs));
      pushSharedServerUpdate('notifications', updatedNotifs);
    }
  };

  const deleteStudyMaterial = (id: string) => {
    const updated = studyMaterials.filter(m => m.id !== id);
    setStudyMaterials(updated);
    localStorage.setItem('chz_study', JSON.stringify(updated));
    pushSharedServerUpdate('studyMaterials', updated);
    if (isAdmin) {
      logAdminAction('Material Deleted', `আইডি: ${id}`);
    }
    addToast('স্টাডি মেটেরিয়াল মুছে ফেলা হয়েছে।', 'info');
  };

  const incrementDownload = (id: string) => {
    const updated = studyMaterials.map(m => m.id === id ? { ...m, downloadCount: m.downloadCount + 1 } : m);
    setStudyMaterials(updated);
    localStorage.setItem('chz_study', JSON.stringify(updated));
    pushSharedServerUpdate('studyMaterials', updated);
  };

  // Books
  const addBookListing = (book: Omit<BookListing, 'id' | 'createdAt' | 'updatedAt' | 'isApproved'>) => {
    const newBook: BookListing = {
      ...book,
      id: 'book_' + Date.now(),
      isApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newBook, ...books];
    setBooks(updated);
    localStorage.setItem('chz_books', JSON.stringify(updated));
    pushSharedServerUpdate('books', updated);
    addToast('বইয়ের লিস্টিং সফলভাবে যুক্ত হয়েছে!', 'success');
  };

  const updateBookStatus = (id: string, status: BookListing['status']) => {
    const updated = books.map(b => b.id === id ? { ...b, status, updatedAt: new Date().toISOString() } : b);
    setBooks(updated);
    localStorage.setItem('chz_books', JSON.stringify(updated));
    pushSharedServerUpdate('books', updated);
    addToast(`বইয়ের স্ট্যাটাস পরিবর্তিত হয়েছে: ${status}`, 'success');
  };

  const deleteBookListing = (id: string) => {
    const updated = books.filter(b => b.id !== id);
    setBooks(updated);
    localStorage.setItem('chz_books', JSON.stringify(updated));
    pushSharedServerUpdate('books', updated);
    if (isAdmin) {
      logAdminAction('Book Listing Deleted', `বই রিমুভ করা হয়েছে: ${id}`);
    }
    addToast('বইয়ের লিস্টিং মুছে ফেলা হয়েছে।', 'info');
  };

  // Lost & Found
  const addLostFoundItem = (item: Omit<LostFoundItem, 'id' | 'createdAt' | 'updatedAt' | 'isApproved'>) => {
    const newItem: LostFoundItem = {
      ...item,
      id: 'lf_' + Date.now(),
      isApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newItem, ...lostFoundItems];
    setLostFoundItems(updated);
    localStorage.setItem('chz_lostfound', JSON.stringify(updated));
    pushSharedServerUpdate('lostFoundItems', updated);
    addToast('লস্ট অ্যান্ড ফাউন্ড পোস্ট যুক্ত হয়েছে!', 'success');
  };

  const updateLostFoundStatus = (id: string, status: LostFoundItem['status']) => {
    const updated = lostFoundItems.map(item => item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item);
    setLostFoundItems(updated);
    localStorage.setItem('chz_lostfound', JSON.stringify(updated));
    pushSharedServerUpdate('lostFoundItems', updated);
    addToast('আইটেমের স্ট্যাটাস আপডেট হয়েছে!', 'success');
  };

  const deleteLostFoundItem = (id: string) => {
    const updated = lostFoundItems.filter(item => item.id !== id);
    setLostFoundItems(updated);
    localStorage.setItem('chz_lostfound', JSON.stringify(updated));
    pushSharedServerUpdate('lostFoundItems', updated);
    if (isAdmin) {
      logAdminAction('Lost & Found Deleted', `আইটেম রিমুভ: ${id}`);
    }
    addToast('আইটেম মুছে ফেলা হয়েছে।', 'info');
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    localStorage.setItem('chz_notifs', JSON.stringify(updated));
    pushSharedServerUpdate('notifications', updated);
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem('chz_notifs', JSON.stringify(updated));
    pushSharedServerUpdate('notifications', updated);
    addToast('সকল নোটিফিকেশন পড়া হয়েছে।', 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('chz_notifs', JSON.stringify([]));
    pushSharedServerUpdate('notifications', []);
    addToast('নোটিফিকেশন তালিকা পরিষ্কার করা হয়েছে।', 'info');
  };

  // Reports
  const submitReport = (report: Omit<ReportItem, 'id' | 'status' | 'createdAt'>) => {
    const newReport: ReportItem = {
      ...report,
      id: 'rep_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const updated = [newReport, ...reports];
    setReports(updated);
    localStorage.setItem('chz_reports', JSON.stringify(updated));
    pushSharedServerUpdate('reports', updated);
    addToast('আপনার অভিযোগটি জমা হয়েছে। এডমিন দ্রুত পর্যালোচনা করবেন।', 'success');
  };

  const resolveReport = (id: string, resolution: 'resolved' | 'dismissed') => {
    const updated = reports.map(r => r.id === id ? { ...r, status: resolution } : r);
    setReports(updated);
    localStorage.setItem('chz_reports', JSON.stringify(updated));
    pushSharedServerUpdate('reports', updated);
    logAdminAction('Report Handled', `রিপোর্ট আইডি ${id} স্ট্যাটাস: ${resolution}`);
    addToast(`রিপোর্ট সফলভাবে ${resolution === 'resolved' ? 'নিষ্পত্তি' : 'খারিজ'} করা হয়েছে।`, 'info');
  };

  // Student ID Verification submission
  const submitVerificationRequest = async (req: { studentIdNumber: string; idCardImageUrl: string }): Promise<boolean> => {
    if (!currentUser) {
      addToast('ভেরিফিকেশন সাবমিট করতে লগইন আবশ্যক।', 'error');
      return false;
    }
    const newReq: VerificationRequest = {
      id: 'verif_' + Date.now(),
      userId: currentUser.uid,
      userName: currentUser.displayName,
      userEmail: currentUser.email,
      userCollege: currentUser.collegeName,
      userDepartment: currentUser.department,
      academicYear: currentUser.academicYear,
      studentIdNumber: req.studentIdNumber.trim(),
      idCardImageUrl: req.idCardImageUrl,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    const updated = [newReq, ...verificationRequests.filter(r => r.userId !== currentUser.uid)];
    setVerificationRequests(updated);
    localStorage.setItem('chz_verifications', JSON.stringify(updated));
    pushSharedServerUpdate('verifications', updated);

    // Update current user profile status to pending
    updateUserStatus(currentUser.uid, {
      verificationStatus: 'pending',
      studentIdNumber: req.studentIdNumber.trim(),
      idCardImageUrl: req.idCardImageUrl,
      verificationSubmittedAt: new Date().toISOString(),
    });

    addToast('আপনার স্টুডেন্ট আইডি সাবমিট সম্পন্ন হয়েছে! এডমিন রিভিউ শেষে ব্লু-টিক প্রদান করা হবে।', 'success');
    return true;
  };

  // Review Verification Request (Admin)
  const reviewVerificationRequest = async (requestId: string, status: 'verified' | 'rejected', rejectionReason?: string): Promise<boolean> => {
    const target = verificationRequests.find(r => r.id === requestId);
    if (!target) return false;

    const updated = verificationRequests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          rejectionReason: status === 'rejected' ? rejectionReason : undefined,
          reviewedAt: new Date().toISOString(),
        };
      }
      return r;
    });

    setVerificationRequests(updated);
    localStorage.setItem('chz_verifications', JSON.stringify(updated));
    pushSharedServerUpdate('verifications', updated);

    // Update target user
    updateUserStatus(target.userId, {
      verificationStatus: status,
      verificationReviewedAt: new Date().toISOString(),
      verificationRejectionReason: status === 'rejected' ? rejectionReason : undefined,
      points: status === 'verified' ? (usersList.find(u => u.uid === target.userId)?.points || 0) + 100 : undefined
    });

    // Notify user
    const notifMessage = status === 'verified'
      ? 'অভিনন্দন! আপনার স্টুডেন্ট আইডি সফলভাবে ভেরিফাইড হয়েছে এবং প্রোফাইলে ব্লু-টিক ব্যাজ যুক্ত করা হয়েছে।'
      : `আপনার স্টুডেন্ট আইডি ভেরিফিকেশন প্রত্যাখ্যাত হয়েছে। কারণ: ${rejectionReason || 'তথ্য বা ছবির অস্পষ্টতা'}`;

    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now(),
      userId: target.userId,
      title: status === 'verified' ? 'ব্লু-টিক ভেরিফিকেশন সফল! 🎓' : 'আইডি ভেরিফিকেশন আপডেট',
      message: notifMessage,
      type: status === 'verified' ? 'approval' : 'rejection',
      linkTab: 'profile',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('chz_notifs', JSON.stringify(updatedNotifs));
    pushSharedServerUpdate('notifications', updatedNotifs);

    logAdminAction(
      `ID Verification ${status === 'verified' ? 'Approved' : 'Rejected'}`,
      `শিক্ষার্থী: ${target.userName} (${target.studentIdNumber})`
    );

    addToast(
      status === 'verified' ? `${target.userName}-কে ভেরিফাইড ব্লু-টিক ব্যাজ দেওয়া হয়েছে!` : 'ভেরিফিকেশন প্রত্যাখ্যাত হয়েছে।',
      'success'
    );
    return true;
  };

  // Bookmarks
  const toggleBookmark = (type: 'material' | 'post' | 'book', id: string) => {
    const key = type === 'material' ? 'materialIds' : type === 'post' ? 'postIds' : 'bookIds';
    const list = savedBookmarks[key] || [];
    const isSaved = list.includes(id);
    const updatedList = isSaved ? list.filter(item => item !== id) : [...list, id];
    const updated = {
      ...savedBookmarks,
      [key]: updatedList,
    };
    setSavedBookmarks(updated);
    localStorage.setItem('chz_bookmarks', JSON.stringify(updated));
    pushSharedServerUpdate('bookmarks', updated);
    addToast(isSaved ? 'বুকমার্ক থেকে সরানো হয়েছে।' : 'সংরক্ষিত তালিকায় যুক্ত হয়েছে!', 'info');
  };

  const isBookmarked = (type: 'material' | 'post' | 'book', id: string) => {
    const key = type === 'material' ? 'materialIds' : type === 'post' ? 'postIds' : 'bookIds';
    return (savedBookmarks[key] || []).includes(id);
  };

  // Academic Routines
  const addRoutineSlot = (slot: Omit<ClassRoutineSlot, 'id'>) => {
    const newSlot: ClassRoutineSlot = {
      ...slot,
      id: 'routine_' + Date.now(),
    };
    const updated = [...routineSlots, newSlot];
    setRoutineSlots(updated);
    localStorage.setItem('chz_routines', JSON.stringify(updated));
    pushSharedServerUpdate('routines', updated);
    addToast('ক্লাস রুটিনে নতুন শিডিউল যোগ হয়েছে!', 'success');
  };

  const deleteRoutineSlot = (id: string) => {
    const updated = routineSlots.filter(s => s.id !== id);
    setRoutineSlots(updated);
    localStorage.setItem('chz_routines', JSON.stringify(updated));
    pushSharedServerUpdate('routines', updated);
    addToast('ক্লাস শিডিউল মুছে ফেলা হয়েছে।', 'info');
  };

  // Exams Tracker
  const addExam = (exam: Omit<ExamCountdownItem, 'id' | 'createdAt'>) => {
    const newExam: ExamCountdownItem = {
      ...exam,
      id: 'exam_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newExam, ...exams];
    setExams(updated);
    localStorage.setItem('chz_exams', JSON.stringify(updated));
    pushSharedServerUpdate('exams', updated);
    addToast('নতুন পরীক্ষার কাউন্টডাউন যোগ হয়েছে!', 'success');
  };

  const deleteExam = (id: string) => {
    const updated = exams.filter(e => e.id !== id);
    setExams(updated);
    localStorage.setItem('chz_exams', JSON.stringify(updated));
    pushSharedServerUpdate('exams', updated);
    addToast('পরীক্ষা মুছে ফেলা হয়েছে।', 'info');
  };

  const toggleSyllabusTopic = (examId: string, topicId: string) => {
    const updated = exams.map(e => {
      if (e.id === examId) {
        return {
          ...e,
          syllabusTopics: e.syllabusTopics.map(t => t.id === topicId ? { ...t, isCompleted: !t.isCompleted } : t)
        };
      }
      return e;
    });
    setExams(updated);
    localStorage.setItem('chz_exams', JSON.stringify(updated));
    pushSharedServerUpdate('exams', updated);
  };

  // CGPA Records
  const saveCGPARecord = (record: Omit<SavedCGPARecord, 'id' | 'updatedAt'>) => {
    const newRecord: SavedCGPARecord = {
      ...record,
      id: 'cgpa_' + Date.now(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...savedCGPARecords];
    setSavedCGPARecords(updated);
    localStorage.setItem('chz_cgpa', JSON.stringify(updated));
    pushSharedServerUpdate('cgpa', updated);
    addToast('CGPA হিসাব সফলভাবে সেভ করা হয়েছে!', 'success');
  };

  const deleteCGPARecord = (id: string) => {
    const updated = savedCGPARecords.filter(r => r.id !== id);
    setSavedCGPARecords(updated);
    localStorage.setItem('chz_cgpa', JSON.stringify(updated));
    pushSharedServerUpdate('cgpa', updated);
    addToast('CGPA রেকর্ড মোছা হয়েছে।', 'info');
  };

  // Chat & Messaging
  const openDirectChatWithUser = (
    targetUser: { uid: string; displayName: string; photoURL?: string; collegeName?: string; department?: string; isVerified?: boolean },
    contextItem?: ChatConversation['contextItem']
  ) => {
    if (!currentUser) {
      addToast('চ্যাট করতে অনুগ্রহ করে লগইন করুন।', 'error');
      return;
    }
    if (currentUser.uid === targetUser.uid) {
      addToast('নিজের সাথে চ্যাট করা সম্ভব নয়।', 'info');
      return;
    }

    let existingConvo = chatConversations.find(c => 
      c.participantIds.includes(currentUser.uid) && c.participantIds.includes(targetUser.uid)
    );

    if (!existingConvo) {
      const newConvoId = `dm_${[currentUser.uid, targetUser.uid].sort().join('_')}`;
      existingConvo = {
        id: newConvoId,
        participantIds: [currentUser.uid, targetUser.uid],
        participants: [
          {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            collegeName: currentUser.collegeName,
            department: currentUser.department,
            isVerified: currentUser.verificationStatus === 'verified',
          },
          targetUser,
        ],
        lastMessage: contextItem ? `বই/নোট: ${contextItem.title}` : 'নতুন বার্তা শুরু হয়েছে',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        contextItem,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedConvos = [existingConvo, ...chatConversations];
      setChatConversations(updatedConvos);
      localStorage.setItem('chz_chat_convos', JSON.stringify(updatedConvos));
      pushSharedServerUpdate('chatConversations', updatedConvos);
    } else if (contextItem && !existingConvo.contextItem) {
      const updatedConvos = chatConversations.map(c => c.id === existingConvo!.id ? { ...c, contextItem } : c);
      setChatConversations(updatedConvos);
      localStorage.setItem('chz_chat_convos', JSON.stringify(updatedConvos));
      pushSharedServerUpdate('chatConversations', updatedConvos);
    }

    setActiveChatId(existingConvo.id);
    setActiveTab('chat');
  };

  const sendMessage = (conversationId: string, content: string, contextItem?: ChatMessage['contextItem']) => {
    if (!currentUser || !content.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      conversationId,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      senderAvatar: currentUser.photoURL,
      senderCollege: currentUser.collegeName,
      senderIsVerified: currentUser.verificationStatus === 'verified',
      content: content.trim(),
      contextItem,
      createdAt: new Date().toISOString(),
    };

    const currentMsgList = chatMessages[conversationId] || [];
    const updatedMsgList = [...currentMsgList, newMsg];
    const updatedMessagesMap = {
      ...chatMessages,
      [conversationId]: updatedMsgList,
    };

    setChatMessages(updatedMessagesMap);
    localStorage.setItem('chz_chat_msgs', JSON.stringify(updatedMessagesMap));
    pushSharedServerUpdate('chatMessages', updatedMessagesMap);

    // Update conversation last message
    const updatedConvos = chatConversations.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: content.trim(),
          lastMessageTime: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    setChatConversations(updatedConvos);
    localStorage.setItem('chz_chat_convos', JSON.stringify(updatedConvos));
    pushSharedServerUpdate('chatConversations', updatedConvos);
  };

  const unreadNotifCount = notifications.filter(n => !n.isRead && (n.userId === 'all' || n.userId === currentUser?.uid)).length;

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        toasts,
        addToast,
        removeToast,
        settings,
        updateSettings,
        notices,
        addNotice,
        updateNotice,
        deleteNotice,
        posts,
        comments,
        createPost,
        updatePost,
        deletePost,
        toggleLikePost,
        addComment,
        addReply,
        votePoll,
        studyMaterials,
        uploadStudyMaterial,
        approveStudyMaterial,
        rejectStudyMaterial,
        deleteStudyMaterial,
        incrementDownload,
        books,
        addBookListing,
        updateBookStatus,
        deleteBookListing,
        lostFoundItems,
        addLostFoundItem,
        updateLostFoundStatus,
        deleteLostFoundItem,
        notifications,
        unreadNotifCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        reports,
        submitReport,
        resolveReport,
        activityLogs,
        logAdminAction,
        isDarkMode,
        toggleDarkMode,
        verificationRequests,
        submitVerificationRequest,
        reviewVerificationRequest,
        savedBookmarks,
        toggleBookmark,
        isBookmarked,
        routineSlots,
        addRoutineSlot,
        deleteRoutineSlot,
        exams,
        addExam,
        deleteExam,
        toggleSyllabusTopic,
        savedCGPARecords,
        saveCGPARecord,
        deleteCGPARecord,
        chatConversations,
        chatMessages,
        campusGroups,
        activeChatId,
        setActiveChatId,
        openDirectChatWithUser,
        sendMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
