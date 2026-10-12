import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Flame, 
  Star, 
  BookOpen, 
  CheckCircle, 
  MessageSquare, 
  TrendingUp,
  School,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { VerifiedBadge } from '../common/VerifiedBadge';

type Timeframe = 'weekly' | 'monthly' | 'allTime';

export const LeaderboardView: React.FC = () => {
  const { currentUser, usersList } = useAuth();
  const { studyMaterials, posts, openDirectChatWithUser, setActiveTab } = useApp();
  const [timeframe, setTimeframe] = useState<Timeframe>('allTime');

  // Compute leaderboard scores for each user
  const leaderboardUsers = usersList
    .filter(u => !u.isBanned)
    .map(user => {
      const userMaterialsCount = studyMaterials.filter(m => m.uploaderId === user.uid && m.isApproved).length;
      const userPostsCount = posts.filter(p => p.authorId === user.uid).length;
      
      // Multipliers based on timeframe for dynamic feel
      const timeMultiplier = timeframe === 'weekly' ? 0.35 : timeframe === 'monthly' ? 0.7 : 1.0;
      const basePoints = user.points || 0;
      const calculatedPoints = Math.round(
        (basePoints + (userMaterialsCount * 50) + (userPostsCount * 20)) * timeMultiplier
      );

      const tasksCompleted = Math.round((user.completedTasksCount || 5) * timeMultiplier);

      return {
        ...user,
        calculatedPoints,
        materialsCount: userMaterialsCount,
        postsCount: userPostsCount,
        tasksCompleted,
      };
    })
    .sort((a, b) => b.calculatedPoints - a.calculatedPoints);

  const top3 = leaderboardUsers.slice(0, 3);
  const remainingRanks = leaderboardUsers.slice(3);

  // Find current user's rank
  const myRankIndex = currentUser 
    ? leaderboardUsers.findIndex(u => u.uid === currentUser.uid) 
    : -1;
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;
  const myStats = myRankIndex >= 0 ? leaderboardUsers[myRankIndex] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
              <Crown className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
              <span>ক্যাম্পাস লিডারবোর্ড ও সেরা শিক্ষার্থী</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              স্টুডেন্ট লিডারবোর্ড র‍্যাঙ্কিং
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-lg leading-relaxed">
              নোট শেয়ার, টাস্ক সম্পন্ন এবং কমিউনিটিতে সক্রিয় অবদানের ভিত্তিতে শীর্ষ শিক্ষার্থীদের স্বীকৃতি ও রিওয়ার্ড।
            </p>
          </div>

          {/* Timeframe Filter Tabs */}
          <div className="flex bg-black/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shrink-0 self-stretch sm:self-auto">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === 'weekly'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              এই সপ্তাহ
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === 'monthly'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              এই মাস
            </button>
            <button
              onClick={() => setTimeframe('allTime')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === 'allTime'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              সর্বমোট
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* 2nd Place */}
        {top3[1] && (
          <div className="order-2 md:order-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col items-center text-center relative shadow-xs hover:shadow-md transition-shadow">
            <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold flex items-center gap-1 shadow-xs">
              <Medal className="w-3.5 h-3.5 text-slate-500" />
              <span>২য় স্থান (Silver)</span>
            </div>

            <div className="relative mt-2 mb-3">
              <img
                src={top3[1].photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[1].displayName)}`}
                alt={top3[1].displayName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-300 dark:border-slate-700 shadow-xs"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-black flex items-center justify-center">
                ২
              </span>
            </div>

            <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-slate-100 text-sm">
              <span className="truncate max-w-[150px]">{top3[1].displayName}</span>
              {top3[1].verificationStatus === 'verified' && <VerifiedBadge size="xs" />}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-full">
              {top3[1].collegeName}
            </p>

            <div className="mt-4 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-sm">
              {top3[1].calculatedPoints} পয়েন্ট
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 w-full justify-center">
              <span>📚 {top3[1].materialsCount} নোট</span>
              <span>·</span>
              <span>✅ {top3[1].tasksCompleted} টাস্ক</span>
            </div>

            {currentUser && currentUser.uid !== top3[1].uid && (
              <button
                onClick={() => openDirectChatWithUser(top3[1])}
                className="mt-3 w-full py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>মেসেজ</span>
              </button>
            )}
          </div>
        )}

        {/* 1st Place (Champion) */}
        {top3[0] && (
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 rounded-3xl border-2 border-amber-300 dark:border-amber-700 p-6 flex flex-col items-center text-center relative shadow-md hover:shadow-lg transition-shadow -translate-y-1">
            <div className="absolute -top-4 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 text-xs font-black flex items-center gap-1.5 shadow-md">
              <Crown className="w-4 h-4 fill-amber-950" />
              <span>শীর্ষ চ্যাম্পিয়ন (১ম)</span>
            </div>

            <div className="relative mt-2 mb-3">
              <img
                src={top3[0].photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[0].displayName)}`}
                alt={top3[0].displayName}
                className="w-20 h-20 rounded-2xl object-cover border-3 border-amber-400 shadow-md"
              />
              <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-amber-400 text-amber-950 text-xs font-black flex items-center justify-center shadow-xs">
                ১
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-extrabold text-slate-900 dark:text-slate-100 text-base">
              <span className="truncate max-w-[160px]">{top3[0].displayName}</span>
              {top3[0].verificationStatus === 'verified' && <VerifiedBadge size="sm" />}
            </div>

            <p className="text-xs text-amber-800 dark:text-amber-400 font-medium mt-0.5 truncate max-w-full">
              {top3[0].collegeName}
            </p>

            <div className="mt-4 px-5 py-2 rounded-2xl bg-amber-500 text-white font-black text-base shadow-sm">
              🏆 {top3[0].calculatedPoints} পয়েন্ট
            </div>

            <div className="flex items-center gap-3 text-xs text-amber-800/80 dark:text-amber-400/80 mt-3 pt-3 border-t border-amber-100 dark:border-amber-900/40 w-full justify-center">
              <span>📚 {top3[0].materialsCount} নোট</span>
              <span>·</span>
              <span>✅ {top3[0].tasksCompleted} টাস্ক</span>
            </div>

            {currentUser && currentUser.uid !== top3[0].uid && (
              <button
                onClick={() => openDirectChatWithUser(top3[0])}
                className="mt-3 w-full py-1.5 px-3 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>মেসেজ দিন</span>
              </button>
            )}
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <div className="order-3 md:order-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col items-center text-center relative shadow-xs hover:shadow-md transition-shadow">
            <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-extrabold flex items-center gap-1 shadow-xs">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>৩য় স্থান (Bronze)</span>
            </div>

            <div className="relative mt-2 mb-3">
              <img
                src={top3[2].photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[2].displayName)}`}
                alt={top3[2].displayName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-600/40 dark:border-amber-800 shadow-xs"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-black flex items-center justify-center">
                ৩
              </span>
            </div>

            <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-slate-100 text-sm">
              <span className="truncate max-w-[150px]">{top3[2].displayName}</span>
              {top3[2].verificationStatus === 'verified' && <VerifiedBadge size="xs" />}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-full">
              {top3[2].collegeName}
            </p>

            <div className="mt-4 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-sm">
              {top3[2].calculatedPoints} পয়েন্ট
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 w-full justify-center">
              <span>📚 {top3[2].materialsCount} নোট</span>
              <span>·</span>
              <span>✅ {top3[2].tasksCompleted} টাস্ক</span>
            </div>

            {currentUser && currentUser.uid !== top3[2].uid && (
              <button
                onClick={() => openDirectChatWithUser(top3[2])}
                className="mt-3 w-full py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>মেসেজ</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Logged in User Rank Bar */}
      {currentUser && myStats && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg">
              #{myRank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">আপনার বর্তমান র‍্যাঙ্ক</span>
                {currentUser.verificationStatus === 'verified' ? (
                  <VerifiedBadge size="xs" />
                ) : (
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                    ভেরিফিকেশন পেন্ডিং
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                আপনার অর্জিত মোট স্কোর: <span className="font-bold text-white">{myStats.calculatedPoints} পয়েন্ট</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('study')}
              className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              নোট শেয়ার করে পয়েন্ট বাড়ান (+৫০)
            </button>
          </div>
        </div>
      )}

      {/* Complete Rankings List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span>সম্পূর্ণ র‍্যাঙ্কিং তালিকা</span>
          </h2>
          <span className="text-xs text-slate-500">মোট সক্রিয় শিক্ষার্থী: {leaderboardUsers.length}</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {leaderboardUsers.map((user, idx) => {
            const rank = idx + 1;
            const isMe = currentUser?.uid === user.uid;

            return (
              <div
                key={user.uid}
                className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition-colors ${
                  isMe 
                    ? 'bg-blue-50/50 dark:bg-blue-950/20' 
                    : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className={`w-7 text-center font-black text-sm shrink-0 ${
                    rank === 1 ? 'text-amber-500' :
                    rank === 2 ? 'text-slate-400' :
                    rank === 3 ? 'text-amber-700' :
                    'text-slate-400'
                  }`}>
                    #{rank}
                  </span>

                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}`}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {user.displayName}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.2 rounded-md">
                          আপনি
                        </span>
                      )}
                      {user.verificationStatus === 'verified' && <VerifiedBadge size="xs" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.collegeName} · {user.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 block">
                      {user.calculatedPoints} <span className="text-[11px] font-normal text-slate-400">পয়েন্ট</span>
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      {user.materialsCount} নোট · {user.tasksCompleted} টাস্ক
                    </span>
                  </div>

                  {currentUser && !isMe && (
                    <button
                      onClick={() => openDirectChatWithUser(user)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="মেসেজ পাঠান"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
