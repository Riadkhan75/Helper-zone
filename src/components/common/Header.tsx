import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  Bell, 
  Shield, 
  LogIn, 
  User, 
  Sun, 
  Moon, 
  Trophy, 
  Calculator, 
  MessageSquare 
} from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';

interface HeaderProps {
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { activeTab, setActiveTab, unreadNotifCount, settings, isDarkMode, toggleDarkMode } = useApp();
  const { currentUser, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element Brand wordmark */}
        <button
          onClick={() => setActiveTab('home')}
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer text-left"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-lg hidden sm:inline">
            {settings.siteName || 'Campus Help Zone'}
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-base sm:hidden">
            Campus Help
          </span>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('home')}
            className={`whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1 ${
              activeTab === 'home' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600' : ''
            }`}
          >
            হোম
          </button>
          <button
            onClick={() => setActiveTab('study')}
            className={`whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1 ${
              activeTab === 'study' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600' : ''
            }`}
          >
            স্টাডি জোন
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1 ${
              activeTab === 'books' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600' : ''
            }`}
          >
            বই বিনিময়
          </button>
          <button
            onClick={() => setActiveTab('lostfound')}
            className={`whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1 ${
              activeTab === 'lostfound' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600' : ''
            }`}
          >
            লস্ট & ফাউন্ড
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1 ${
              activeTab === 'community' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600' : ''
            }`}
          >
            কমিউনিটি
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1 flex items-center gap-1 ${
              activeTab === 'academic' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600' : ''
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>টুলস ও রুটিন</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1 flex items-center gap-1 ${
              activeTab === 'leaderboard' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600' : ''
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>লিডারবোর্ড</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1 flex items-center gap-1 ${
              activeTab === 'chat' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600' : ''
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
            <span>চ্যাট</span>
          </button>
        </nav>

        {/* Zone 3: Actions Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title={isDarkMode ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
            aria-label="ডার্ক মোড টগল"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Chat Quick Access (Mobile/Tablet) */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`p-2 rounded-xl transition-colors cursor-pointer lg:hidden ${
              activeTab === 'chat'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="চ্যাট"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Admin Panel button */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'admin' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>এডমিন প্যানেল</span>
            </button>
          )}

          {/* Notifications button */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            aria-label="নোটিফিকেশন"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full flex items-center justify-center">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </button>

          {/* Profile / Auth Button */}
          {currentUser ? (
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 p-1 pl-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                  {currentUser.displayName}
                </span>
                {currentUser.verificationStatus === 'verified' && (
                  <VerifiedBadge size="xs" />
                )}
              </div>
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                  {currentUser.displayName.charAt(0)}
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span>লগইন</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
