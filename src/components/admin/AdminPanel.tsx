import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  BookOpen, 
  ShoppingBag, 
  SearchCode, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Settings, 
  Megaphone, 
  Plus, 
  Search, 
  Activity, 
  Lock, 
  Sliders, 
  Bell,
  Check,
  Eye,
  UserX,
  UserCheck,
  AlertOctagon,
  ArrowLeft
} from 'lucide-react';
import { StudyMaterial, CollegeNotice, UserProfile, ReportItem } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

type AdminTab = 'overview' | 'approvals' | 'users' | 'posts' | 'study' | 'books' | 'lostfound' | 'reports' | 'notices' | 'settings' | 'logs';

export const AdminPanel: React.FC = () => {
  const { 
    currentUser, 
    isAdmin, 
    usersList, 
    updateUserStatus 
  } = useAuth();

  const { 
    posts, 
    deletePost, 
    studyMaterials, 
    approveStudyMaterial, 
    rejectStudyMaterial, 
    deleteStudyMaterial, 
    books, 
    deleteBookListing, 
    lostFoundItems, 
    deleteLostFoundItem, 
    reports, 
    resolveReport, 
    notices, 
    addNotice, 
    deleteNotice, 
    updateNotice,
    settings, 
    updateSettings, 
    activityLogs,
    setActiveTab,
    addToast
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('overview');

  // Search queries
  const [userSearch, setUserSearch] = useState('');
  const [contentSearch, setContentSearch] = useState('');

  // Modals state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Notice creation form state
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState('সাধারণ নোটিশ');
  const [newNoticePriority, setNewNoticePriority] = useState<'emergency' | 'important' | 'general'>('general');

  // Reject reason prompt state
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('কপিরাইট অথবা অস্পষ্ট হ্যান্ডনোট');

  // Settings form state
  const [siteName, setSiteName] = useState(settings.siteName);
  const [siteDescription, setSiteDescription] = useState(settings.siteDescription);
  const [bannerNotice, setBannerNotice] = useState(settings.bannerNotice);
  const [isNoticeActive, setIsNoticeActive] = useState(settings.isNoticeActive);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(settings.isMaintenanceMode);
  const [maxFileUploadMb, setMaxFileUploadMb] = useState(settings.maxFileUploadMb);

  // Security guard: If user is not admin, show Access Denied
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-rose-200 rounded-3xl shadow-lg text-center space-y-4">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">অননুমোদিত প্রবেশাধিকার</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          এই এডমিন প্যানেলটি শুধুমাত্র অনুমোদিত প্রশাসকদের জন্য সংরক্ষিত। সাধারণ ব্যবহারকারী এডমিন সুবিধা উপভোগ করতে পারবে না।
        </p>
        <button
          onClick={() => setActiveTab('home')}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          হোমপেজে ফিরে যান
        </button>
      </div>
    );
  }

  // Pending items count
  const pendingStudyMaterials = studyMaterials.filter(m => !m.isApproved);
  const pendingReports = reports.filter(r => r.status === 'pending');

  // Filtered Users
  const filteredUsers = usersList.filter(u => 
    u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.collegeName.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      siteName,
      siteDescription,
      bannerNotice,
      isNoticeActive,
      isMaintenanceMode,
      maxFileUploadMb: Number(maxFileUploadMb),
    });
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) {
      addToast('নোটিশের শিরোনাম ও বিবরণ পূরণ করুন।', 'error');
      return;
    }
    addNotice({
      title: newNoticeTitle.trim(),
      content: newNoticeContent.trim(),
      category: newNoticeCategory,
      priority: newNoticePriority,
      isActive: true,
      publishedBy: currentUser?.displayName || 'এডমিন অফিস',
      date: new Date().toLocaleDateString('bn-BD'),
    });
    setNewNoticeTitle('');
    setNewNoticeContent('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">এডমিন কন্ট্রোল প্যানেল</h1>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                /adminriad
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              স্বাগতম, {currentUser?.displayName} · সম্পূর্ণ ডেটাবেস ও কনটেন্ট মডারেশন সিস্টেম
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('home')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>ওয়েবসাইটে ফিরে যান</span>
        </button>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'overview' as const, label: 'ড্যাশবোর্ড', count: undefined },
          { id: 'approvals' as const, label: 'অপেক্ষমাণ অনুমোদন', count: pendingStudyMaterials.length },
          { id: 'users' as const, label: 'ব্যবহারকারী', count: usersList.length },
          { id: 'posts' as const, label: 'কমিউনিটি পোস্ট', count: posts.length },
          { id: 'study' as const, label: 'স্টাডি ফাইলস', count: studyMaterials.length },
          { id: 'books' as const, label: 'বইয়ের লিস্টিং', count: books.length },
          { id: 'lostfound' as const, label: 'লস্ট অ্যান্ড ফাউন্ড', count: lostFoundItems.length },
          { id: 'reports' as const, label: 'রিপোর্ট কিউ', count: pendingReports.length },
          { id: 'notices' as const, label: 'কলেজ নোটিশ', count: notices.length },
          { id: 'settings' as const, label: 'সাইট কনফিগারেশন', count: undefined },
          { id: 'logs' as const, label: 'অ্যাক্টিভিটি লগস', count: activityLogs.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeAdminTab === tab.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeAdminTab === tab.id ? 'bg-white text-purple-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{usersList.length}</p>
              <p className="text-xs text-slate-500">মোট ইউজার</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{posts.length}</p>
              <p className="text-xs text-slate-500">কমিউনিটি পোস্ট</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2">
                <BookOpen className="w-4 h-4" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{studyMaterials.length}</p>
              <p className="text-xs text-slate-500">স্টাডি ফাইলস</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{books.length}</p>
              <p className="text-xs text-slate-500">বইয়ের লিস্টিং</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{pendingStudyMaterials.length}</p>
              <p className="text-xs text-slate-500">অনুমোদন বাকি</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-2">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{pendingReports.length}</p>
              <p className="text-xs text-slate-500">জমা হওয়া অভিযোগ</p>
            </div>
          </div>

          {/* Quick Action Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Pending Study Files */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  নতুন ফাইল অনুমোদন কিউ ({pendingStudyMaterials.length})
                </h3>
                <button
                  onClick={() => setActiveAdminTab('approvals')}
                  className="text-xs font-semibold text-purple-600 hover:underline cursor-pointer"
                >
                  সব দেখুন
                </button>
              </div>

              {pendingStudyMaterials.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">কোনো অপেক্ষমাণ ফাইল নেই। সব ফাইল অনুমোদিত!</p>
              ) : (
                pendingStudyMaterials.slice(0, 3).map(item => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        আপলোডার: {item.uploaderName} · {item.fileName} ({item.fileSizeMb}MB)
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => approveStudyMaterial(item.id)}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                        title="অনুমোদন করুন"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setRejectId(item.id);
                        }}
                        className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
                        title="বাতিল করুন"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pending Reports */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  সাম্প্রতিক অভিযোগ / রিপোর্ট ({pendingReports.length})
                </h3>
                <button
                  onClick={() => setActiveAdminTab('reports')}
                  className="text-xs font-semibold text-purple-600 hover:underline cursor-pointer"
                >
                  সব দেখুন
                </button>
              </div>

              {pendingReports.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">কোনো নতুন অভিযোগ নেই। কমিউনিটি পরিচ্ছন্ন!</p>
              ) : (
                pendingReports.slice(0, 3).map(rep => (
                  <div key={rep.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-800">{rep.targetTitle}</span>
                      <span className="text-[10px] text-rose-600 font-semibold">{rep.reason}</span>
                    </div>
                    <p className="text-slate-600">{rep.details}</p>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => resolveReport(rep.id, 'dismissed')}
                        className="px-2.5 py-1 bg-white text-slate-600 border border-slate-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                      >
                        খারিজ
                      </button>
                      <button
                        onClick={() => resolveReport(rep.id, 'resolved')}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                      >
                        পদক্ষেপ নিন
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENDING APPROVALS */}
      {activeAdminTab === 'approvals' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">স্টাডি ফাইল অনুমোদন কিউ</h2>
              <p className="text-xs text-slate-500">অনুমোদিত না হওয়া পর্যন্ত সাধারণ ব্যবহারকারীরা এই ফাইলগুলো দেখতে পাবে না।</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              {pendingStudyMaterials.length} টি অপেক্ষমাণ
            </span>
          </div>

          {pendingStudyMaterials.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              কোনো অপেক্ষমাণ ফাইল নেই। সব ফাইল পর্যালোচিত।
            </div>
          ) : (
            <div className="space-y-3">
              {pendingStudyMaterials.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600">{item.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>আপলোডার: <strong className="text-slate-700">{item.uploaderName}</strong></span>
                      <span>·</span>
                      <span>বিষয়: {item.subject}</span>
                      <span>·</span>
                      <span>ফাইল: {item.fileName} ({item.fileSizeMb}MB)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => approveStudyMaterial(item.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>অনুমোদন করুন</span>
                    </button>
                    <button
                      onClick={() => setRejectId(item.id)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>বাতিল</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">ব্যবহারকারী ব্যবস্থাপনা ও অ্যাক্সেস কন্ট্রোল</h2>
              <p className="text-xs text-slate-500">শিক্ষার্থীদের তথ্য, রোল এবং সাসপেনশন নিয়ন্ত্রণ করুন</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="ইউজার বা ইমেইল খুঁজুন..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">শিক্ষার্থী</th>
                  <th className="p-3">কলেজ ও বিভাগ</th>
                  <th className="p-3">রোল</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">মডারেশন অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isSelf = u.uid === currentUser?.uid;

                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                            alt={u.displayName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{u.displayName}</p>
                            <p className="text-[11px] text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-slate-800">{u.collegeName}</p>
                        <p className="text-[11px] text-slate-500">{u.department} · {u.academicYear}</p>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          u.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 font-bold' 
                            : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {u.role === 'admin' ? 'এডমিন' : 'শিক্ষার্থী'}
                        </span>
                      </td>
                      <td className="p-3">
                        {u.isBanned ? (
                          <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">নিষিদ্ধ (Banned)</span>
                        ) : u.isSuspended ? (
                          <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">স্থগিত</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">সক্রিয়</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {!isSelf && (
                          <div className="flex items-center justify-end gap-1.5">
                            {u.isBanned ? (
                              <button
                                onClick={() => {
                                  updateUserStatus(u.uid, { isBanned: false });
                                  addToast('ইউজারের ব্যান তুলে নেওয়া হয়েছে।', 'success');
                                }}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-lg text-[11px] cursor-pointer"
                              >
                                আনব্যান
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: 'ইউজারকে নিষিদ্ধ (Ban) করবেন?',
                                    description: `${u.displayName} অ্যাকাউন্টটি ব্যান করলে সে আর ওয়েবসাইটে লগইন করতে পারবে না।`,
                                    onConfirm: () => {
                                      updateUserStatus(u.uid, { isBanned: true });
                                      addToast('ইউজারকে ব্যান করা হয়েছে।', 'info');
                                    }
                                  });
                                }}
                                className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-lg text-[11px] cursor-pointer"
                              >
                                ব্যান করুন
                              </button>
                            )}

                            <button
                              onClick={() => {
                                const nextSuspended = !u.isSuspended;
                                updateUserStatus(u.uid, { isSuspended: nextSuspended });
                                addToast(nextSuspended ? 'ইউজার স্থগিত করা হয়েছে।' : 'ইউজারের স্থগিতাদেশ প্রত্যাহার করা হয়েছে।', 'info');
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] cursor-pointer"
                            >
                              {u.isSuspended ? 'আন-সাসপেন্ড' : 'সাসপেন্ড'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COMMUNITY POSTS MODERATION */}
      {activeAdminTab === 'posts' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">কমিউনিটি পোস্ট মডারেশন</h2>
              <p className="text-xs text-slate-500">অনাকাঙ্ক্ষিত বা স্প্যাম পোস্ট তাৎক্ষণিক ডিলিট করুন</p>
            </div>
            <span className="text-xs text-slate-500">মোট {posts.length}টি পোস্ট</span>
          </div>

          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{post.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{post.content}</p>
                  <p className="text-[11px] text-slate-400 mt-1">লেখক: {post.authorName} ({post.authorCollege})</p>
                </div>

                <button
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'পোস্টটি ডিলিট করবেন?',
                      description: 'এই পোস্ট এবং এর সকল মন্তব্য স্থায়ীভাবে মুছে যাবে।',
                      onConfirm: () => deletePost(post.id)
                    });
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STUDY MATERIALS MANAGER */}
      {activeAdminTab === 'study' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">স্টাডি ফাইলস লাইব্রেরি</h2>
              <p className="text-xs text-slate-500">সকল আপলোডকৃত নোট ও প্রশ্নব্যাংক নিয়ন্ত্রণ করুন</p>
            </div>
            <span className="text-xs text-slate-500">মোট {studyMaterials.length}টি ফাইল</span>
          </div>

          <div className="space-y-3">
            {studyMaterials.map((mat) => (
              <div key={mat.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-0.5">{mat.title}</h3>
                  <p className="text-[11px] text-slate-500">
                    বিষয়: {mat.subject} · {mat.fileName} ({mat.fileSizeMb}MB) · আপলোডার: {mat.uploaderName}
                  </p>
                  <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded ${
                    mat.isApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {mat.isApproved ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!mat.isApproved && (
                    <button
                      onClick={() => approveStudyMaterial(mat.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      অনুমোদন
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: 'স্টাডি ফাইল মুছে ফেলবেন?',
                        description: `"${mat.title}" ফাইলটি স্থায়ীভাবে ডিলিট করা হবে।`,
                        onConfirm: () => deleteStudyMaterial(mat.id)
                      });
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: NOTICES & ANNOUNCEMENTS MANAGER */}
      {activeAdminTab === 'notices' && (
        <div className="space-y-6">
          {/* Create New Notice */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-purple-600" />
              নতুন কলেজ নোটিশ প্রকাশ করুন
            </h2>
            <p className="text-xs text-slate-500 mb-4">জরুরি নোটিশ প্রকাশিত হলে সকল শিক্ষার্থী তাৎক্ষণিক নোটিফিকেশন পাবে।</p>

            <form onSubmit={handleCreateNotice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">নোটিশের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  placeholder="যেমন: সেমিস্টার ফাইনাল পরীক্ষার রুটিন ও প্রবেশপত্র বিতরণ সংক্রান্ত"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={newNoticeCategory}
                    onChange={(e) => setNewNoticeCategory(e.target.value)}
                    placeholder="যেমন: পরীক্ষা সংক্রান্ত / লাইব্রেরি / ক্লাব"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">গুরুত্ব স্তর (Priority)</label>
                  <select
                    value={newNoticePriority}
                    onChange={(e) => setNewNoticePriority(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="general">সাধারণ নোটিশ</option>
                    <option value="important">গুরুত্বপূর্ণ</option>
                    <option value="emergency">জরুরি (ব্যানারে হাইলাইট হবে)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">বিস্তারিত বিবরণ *</label>
                <textarea
                  rows={3}
                  required
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  placeholder="নোটিশের সম্পূর্ণ বক্তব্য লিখুন..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>নোটিশ প্রকাশ করুন</span>
              </button>
            </form>
          </div>

          {/* Existing Notices List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm mb-2">বর্তমান নোটিশসমূহ</h3>
            {notices.map((n) => (
              <div key={n.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {n.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{n.title}</h4>
                    {n.priority === 'emergency' && (
                      <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">জরুরি</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{n.content}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateNotice(n.id, { isActive: !n.isActive })}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg cursor-pointer ${
                      n.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {n.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </button>
                  <button
                    onClick={() => deleteNotice(n.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SITE CONFIGURATION & SETTINGS */}
      {activeAdminTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-600" />
            ওয়েবসাইট সেটিংস ও কনফিগারেশন
          </h2>
          <p className="text-xs text-slate-500 mb-6">ওয়েবসাইটের নাম, হোমপেজ নোটিশ এবং আপলোড নিরাপত্তা কনফিগারেশন</p>

          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ওয়েবসাইটের নাম</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">সংক্ষিপ্ত পরিচিতি</label>
              <input
                type="text"
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">হোমপেজ ব্যানার নোটিশ (জরুরি ফ্লাশ)</label>
              <textarea
                rows={2}
                value={bannerNotice}
                onChange={(e) => setBannerNotice(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl resize-none"
              />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl space-y-3">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-800 cursor-pointer">
                <span>হোমপেজ ব্যানার নোটিশ সক্রিয় রাখুন</span>
                <input
                  type="checkbox"
                  checked={isNoticeActive}
                  onChange={(e) => setIsNoticeActive(e.target.checked)}
                  className="rounded text-purple-600 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-semibold text-rose-700 cursor-pointer pt-2 border-t border-slate-200/50">
                <span>মেইনটেন্যান্স মোড (Maintenance Mode)</span>
                <input
                  type="checkbox"
                  checked={isMaintenanceMode}
                  onChange={(e) => setIsMaintenanceMode(e.target.checked)}
                  className="rounded text-rose-600 h-4 w-4"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ফাইলের সর্বোচ্চ অনুমোদিত আকার (MB)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={maxFileUploadMb}
                onChange={(e) => setMaxFileUploadMb(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              সেটিংস সংরক্ষণ করুন
            </button>
          </form>
        </div>
      )}

      {/* TAB 8: ACTIVITY AUDIT LOGS */}
      {activeAdminTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">অ্যাডমিন অ্যাক্টিভিটি অডিট লগ</h2>
              <p className="text-xs text-slate-500">সকল প্রশাসনিক কর্মের সংরক্ষিত ইতিহাস</p>
            </div>
            <span className="text-xs text-slate-400">মোট {activityLogs.length}টি লগ</span>
          </div>

          <div className="space-y-2">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-800">{log.action}: </span>
                  <span className="text-slate-700">{log.details}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">অ্যাডমিন: {log.adminEmail}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={true}
          title={confirmModal.title}
          description={confirmModal.description}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        />
      )}

      {/* Reject Reason Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">স্টাডি ফাইল বাতিলের কারণ উল্লেখ করুন</h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectId(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  rejectStudyMaterial(rejectId, rejectReason);
                  setRejectId(null);
                }}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl"
              >
                প্রত্যাখ্যান করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
