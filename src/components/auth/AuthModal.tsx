import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { X, Lock, Mail, User, School, BookOpen, GraduationCap, Phone, ShieldCheck } from 'lucide-react';
import { AcademicYearSelector } from '../common/AcademicYearSelector';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { login, register, resetPassword, isFirebaseMode } = useAuth();
  const { addToast } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('১ম বর্ষ');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        addToast('সফলভাবে লগইন হয়েছে!', 'success');
        onClose();
      } else {
        setErrorMsg(res.message || 'লগইন ব্যর্থ হয়েছে।');
      }
    } else if (mode === 'register') {
      if (!displayName || !collegeName || !department) {
        setLoading(false);
        setErrorMsg('অনুগ্রহ করে সকল আবশ্যক তথ্য প্রদান করুন।');
        return;
      }
      const res = await register({
        email,
        pass: password,
        displayName,
        collegeName,
        department,
        academicYear,
        phoneNumber,
      });
      setLoading(false);
      if (res.success) {
        addToast('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম।', 'success');
        onClose();
      } else {
        setErrorMsg(res.message || 'নিবন্ধন সম্পন্ন হয়নি।');
      }
    } else if (mode === 'forgot') {
      const res = await resetPassword(email);
      setLoading(false);
      if (res.success) {
        addToast(res.message || 'রিসেট লিংক পাঠানো হয়েছে।', 'info');
        setMode('login');
      } else {
        setErrorMsg(res.message || 'ব্যর্থ হয়েছে।');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'login' && 'লগইন করুন'}
              {mode === 'register' && 'নতুন অ্যাকাউন্ট তৈরি করুন'}
              {mode === 'forgot' && 'পাসওয়ার্ড পুনরুদ্ধার'}
            </h2>
            <p className="text-xs text-slate-500">
              {mode === 'login' && 'ক্যাম্পাস হেল্প জোনে আপনার অ্যাকাউন্টে প্রবেশ করুন'}
              {mode === 'register' && 'কলেজ কমিউনিটিতে যুক্ত হতে তথ্য দিন'}
              {mode === 'forgot' && 'আপনার নিবন্ধিত ইমেইল ঠিকানা দিন'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">পূর্ণ নাম *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="যেমন: রাফসান আহমেদ"
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
                        placeholder="যেমন: ঢাকা কলেজ"
                        className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">বিভাগ / অনুষদ *</label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="যেমন: হিসাববিজ্ঞান"
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
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ফোন নম্বর (ঐচ্ছিক)</label>
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
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ইমেইল ঠিকানা *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">পাসওয়ার্ড *</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-indigo-600 hover:underline cursor-pointer"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading ? 'প্রক্রিয়াধীন...' : (
                mode === 'login' ? 'লগইন' : mode === 'register' ? 'অ্যাকাউন্ট তৈরি' : 'রিসেট লিংক পাঠান'
              )}
            </button>
          </form>

          {/* Toggle Modes */}
          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
            {mode === 'login' ? (
              <p>
                নতুন শিক্ষার্থী?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  নিবন্ধন করুন
                </button>
              </p>
            ) : (
              <p>
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  লগইন করুন
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
