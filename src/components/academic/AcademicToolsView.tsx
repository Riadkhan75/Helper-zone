import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Calculator, 
  Calendar, 
  Bookmark, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  FileText, 
  BookOpen, 
  ShoppingBag, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { DayOfWeek, CGPACourse, CGPASemester } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';

type ToolTab = 'cgpa' | 'routine_exams' | 'bookmarks';

const GRADE_SCALE = [
  { letter: 'A+', point: 4.00, label: 'A+ (4.00 - 80% ও তদূর্ধ্ব)' },
  { letter: 'A', point: 3.75, label: 'A (3.75 - 75% থেকে ৭৯%)' },
  { letter: 'A-', point: 3.50, label: 'A- (3.50 - 70% থেকে ৭৪%)' },
  { letter: 'B+', point: 3.25, label: 'B+ (3.25 - 65% থেকে ৬৯%)' },
  { letter: 'B', point: 3.00, label: 'B (3.00 - 60% থেকে ৬৪%)' },
  { letter: 'B-', point: 2.75, label: 'B- (2.75 - 55% থেকে ৫৯%)' },
  { letter: 'C+', point: 2.50, label: 'C+ (2.50 - 50% থেকে ৫৪%)' },
  { letter: 'C', point: 2.25, label: 'C (2.25 - 45% থেকে ৪৯%)' },
  { letter: 'D', point: 2.00, label: 'D (2.00 - 40% থেকে ৪৪%)' },
  { letter: 'F', point: 0.00, label: 'F (0.00 - অনুত্তীর্ণ / Fail)' },
];

const DAYS_OF_WEEK: DayOfWeek[] = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_LABELS: Record<DayOfWeek, string> = {
  Saturday: 'শনিবার',
  Sunday: 'রবিবার',
  Monday: 'সোমবার',
  Tuesday: 'মঙ্গলবার',
  Wednesday: 'বুধবার',
  Thursday: 'বৃহস্পতিবার',
  Friday: 'শুক্রবার',
};

