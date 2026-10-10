import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Heart, 
  MessageSquare, 
  Share2, 
  Send, 
  Flag, 
  Trash2, 
  CheckCircle2, 
  CornerDownRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { CommunityPost, PostComment } from '../../types';
import { ReportModal } from '../common/ReportModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface PostDetailModalProps {
  post: CommunityPost | null;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose, onOpenAuth }) => {
  const { 
    comments, 
    addComment, 
    addReply, 
    toggleLikePost, 
    votePoll, 
    deletePost, 
    addToast 
  } = useApp();
  const { currentUser, isAdmin } = useAuth();

  const [commentText, setCommentText] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  if (!post) return null;

  const postComments: PostComment[] = comments[post.id] || [];
  const isLiked = currentUser && post.likes.includes(currentUser.uid);
  const isAuthor = currentUser && post.authorId === currentUser.uid;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!commentText.trim()) return;

    addComment(post.id, commentText.trim());
    setCommentText('');
  };

  const handleReplySubmit = (commentId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const text = replyTextMap[commentId];
    if (!text || !text.trim()) return;

    addReply(post.id, commentId, text.trim());
    setReplyTextMap(prev => ({ ...prev, [commentId]: '' }));
    setActiveReplyId(null);
  };

  // Poll calculations
  const totalVotes = post.poll ? post.poll.options.reduce((acc, curr) => acc + curr.votes.length, 0) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            {post.authorAvatar ? (
              <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                {post.authorName.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">{post.authorName}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {post.authorCollege} · {new Date(post.createdAt).toLocaleDateString('bn-BD')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
              title="রিপোর্ট করুন"
            >
              <Flag className="w-4 h-4" />
            </button>
            {(isAuthor || isAdmin) && (
              <button
                onClick={() => setConfirmDeleteOpen(true)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {post.isUrgent && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>জরুরি সাহায্য আহ্বান: দ্রুত সহমর্মিতা ও তথ্য সহায়তা প্রত্যাশিত।</span>
            </div>
          )}

          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-3">
              {post.title}
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {post.imageUrl && (
            <div className="rounded-2xl overflow-hidden bg-slate-100 max-h-72">
              <img
                src={post.imageUrl}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Interactive Poll */}
          {post.poll && (
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">📊 {post.poll.question}</h4>
                <span className="text-[11px] text-slate-500 font-medium">মোট {totalVotes} ভোট</span>
              </div>

              <div className="space-y-2">
                {post.poll.options.map((opt) => {
                  const hasVoted = currentUser && opt.votes.includes(currentUser.uid);
                  const percentage = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => currentUser ? votePoll(post.id, opt.id) : onOpenAuth()}
                      className={`relative p-2.5 rounded-xl border text-xs cursor-pointer transition-all overflow-hidden ${
                        hasVoted 
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-950 font-semibold' 
                          : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700'
                      }`}
                    >
                      {/* Vote Progress Fill */}
                      <div
                        className="absolute inset-y-0 left-0 bg-indigo-100/70 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          {hasVoted && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                          {opt.text}
                        </span>
                        <span className="font-bold text-slate-700">{percentage}% ({opt.votes.length})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2 pb-2 border-y border-slate-100 text-xs">
            <button
              onClick={() => currentUser ? toggleLikePost(post.id) : onOpenAuth()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                isLiked ? 'text-rose-600 bg-rose-50 font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
              <span>{post.likes.length} পছন্দ</span>
            </button>

            <span className="text-slate-500 font-medium flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{postComments.length} টি মন্তব্য</span>
            </span>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">আলোচনা ও মন্তব্য</h4>

            {postComments.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন!</p>
            ) : (
              <div className="space-y-3">
                {postComments.map((comm) => (
                  <div key={comm.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {comm.authorAvatar ? (
                          <img src={comm.authorAvatar} alt={comm.authorName} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                            {comm.authorName.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs font-bold text-slate-800">{comm.authorName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comm.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed pl-8">
                      {comm.content}
                    </p>

                    {/* Replies */}
                    {comm.replies && comm.replies.length > 0 && (
                      <div className="pl-8 pt-1 space-y-2">
                        {comm.replies.map(rep => (
                          <div key={rep.id} className="p-2 bg-white rounded-lg border border-slate-100 text-xs">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-0.5">
                              <span>{rep.authorName}</span>
                              <span className="text-[9px] text-slate-400">
                                {new Date(rep.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-600">{rep.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Toggle & Input */}
                    <div className="pl-8 pt-1">
                      {activeReplyId === comm.id ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="text"
                            value={replyTextMap[comm.id] || ''}
                            onChange={(e) => setReplyTextMap(prev => ({ ...prev, [comm.id]: e.target.value }))}
                            placeholder="উত্তর লিখুন..."
                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => handleReplySubmit(comm.id)}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 cursor-pointer"
                          >
                            পাঠান
                          </button>
                          <button
                            onClick={() => setActiveReplyId(null)}
                            className="text-xs text-slate-400 hover:text-slate-600"
                          >
                            বাতিল
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveReplyId(comm.id)}
                          className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CornerDownRight className="w-3 h-3" /> উত্তর দিন
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Comment Input */}
        <form onSubmit={handleCommentSubmit} className="p-4 bg-slate-50 border-t border-slate-100 shrink-0 flex items-center gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={currentUser ? "আপনার মন্তব্য লিখুন..." : "মন্তব্য করতে লগইন করুন..."}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <ReportModal
          isOpen={true}
          onClose={() => setReportModalOpen(false)}
          targetId={post.id}
          targetType="post"
          targetTitle={post.title}
        />
      )}

      {/* Confirm Delete */}
      {confirmDeleteOpen && (
        <ConfirmModal
          isOpen={true}
          title="পোস্টটি মুছে ফেলবেন?"
          description="পোস্ট এবং এর সকল মন্তব্য স্থায়ীভাবে মুছে ফেলা হবে।"
          confirmLabel="মুছে ফেলুন"
          onConfirm={() => {
            deletePost(post.id);
            setConfirmDeleteOpen(false);
            onClose();
          }}
          onClose={() => setConfirmDeleteOpen(false)}
        />
      )}
    </div>
  );
};
