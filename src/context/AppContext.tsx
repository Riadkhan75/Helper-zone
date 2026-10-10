import React, { createContext, useContext, useState, useEffect } from 'react';
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
  PostComment
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
  INITIAL_COMMENTS
} from '../services/seedData';
import { useAuth } from './AuthContext';

export type ActiveTab = 'home' | 'study' | 'books' | 'lostfound' | 'community' | 'notifications' | 'profile' | 'admin';

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
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persistent States
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

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('chz_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('chz_notices', JSON.stringify(notices)); }, [notices]);
  useEffect(() => { localStorage.setItem('chz_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('chz_comments', JSON.stringify(comments)); }, [comments]);
  useEffect(() => { localStorage.setItem('chz_study', JSON.stringify(studyMaterials)); }, [studyMaterials]);
  useEffect(() => { localStorage.setItem('chz_books', JSON.stringify(books)); }, [books]);
  useEffect(() => { localStorage.setItem('chz_lostfound', JSON.stringify(lostFoundItems)); }, [lostFoundItems]);
  useEffect(() => { localStorage.setItem('chz_notifs', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('chz_reports', JSON.stringify(reports)); }, [reports]);
  useEffect(() => { localStorage.setItem('chz_logs', JSON.stringify(activityLogs)); }, [activityLogs]);

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
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Settings
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    logAdminAction('Site Settings Updated', 'ওয়েবসাইট কনফিগারেশন আপডেট করা হয়েছে');
    addToast('ওয়েবসাইট সেটিংস সফলভাবে সংরক্ষিত হয়েছে।', 'success');
  };

  // Notices
  const addNotice = (notice: Omit<CollegeNotice, 'id' | 'createdAt'>) => {
    const newNotice: CollegeNotice = {
      ...notice,
      id: 'notice_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setNotices(prev => [newNotice, ...prev]);
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
    setNotifications(prev => [broadcastNotif, ...prev]);
  };

  const updateNotice = (id: string, updates: Partial<CollegeNotice>) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    logAdminAction('Notice Updated', `আইডি: ${id}`);
    addToast('নোটিশ আপডেট করা হয়েছে।', 'success');
  };

  const deleteNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
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
    setPosts(prev => [newPost, ...prev]);
    addToast('কমিউনিটিতে পোস্ট সফলভাবে প্রকাশিত হয়েছে।', 'success');
  };

  const updatePost = (id: string, updates: Partial<CommunityPost>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
    addToast('পোস্ট আপডেট করা হয়েছে।', 'success');
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
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
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(currentUser.uid);
        const nextLikes = isLiked 
          ? post.likes.filter(uid => uid !== currentUser.uid)
          : [...post.likes, currentUser.uid];
        return { ...post, likes: nextLikes };
      }
      return post;
    }));
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

    setComments(prev => {
      const list = prev[postId] ? [...prev[postId], newComment] : [newComment];
      return { ...prev, [postId]: list };
    });

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p));
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
      setNotifications(prev => [notif, ...prev]);
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

    setComments(prev => {
      const currentPostComments = prev[postId] || [];
      const updated = currentPostComments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: c.replies ? [...c.replies, newReply] : [newReply]
          };
        }
        return c;
      });
      return { ...prev, [postId]: updated };
    });

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p));
    addToast('উত্তর যুক্ত হয়েছে।', 'success');
  };

  const votePoll = (postId: string, optionId: string) => {
    if (!currentUser) {
      addToast('ভোট দিতে লগইন করুন।', 'error');
      return;
    }
    setPosts(prev => prev.map(post => {
      if (post.id === postId && post.poll) {
        const updatedOptions = post.poll.options.map(opt => {
          // Remove user's previous votes from all options in this poll
          const cleanVotes = opt.votes.filter(uid => uid !== currentUser.uid);
          if (opt.id === optionId) {
            return { ...opt, votes: [...cleanVotes, currentUser.uid] };
          }
          return { ...opt, votes: cleanVotes };
        });
        return { ...post, poll: { ...post.poll, options: updatedOptions } };
      }
      return post;
    }));
    addToast('আপনার মতামত গৃহীত হয়েছে!', 'success');
  };

  // Study Materials
  const uploadStudyMaterial = (mat: Omit<StudyMaterial, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'isApproved'>) => {
    // Check file size against site settings
    if (mat.fileSizeMb > settings.maxFileUploadMb) {
      addToast(`ফাইলের আকার অনুমোদিত সীমার বেশি (${settings.maxFileUploadMb}MB সর্বোচ্চ)।`, 'error');
      return;
    }

    const isAutoApproved = isAdmin; // Admin uploads are approved automatically
    const newMaterial: StudyMaterial = {
      ...mat,
      id: 'study_' + Date.now(),
      downloadCount: 0,
      isApproved: isAutoApproved,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStudyMaterials(prev => [newMaterial, ...prev]);

    if (isAutoApproved) {
      addToast('স্টাডি মেটেরিয়াল সরাসরি অনুমোদিত ও প্রকাশিত হয়েছে।', 'success');
    } else {
      addToast('ফাইল আপলোড সফল! এডমিন অনুমোদনের পর এটি সবার কাছে প্রদর্শিত হবে।', 'info');
    }
  };

  const approveStudyMaterial = (id: string) => {
    setStudyMaterials(prev => prev.map(m => m.id === id ? { ...m, isApproved: true } : m));
    const target = studyMaterials.find(m => m.id === id);
    if (target) {
      logAdminAction('Study Material Approved', `অনুমোদন করা হয়েছে: ${target.title}`);
      // Notify uploader
      const notif: NotificationItem = {
        id: 'notif_' + Date.now(),
        userId: target.uploaderId,
        title: 'স্টাডি মেটেরিয়াল অনুমোদিত',
        message: `আপনার আপলোডকৃত "${target.title}" এডমিন কর্তৃক অনুমোদিত হয়েছে।`,
        type: 'approval',
        linkTab: 'study',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications(prev => [notif, ...prev]);
    }
    addToast('স্টাডি মেটেরিয়াল সফলভাবে অনুমোদিত হয়েছে।', 'success');
  };

  const rejectStudyMaterial = (id: string, reason: string) => {
    const target = studyMaterials.find(m => m.id === id);
    setStudyMaterials(prev => prev.filter(m => m.id !== id));
    if (target) {
      logAdminAction('Study Material Rejected', `বাতিল: ${target.title} (কারণ: ${reason})`);
      const notif: NotificationItem = {
        id: 'notif_' + Date.now(),
        userId: target.uploaderId,
        title: 'স্টাডি মেটেরিয়াল প্রত্যাখ্যাত',
        message: `আপনার আপলোডকৃত ফাইলটি বাতিল করা হয়েছে। কারণ: ${reason}`,
        type: 'rejection',
        linkTab: 'study',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications(prev => [notif, ...prev]);
    }
    addToast('স্টাডি মেটেরিয়াল বাতিল করা হয়েছে।', 'info');
  };

  const deleteStudyMaterial = (id: string) => {
    setStudyMaterials(prev => prev.filter(m => m.id !== id));
    if (isAdmin) {
      logAdminAction('Study Material Deleted', `মুছে ফেলা হয়েছে: ${id}`);
    }
    addToast('স্টাডি মেটেরিয়াল মুছে ফেলা হয়েছে।', 'info');
  };

  const incrementDownload = (id: string) => {
    setStudyMaterials(prev => prev.map(m => m.id === id ? { ...m, downloadCount: m.downloadCount + 1 } : m));
    addToast('ডাউনলোড শুরু হচ্ছে...', 'info');
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
    setBooks(prev => [newBook, ...prev]);
    addToast('বইয়ের লিস্টিং সফলভাবে যুক্ত হয়েছে।', 'success');
  };

  const updateBookStatus = (id: string, status: BookListing['status']) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, status, updatedAt: new Date().toISOString() } : b));
    addToast('বইয়ের স্ট্যাটাস আপডেট হয়েছে।', 'success');
  };

  const deleteBookListing = (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
    if (isAdmin) {
      logAdminAction('Book Listing Removed', `বই রিমুভ করা হয়েছে: ${id}`);
    }
    addToast('লিস্টিং মুছে ফেলা হয়েছে।', 'info');
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
    setLostFoundItems(prev => [newItem, ...prev]);
    addToast(item.type === 'lost' ? 'হারানো বিজ্ঞপ্তির পোস্ট প্রকাশিত হয়েছে।' : 'প্রাপ্তি বিজ্ঞপ্তির পোস্ট প্রকাশিত হয়েছে।', 'success');
  };

  const updateLostFoundStatus = (id: string, status: LostFoundItem['status']) => {
    setLostFoundItems(prev => prev.map(item => item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item));
    addToast('আইটেম স্ট্যাটাস আপডেট হয়েছে।', 'success');
  };

  const deleteLostFoundItem = (id: string) => {
    setLostFoundItems(prev => prev.filter(item => item.id !== id));
    if (isAdmin) {
      logAdminAction('Lost&Found Removed', `আইটেম রিমুভ করা হয়েছে: ${id}`);
    }
    addToast('আইটেম মুছে ফেলা হয়েছে।', 'info');
  };

  // Notifications
  const unreadNotifCount = notifications.filter(n => !n.isRead && (n.userId === currentUser?.uid || n.userId === 'all')).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    addToast('সব নোটিফিকেশন পড়া হয়েছে চিহ্নিত করা হয়েছে।', 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
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
    setReports(prev => [newReport, ...prev]);
    addToast('আপনার অভিযোগটি জমা হয়েছে। এডমিন দ্রুত পর্যালোচনা করবেন।', 'success');
  };

  const resolveReport = (id: string, resolution: 'resolved' | 'dismissed') => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: resolution } : r));
    logAdminAction('Report Resolved', `রিপোর্ট ${id} - স্ট্যাটাস: ${resolution}`);
    addToast(resolution === 'resolved' ? 'রিপোর্টটি সমাধান করা হয়েছে।' : 'রিপোর্টটি খারিজ করা হয়েছে।', 'info');
  };

  return (
    <AppContext.Provider value={{
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
    }}>
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
