import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { X, User, School, BookOpen, GraduationCap, Phone, FileText, Eye, EyeOff } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useAuth();
  const { addToast } = useApp();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
  const [collegeName, setCollegeName] = useState(currentUser?.collegeName || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [academicYear, setAcademicYear] = useState(currentUser?.academicYear || '১ম বর্ষ');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [showPhonePublicly, setShowPhonePublicly] = useState(currentUser?.showPhonePublicly || false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile({
        displayName,
        photoURL: photoURL.trim() || undefined,
        collegeName,
        department,
        academicYear,
        bio,
        phoneNumber,
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
            <p className="text-xs text-slate-500">আপনার একাডেমিক ও ব্যক্তিগত তথ্য আপডেট করুন</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">প্রোফাইল ছবির লিংক (ঐচ্ছিক)</label>
            <input
              type="url"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">শিক্ষাবর্ষ</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="এইচএসসি ১ম বর্ষ">এইচএসসি ১ম বর্ষ</option>
                  <option value="এইচএসসি ২য় বর্ষ">এইচএসসি ২য় বর্ষ</option>
                  <option value="অনার্স ১ম বর্ষ">অনার্স ১ম বর্ষ</option>
                  <option value="অনার্স ২য় বর্ষ">অনার্স ২য় বর্ষ</option>
                  <option value="অনার্স ৩য় বর্ষ">অনার্স ৩য় বর্ষ</option>
                  <option value="অনার্স ৪র্থ বর্ষ">অনার্স ৪র্থ বর্ষ</option>
                  <option value="মাস্টার্স">মাস্টার্স</option>
                </select>
              </div>
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
              disabled={loading}
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
