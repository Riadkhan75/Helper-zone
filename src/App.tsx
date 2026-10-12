/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp, ActiveTab } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/Toast';
import { HomeView } from './components/home/HomeView';
import { StudyView } from './components/study/StudyView';
import { BooksView } from './components/books/BooksView';
import { LostFoundView } from './components/lostfound/LostFoundView';
import { CommunityView } from './components/community/CommunityView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { ProfileView } from './components/profile/ProfileView';
import { AdminPanel } from './components/admin/AdminPanel';
import { AcademicToolsView } from './components/academic/AcademicToolsView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { ChatView } from './components/chat/ChatView';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileEditModal } from './components/auth/ProfileEditModal';
import { UploadMaterialModal } from './components/study/UploadMaterialModal';
import { AddBookModal } from './components/books/AddBookModal';
import { AddLostFoundModal } from './components/lostfound/AddLostFoundModal';
import { CreatePostModal } from './components/community/CreatePostModal';
import { PostDetailModal } from './components/community/PostDetailModal';
import { CommunityPost, LostFoundType } from './types';
import { GraduationCap, HeartHandshake, Shield, Sparkles, Wrench } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, settings } = useApp();
  const { isAdmin, currentUser } = useAuth();

  // Modal controls
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [uploadStudyOpen, setUploadStudyOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [addLostFoundOpen, setAddLostFoundOpen] = useState(false);
  const [lostFoundDefaultType, setLostFoundDefaultType] = useState<LostFoundType>('lost');
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  // Check URL pathname for /adminriad
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/adminriad' || window.location.hash === '#adminriad') {
      setActiveTab('admin');
    }
  }, [setActiveTab]);

  // Sync URL when tab changes to admin
  useEffect(() => {
    if (activeTab === 'admin') {
      window.history.replaceState(null, '', '/adminriad');
    } else {
      window.history.replaceState(null, '', '/');
    }
  }, [activeTab]);

  // Maintenance mode handling
  if (settings.isMaintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Wrench className="w-8 h-8 animate-spin" />
          </div>
          <h1 className="text-2xl font-extrabold">{settings.siteName} - রক্ষণাবেক্ষণ চলছে</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            ওয়েবসাইটের সার্ভার ও ডাটাবেস আপগ্রেডেশনের কাজ চলছে। খুব শীঘ্রই আমরা পুনরায় উন্মুক্ত হব। সহযোগিতার জন্য ধন্যবাদ।
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
          >
            এডমিন লগইন
          </button>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {activeTab === 'home' && (
          <HomeView
            onOpenCreatePost={() => setCreatePostOpen(true)}
            onSelectPost={(post) => setSelectedPost(post)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'study' && (
          <StudyView
            onOpenUpload={() => setUploadStudyOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'books' && (
          <BooksView
            onOpenAddBook={() => setAddBookOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'lostfound' && (
          <LostFoundView
            onOpenAddModal={(type) => {
              setLostFoundDefaultType(type || 'lost');
              setAddLostFoundOpen(true);
            }}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'community' && (
          <CommunityView
            onOpenCreatePost={() => setCreatePostOpen(true)}
            onSelectPost={(post) => setSelectedPost(post)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'academic' && <AcademicToolsView />}

        {activeTab === 'leaderboard' && <LeaderboardView />}

        {activeTab === 'chat' && <ChatView />}

        {activeTab === 'notifications' && <NotificationsView />}

        {activeTab === 'profile' && (
          <ProfileView
            onOpenEditProfile={() => setProfileEditOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Quiet Domain Footer (Desktop) */}
      <footer className="hidden md:block bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-8 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">{settings.siteName}</span>
            <span>—</span>
            <span>কলেজ ও বিশ্ববিদ্যালয় শিক্ষার্থীদের নির্ভরযোগ্য সহযোগী</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 flex-wrap">
            <button onClick={() => setActiveTab('home')} className="hover:text-indigo-600 cursor-pointer">হোম</button>
            <button onClick={() => setActiveTab('study')} className="hover:text-indigo-600 cursor-pointer">স্টাডি জোন</button>
            <button onClick={() => setActiveTab('books')} className="hover:text-indigo-600 cursor-pointer">বই বিনিময়</button>
            <button onClick={() => setActiveTab('academic')} className="hover:text-indigo-600 cursor-pointer">অ্যাকাডেমিক টুলস</button>
            <button onClick={() => setActiveTab('leaderboard')} className="hover:text-indigo-600 cursor-pointer">লিডারবোর্ড</button>
            <button onClick={() => setActiveTab('chat')} className="hover:text-indigo-600 cursor-pointer">চ্যাট</button>
            <button onClick={() => setActiveTab('lostfound')} className="hover:text-indigo-600 cursor-pointer">লস্ট অ্যান্ড ফাউন্ড</button>
            <button onClick={() => setActiveTab('community')} className="hover:text-indigo-600 cursor-pointer">কমিউনিটি</button>
            {isAdmin && (
              <button onClick={() => setActiveTab('admin')} className="text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer">
                এডমিন প্যানেল (/adminriad)
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Modals & Dialogs */}
      <ToastContainer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <ProfileEditModal
        isOpen={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
      />

      <UploadMaterialModal
        isOpen={uploadStudyOpen}
        onClose={() => setUploadStudyOpen(false)}
      />

      <AddBookModal
        isOpen={addBookOpen}
        onClose={() => setAddBookOpen(false)}
      />

      <AddLostFoundModal
        isOpen={addLostFoundOpen}
        defaultType={lostFoundDefaultType}
        onClose={() => setAddLostFoundOpen(false)}
      />

      <CreatePostModal
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
      />

      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
