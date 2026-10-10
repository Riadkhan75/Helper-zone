import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  User, 
  School, 
  BookOpen, 
  Phone, 
  FileText, 
  Eye, 
  EyeOff,
  Image as ImageIcon,
  Upload,
  Trash2,
  Link as LinkIcon
} from 'lucide-react';
import { compressImageFile } from '../../utils/imageUtils';
import { AcademicYearSelector } from '../common/AcademicYearSelector';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useAuth();
  const { addToast } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('১ম বর্ষ');
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhonePublicly, setShowPhonePublicly] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && isOpen) {
      setDisplayName(currentUser.displayName || '');
      setPhotoURL(currentUser.photoURL || '');
      setCollegeName(currentUser.collegeName || '');
      setDepartment(currentUser.department || '');
      setAcademicYear(currentUser.academicYear || '১ম বর্ষ');
      setBio(currentUser.bio || '');
      setPhoneNumber(currentUser.phoneNumber || '');
      setShowPhonePublicly(currentUser.showPhonePublicly || false);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  // Handle direct file selection from gallery
  const handleDirectPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPhoto(true);
    try {
      const optimizedBase64 = await compressImageFile(file, 400, 400, 0.85);
      setPhotoURL(optimizedBase64);
      addToast('গ্যালারি থেকে ছবি সফলভাবে যুক্ত হয়েছে!', 'success');
    } catch (err: any) {
      addToast(err?.message || 'ছবি প্রসেস করতে সমস্যা হয়েছে।', 'error');
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    setPhotoURL('');
    addToast('ছবি মুছে ফেলা হয়েছে।', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        photoURL: photoURL.trim() || undefined,
        collegeName: collegeName.trim(),
        department: department.trim(),
        academicYear: academicYear.trim(),
        bio: bio.trim(),
        phoneNumber: phoneNumber.trim(),
        showPhonePublicly,
      });
      addToast('প্রোফাইল সফলভাবে আপডেট করা হয়েছে।', 'success');
      onClose();
    } catch (err: any) {
      addToast('প্রোফাইল আপডেট ব্যর্থ হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">প্রোফাইল সম্পাদনা</h2>
            <p className="text-xs text-slate-500">আপনার ছবি ও সঠিক একাডেমিক তথ্য আপডেট করুন</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Direct Photo Upload Section */}
          <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-purple-50/60 border border-indigo-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>প্রোফাইল ছবি (সরাসরি গ্যালারি থেকে)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{showUrlInput ? 'লিংক ইনপুট লুকান' : 'ছবির লিংক দিতে চান?'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Photo Preview - Click opens gallery */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative group shrink-0 cursor-pointer"
                title="গ্যালারি থেকে ছবি বদলাতে ক্লিক করুন"
              >
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="প্রোফাইল ছবি"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md group-hover:bg-indigo-700 transition-colors">
                    {displayName.charAt(0) || 'U'}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold">
                  <ImageIcon className="w-5 h-5 mb-0.5" />
                  <span>গ্যালারি</span>
                </div>
              </div>

              {/* Direct Gallery Controls */}
              <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                {/* Hidden File Input for direct gallery selection without camera prompt */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleDirectPhotoSelect}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    disabled={isProcessingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isProcessingPhoto ? 'প্রসেসিং হচ্ছে...' : 'গ্যালারি থেকে ছবি সিলেক্ট করুন'}</span>
                  </button>

                  {photoURL && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      title="ছবি সরান"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ছবি সরান</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500">
                  সরাসরি মোবাইল গ্যালারি বা কম্পিউটার থেকে যেকোনো ফটো সিলেক্ট করুন। সাইজ স্বয়ংক্রিয়ভাবে অপ্টিমাইজ হবে।
                </p>
              </div>
            </div>

            {/* Optional URL input toggle */}
            {showUrlInput && (
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">ছবির ওয়েব লিংক (URL)</label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">নাম *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">কলেজ / বিশ্ববিদ্যালয় *</label>
              <div className="relative">
                <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">বিভাগ *</label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <AcademicYearSelector
                value={academicYear}
                onChange={setAcademicYear}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">মোবাইল নম্বর</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="০১৭xxxxxxxx"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Privacy Switcher */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {showPhonePublicly ? (
                <Eye className="w-4 h-4 text-indigo-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <p className="text-xs font-semibold text-slate-800">পাবলিকলি ফোন নম্বর প্রদর্শন</p>
                <p className="text-[11px] text-slate-500">
                  {showPhonePublicly ? 'সবাই আপনার ফোন নম্বর দেখতে পাবে' : 'ডিফল্টভাবে ফোন নম্বর গোপন রাখা হবে'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showPhonePublicly}
                onChange={(e) => setShowPhonePublicly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">পরিচিতি (Bio)</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="নিজের বা পড়াশোনার আগ্রহ নিয়ে কিছু লিখুন..."
                className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>
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
              disabled={loading || isProcessingPhoto}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
