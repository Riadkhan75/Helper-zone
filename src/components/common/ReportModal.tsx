import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Flag, X } from 'lucide-react';
import { ReportItem } from '../../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: ReportItem['targetType'];
  targetTitle: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetType,
  targetTitle,
}) => {
  const { submitReport, addToast } = useApp();
  const { currentUser } = useAuth();

  const [reason, setReason] = useState<ReportItem['reason']>('spam');
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      addToast('রিপোর্ট করতে অনুগ্রহ করে লগইন করুন।', 'error');
      return;
    }

    submitReport({
      reporterId: currentUser.uid,
      reporterName: currentUser.displayName,
      targetId,
      targetType,
      targetTitle,
      reason,
      details: details.trim() || 'কোনো অতিরিক্ত বিবরণ দেওয়া হয়নি।',
    });

    setDetails('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Flag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">রিপোর্ট করুন</h3>
                <p className="text-xs text-slate-500 truncate max-w-[240px]">{targetTitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">অভিযোগের কারণ</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportItem['reason'])}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="spam">স্প্যাম অথবা অপ্রাসঙ্গিক বিজ্ঞাপন</option>
                <option value="fake_info">ভুল বা বিভ্রান্তিকর তথ্য</option>
                <option value="harassment">হয়রানি অথবা অশালীন আচরণ</option>
                <option value="copyright">কপিরাইট লঙ্ঘন বা অনুমতিহীন ম্যাটেরিয়াল</option>
                <option value="inappropriate">নীতিমালা বিরোধী উপাদান</option>
                <option value="other">অন্যান্য সমস্যা</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">বিস্তারিত বিবরণ (ঐচ্ছিক)</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="সমস্যাটি সম্পর্কে সংক্ষিপ্ত বিবরণ লিখুন..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                জমা দিন
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
