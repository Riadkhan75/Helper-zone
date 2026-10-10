import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { X, Users, AlertCircle, Plus, Trash, BarChart2 } from 'lucide-react';
import { CommunityPost, PostCategory, PollOption } from '../../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { createPost, addToast } = useApp();
  const { currentUser } = useAuth();

  const [category, setCategory] = useState<PostCategory>('general');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  // Poll state
  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['অপশন ১', 'অপশন ২']);

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions(prev => [...prev, `অপশন ${prev.length + 1}`]);
    }
  };

  const handleRemovePollOption = (idx: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const handlePollOptionChange = (idx: number, val: string) => {
    setPollOptions(prev => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      addToast('পোস্ট তৈরি করতে অনুগ্রহ করে লগইন করুন।', 'error');
      return;
    }

    if (title.trim().length < 5) {
      addToast('পোস্টের শিরোনাম ন্যূনতম ৫ অক্ষরের হতে হবে।', 'error');
      return;
    }

    setLoading(true);

    let pollData;
    if (hasPoll && pollQuestion.trim()) {
      pollData = {
        question: pollQuestion.trim(),
        options: pollOptions.map((optText, index) => ({
          id: `opt_${Date.now()}_${index}`,
          text: optText.trim() || `অপশন ${index + 1}`,
          votes: [],
        })),
      };
    }

    createPost({
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorCollege: currentUser.collegeName,
      authorAvatar: currentUser.photoURL,
      category,
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
      isUrgent: category === 'help' ? true : isUrgent,
      status: 'active',
      poll: pollData,
    });

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">কমিউনিটিতে পোস্ট লিখুন</h2>
              <p className="text-xs text-slate-500">প্রশ্ন, সাহায্য বা আলোচনা শুরু করুন</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ক্যাটাগরি</label>
              <select
                value={category}
                onChange={(e) => {
                  const val = e.target.value as PostCategory;
                  setCategory(val);
                  if (val === 'help') setIsUrgent(true);
                }}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="general">সাধারণ আলোচনা</option>
                <option value="help">জরুরি সাহায্য (রক্ত/চিকিৎসা/জরুরি)</option>
                <option value="study_partner">স্টাডি পার্টনার খুঁজছি</option>
                <option value="tuition">টিউশন ও ক্যারিয়ার বিজ্ঞপ্তি</option>
                <option value="question">একাডেমিক প্রশ্ন ও ডাউট</option>
                <option value="club">ক্লাব ও ক্যাম্পাস ইভেন্ট</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                <span className={isUrgent ? 'text-rose-600 font-bold' : ''}>জরুরি পোস্ট হিসেবে চিহ্নিত করুন</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">শিরোনাম *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: ৩য় সেমিস্টার ডাটা স্ট্রাকচার কোর্সের স্টাডি পার্টনার দরকার"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">বিস্তারিত বিবরণ *</label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="আপনার প্রশ্ন বা সহযোগিতার কথা বিস্তারিত লিখুন..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ছবির লিংক (ঐচ্ছিক)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Poll Integration */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setHasPoll(!hasPoll)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer mb-3"
            >
              <BarChart2 className="w-4 h-4" />
              <span>{hasPoll ? 'পোলের বিকল্প বাদ দিন' : 'একটি মতামত পোল যুক্ত করুন'}</span>
            </button>

            {hasPoll && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">পোলের প্রশ্ন</label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="যেমন: ক্লাস টেস্ট কবে দেওয়া উত্তম?"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-700">বিকল্পসমূহ</label>
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePollOption(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddPollOption}
                      className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> আরও একটি বিকল্প যোগ করুন
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading ? 'পোস্ট হচ্ছে...' : 'পোস্ট প্রকাশ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
