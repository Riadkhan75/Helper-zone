import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Bell, Shield, LogIn, User } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { activeTab, setActiveTab, unreadNotifCount, settings } = useApp();
  const { currentUser, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element Brand wordmark */}
        <button
          onClick={() => setActiveTab('home')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer text-left"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 text-lg">{settings.siteName || 'Campus Help Zone'}</span>
        </button>

        {/* Zone 2: 4-5 concise single-line text navigation links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('home')}
            className={`whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors cursor-pointer ${
              activeTab === 'home' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 py-1' : ''
            }`}
          >
            হোম
          </button>
          <button
            onClick={() => setActiveTab('study')}
            className={`whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors cursor-pointer ${
              activeTab === 'study' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 py-1' : ''
            }`}
          >
            স্টাডি জোন
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors cursor-pointer ${
              activeTab === 'books' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 py-1' : ''
            }`}
          >
            বই বিনিময়
          </button>
          <button
            onClick={() => setActiveTab('lostfound')}
            className={`whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors cursor-pointer ${
              activeTab === 'lostfound' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 py-1' : ''
            }`}
          >
            লস্ট অ্যান্ড ফাউন্ড
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors cursor-pointer ${
              activeTab === 'community' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 py-1' : ''
            }`}
          >
            কমিউনিটি
          </button>
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="flex items-center gap-3 shrink-0">
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'admin' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>এডমিন প্যানেল</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="নোটিফিকেশন"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full flex items-center justify-center">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </button>

          {currentUser ? (
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 p-1 pl-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                {currentUser.displayName}
              </span>
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
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
              <span>লগইন / নিবন্ধন</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
