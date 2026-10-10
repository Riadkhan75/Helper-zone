import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  SearchCode, 
  Megaphone,
  ArrowRight
} from 'lucide-react';
import { NotificationItem } from '../../types';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearNotifications,
    setActiveTab
  } = useApp();
  const { currentUser } = useAuth();

  // Filter notifications for current user or broadcast to 'all'
  const userNotifications = notifications.filter(
    n => n.userId === 'all' || (currentUser && n.userId === currentUser.uid)
  );

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'rejection':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'lost_found':
        return <SearchCode className="w-4 h-4 text-amber-600" />;
      case 'announcement':
      default:
        return <Megaphone className="w-4 h-4 text-purple-600" />;
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationAsRead(item.id);
    if (item.linkTab) {
      setActiveTab(item.linkTab);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <span>নোটিফিকেশন ও আপডেট</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">মন্তব্য, অনুমোদন ও ক্যাম্পাসের জরুরি ঘোষণা</p>
        </div>

        {userNotifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>সব পড়া হয়েছে</span>
            </button>
            <button
              onClick={clearNotifications}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
              title="সব পরিষ্কার করুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      {userNotifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm mb-1">কোনো নোটিফিকেশন নেই</h3>
          <p className="text-xs text-slate-500">আপনার জন্য এই মুহূর্তে নতুন কোনো বার্তা বা সতর্কতা নেই।</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {userNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                !item.isRead
                  ? 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-300 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:bg-slate-50/80'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(item.createdAt).toLocaleDateString('bn-BD')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  {item.message}
                </p>

                {item.linkTab && (
                  <span className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
                    সংশ্লিষ্ট বিভাগে যান <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>

              {!item.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
