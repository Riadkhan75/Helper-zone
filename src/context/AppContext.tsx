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
import { fetchSharedServerState, pushSharedServerUpdate } from '../services/apiService';
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

  // Track server version to avoid overwriting and prevent redundant state sets
  const lastServerTimestampRef = useRef<string>('');
  const isInitialLoadDoneRef = useRef<boolean>(false);

  // Background Live Sync: fetch latest changes from /api/sync every 3 seconds
  useEffect(() => {
    let isMounted = true;

    const syncFromServer = async () => {
      const serverState = await fetchSharedServerState();
      if (!serverState || !isMounted) return;

      const serverTimestamp = serverState.updatedAt || '';
      // Only apply if initial load or new server updates are present
      if (!isInitialLoadDoneRef.current || (serverTimestamp && serverTimestamp !== lastServerTimestampRef.current)) {
        lastServerTimestampRef.current = serverTimestamp;

        if (serverState.settings) {
          setSettings(serverState.settings);
          localStorage.setItem('chz_settings', JSON.stringify(serverState.settings));
        }
        if (Array.isArray(serverState.notices) && serverState.notices.length > 0) {
          setNotices(serverState.notices);
          localStorage.setItem('chz_notices', JSON.stringify(serverState.notices));
        }
        if (Array.isArray(serverState.posts) && serverState.posts.length > 0) {
          setPosts(serverState.posts);
          localStorage.setItem('chz_posts', JSON.stringify(serverState.posts));
        }
        if (serverState.comments && typeof serverState.comments === 'object') {
          setComments(serverState.comments);
          localStorage.setItem('chz_comments', JSON.stringify(serverState.comments));
        }
        if (Array.isArray(serverState.studyMaterials) && serverState.studyMaterials.length > 0) {
          setStudyMaterials(serverState.studyMaterials);
          localStorage.setItem('chz_study', JSON.stringify(serverState.studyMaterials));
        }
        if (Array.isArray(serverState.books) && serverState.books.length > 0) {
          setBooks(serverState.books);
          localStorage.setItem('chz_books', JSON.stringify(serverState.books));
        }
        if (Array.isArray(serverState.lostFoundItems) && serverState.lostFoundItems.length > 0) {
          setLostFoundItems(serverState.lostFoundItems);
          localStorage.setItem('chz_lostfound', JSON.stringify(serverState.lostFoundItems));
        }
        if (Array.isArray(serverState.notifications) && serverState.notifications.length > 0) {
          setNotifications(serverState.notifications);
          localStorage.setItem('chz_notifs', JSON.stringify(serverState.notifications));
        }
        if (Array.isArray(serverState.reports)) {
          setReports(serverState.reports);
          localStorage.setItem('chz_reports', JSON.stringify(serverState.reports));
        }
        if (Array.isArray(serverState.activityLogs)) {
          setActivityLogs(serverState.activityLogs);
          localStorage.setItem('chz_logs', JSON.stringify(serverState.activityLogs));
        }

        isInitialLoadDoneRef.current = true;
      }
    };

    syncFromServer();
    const interval = setInterval(syncFromServer, 3000);
    window.addEventListener('focus', syncFromServer);

    return () => {
      isMounted = false;
      clearInterval(interval);
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
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('chz_settings', JSON.stringify(updated));
    pushSharedServerUpdate('settings', updated);
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
