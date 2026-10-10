import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertCircle, Megaphone, ChevronRight, X, Calendar } from 'lucide-react';
import { CollegeNotice } from '../../types';

export const NoticeBanner: React.FC = () => {
  const { settings, notices } = useApp();
  const [selectedNotice, setSelectedNotice] = useState<CollegeNotice | null>(null);

  const activeNotices = notices.filter(n => n.isActive);
  const emergencyNotice = activeNotices.find(n => n.priority === 'emergency');

  return (
    <>
      <div className="space-y-3">
        {/* Urgent Scrolling or Flash Notice */}
        {settings.isNoticeActive && settings.bannerNotice && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-amber-950 truncate">
                {settings.bannerNotice}
              </p>
            </div>
            {emergencyNotice && (
              <button
                onClick={() => setSelectedNotice(emergencyNotice)}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-0.5 whitespace-nowrap cursor-pointer shrink-0"
              >
                বিস্তারিত <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Highlighted College Notices Strip */}
        {activeNotices.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <h3 className="text-sm font-bold text-slate-900">জরুরি কলেজ নোটিশ ও ঘোষণা</h3>
              </div>
              <span className="text-xs text-slate-500">মোট {activeNotices.length}টি নোটিশ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {activeNotices.slice(0, 3).map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-200 rounded-xl transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-indigo-700">
                        {notice.category}
                      </span>
                      {notice.priority === 'emergency' && (
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          জরুরি
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 mb-2 leading-relaxed">
                      {notice.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/50">
                    <span>{notice.publishedBy}</span>
                    <span>{notice.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-indigo-600">{selectedNotice.category}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {selectedNotice.date}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {selectedNotice.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-wrap">
                {selectedNotice.content}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span>প্রকাশক: <strong className="text-slate-700">{selectedNotice.publishedBy}</strong></span>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-xl transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
