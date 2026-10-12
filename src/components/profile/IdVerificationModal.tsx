import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X, 
  FileCheck2, 
  Camera,
  School,
  IdCard
} from 'lucide-react';
import { compressImageFile } from '../../utils/imageUtils';
import { VerifiedBadge } from '../common/VerifiedBadge';

interface IdVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IdVerificationModal: React.FC<IdVerificationModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { submitVerificationRequest, addToast, isDarkMode } = useApp();

  const [studentIdNumber, setStudentIdNumber] = useState(currentUser?.studentIdNumber || '');
  const [idCardImage, setIdCardImage] = useState<string>(currentUser?.idCardImageUrl || '');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !currentUser) return null;

  const currentStatus = currentUser.verificationStatus || 'unverified';

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressed = await compressImageFile(file, 900, 900, 0.85);
      setIdCardImage(compressed);
      addToast('আইডি কার্ডের ছবি সফলভাবে যুক্ত হয়েছে।', 'success');
    } catch {
      addToast('ছবি প্রসেস করতে ব্যর্থ হয়েছে। অন্য ছবি চেষ্টা করুন।', 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdNumber.trim()) {
      addToast('অনুগ্রহ করে আপনার স্টুডেন্ট আইডি বা রোল নম্বর লিখুন।', 'error');
      return;
    }
    if (!idCardImage) {
      addToast('অনুগ্রহ করে আপনার কলেজ/বিশ্ববিদ্যালয় আইডি কার্ডের স্পষ্ট ছবি আপলোড করুন।', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await submitVerificationRequest({
        studentIdNumber: studentIdNumber.trim(),
        idCardImageUrl: idCardImage,
      });
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-slate-100 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">স্টুডেন্ট আইডি ভেরিফিকেশন</h2>
              <VerifiedBadge size="sm" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ব্লু-টিক ব্যাজ পেয়ে ক্যাম্পাসে বিশ্বাসযোগ্যতা অর্জন করুন
            </p>
          </div>
        </div>

        {/* Status Alert Banners */}
        {currentStatus === 'verified' && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800 dark:text-emerald-300">
              <p className="font-bold">আপনি একজন ভেরিফাইড শিক্ষার্থী!</p>
              <p className="mt-0.5 text-emerald-700/90 dark:text-emerald-400">
                আপনার প্রোফাইল এবং সকল পোস্টে ব্লু-টিক ভেরিফায়েড ব্যাজ প্রদর্শিত হচ্ছে।
              </p>
            </div>
          </div>
        )}

        {currentStatus === 'pending' && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300">
              <p className="font-bold">ভেরিফিকেশন বিবেচনাধীন রয়েছে</p>
              <p className="mt-0.5 text-amber-700/90 dark:text-amber-400">
                আপনার আবেদনটি এডমিন পর্যালোচনা করছেন। সাধারণত ২৪ ঘণ্টার মধ্যে ভেরিফিকেশন অনুমোদন হয়ে যায়। আপনি চাইলে তথ্য আপডেট করতে পারেন।
              </p>
            </div>
          </div>
        )}

        {currentStatus === 'rejected' && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800 dark:text-rose-300">
              <p className="font-bold">পূর্ববর্তী আবেদন গৃহীত হয়নি</p>
              <p className="mt-0.5 text-rose-700/90 dark:text-rose-400">
                {currentUser.verificationRejectionReason || 'আইডি কার্ডের ছবি অস্পষ্ট ছিল বা তথ্য মিল পাওয়া যায়নি।'} অনুগ্রহ করে পরিষ্কার ছবি দিয়ে পুনরায় সাবমিট করুন।
              </p>
            </div>
          </div>
        )}

        {/* Benefits summary */}
        <div className="mb-6 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
          <p className="font-semibold text-slate-800 dark:text-slate-200">ব্লু-টিক ভেরিফিকেশনের সুবিধাসমূহ:</p>
          <ul className="text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
            <li>নামের পাশে প্রফেশনাল ব্লু-টিক ব্যাজ <VerifiedBadge size="xs" /></li>
            <li>বই কেনাবেচা ও নোটে অন্যান্য শিক্ষার্থীদের ১০০% আস্থা</li>
            <li>লিডারবোর্ডে অতিরিক্ত ১০০ রিওয়ার্ড পয়েন্ট প্রাপ্তি</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              শিক্ষাপ্রতিষ্ঠান ও বিভাগ
            </label>
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>{currentUser.collegeName}</span>
              <span className="font-semibold">{currentUser.department}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              স্টুডেন্ট আইডি / রোল / রেজিস্ট্রেশন নম্বর <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={studentIdNumber}
              onChange={(e) => setStudentIdNumber(e.target.value)}
              placeholder="উদাঃ DU-CSE-2022-045 অথবা রোল নম্বর"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              কলেজ / বিশ্ববিদ্যালয় আইডি কার্ডের ছবি <span className="text-rose-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {idCardImage ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-blue-400 dark:border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 p-2">
                <img
                  src={idCardImage}
                  alt="Uploaded Student ID"
                  className="w-full h-44 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/75 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 backdrop-blur-xs transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>ছবি পরিবর্তন</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all flex flex-col items-center justify-center text-center cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isCompressing ? 'ছবি প্রস্তুত হচ্ছে...' : 'আইডি কার্ডের ছবি সিলেক্ট করুন'}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  JPG, PNG অথবা কার্ডের স্পষ্ট ছবি আপলোড করুন
                </span>
              </button>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{isSubmitting ? 'সাবমিট হচ্ছে...' : 'ভেরিফিকেশনের জন্য জমা দিন'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
