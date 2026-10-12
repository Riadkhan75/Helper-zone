import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, BookOpen, Users, Bell, User, Calculator, MessageSquare } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'home' as const, label: 'হোম', icon: Home },
    { id: 'study' as const, label: 'স্টাডি', icon: BookOpen },
    { id: 'academic' as const, label: 'টুলস', icon: Calculator },
    { id: 'chat' as const, label: 'চ্যাট', icon: MessageSquare },
    { id: 'community' as const, label: 'কমিউনিটি', icon: Users },
    { id: 'profile' as const, label: 'প্রোফাইল', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-lg">
      <nav className="grid grid-cols-6 items-center h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center relative transition-colors cursor-pointer ${
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : ''}`} />
              </div>
              <span className={`text-[10px] font-medium mt-1 tracking-tight truncate max-w-full ${
                isActive ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
