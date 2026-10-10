import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { X, SearchCode, MapPin, Calendar, AlertTriangle, ShieldAlert } from 'lucide-react';
import { LostFoundItem, LostFoundType } from '../../types';

interface AddLostFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: LostFoundType;
}

export const AddLostFoundModal: React.FC<AddLostFoundModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'lost',
}) => {
  const { addLostFoundItem, addToast } = useApp();
  const { currentUser } = useAuth();

  const [type, setType] = useState<LostFoundType>(defaultType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LostFoundItem['category']>('id_card');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('bn-BD'));
  const [imageUrl, setImageUrl] = useState('');
  const [reporterPhone, setReporterPhone] = useState(currentUser?.phoneNumber || '');
  const [hasSensitiveWarning, setHasSensitiveWarning] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: LostFoundItem['category']) => {
    setCategory(cat);
    if (cat === 'id_card' || cat === 'money_wallet') {
      setHasSensitiveWarning(true);
    } else {
      setHasSensitiveWarning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      addToast('পোস্ট করতে অনুগ্রহ করে লগইন করুন।', 'error');
      return;
    }

    setLoading(true);

    addLostFoundItem({
      reporterId: currentUser.uid,
      reporterName: currentUser.displayName,
      reporterCollege: currentUser.collegeName,
      reporterPhone: reporterPhone.trim() || undefined,
      type,
      title: title.trim(),
      category,
      description: description.trim(),
      location: location.trim(),
      date,
      imageUrl: imageUrl.trim() || undefined,
      status: 'active',
      hasSensitiveWarning,
    });

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${type === 'lost' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <SearchCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {type === 'lost' ? 'হারানো জিনিসের বিজ্ঞপ্তি' : 'প্রাপ্তি বিজ্ঞপ্তি প্রকাশ করুন'}
              </h2>
              <p className="text-xs text-slate-500">সহপাঠীদের জিনিস ফেরত পেতে বা দিতে সাহায্য করুন</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Item Type Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('lost')}
              className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                type === 'lost' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              হারিয়ে গেছে (Lost)
            </button>
            <button
              type="button"
              onClick={() => setType('found')}
              className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                type === 'found' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              পাওয়া গেছে (Found)
            </button>
          </div>

          {/* Sensitive Document Warning Banner */}
          {(hasSensitiveWarning || category === 'id_card' || category === 'money_wallet') && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>গোপনীয়তা সতর্কতা:</strong> জাতীয় পরিচয়পত্র, ব্যাংক কার্ড বা স্পর্শকাতর তথ্যের ছবি আপলোড করার সময় গোপন নম্বর বা স্বাক্ষর ঢেকে দিন।
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">শিরোনাম *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: বিজ্ঞান ভবনের ল্যাবে একটি স্টুডেন্ট কার্ড পাওয়া গেছে"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ক্যাটাগরি</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as LostFoundItem['category'])}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="id_card">পরিচয়পত্র / আইডি কার্ড</option>
                <option value="electronics">ইলেকট্রনিক্স (ক্যালকুলেটর/মোবাইল)</option>
                <option value="books_notes">বই ও হ্যান্ডনোট</option>
                <option value="keys">চাবি (Keys)</option>
                <option value="accessories">ব্যাগ বা ঘড়ি</option>
                <option value="money_wallet">মানিব্যাগ / ওয়ালেট</option>
                <option value="other">অন্যান্য</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">তারিখ</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="১০ অক্টোবর ২০২৬"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">স্থান (Location) *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="যেমন: সেন্ট্রাল লাইব্রেরি ২য় তলা বা ক্যাফেটেরিয়া"
                className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">যোগাযোগের নম্বর</label>
            <input
              type="tel"
              value={reporterPhone}
              onChange={(e) => setReporterPhone(e.target.value)}
              placeholder="০১৭xxxxxxxx"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ছবির লিংক (ঐচ্ছিক)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">বিস্তারিত বর্ণনা *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="আইটেমটি দেখতে কেমন, কোনো বিশেষ চিহ্ন আছে কি না..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
            />
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
              className="px-5 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading ? 'প্রকাশ হচ্ছে...' : 'বিজ্ঞপ্তি পোস্ট করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
