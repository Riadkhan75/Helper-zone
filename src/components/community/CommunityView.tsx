import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Search, 
  Plus, 
  Heart, 
  MessageSquare, 
  AlertCircle, 
  BarChart2, 
  Filter,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { CommunityPost, PostCategory } from '../../types';

interface CommunityViewProps {
  onOpenCreatePost: () => void;
  onSelectPost: (post: CommunityPost) => void;
  onOpenAuth: () => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  onOpenCreatePost,
  onSelectPost,
  onOpenAuth,
}) => {
  const { posts, toggleLikePost } = useApp();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const filteredPosts = posts.filter(post => {
    const matchesSearch = search === '' ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase()) ||
      post.authorCollege.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCat === 'all' || post.category === selectedCat;

    return matchesSearch && matchesCategory;
  });

  const categories: { id: string; label: string; count?: number }[] = [
    { id: 'all', label: 'সকল আলোচনা' },
    { id: 'help', label: 'জরুরি সাহায্য' },
    { id: 'study_partner', label: 'স্টাডি পার্টনার' },
    { id: 'tuition', label: 'টিউশন ও জব' },
    { id: 'question', label: 'প্রশ্নোত্তর' },
    { id: 'club', label: 'ক্লাব ও ইভেন্ট' },
  ];

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-emerald-200">
            <Users className="w-3.5 h-3.5" />
            <span>শিক্ষার্থী ফোরাম ও নেটওয়ার্ক</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold">কমিউনিটি ও হেল্প জোন</h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            স্টাডি পার্টনার খুঁজুন, টিউটর বা টিউশন বিজ্ঞপ্তি দিন, রক্তদান বা যেকোনো ক্যাম্পাস সমস্যায় সাহায্য চান।
          </p>
        </div>

        <button
          onClick={() => currentUser ? onOpenCreatePost() : onOpenAuth()}
          className="px-4 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন আলোচনা শুরু করুন</span>
        </button>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="কমিউনিটির পোস্ট, প্রশ্ন বা টিউশন খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                selectedCat === c.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm mb-1">কোনো পোস্ট পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500 mb-4">অনুসন্ধানের সাথে মিল রেখে কোনো আলোচনা নেই।</p>
          <button
            onClick={() => currentUser ? onOpenCreatePost() : onOpenAuth()}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            প্রথম পোস্টটি লিখুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => {
            const isLiked = currentUser && post.likes.includes(currentUser.uid);

            return (
              <article
                key={post.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt={post.authorName} className="w-9 h-9 rounded-full object-cover border border-slate-100" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                          {post.authorName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-slate-900 text-xs sm:text-sm leading-tight">
                          {post.authorName}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {post.authorCollege} · {new Date(post.createdAt).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    </div>

                    {post.isUrgent && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> জরুরি
                      </span>
                    )}
                  </div>

                  <div 
                    onClick={() => onSelectPost(post)}
                    className="cursor-pointer group"
                  >
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                      {post.content}
                    </p>
                  </div>

                  {post.poll && (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mb-4 text-xs">
                      <p className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                        <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{post.poll.question}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {post.poll.options.length} টি বিকল্প · ভোট দিতে ক্লিক করুন
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        currentUser ? toggleLikePost(post.id) : onOpenAuth();
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
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    বিস্তারিত দেখুন →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
