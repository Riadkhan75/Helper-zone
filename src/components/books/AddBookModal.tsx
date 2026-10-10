import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { X, Book, Image, Tag, DollarSign, Phone, AlertCircle } from 'lucide-react';
import { BookListing, BookCondition, BookListingType } from '../../types';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose }) => {
  const { addBookListing, addToast } = useApp();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [edition, setEdition] = useState('');
  const [subjectDepartment, setSubjectDepartment] = useState('');
  const [condition, setCondition] = useState<BookCondition>('good');
  const [listingType, setListingType] = useState<BookListingType>('sell');
  const [price, setPrice] = useState<number>(150);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [sellerPhone, setSellerPhone] = useState(currentUser?.phoneNumber || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      addToast('বইয়ের লিস্টিং দিতে অনুগ্রহ করে লগইন করুন।', 'error');
      return;
    }

    setLoading(true);

    addBookListing({
      sellerId: currentUser.uid,
      sellerName: currentUser.displayName,
      sellerCollege: currentUser.collegeName,
      sellerPhone: sellerPhone.trim() || undefined,
      title: title.trim(),
      author: author.trim(),
      edition: edition.trim() || undefined,
      subjectDepartment: subjectDepartment.trim() || currentUser.department,
      condition,
      listingType,
      price: listingType === 'sell' ? Number(price) : 0,
      imageUrl: imageUrl.trim() || undefined,
      description: description.trim(),
      status: 'available',
    });

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Book className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">বইয়ের লিস্টিং যোগ করুন</h2>
              <p className="text-xs text-slate-500">বিক্রয়, বিনিময় অথবা শিক্ষার্থীদের ফ্রিতে দিন</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">বইয়ের নাম *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: উচ্চতর গণিত ১ম পত্র (অক্ষরপত্র প্রকাশনী)"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">লেখক / রাইটার *</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="যেমন: অসীম কুমার সাহা"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">সংস্করণ / এডিশন (ঐচ্ছিক)</label>
              <input
                type="text"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                placeholder="যেমন: ২০২০ বা ৪র্থ সংস্করণ"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">বইয়ের ধরন</label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value as BookListingType)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="sell">বিক্রয় (Sell)</option>
                <option value="exchange">বিনিময় (Exchange)</option>
                <option value="free">বিনামূল্যে দান (Free)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">বইয়ের অবস্থা</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as BookCondition)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="brand_new">একদম নতুন (Brand New)</option>
                <option value="like_new">নতুন মতো (Like New)</option>
                <option value="good">ভালো অবস্থা (Good)</option>
                <option value="acceptable">ব্যবহারযোগ্য (Acceptable)</option>
              </select>
            </div>
          </div>

          {listingType === 'sell' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">মূল্য (টাকা ৳) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">৳</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="১৫০"
                  className="w-full pl-8 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">অনুষদ বা বিষয়</label>
            <input
              type="text"
              value={subjectDepartment}
              onChange={(e) => setSubjectDepartment(e.target.value)}
              placeholder="যেমন: বিজ্ঞান / ব্যবসায় শিক্ষা / CSE"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">যোগাযোগের ফোন নম্বর (নিরাপদ)</label>
            <input
              type="tel"
              value={sellerPhone}
              onChange={(e) => setSellerPhone(e.target.value)}
              placeholder="০১৭xxxxxxxx"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              * আপনার নম্বর উন্মুক্ত থাকবে না, শুধু আগ্রহী শিক্ষার্থী যোগাযোগ বোতাম চাপলেই দেখতে পাবে।
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">বিবরণ ও স্থান</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="বইটি কেমন অবস্থায় আছে এবং ক্যাম্পাস এর কোথায় এসে সংগ্রহ করা যাবে..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
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
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading ? 'লিস্টিং হচ্ছে...' : 'লিস্টিং প্রকাশ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
