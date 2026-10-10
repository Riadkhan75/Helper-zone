import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Phone, 
  CheckCircle, 
  Clock, 
  Flag, 
  Trash2, 
  Book,
  X,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { BookListing } from '../../types';
import { ReportModal } from '../common/ReportModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface BooksViewProps {
  onOpenAddBook: () => void;
  onOpenAuth: () => void;
}

export const BooksView: React.FC<BooksViewProps> = ({ onOpenAddBook, onOpenAuth }) => {
  const { books, updateBookStatus, deleteBookListing, addToast } = useApp();
  const { currentUser, isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Contact seller modal
  const [contactBook, setContactBook] = useState<BookListing | null>(null);

  // Report modal
  const [reportTarget, setReportTarget] = useState<BookListing | null>(null);

  // Delete modal
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredBooks = books.filter(b => {
    const matchesSearch = search === '' ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.subjectDepartment.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'all' || b.listingType === filterType;
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const conditionLabels: Record<string, string> = {
    brand_new: 'একদম নতুন',
    like_new: 'নতুন মতো',
    good: 'ভালো অবস্থা',
    acceptable: 'ব্যবহারযোগ্য',
  };

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-purple-200">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>ক্যাম্পাস বুক এক্সচেঞ্জ হাব</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold">বই ক্রয়, বিক্রয় ও বিনিময়</h1>
          <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
            সিনিয়র ও জুনিয়রদের মধ্যে পাঠ্যবই আদান-প্রদান করুন। কম খরচে বই কিনুন বা অন্যকে পড়তে দিন।
          </p>
        </div>

        <button
          onClick={() => currentUser ? onOpenAddBook() : onOpenAuth()}
          className="px-4 py-2.5 bg-white text-purple-950 hover:bg-purple-50 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>বই পোস্ট করুন</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="বইয়ের নাম, লেখক বা বিষয় দিয়ে অনুসন্ধান..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
          >
            <option value="all">সকল ধরন</option>
            <option value="sell">বিক্রয় (Sell)</option>
            <option value="exchange">বিনিময় (Exchange)</option>
            <option value="free">বিনামূল্যে (Free)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="available">পাওয়া যাচ্ছে</option>
            <option value="reserved">বুকড / রিজার্ভ</option>
            <option value="sold">বিক্রি সম্পন্ন</option>
          </select>
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
          <Book className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm mb-1">কোনো বই পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500 mb-4">আপনার খোঁজার সাথে মিল রেখে কোনো বইয়ের লিস্টিং নেই।</p>
          <button
            onClick={() => currentUser ? onOpenAddBook() : onOpenAuth()}
            className="px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            প্রথম বইটির বিজ্ঞাপন দিন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => {
            const isOwner = currentUser && book.sellerId === currentUser.uid;

            return (
              <div
                key={book.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4.5 hover:border-purple-200 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top tags & status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      book.listingType === 'sell' 
                        ? 'bg-purple-100 text-purple-700' 
                        : book.listingType === 'exchange'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {book.listingType === 'sell' ? 'বিক্রয়' : book.listingType === 'exchange' ? 'বিনিময়' : 'বিনামূল্যে দান'}
                    </span>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      book.status === 'available'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : book.status === 'reserved'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {book.status === 'available' ? 'পাওয়া যাচ্ছে' : book.status === 'reserved' ? 'বুকড' : 'বিক্রিত'}
                    </span>
                  </div>

                  {/* Thumbnail if provided */}
                  {book.imageUrl && (
                    <div className="h-36 rounded-xl overflow-hidden mb-3 bg-slate-100">
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1 leading-snug line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-2">লেখক: <strong className="text-slate-700">{book.author}</strong> {book.edition ? `(${book.edition})` : ''}</p>

                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-[11px] text-slate-600 mb-3">
                    <div className="flex justify-between">
                      <span>অবস্থা:</span>
                      <strong className="text-slate-800">{conditionLabels[book.condition] || book.condition}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>মূল্য:</span>
                      <strong className="text-purple-700 font-bold text-xs">
                        {book.listingType === 'sell' ? `৳ ${book.price}` : book.listingType === 'free' ? 'বিনামূল্যে' : 'বিনিময় সাপেক্ষ'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>বিক্রেতা:</span>
                      <span>{book.sellerName} ({book.sellerCollege})</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {book.description}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setReportTarget(book)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="রিপোর্ট করুন"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => setDeleteId(book.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {(isOwner || isAdmin) && (
                      <select
                        value={book.status}
                        onChange={(e) => updateBookStatus(book.id, e.target.value as BookListing['status'])}
                        className="px-2 py-1 text-[11px] font-semibold bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                      </select>
                    )}

                    <button
                      onClick={() => setContactBook(book)}
                      disabled={book.status === 'sold'}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
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

      {/* Safe Contact Modal */}
      {contactBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">বিক্রেতার সাথে যোগাযোগ</h3>
                    <p className="text-[11px] text-slate-500">{contactBook.title}</p>
                  </div>
                </div>
                <button onClick={() => setContactBook(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3.5">
                <div className="p-3.5 bg-purple-50/60 border border-purple-100 rounded-xl space-y-1.5 text-xs">
                  <p className="text-slate-600">বিক্রেতা: <strong className="text-slate-800">{contactBook.sellerName}</strong></p>
                  <p className="text-slate-600">কলেজ: <span>{contactBook.sellerCollege}</span></p>
                  <p className="text-slate-600">যোগাযোগের নম্বর:</p>
                  <p className="text-base font-bold text-purple-900 tracking-wider">
                    {contactBook.sellerPhone || '০১৭xxxxxxxx (অনুরোধ পাঠান)'}
                  </p>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>নিরাপত্তা সতর্কতা:</strong> কোনো অপরিচিত ব্যক্তিকে অগ্রিম টাকা পাঠাবেন না। ক্যাম্পাসের পাবলিক প্লেস বা লাইব্রেরির সামনে সরাসরি দেখা করে বইটি যাচাই করে নিন।
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setContactBook(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  ঠিক আছে
                </button>
                {contactBook.sellerPhone && (
                  <a
                    href={`tel:${contactBook.sellerPhone}`}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>সরাসরি কল দিন</span>
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
          title="বইয়ের লিস্টিং মুছে ফেলবেন?"
          description="এই লিস্টিংটি স্থায়ীভাবে মুছে ফেলা হবে।"
          confirmLabel="মুছে ফেলুন"
          onConfirm={() => {
            deleteBookListing(deleteId);
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
          targetType="book"
          targetTitle={reportTarget.title}
        />
      )}
    </div>
  );
};
