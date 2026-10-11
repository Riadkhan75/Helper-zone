import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { NoticeBanner } from './NoticeBanner';
import { 
  Search, 
  BookOpen, 
  ShoppingBag, 
  SearchCode, 
  Users, 
  Heart, 
  MessageSquare, 
  ArrowRight, 
  AlertCircle,
  Sparkles,
  HelpCircle,
  Compass,
  PlusCircle,
  CheckCircle2
} from 'lucide-react';
import { CommunityPost } from '../../types';

import { AppDownloadCard } from './AppDownloadCard';

interface HomeViewProps {
  onOpenCreatePost: () => void;
  onSelectPost: (post: CommunityPost) => void;
  onOpenAuth: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenCreatePost,
  onSelectPost,
  onOpenAuth,
}) => {
  const { 
    setActiveTab, 
    searchQuery, 
    setSearchQuery, 
    posts, 
    studyMaterials, 
    books, 
    lostFoundItems,
    toggleLikePost,
    settings
  } = useApp();
  const { currentUser } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [displayCount, setDisplayCount] = useState(6);

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorCollege.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const urgentHelpPosts = posts.filter(p => p.category === 'help' || p.isUrgent);

  const categories = [
    { id: 'all', label: 'সকল আলোচনা' },
    { id: 'help', label: 'জরুরি সাহায্য' },
    { id: 'study_partner', label: 'স্টাডি পার্টনার' },
    { id: 'tuition', label: 'টিউশন ও ক্যারিয়ার' },
    { id: 'question', label: 'প্রশ্নোত্তর' },
    { id: 'club', label: 'ক্লাব ও এক্টিভিটি' },
  ];

  return (
    <div className="space-y-6">
      {/* College Emergency Notice Banner */}
      <NoticeBanner />

      {/* Hero Presentation Card with Generated Campus Image */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl min-h-[220px] sm:min-h-[260px] flex items-center">
        <img
          src="/src/assets/images/campus_students_hero_1791651860723.jpg"
          alt="ক্যাম্পাস হেল্প জোন শিক্ষার্থী কমিউনিটি"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-transparent" />
        
        <div className="relative z-10 p-6 sm:p-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/30 border border-indigo-400/40 rounded-full text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>শিক্ষার্থীদের পারস্পরিক সহযোগিতার নিরাপদ মাধ্যম</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-balance">
            ক্যাম্পাস সংক্রান্ত যেকোনো প্রয়োজনে শিক্ষার্থীদের সাথে যুক্ত থাকুন
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            {settings.siteDescription || 'নোট ও সাজেশন সংগ্রহ করুন, পুরোনো বই সাশ্রয়ী মূল্যে বিনিময় করুন এবং ক্যাম্পাসে হারানো যেকোনো জিনিস সহজে খুঁজে নিন।'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => currentUser ? onOpenCreatePost() : onOpenAuth()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>সাহায্য চাই বা পোস্ট করুন</span>
            </button>
            <button
              onClick={() => setActiveTab('study')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-md transition-colors cursor-pointer"
            >
              স্টাডি রিসোর্স ব্রাউজ করুন
            </button>
          </div>
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="পোস্ট, বই, স্টাডি মেটেরিয়াল বা হারানো জিনিস খুঁজুন (যেমন: পদার্থবিজ্ঞান, ক্যালকুলাস, আইডি কার্ড)..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-3 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            মুছুন
          </button>
        )}
      </div>

      {/* Quick Access Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setActiveTab('study')}
          className="p-4 bg-white hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-200 rounded-2xl text-left transition-all cursor-pointer shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1">স্টাডি জোন</h3>
          <p className="text-xs text-slate-500 leading-snug">নোট, সাজেশন ও প্রশ্নব্যাংক ({studyMaterials.filter(s => s.isApproved).length}+)</p>
        </button>

        <button
          onClick={() => setActiveTab('books')}
          className="p-4 bg-white hover:bg-purple-50/40 border border-slate-200/80 hover:border-purple-200 rounded-2xl text-left transition-all cursor-pointer shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1">বই বিনিময়</h3>
          <p className="text-xs text-slate-500 leading-snug">ক্রয়, বিক্রয় ও ফ্রি ডিস্ট্রিবিউশন ({books.length}+)</p>
        </button>

        <button
          onClick={() => setActiveTab('lostfound')}
          className="p-4 bg-white hover:bg-amber-50/40 border border-slate-200/80 hover:border-amber-200 rounded-2xl text-left transition-all cursor-pointer shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <SearchCode className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1">লস্ট অ্যান্ড ফাউন্ড</h3>
          <p className="text-xs text-slate-500 leading-snug">হারানো জিনিস ফিরে পান ({lostFoundItems.length}+)</p>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className="p-4 bg-white hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-200 rounded-2xl text-left transition-all cursor-pointer shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1">কমিউনিটি</h3>
          <p className="text-xs text-slate-500 leading-snug">গ্রুপ স্টাডি, টিউশন ও আলোচনা</p>
        </button>
      </div>

      {/* App Download & PWA Install Card */}
      <AppDownloadCard />

      {/* Urgent Help Section */}
      {urgentHelpPosts.length > 0 && (
        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">জরুরি সাহায্যের আহ্বান</h3>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('help');
                setActiveTab('community');
              }}
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 cursor-pointer flex items-center gap-1"
            >
              সব দেখুন <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentHelpPosts.slice(0, 2).map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="p-3.5 bg-white border border-rose-100 rounded-xl hover:shadow-xs transition-shadow cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                    <span className="font-semibold text-slate-800">{post.authorName}</span>
                    <span>·</span>
                    <span>{post.authorCollege}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5 leading-snug line-clamp-1">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-xs">
                  <span className="text-rose-600 font-semibold">জরুরি সহযোগিতা প্রয়োজন</span>
                  <span className="text-indigo-600 font-medium">বিস্তারিত পড়ুন →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Latest Posts Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">সাম্প্রতিক পোস্ট ও আলোচনা</h3>
          <span className="text-xs text-slate-500">মোট {filteredPosts.length}টি পোস্ট</span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm mb-1">কোনো পোস্ট পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-500 mb-4">আপনার অনুসন্ধানের সাথে সামঞ্জস্যপূর্ণ কোনো পোস্ট নেই।</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
            >
              ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.slice(0, displayCount).map((post) => {
              const isLiked = currentUser && post.likes.includes(currentUser.uid);

              return (
                <article
                  key={post.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Author & unboxed metadata */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        {post.authorAvatar ? (
                          <img src={post.authorAvatar} alt={post.authorName} className="w-9 h-9 rounded-full object-cover border border-slate-100" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                            {post.authorName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-slate-900 text-xs sm:text-sm leading-tight">
                            {post.authorName}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <span className="truncate max-w-[150px]">{post.authorCollege}</span>
                            <span>·</span>
                            <span>{new Date(post.createdAt).toLocaleDateString('bn-BD')}</span>
                          </div>
                        </div>
                      </div>

                      {post.isUrgent && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          জরুরি
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div 
                      onClick={() => onSelectPost(post)}
                      className="cursor-pointer group"
                    >
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                        {post.content}
                      </p>
                    </div>

                    {/* Poll preview if exists */}
                    {post.poll && (
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mb-4">
                        <p className="text-xs font-semibold text-slate-800 mb-2">📊 {post.poll.question}</p>
                        <div className="space-y-1.5">
                          {post.poll.options.map(opt => (
                            <div key={opt.id} className="text-xs text-slate-600 flex justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-100">
                              <span className="truncate">{opt.text}</span>
                              <span className="font-bold text-indigo-600 ml-2">{opt.votes.length} ভোট</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer controls: Like, Comment count, Detail */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLikePost(post.id);
                        }}
                        className={`flex items-center gap-1.5 font-medium cursor-pointer transition-colors ${
                          isLiked ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
                        <span>{post.likes.length}</span>
                      </button>

                      <button
                        onClick={() => onSelectPost(post)}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.commentCount} মন্তব্য</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onSelectPost(post)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      বিস্তারিত পড়ুন →
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {filteredPosts.length > displayCount && (
          <div className="text-center pt-4">
            <button
              onClick={() => setDisplayCount(prev => prev + 6)}
              className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              আরও পোস্ট দেখুন ({filteredPosts.length - displayCount}টি বাকি)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