export const AcademicToolsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    routineSlots, 
    addRoutineSlot, 
    deleteRoutineSlot,
    exams, 
    addExam, 
    deleteExam, 
    toggleSyllabusTopic,
    savedBookmarks, 
    toggleBookmark,
    studyMaterials,
    books,
    posts,
    openDirectChatWithUser,
    setActiveTab,
    addToast
  } = useApp();

  const [activeTool, setActiveTool] = useState<ToolTab>('cgpa');

  // CGPA State
  const [semesters, setSemesters] = useState<CGPASemester[]>([
    {
      id: 'sem_1',
      semesterName: 'সেমিস্টার ১',
      courses: [
        { id: 'c1', name: 'Structured Programming Language (C)', credit: 3.0, gradePoint: 3.75, gradeLetter: 'A' },
        { id: 'c2', name: 'Programming Lab', credit: 1.5, gradePoint: 4.00, gradeLetter: 'A+' },
        { id: 'c3', name: 'Differential Calculus & Geometry', credit: 3.0, gradePoint: 3.50, gradeLetter: 'A-' },
        { id: 'c4', name: 'Physics & Electromagnetism', credit: 3.0, gradePoint: 3.25, gradeLetter: 'B+' },
      ]
    }
  ]);

  // Target CGPA calculator state
  const [currentCGPAInput, setCurrentCGPAInput] = useState<string>('3.50');
  const [completedCreditsInput, setCompletedCreditsInput] = useState<string>('45');
  const [targetCGPAInput, setTargetCGPAInput] = useState<string>('3.70');
  const [upcomingCreditsInput, setUpcomingCreditsInput] = useState<string>('15');

  // Routine & Exam Modals state
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Saturday');
  const [isAddRoutineOpen, setIsAddRoutineOpen] = useState(false);
  const [newRoutineSubject, setNewRoutineSubject] = useState('');
  const [newRoutineTime, setNewRoutineTime] = useState('10:00 AM - 11:30 AM');
  const [newRoutineRoom, setNewRoutineRoom] = useState('রুম ৩০২');
  const [newRoutineTeacher, setNewRoutineTeacher] = useState('');
  const [newRoutineType, setNewRoutineType] = useState<'theory' | 'lab'>('theory');

  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [newExamSubject, setNewExamSubject] = useState('');
  const [newExamTitle, setNewExamTitle] = useState('সেমিস্টার ফাইনাল ২০২৬');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamRoom, setNewExamRoom] = useState('পরীক্ষা হল');
  const [newExamTopics, setNewExamTopics] = useState('');

  // Live Timer ticker for exam countdown
  const [, setTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTicker(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // CGPA Math
  const calculateSemesterStats = (courses: CGPACourse[]) => {
    let totalCreds = 0;
    let weightedPoints = 0;
    courses.forEach(c => {
      totalCreds += c.credit;
      weightedPoints += (c.credit * c.gradePoint);
    });
    const gpa = totalCreds > 0 ? (weightedPoints / totalCreds) : 0;
    return { totalCreds, gpa: Number(gpa.toFixed(2)) };
  };

  const calculateOverallCGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;
    semesters.forEach(s => {
      s.courses.forEach(c => {
        totalCredits += c.credit;
        totalPoints += (c.credit * c.gradePoint);
      });
    });
    const cgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    return {
      totalCredits,
      cgpa: Number(cgpa.toFixed(2))
    };
  };

  const overallStats = calculateOverallCGPA();

  // Add course to semester
  const handleAddCourse = (semId: string) => {
    setSemesters(prev => prev.map(sem => {
      if (sem.id === semId) {
        const newCourse: CGPACourse = {
          id: 'course_' + Date.now(),
          name: 'নতুন কোর্স ' + (sem.courses.length + 1),
          credit: 3.0,
          gradePoint: 4.00,
          gradeLetter: 'A+'
        };
        return { ...sem, courses: [...sem.courses, newCourse] };
      }
      return sem;
    }));
  };

  // Remove course
  const handleRemoveCourse = (semId: string, courseId: string) => {
    setSemesters(prev => prev.map(sem => {
      if (sem.id === semId) {
        return { ...sem, courses: sem.courses.filter(c => c.id !== courseId) };
      }
      return sem;
    }));
  };

  // Update course grade / credit
  const handleUpdateCourse = (semId: string, courseId: string, updates: Partial<CGPACourse>) => {
    setSemesters(prev => prev.map(sem => {
      if (sem.id === semId) {
        return {
          ...sem,
          courses: sem.courses.map(c => {
            if (c.id === courseId) {
              const updated = { ...c, ...updates };
              if (updates.gradeLetter) {
                const foundScale = GRADE_SCALE.find(s => s.letter === updates.gradeLetter);
                if (foundScale) updated.gradePoint = foundScale.point;
              }
              return updated;
            }
            return c;
          })
        };
      }
      return sem;
    }));
  };

  // Add new semester
  const handleAddSemester = () => {
    const newSem: CGPASemester = {
      id: 'sem_' + (semesters.length + 1),
      semesterName: `সেমিস্টার ${semesters.length + 1}`,
      courses: [
        { id: 'c_' + Date.now(), name: 'কোর্স ১', credit: 3.0, gradePoint: 3.75, gradeLetter: 'A' },
        { id: 'c_' + (Date.now() + 1), name: 'কোর্স ২', credit: 3.0, gradePoint: 4.00, gradeLetter: 'A+' },
      ]
    };
    setSemesters([...semesters, newSem]);
  };

  // Target required GPA calculation
  const calculateRequiredGPA = () => {
    const curCG = parseFloat(currentCGPAInput) || 0;
    const compCr = parseFloat(completedCreditsInput) || 0;
    const tarCG = parseFloat(targetCGPAInput) || 0;
    const upCr = parseFloat(upcomingCreditsInput) || 0;

    if (upCr <= 0) return null;
    const currentPoints = curCG * compCr;
    const totalTargetPoints = tarCG * (compCr + upCr);
    const requiredPoints = totalTargetPoints - currentPoints;
    const reqGPA = requiredPoints / upCr;
    return Number(reqGPA.toFixed(2));
  };

  // Countdown Helper
  const getExamRemainingTime = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) return { expired: true, text: 'পরীক্ষা শেষ' };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    return {
      expired: false,
      days,
      hours,
      mins,
      secs,
      text: `${days} দিন ${hours} ঘণ্টা ${mins} মিনিট বাকি`
    };
  };

  // Bookmark filtering
  const bookmarkedMaterials = studyMaterials.filter(m => (savedBookmarks.materialIds || []).includes(m.id));
  const bookmarkedBooks = books.filter(b => (savedBookmarks.bookIds || []).includes(b.id));
  const bookmarkedPosts = posts.filter(p => (savedBookmarks.postIds || []).includes(p.id));

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-indigo-200" />
            <span>শিক্ষার্থীদের ডিজিটাল অ্যাকাডেমিক পাওয়ার টুলস</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            অ্যাকাডেমিক অ্যাসিস্ট্যান্ট
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
            নিখুঁত CGPA হিসাব, ক্লাস রুটিন, পরীক্ষার লাইভ কাউন্টডাউন ও প্রয়োজনীয় হ্যান্ডনোট সেভ রাখার পূর্ণাঙ্গ সুবিধা।
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex bg-black/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 mt-6 gap-1 max-w-md">
          <button
            onClick={() => setActiveTool('cgpa')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTool === 'cgpa'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>CGPA ক্যালকুলেটর</span>
          </button>

          <button
            onClick={() => setActiveTool('routine_exams')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTool === 'routine_exams'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>রুটিন ও এক্সাম</span>
          </button>

          <button
            onClick={() => setActiveTool('bookmarks')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTool === 'bookmarks'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>সংরক্ষিত আইটেম</span>
          </button>
        </div>
      </div>

      {/* TOOL 1: CGPA CALCULATOR */}
      {activeTool === 'cgpa' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* CGPA Summary Dashboard Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-black shrink-0">
                ★
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">সর্বমোট কিউমুলেটিভ CGPA</p>
                <h3 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {overallStats.cgpa.toFixed(2)}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">স্কেল: ৪.০০</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-black shrink-0">
                CR
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">মোট ক্রেডিট সম্পন্ন</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                  {overallStats.totalCredits}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">ক্রেডিট আওয়ার</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-black shrink-0">
                🏆
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">অ্যাকাডেমিক বিভাগ</p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {overallStats.cgpa >= 3.75 ? 'First Class (Distinction)' : overallStats.cgpa >= 3.0 ? 'First Class' : 'Second Class'}
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold">সফল অগ্রগতি</span>
              </div>
            </div>
          </div>

          {/* Semesters Course Cards */}
          <div className="space-y-4">
            {semesters.map((sem) => {
              const semStats = calculateSemesterStats(sem.courses);

              return (
                <div key={sem.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{sem.semesterName}</h3>
                      <p className="text-xs text-slate-500">
                        ক্রেডিট: <span className="font-bold text-slate-700 dark:text-slate-300">{semStats.totalCreds}</span> · 
                        সেমিস্টার SGPA: <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm ml-1">{semStats.gpa.toFixed(2)}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddCourse(sem.id)}
                      className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>কোর্স যোগ করুন</span>
                    </button>
                  </div>

                  {/* Course rows */}
                  <div className="space-y-2.5">
                    {sem.courses.map((course) => (
                      <div
                        key={course.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <input
                          type="text"
                          value={course.name}
                          onChange={(e) => handleUpdateCourse(sem.id, course.id, { name: e.target.value })}
                          className="w-full sm:w-1/2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                          placeholder="কোর্সের নাম বা কোড"
                        />

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          {/* Credit selector */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-500">ক্রেডিট:</span>
                            <select
                              value={course.credit}
                              onChange={(e) => handleUpdateCourse(sem.id, course.id, { credit: parseFloat(e.target.value) })}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-hidden"
                            >
                              <option value={1.0}>১.০</option>
                              <option value={1.5}>১.৫</option>
                              <option value={2.0}>২.০</option>
                              <option value={3.0}>৩.০</option>
                              <option value={4.0}>৪.০</option>
                            </select>
                          </div>

                          {/* Grade letter selector */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-500">গ্রেড:</span>
                            <select
                              value={course.gradeLetter}
                              onChange={(e) => handleUpdateCourse(sem.id, course.id, { gradeLetter: e.target.value })}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-indigo-600 focus:outline-hidden"
                            >
                              {GRADE_SCALE.map((g) => (
                                <option key={g.letter} value={g.letter}>
                                  {g.letter} ({g.point.toFixed(2)})
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={() => handleRemoveCourse(sem.id, course.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors ml-auto sm:ml-0"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <button
              onClick={handleAddSemester}
              className="w-full py-3.5 border-2 border-dashed border-indigo-200 dark:border-indigo-900 rounded-3xl hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>পরবর্তী সেমিস্টার যুক্ত করুন</span>
            </button>
          </div>

          {/* Target CGPA Simulator Planner */}
          <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 dark:from-slate-900 dark:to-indigo-950/20 rounded-3xl border border-indigo-100 dark:border-indigo-950 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                টার্গেট CGPA প্ল্যানার (ভবিষ্যৎ পরিকল্পনা)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              আপনার কাঙ্ক্ষিত চূড়ান্ত CGPA অর্জন করতে পরবর্তী সেমিস্টারে কত জিপিএ প্রয়োজন তা হিসাব করুন।
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  বর্তমান CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentCGPAInput}
                  onChange={(e) => setCurrentCGPAInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  অতিক্রান্ত ক্রেডিট
                </label>
                <input
                  type="number"
                  value={completedCreditsInput}
                  onChange={(e) => setCompletedCreditsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  টার্গেট CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={targetCGPAInput}
                  onChange={(e) => setTargetCGPAInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  পরবর্তী সেমিস্টারের ক্রেডিট
                </label>
                <input
                  type="number"
                  value={upcomingCreditsInput}
                  onChange={(e) => setUpcomingCreditsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                />
              </div>
            </div>

            {/* Result banner */}
            {(() => {
              const req = calculateRequiredGPA();
              if (req === null) return null;
              const isAchievable = req <= 4.00;

              return (
                <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                  isAchievable
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300'
                }`}>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold">
                      {isAchievable ? 'প্রয়োজনীয় টার্গেট জিপিএ:' : 'টার্গেট অর্জনযোগ্য নয়'}
                    </p>
                    <p className="text-[11px] opacity-80">
                      {isAchievable
                        ? `পরবর্তী ${upcomingCreditsInput} ক্রেডিটে আপনার ন্যূনতম ${req.toFixed(2)} GPA পেতে হবে।`
                        : `৪.০০ স্কেলে এটি সম্ভব নয় (${req.toFixed(2)} প্রয়োজন)। আরও বেশি ক্রেডিট বা পূর্বের কোর্স ইমপ্রুভ প্রয়োজন।`}
                    </p>
                  </div>
                  <span className="text-2xl font-black shrink-0">
                    {req.toFixed(2)}
                  </span>
                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* TOOL 2: ROUTINE & EXAM TRACKER */}
      {activeTool === 'routine_exams' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Upcoming Exams Countdown Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-rose-500" />
                  <span>আসন্ন পরীক্ষার লাইভ কাউন্টডাউন</span>
                </h2>
                <p className="text-xs text-slate-500">পরীক্ষার বাকি দিন ও ঘণ্টা পর্যবেক্ষণ করুন</p>
              </div>

              <button
                onClick={() => setIsAddExamOpen(true)}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন পরীক্ষা যোগ করুন</span>
              </button>
            </div>

            {exams.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                কোনো পরীক্ষার শিডিউল যুক্ত করা নেই। উপরের বাটনে ক্লিক করে যোগ করুন।
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((exam) => {
                  const rem = getExamRemainingTime(exam.examDate);

                  return (
                    <div
                      key={exam.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full">
                            {exam.examTitle}
                          </span>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                            {exam.subject}
                          </h3>
                          <p className="text-xs text-slate-400">
                            তারিখ: {new Date(exam.examDate).toLocaleDateString('bn-BD')} · সময়: {new Date(exam.examDate).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteExam(exam.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Live Ticker Clock */}
                      {!rem.expired ? (
                        <div className="grid grid-cols-4 gap-2 my-4 text-center">
                          <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900">
                            <span className="block text-xl font-black text-rose-600 dark:text-rose-400">{rem.days}</span>
                            <span className="text-[10px] font-medium text-slate-500">দিন</span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900">
                            <span className="block text-xl font-black text-rose-600 dark:text-rose-400">{rem.hours}</span>
                            <span className="text-[10px] font-medium text-slate-500">ঘণ্টা</span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900">
                            <span className="block text-xl font-black text-rose-600 dark:text-rose-400">{rem.mins}</span>
                            <span className="text-[10px] font-medium text-slate-500">মিনিট</span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900">
                            <span className="block text-xl font-black text-rose-600 dark:text-rose-400">{rem.secs}</span>
                            <span className="text-[10px] font-medium text-slate-500">সেকেন্ড</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 my-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl text-xs font-bold text-center">
                          পরীক্ষা শেষ হয়েছে
                        </div>
                      )}

                      {/* Syllabus Checklist */}
                      {exam.syllabusTopics && exam.syllabusTopics.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            সিলেবাস টপিক ট্র্যাকার:
                          </span>
                          {exam.syllabusTopics.map((topic) => (
                            <label
                              key={topic.id}
                              className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={topic.isCompleted}
                                onChange={() => toggleSyllabusTopic(exam.id, topic.id)}
                                className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300"
                              />
                              <span className={topic.isCompleted ? 'line-through opacity-60' : ''}>
                                {topic.title}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weekly Class Timetable Routine */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span>সাপ্তাহিক ক্লাস রুটিন</span>
                </h2>
                <p className="text-xs text-slate-500">প্রতিদিনের ক্লাস ও ল্যাব শিডিউল</p>
              </div>

              <button
                onClick={() => setIsAddRoutineOpen(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ক্লাস শিডিউল যোগ করুন</span>
              </button>
            </div>

            {/* Day Selector Pills */}
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
              {DAYS_OF_WEEK.map((day) => {
                const count = routineSlots.filter(s => s.day === day).length;
                const isSelected = selectedDay === day;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    <span>{DAY_LABELS[day]}</span>
                    {count > 0 && (
                      <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Routine Slots List for Selected Day */}
            <div className="space-y-3">
              {routineSlots.filter(s => s.day === selectedDay).length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  {DAY_LABELS[selectedDay]} কোনো ক্লাস শিডিউল নেই।
                </div>
              ) : (
                routineSlots
                  .filter(s => s.day === selectedDay)
                  .map((slot) => (
                    <div
                      key={slot.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          slot.type === 'lab'
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 border border-purple-200 dark:border-purple-800'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 border border-blue-200 dark:border-blue-800'
                        }`}>
                          {slot.type === 'lab' ? 'LAB' : 'TH'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                              {slot.subject}
                            </h3>
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              {slot.startTime} {slot.endTime ? `- ${slot.endTime}` : ''}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>📍 {slot.roomNumber}</span>
                            {slot.teacherName && <span>· 👤 {slot.teacherName}</span>}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteRoutineSlot(slot.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Add Routine Slot Modal */}
          {isAddRoutineOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-extrabold text-base">ক্লাস শিডিউল যোগ করুন</h3>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">দিন</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d} value={d}>{DAY_LABELS[d]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">বিষয়ের নাম</label>
                  <input
                    type="text"
                    required
                    value={newRoutineSubject}
                    onChange={(e) => setNewRoutineSubject(e.target.value)}
                    placeholder="উদাঃ ডাটা স্ট্রাকচার"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">সময়</label>
                  <input
                    type="text"
                    value={newRoutineTime}
                    onChange={(e) => setNewRoutineTime(e.target.value)}
                    placeholder="১০:০০ AM - ১১:৩০ AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">রুম নম্বর</label>
                    <input
                      type="text"
                      value={newRoutineRoom}
                      onChange={(e) => setNewRoutineRoom(e.target.value)}
                      placeholder="রুম ৪০১"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">টাইপ</label>
                    <select
                      value={newRoutineType}
                      onChange={(e) => setNewRoutineType(e.target.value as 'theory' | 'lab')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                    >
                      <option value="theory">থিওরি (Theory)</option>
                      <option value="lab">ল্যাব (Lab)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">শিক্ষকের নাম (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={newRoutineTeacher}
                    onChange={(e) => setNewRoutineTeacher(e.target.value)}
                    placeholder="শিক্ষকের নাম"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsAddRoutineOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={() => {
                      if (!newRoutineSubject.trim()) return;
                      addRoutineSlot({
                        day: selectedDay,
                        subject: newRoutineSubject.trim(),
                        startTime: newRoutineTime,
                        endTime: '',
                        roomNumber: newRoutineRoom,
                        teacherName: newRoutineTeacher,
                        type: newRoutineType,
                      });
                      setNewRoutineSubject('');
                      setIsAddRoutineOpen(false);
                    }}
                    className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                  >
                    সেভ করুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Exam Modal */}
          {isAddExamOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-extrabold text-base">পরীক্ষার তথ্য যোগ করুন</h3>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">বিষয়ের নাম</label>
                  <input
                    type="text"
                    required
                    value={newExamSubject}
                    onChange={(e) => setNewExamSubject(e.target.value)}
                    placeholder="উদাঃ ডাটাবেস সিস্টেম"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">পরীক্ষার নাম / ধরন</label>
                  <input
                    type="text"
                    value={newExamTitle}
                    onChange={(e) => setNewExamTitle(e.target.value)}
                    placeholder="মিডটার্ম / সেমিস্টার ফাইনাল"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">তারিখ ও সময়</label>
                  <input
                    type="datetime-local"
                    required
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">সিলেবাস টপিকসমূহ (কমা দিয়ে আলাদা করুন)</label>
                  <input
                    type="text"
                    value={newExamTopics}
                    onChange={(e) => setNewExamTopics(e.target.value)}
                    placeholder="অধ্যায় ১, অধ্যায় ২, এসকিউএল কোয়েরি"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsAddExamOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={() => {
                      if (!newExamSubject.trim() || !newExamDate) return;
                      const topics = newExamTopics
                        ? newExamTopics.split(',').map((t, idx) => ({ id: 'top_' + idx, title: t.trim(), isCompleted: false })).filter(t => t.title)
                        : [];

                      addExam({
                        subject: newExamSubject.trim(),
                        examTitle: newExamTitle.trim(),
                        examDate: newExamDate,
                        roomNumber: newExamRoom,
                        syllabusTopics: topics,
                      });
                      setNewExamSubject('');
                      setNewExamDate('');
                      setIsAddExamOpen(false);
                    }}
                    className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
                  >
                    কাউন্টডাউন শুরু করুন
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TOOL 3: BOOKMARKS & SAVED ITEMS */}
      {activeTool === 'bookmarks' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-indigo-600" />
              <span>আপনার সংরক্ষিত বুকমার্কসমূহ</span>
            </h2>
            <p className="text-xs text-slate-500">
              জরুরি হ্যান্ডনোট, বই ও প্রয়োজনীয় পোস্ট এক ক্লিকে দেখার জন্য সংরক্ষিত
            </p>
          </div>

          {/* Bookmarked Handnotes */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>স্টাডি মেটেরিয়াল ও হ্যান্ডনোট ({bookmarkedMaterials.length})</span>
            </h3>

            {bookmarkedMaterials.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                কোনো নোট বুকমার্ক করা নেই। স্টাডি জোন থেকে যেকোনো নোটের বুকমার্ক বাটনে ক্লিক করুন।
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bookmarkedMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                        {mat.department}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {mat.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        আপলোডার: {mat.uploaderName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={mat.fileUrl}
                        download
                        className="p-2 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors"
                        title="ডাউনলোড"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => toggleBookmark('material', mat.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        title="রিমুভ বুকমার্ক"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarked Books */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-500" />
              <span>সংরক্ষিত বই ({bookmarkedBooks.length})</span>
            </h3>

            {bookmarkedBooks.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                কোনো বই সেভ করা নেই।
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bookmarkedBooks.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {b.title}
                      </h4>
                      <p className="text-[11px] text-emerald-600 font-bold">
                        {b.listingType === 'free' ? 'বিনামূল্যে' : `৳ ${b.price}`}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        বিক্রেতা: {b.sellerName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openDirectChatWithUser({
                          uid: b.sellerId,
                          displayName: b.sellerName,
                          collegeName: b.sellerCollege,
                        }, {
                          type: 'book',
                          id: b.id,
                          title: b.title,
                          price: b.price,
                        })}
                        className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl transition-colors"
                        title="বিক্রেতার সাথে চ্যাট"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleBookmark('book', b.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
