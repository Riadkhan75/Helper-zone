import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  Flag, 
  BookOpen,
  Filter,
  Trash2,
  Share2
} from 'lucide-react';
import { StudyMaterial } from '../../types';
import { ReportModal } from '../common/ReportModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface StudyViewProps {
  onOpenUpload: () => void;
  onOpenAuth: () => void;
}

export const StudyView: React.FC<StudyViewProps> = ({ onOpenUpload, onOpenAuth }) => {
  const { 
    studyMaterials, 
    incrementDownload, 
    deleteStudyMaterial, 
    addToast 
  } = useApp();
  const { currentUser, isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);

  // Report modal state
  const [reportTarget, setReportTarget] = useState<StudyMaterial | null>(null);

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Filtered materials
  const visibleMaterials = studyMaterials.filter((item) => {
    // Ordinary users can only see approved items OR their own pending items
    const canSee = item.isApproved || (currentUser && item.uploaderId === currentUser.uid) || isAdmin;
    if (!canSee) return false;

    const matchesSearch = search === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subject.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === 'all' || item.department.toLowerCase().includes(selectedDept.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesDept && matchesCat;
  });

  const categoryLabels: Record<StudyMaterial['category'], string> = {
    handnote: 'হ্যান্ডনোট',
    question_bank: 'প্রশ্নব্যাংক',
    suggestion: 'সাজেশন',
    slides: 'লেকচার স্লাইড',
    lab_report: 'ল্যাব রিপোর্ট',
    book_pdf: 'রেফারেন্স বই',
  };

  const handleDownload = (item: StudyMaterial) => {
    incrementDownload(item.id);
    // Create temporary anchor to simulate realistic download
    const link = document.createElement('a');
    link.href = item.fileUrl;
    link.download = item.fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Visual Header Strip with Study Image */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[160px] sm:min-h-[190px] flex items-center shadow-lg">
        <img
          src="/src/assets/images/study_library_notes_1791651879811.jpg"
          alt="স্টাডি জোন রিসোর্স"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />
        
        <div className="relative z-10 p-6 sm:p-8 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/30 border border-blue-400/40 rounded-full text-xs font-semibold text-blue-200">
            <BookOpen className="w-3.5 h-3.5" />
            <span>একাডেমিক রিসোর্স ভল্ট</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white">স্টাডি জোন ও নোট ভাণ্ডার</h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            বিগত বছরের প্রশ্ন, হ্যান্ডনোট এবং লেকচার স্লাইড ডাউনলোড করুন অথবা সহপাঠীদের সহায়তায় নিজের নোট আপলোড করুন।
          </p>
        </div>

        <div className="absolute right-6 top-6 hidden sm:block z-10">
          <button
            onClick={() => currentUser ? onOpenUpload() : onOpenAuth()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>নোট আপলোড করুন</span>
          </button>
        </div>
      </div>

      {/* Action / Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="বিষয়, টপিক বা কোর্সের নাম দিয়ে খুঁজুন (যেমন: পদার্থবিজ্ঞান, ডাটা স্ট্রাকচার)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 sm:shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="all">সকল ধরন</option>
              <option value="handnote">হ্যান্ডনোট</option>
              <option value="question_bank">প্রশ্নব্যাংক</option>
              <option value="suggestion">সাজেশন</option>
              <option value="slides">লেকচার স্লাইড</option>
              <option value="book_pdf">রেফারেন্স বই</option>
            </select>

            <button
              onClick={() => currentUser ? onOpenUpload() : onOpenAuth()}
              className="sm:hidden flex-1 px-3 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>আপলোড</span>
            </button>
          </div>
        </div>
      </div>

      {/* Materials List Grid */}
      {visibleMaterials.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm mb-1">কোনো স্টাডি মেটেরিয়াল পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500 mb-4">অন্যান্য কিওয়ার্ড দিয়ে অনুসন্ধান করুন অথবা আপনি নিজেই প্রথম নোট আপলোড করুন।</p>
          <button
            onClick={() => currentUser ? onOpenUpload() : onOpenAuth()}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            নতুন রিসোর্স আপলোড করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleMaterials.map((item) => {
            const isOwner = currentUser && item.uploaderId === currentUser.uid;

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4.5 hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {categoryLabels[item.category] || item.category}
                    </span>

                    {!item.isApproved && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3" /> অনুমোদনের অপেক্ষায়
                      </span>
                    )}

                    {item.isApproved && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> ভেরিফাইড
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1.5 leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <p>বিষয়: <strong className="text-slate-700">{item.subject}</strong></p>
                    <p>বিভাগ ও বছর: <span>{item.department} ({item.academicYear})</span></p>
                    <p>আপলোডার: <span className="font-medium text-slate-700">{item.uploaderName}</span></p>
                    <p className="text-[10px] text-slate-400">
                      ফাইল: {item.fileName} ({item.fileSizeMb} MB) · {item.downloadCount} বার ডাউনলোড
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewMaterial(item)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="প্রিভিউ দেখুন"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setReportTarget(item)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="রিপোর্ট করুন"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => setDeleteTargetId(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDownload(item)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ডাউনলোড ({item.fileSizeMb}MB)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base truncate max-w-md">
                  {previewMaterial.title}
                </h3>
              </div>
              <button onClick={() => setPreviewMaterial(null)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">বিষয়:</span>
                  <span className="font-semibold text-slate-800">{previewMaterial.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">অনুষদ/শ্রেণি:</span>
                  <span className="font-semibold text-slate-800">{previewMaterial.department} · {previewMaterial.academicYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">আপলোডার:</span>
                  <span className="font-semibold text-slate-800">{previewMaterial.uploaderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ফাইল সাইজ:</span>
                  <span className="font-semibold text-slate-800">{previewMaterial.fileSizeMb} MB ({previewMaterial.fileName})</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 text-xs mb-1">ফাইলের বিবরণ:</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {previewMaterial.description || 'কোনো বিবরণ দেওয়া হয়নি।'}
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-8 text-center bg-slate-100/50">
                <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">{previewMaterial.fileName}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  নিরাপদ ভাইরাস স্ক্যান সম্পন্ন। ডাউনলোড করে অফলাইনে পড়ার জন্য প্রস্তুত।
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setPreviewMaterial(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => {
                  handleDownload(previewMaterial);
                  setPreviewMaterial(null);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ডাউনলোড শুরু করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <ConfirmModal
          isOpen={true}
          title="স্টাডি মেটেরিয়াল মুছে ফেলবেন?"
          description="এই ফাইলটি মুছে ফেললে অন্য কোনো শিক্ষার্থী এটি আর ডাউনলোড করতে পারবে না।"
          confirmLabel="মুছে ফেলুন"
          onConfirm={() => {
            deleteStudyMaterial(deleteTargetId);
            setDeleteTargetId(null);
          }}
          onClose={() => setDeleteTargetId(null)}
        />
      )}

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={true}
          onClose={() => setReportTarget(null)}
          targetId={reportTarget.id}
          targetType="study"
          targetTitle={reportTarget.title}
        />
      )}
    </div>
  );
};
