import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  School, 
  BookOpen, 
  GraduationCap, 
  Phone, 
  ShieldCheck, 
  Edit3, 
  LogOut, 
  FileText, 
  ShoppingBag, 
  SearchCode, 
  Eye, 
  EyeOff,
  Clock,
  CheckCircle2,
  Camera,
  Upload
} from 'lucide-react';
import { compressImageFile } from '../../utils/imageUtils';

interface ProfileViewProps {
  onOpenEditProfile: () => void;
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenEditProfile, onOpenAuth }) => {
  const { currentUser, isAdmin, logout, updateUserProfile } = useAuth();
  const { 
    posts, 
    studyMaterials, 
    books, 
    lostFoundItems, 
    setActiveTab, 
    addToast 
  } = useApp();

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'study' | 'books' | 'lostfound'>('posts');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 my-8">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">লগইন করুন</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          আপনার প্রোফাইল দেখতে, নতুন রিসোর্স আপলোড করতে এবং কমিউনিটিতে অংশগ্রহণ করতে অনুগ্রহ করে লগইন করুন।
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
        >
          লগইন / নিবন্ধন করুন
        </button>
      </div>
    );
  }

  // Direct Gallery Photo Selector
  const handleDirectGalleryPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const optimizedBase64 = await compressImageFile(file, 400, 400, 0.85);
      await updateUserProfile({ photoURL: optimizedBase64 });
      addToast('গ্যালারি থেকে প্রোফাইল ছবি সফলভাবে যুক্ত হয়েছে!', 'success');
    } catch (err: any) {
      addToast(err?.message || 'ছবি আপলোড করতে সমস্যা হয়েছে।', 'error');
    } finally {
      setIsUploadingPhoto(false);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
      }
    }
  };

  // Filter user's own contributions
  const myPosts = posts.filter(p => p.authorId === currentUser.uid);
  const myStudy = studyMaterials.filter(s => s.uploaderId === currentUser.uid);
  const myBooks = books.filter(b => b.sellerId === currentUser.uid);
  const myLostFound = lostFoundItems.filter(lf => lf.reporterId === currentUser.uid);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hidden File Input for Direct Gallery Selection */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleDirectGalleryPhoto}
        className="hidden"
      />

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {/* Avatar with Direct Gallery Trigger */}
            <div 
              onClick={() => galleryInputRef.current?.click()}
              className="relative group shrink-0 cursor-pointer"
              title="গ্যালারি থেকে সরাসরি ছবি নির্বাচন করতে ক্লিক করুন"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-xs group-hover:opacity-80 transition-opacity"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-xs group-hover:bg-indigo-700 transition-colors">
                  {currentUser.displayName.charAt(0)}
                </div>
              )}

              {/* Direct Gallery Click Button Overlay */}
              <div
                className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span>{isUploadingPhoto ? 'আপলোড হচ্ছে...' : 'গ্যালারি'}</span>
              </div>

              <div
                className="sm:hidden absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 text-white rounded-full shadow-md"
                title="গ্যালারি থেকে ছবি সিলেক্ট করুন"
              >
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {currentUser.displayName}
                </h1>
                {isAdmin ? (
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    প্রধান এডমিন
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                    শিক্ষার্থী
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
                <School className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{currentUser.collegeName}</span>
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.department}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.academicYear}
                </span>
              </div>

              {/* Direct Photo Change Link */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 pt-0.5 cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>
                  {isUploadingPhoto
                    ? 'ছবি আপলোড হচ্ছে...'
                    : currentUser.photoURL
                    ? 'গ্যালারি থেকে ছবি পরিবর্তন করুন'
                    : 'গ্যালারি থেকে সরাসরি ছবি যোগ করুন'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-indigo-100 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>গ্যালারি থেকে ফটো</span>
            </button>

            <button
              onClick={onOpenEditProfile}
              className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>প্রোফাইল পরিবর্তন</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className="flex-1 sm:flex-initial px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>এডমিন ড্যাশবোর্ড</span>
              </button>
            )}

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bio & Details */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <h4 className="font-semibold text-slate-700 mb-1">পরিচিতি (Bio):</h4>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {currentUser.bio || 'এখনো কোনো পরিচিতি যুক্ত করা হয়নি।'}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700">যোগাযোগ ও প্রাইভেসি:</h4>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
              <p className="text-slate-600">ইমেইল: <strong className="text-slate-800">{currentUser.email}</strong></p>
              <p className="text-slate-600 flex items-center justify-between">
                <span>ফোন নম্বর: <strong className="text-slate-800">{currentUser.phoneNumber || 'যুক্ত নেই'}</strong></span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  {currentUser.showPhonePublicly ? <Eye className="w-3 h-3 text-indigo-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                  {currentUser.showPhonePublicly ? 'পাবলিক' : 'গোপন'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Contributions Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('posts')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'posts' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            আমার পোস্ট ({myPosts.length})
          </button>
          <button
            onClick={() => setActiveSubTab('study')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'study' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            স্টাডি মেটেরিয়াল ({myStudy.length})
          </button>
          <button
            onClick={() => setActiveSubTab('books')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'books' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            আমার বই ({myBooks.length})
          </button>
          <button
            onClick={() => setActiveSubTab('lostfound')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'lostfound' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            হারানো/প্রাপ্তি ({myLostFound.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-4">
          {activeSubTab === 'posts' && (
            <div className="space-y-3">
              {myPosts.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">আপনি এখনো কোনো পোস্ট করেননি।</p>
              ) : (
                myPosts.map(post => (
                  <div key={post.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{post.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{post.likes.length} পছন্দ · {post.commentCount} মন্তব্য</p>
                    </div>
                    <span className="text-[11px] text-slate-400">{new Date(post.createdAt).toLocaleDateString('bn-BD')}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSubTab === 'study' && (
            <div className="space-y-3">
              {myStudy.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">আপনি কোনো স্টাডি রিসোর্স আপলোড করেননি।</p>
              ) : (
                myStudy.map(mat => (
                  <div key={mat.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{mat.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{mat.fileName} ({mat.fileSizeMb} MB) · {mat.downloadCount} ডাউনলোড</p>
                    </div>
                    <div>
                      {mat.isApproved ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> পাবলিকলি সক্রিয়
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3" /> এডমিন অনুমোদনের অপেক্ষায়
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSubTab === 'books' && (
            <div className="space-y-3">
              {myBooks.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">আপনার কোনো বইয়ের বিজ্ঞাপন নেই।</p>
              ) : (
                myBooks.map(b => (
                  <div key={b.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{b.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{b.listingType === 'sell' ? `৳ ${b.price}` : b.listingType === 'free' ? 'ফ্রি' : 'বিনিময়'}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                      {b.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSubTab === 'lostfound' && (
            <div className="space-y-3">
              {myLostFound.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">কোনো হারানো বা প্রাপ্তি বিজ্ঞপ্তি নেই।</p>
              ) : (
                myLostFound.map(lf => (
                  <div key={lf.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{lf.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{lf.location}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800">
                      {lf.type === 'lost' ? 'হারানো' : 'প্রাপ্ত'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
