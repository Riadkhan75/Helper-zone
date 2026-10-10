import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  SearchCode, 
  Search, 
  Plus, 
  MapPin, 
  Calendar, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Flag, 
  Trash2, 
  ShieldAlert,
  AlertTriangle,
  X,
  Share2
} from 'lucide-react';
import { LostFoundItem, LostFoundType } from '../../types';
import { ReportModal } from '../common/ReportModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface LostFoundViewProps {
  onOpenAddModal: (defaultType?: LostFoundType) => void;
  onOpenAuth: () => void;
}

export const LostFoundView: React.FC<LostFoundViewProps> = ({ onOpenAddModal, onOpenAuth }) => {
  const { lostFoundItems, updateLostFoundStatus, deleteLostFoundItem, addToast } = useApp();
  const { currentUser, isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [contactItem, setContactItem] = useState<LostFoundItem | null>(null);
  const [reportTarget, setReportTarget] = useState<LostFoundItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredItems = lostFoundItems.filter((item) => {
    const matchesSearch = search === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;

    return matchesSearch && matchesType && matchesCat;
  });

  const categoryLabels: Record<string, string> = {
    id_card: 'পরিচয়পত্র',
    electronics: 'ইলেকট্রনিক্স',
    books_notes: 'বই ও নোট',
    keys: 'চাবি',
    accessories: 'ব্যাগ/এক্সেসরিজ',
    money_wallet: 'মানিব্যাগ',
    other: 'অন্যান্য',
  };

  return (
    <div className="space-y-6">
      {/* Header Presentation Strip with Lost & Found Image */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[160px] sm:min-h-[190px] flex items-center shadow-lg">
        <img
          src="/src/assets/images/campus_lost_found_1791651892749.jpg"
          alt="ক্যাম্পাস লস্ট অ্যান্ড ফাউন্ড ডেস্ক"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />

        <div className="relative z-10 p-6 sm:p-8 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/30 border border-amber-400/40 rounded-full text-xs font-semibold text-amber-200">
            <SearchCode className="w-3.5 h-3.5" />
            <span>লস্ট অ্যান্ড ফাউন্ড ডেস্ক</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white">হারানো ও প্রাপ্তি বিজ্ঞপ্তি</h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ক্যাম্পাসে কোনো মূল্যবান জিনিস হারিয়ে গেলে পোস্ট দিন অথবা পাওয়া জিনিস সঠিক মালিকের কাছে পৌঁছে দিন।
          </p>
        </div>

        <div className="absolute right-6 top-6 hidden sm:flex gap-2 z-10">
          <button
            onClick={() => currentUser ? onOpenAddModal('lost') : onOpenAuth()}
            className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>হারানো বিজ্ঞপ্তি</span>
          </button>
          <button
            onClick={() => currentUser ? onOpenAddModal('found') : onOpenAuth()}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>প্রাপ্তি বিজ্ঞপ্তি</span>
          </button>
        </div>
      </div>

      {/* Sensitive Information Safety Advisory */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-amber-950">শিক্ষার্থী সচেতনতা ও প্রাইভেসি প্রটোকল</p>
          <p className="text-amber-800 leading-relaxed">
            পরিচয়পত্র বা ডকুমেন্টের নম্বর সবার সামনে সম্পূর্ণ প্রকাশ করবেন না। যেকোনো আইটেম হস্তান্তরের সময় ক্যাম্পাসের পরিচিত স্থান (লাইব্রেরি, প্রক্টর অফিস বা ডিন অফিস) নির্বাচন করুন।
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="হারানো বা প্রাপ্ত জিনিস খুঁজুন (যেমন: আইডি কার্ড, চাবি, ব্যাগ)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
          >
            <option value="all">সকল ধরন</option>
            <option value="lost">হারিয়ে গেছে (Lost)</option>
            <option value="found">পাওয়া গেছে (Found)</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            <option value="id_card">পরিচয়পত্র</option>
            <option value="electronics">ইলেকট্রনিক্স</option>
            <option value="books_notes">বই ও নোট</option>
            <option value="keys">চাবি</option>
            <option value="accessories">এক্সেসরিজ</option>
            <option value="money_wallet">মানিব্যাগ</option>
          </select>
        </div>
      </div>

      {/* Mobile action bar for post creation */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <button
          onClick={() => currentUser ? onOpenAddModal('lost') : onOpenAuth()}
          className="py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>হারানো বিজ্ঞপ্তি</span>
        </button>
        <button
          onClick={() => currentUser ? onOpenAddModal('found') : onOpenAuth()}
          className="py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>প্রাপ্তি বিজ্ঞপ্তি</span>
        </button>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
          <SearchCode className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm mb-1">কোনো তথ্য পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500 mb-4">আপনার অনুসন্ধানের সাথে মিল রেখে কোনো হারানো বা প্রাপ্ত জিনিস নেই।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isOwner = currentUser && item.reporterId === currentUser.uid;
            const isLost = item.type === 'lost';

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4.5 hover:border-amber-200 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Status Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      isLost 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isLost ? 'হারিয়ে গেছে' : 'পাওয়া গেছে'}
                    </span>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      item.status === 'returned'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {item.status === 'returned' ? '✓ মালিক ফেরত পেয়েছে' : 'চলমান অনুসন্ধান'}
                    </span>
                  </div>

                  {item.imageUrl && (
                    <div className="h-36 rounded-xl overflow-hidden mb-3 bg-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1.5 leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="space-y-1 text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setReportTarget(item)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="রিপোর্ট করুন"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => updateLostFoundStatus(item.id, item.status === 'active' ? 'returned' : 'active')}
                        className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
                      >
                        {item.status === 'active' ? 'ফেরত মার্ক করুন' : 'পুনরায় সক্রিয়'}
                      </button>
                    )}

                    <button
                      onClick={() => setContactItem(item)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>যোগাযোগ</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contact Item Modal */}
      {contactItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {contactItem.type === 'lost' ? 'মালিকের সাথে যোগাযোগ' : 'সন্ধানদাতার সাথে যোগাযোগ'}
                  </h3>
                  <p className="text-[11px] text-slate-500">{contactItem.title}</p>
                </div>
                <button onClick={() => setContactItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3.5 text-xs">
                <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-xl space-y-1.5">
                  <p className="text-slate-600">বিজ্ঞপ্তি প্রকাশকারী: <strong className="text-slate-800">{contactItem.reporterName}</strong></p>
                  <p className="text-slate-600">কলেজ: <span>{contactItem.reporterCollege}</span></p>
                  <p className="text-slate-600">স্থান: <span>{contactItem.location}</span></p>
                  <p className="text-slate-600 mt-2">যোগাযোগের নম্বর:</p>
                  <p className="text-base font-bold text-amber-900 tracking-wider">
                    {contactItem.reporterPhone || '০১৭xxxxxxxx (ক্যাম্পাস অফিসে রক্ষিত)'}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>যাচাইকরণ টিপস:</strong> প্রাপ্ত জিনিসের মালিকানা নিশ্চিত করার জন্য রোল নম্বর, বিশেষ কোনো চিহ্ন বা পাসওয়ার্ড লক খুলে দেখাতে বলুন।
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setContactItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                {contactItem.reporterPhone && (
                  <a
                    href={`tel:${contactItem.reporterPhone}`}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>কল দিন</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <ConfirmModal
          isOpen={true}
          title="বিজ্ঞপ্তি মুছে ফেলবেন?"
          description="এই লস্ট অ্যান্ড ফাউন্ড পোস্টটি মুছে ফেলা হবে।"
          confirmLabel="মুছে ফেলুন"
          onConfirm={() => {
            deleteLostFoundItem(deleteId);
            setDeleteId(null);
          }}
          onClose={() => setDeleteId(null)}
        />
      )}

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={true}
          onClose={() => setReportTarget(null)}
          targetId={reportTarget.id}
          targetType="lostfound"
          targetTitle={reportTarget.title}
        />
      )}
    </div>
  );
};
