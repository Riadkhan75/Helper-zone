import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { X, Upload, FileText, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { StudyMaterial } from '../../types';

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({ isOpen, onClose }) => {
  const { uploadStudyMaterial, settings, addToast } = useApp();
  const { currentUser, isAdmin } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('১ম বর্ষ');
  const [category, setCategory] = useState<StudyMaterial['category']>('handnote');
  const [fileUrl, setFileUrl] = useState('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  const [fileName, setFileName] = useState('lecture_notes_document.pdf');
  const [fileSizeMb, setFileSizeMb] = useState<number>(3.5);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      addToast('ফাইল আপলোড করতে অনুগ্রহ করে লগইন করুন।', 'error');
      return;
    }

    if (fileSizeMb > settings.maxFileUploadMb) {
      addToast(`ফাইলের আকার সর্বোচ্চ ${settings.maxFileUploadMb}MB হতে পারবে।`, 'error');
      return;
    }

    setLoading(true);

    uploadStudyMaterial({
      uploaderId: currentUser.uid,
      uploaderName: currentUser.displayName,
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      department: department.trim() || currentUser.department,
      academicYear,
      category,
      fileUrl,
      fileName,
      fileSizeMb,
      fileType: 'application/pdf',
    });

    setLoading(false);
    onClose();
  };

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = Number((file.size / (1024 * 1024)).toFixed(2));
      if (sizeMb > settings.maxFileUploadMb) {
        addToast(`ফাইল সাইজ (${sizeMb} MB) অনুমোদিত সীমা (${settings.maxFileUploadMb} MB) অতিক্রম করেছে!`, 'error');
        return;
      }
      setFileName(file.name);
      setFileSizeMb(sizeMb);
      addToast(`ফাইল প্রস্তুত: ${file.name} (${sizeMb} MB)`, 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">স্টাডি মেটেরিয়াল আপলোড</h2>
              <p className="text-xs text-slate-500">নোট, হ্যান্ডনোট ও প্রশ্নব্যাংক শেয়ার করুন</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Moderation Safety Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>নিরাপত্তা ও গুণমান নিয়মাবলী:</strong> কপিরাইট বা পাইরেটেড ফাইল আপলোড নিষিদ্ধ। সাধারণ শিক্ষার্থীদের আপলোডকৃত ফাইল এডমিন পর্যালোচনার পরই পাবলিকলি প্রদর্শিত হবে।
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ফাইলের শিরোনাম *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: উচ্চ মাধ্যমিক পদার্থবিজ্ঞান ২য় পত্র সম্পূর্ণ হ্যান্ডনোট"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">বিষয় *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="যেমন: পদার্থবিজ্ঞান / হিসাববিজ্ঞান"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">বিভাগ / অনুষদ *</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="যেমন: বিজ্ঞান / CSE"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ক্যাটাগরি</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StudyMaterial['category'])}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="handnote">হ্যান্ডনোট (Hand Note)</option>
                <option value="question_bank">প্রশ্নব্যাংক (Question Bank)</option>
                <option value="suggestion">সাজেশন (Exam Suggestion)</option>
                <option value="slides">লেকচার স্লাইড (Slides)</option>
                <option value="lab_report">ল্যাব রিপোর্ট (Lab Report)</option>
                <option value="book_pdf">রেফারেন্স ই-বুক (E-Book)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">শিক্ষাবর্ষ / শ্রেণি</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="এইচএসসি / ১ম বর্ষ">এইচএসসি / ১ম বর্ষ</option>
                <option value="এইচএসসি / ২য় বর্ষ">এইচএসসি / ২য় বর্ষ</option>
                <option value="১ম বর্ষ (অনার্স)">১ম বর্ষ (অনার্স)</option>
                <option value="২য় বর্ষ (অনার্স)">২য় বর্ষ (অনার্স)</option>
                <option value="৩য় বর্ষ (অনার্স)">৩য় বর্ষ (অনার্স)</option>
                <option value="৪র্থ বর্ষ (অনার্স)">৪র্থ বর্ষ (অনার্স)</option>
              </select>
            </div>
          </div>

          {/* File Picker / Attach Simulation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ডকুমেন্ট ফাইল নির্বাচন (সর্বোচ্চ {settings.maxFileUploadMb}MB)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-indigo-50/20 transition-colors relative">
              <input
                type="file"
                accept=".pdf,.docx,.doc,.ppt,.pptx"
                onChange={handleSimulateFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileText className="w-8 h-8 text-indigo-500 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-800">{fileName}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                আকার: {fileSizeMb} MB · ফাইল পরিবর্তন করতে ক্লিক করুন
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">বিবরণ ও গুরুত্বপূর্ণ নির্দেশনা</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="এই ফাইলে কোন কোন অধ্যায় অন্তর্ভুক্ত রয়েছে এবং কীভাবে এটি শিক্ষার্থীদের সাহায্য করবে..."
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
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading ? 'আপলোড হচ্ছে...' : (isAdmin ? 'সরাসরি প্রকাশ করুন' : 'জমা দিন (অনুমোদন সাপেক্ষ)')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
