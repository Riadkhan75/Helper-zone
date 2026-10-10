import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, BookOpen, Users, Bell, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, unreadNotifCount } = useApp();

  const navItems = [
    { id: 'home' as const, label: 'হোম', icon: Home },
    { id: 'study' as const, label: 'স্টাডি', icon: BookOpen },
    { id: 'community' as const, label: 'কমিউনিটি', icon: Users },
    { id: 'notifications' as const, label: 'নোটিফিকেশন', icon: Bell, badge: unreadNotifCount },
    { id: 'profile' as const, label: 'প্রোফাইল', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
      <nav className="grid grid-cols-5 items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center relative transition-colors cursor-pointer ${
                isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : ''}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[11px] font-medium mt-1 tracking-tight ${isActive ? 'font-bold text-indigo-600' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
