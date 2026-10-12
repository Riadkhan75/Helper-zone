import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  MessageSquare, 
  Send, 
  Users, 
  BookOpen, 
  ShoppingBag, 
  Smile, 
  ArrowLeft, 
  Search,
  CheckCheck,
  ShieldCheck,
  Sparkles,
  School
} from 'lucide-react';
import { VerifiedBadge } from '../common/VerifiedBadge';

type ChatMode = 'direct' | 'groups';

const QUICK_SUGGESTIONS = [
  'বইটি কি এখনও এভেইলেবল আছে?',
  'দাম কিছুটা কমানো সম্ভব?',
  'ক্যাম্পাসে কখন এবং কোথায় দেখা করবেন?',
  'নোটের পিডিএফ কপি শেয়ার করা যাবে?',
  'ধন্যবাদ! আমি অবশ্যই যোগাযোগ করব।',
];

export const ChatView: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    chatConversations, 
    chatMessages, 
    campusGroups, 
    activeChatId, 
    setActiveChatId, 
    sendMessage,
    addToast 
  } = useApp();

  const [chatMode, setChatMode] = useState<ChatMode>('direct');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto select first conversation or group if none active
  useEffect(() => {
    if (!activeChatId) {
      if (chatMode === 'direct' && chatConversations.length > 0) {
        setActiveChatId(chatConversations[0].id);
      } else if (chatMode === 'groups' && campusGroups.length > 0) {
        setActiveChatId(campusGroups[0].id);
      }
    }
  }, [chatMode, activeChatId, chatConversations, campusGroups, setActiveChatId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeChatId]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">মেসেজিং এ লগইন করুন</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          বই ক্রেতা-বিক্রেতার সাথে যোগাযোগ এবং ক্যাম্পাসের ডিপার্টমেন্ট গ্রুপে আলোচনা করতে অনুগ্রহ করে লগইন করুন।
        </p>
      </div>
    );
  }

  // Active chat details
  const isGroupChat = activeChatId?.startsWith('group_');
  const activeGroup = campusGroups.find(g => g.id === activeChatId);
  const activeConvo = chatConversations.find(c => c.id === activeChatId);
  
  // Find other participant in 1-on-1 chat
  const otherParticipant = activeConvo?.participants.find(p => p.uid !== currentUser.uid) || activeConvo?.participants[0];

  const currentMessages = activeChatId ? (chatMessages[activeChatId] || []) : [];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    sendMessage(activeChatId, inputText.trim(), activeConvo?.contextItem);
    setInputText('');
  };

  const handleQuickSuggestion = (text: string) => {
    if (!activeChatId) return;
    sendMessage(activeChatId, text, activeConvo?.contextItem);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] min-h-[580px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
      
      {/* LEFT SIDEBAR: Conversations & Campus Group Rooms */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200/80 dark:border-slate-800 flex flex-col shrink-0 ${
        activeChatId ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Sidebar Header & Mode Switcher */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <span>ইন-অ্যাপ মেসেজ</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold gap-1">
            <button
              onClick={() => {
                setChatMode('direct');
                if (chatConversations.length > 0) setActiveChatId(chatConversations[0].id);
              }}
              className={`py-2 rounded-xl transition-all ${
                chatMode === 'direct'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ব্যক্তিগত চ্যাট
            </button>
            <button
              onClick={() => {
                setChatMode('groups');
                if (campusGroups.length > 0) setActiveChatId(campusGroups[0].id);
              }}
              className={`py-2 rounded-xl transition-all ${
                chatMode === 'groups'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ক্যাম্পাস গ্রুপ
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          
          {chatMode === 'direct' && (
            <>
              {chatConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <p>এখনও কোনো চ্যাট শুরু হয়নি।</p>
                  <p className="text-[11px]">
                    বই বিনিময় বা স্টাডি মেটেরিয়ালে গিয়ে বিক্রেতার সাথে চ্যাট শুরু করতে পারেন।
                  </p>
                </div>
              ) : (
                chatConversations.map((convo) => {
                  const other = convo.participants.find(p => p.uid !== currentUser.uid) || convo.participants[0];
                  const isSelected = activeChatId === convo.id;

                  return (
                    <div
                      key={convo.id}
                      onClick={() => setActiveChatId(convo.id)}
                      className={`p-4 flex items-start gap-3.5 cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={other?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.displayName || 'User')}`}
                          alt={other?.displayName}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                        />
                        {other?.isVerified && (
                          <div className="absolute -bottom-1 -right-1">
                            <VerifiedBadge size="xs" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                              {other?.displayName}
                            </span>
                            {other?.isVerified && <VerifiedBadge size="xs" />}
                          </div>
                          {convo.lastMessageTime && (
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(convo.lastMessageTime).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        {convo.contextItem && (
                          <span className="inline-block mt-0.5 text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-md truncate max-w-full">
                            বই: {convo.contextItem.title}
                          </span>
                        )}

                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                          {convo.lastMessage || 'নতুন বার্তা পাঠান...'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {chatMode === 'groups' && (
            <>
              {campusGroups.map((group) => {
                const isSelected = activeChatId === group.id;

                return (
                  <div
                    key={group.id}
                    onClick={() => setActiveChatId(group.id)}
                    className={`p-4 flex items-start gap-3.5 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-slate-800 text-xl flex items-center justify-center shrink-0">
                      {group.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {group.name}
                        </h4>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-500 font-bold">
                          {group.memberCount} সদস্য
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {group.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          )}

        </div>
      </div>

      {/* RIGHT MAIN CHAT PANE */}
      <div className={`flex-1 flex-col h-full bg-slate-50/50 dark:bg-slate-950/30 ${
        activeChatId ? 'flex' : 'hidden md:flex'
      }`}>
        {activeChatId ? (
          <>
            {/* Top Chat Header */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveChatId(null)}
                  className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {isGroupChat ? (
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-slate-800 text-lg flex items-center justify-center">
                    {activeGroup?.icon}
                  </div>
                ) : (
                  <img
                    src={otherParticipant?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant?.displayName || 'User')}`}
                    alt={otherParticipant?.displayName}
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                )}

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      {isGroupChat ? activeGroup?.name : otherParticipant?.displayName}
                    </h3>
                    {!isGroupChat && otherParticipant?.isVerified && (
                      <VerifiedBadge size="xs" showLabel />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isGroupChat ? `${activeGroup?.category} · পাবলিক আলোচনা ফোরাম` : otherParticipant?.collegeName}
                  </p>
                </div>
              </div>
            </div>

            {/* Context Item Banner (e.g. Inquiring about a book) */}
            {!isGroupChat && activeConvo?.contextItem && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-2 truncate">
                  <ShoppingBag className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold truncate">বইয়ের আলোচনা: {activeConvo.contextItem.title}</span>
                  {activeConvo.contextItem.price !== undefined && (
                    <span className="font-extrabold bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded-md">
                      ৳ {activeConvo.contextItem.price}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {currentMessages.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="font-bold">চ্যাট শুরু করুন!</p>
                  <p className="text-[11px]">নিচের সাজেশন চিপস থেকে নির্বাচন করুন বা বার্তা লিখুন।</p>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.uid;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <img
                          src={msg.senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}`}
                          alt={msg.senderName}
                          className="w-8 h-8 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                      )}

                      <div className={`max-w-[75%] sm:max-w-md rounded-2xl p-3.5 space-y-1 shadow-xs ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-bl-xs'
                      }`}>
                        {!isMe && isGroupChat && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">
                            <span>{msg.senderName}</span>
                            {msg.senderIsVerified && <VerifiedBadge size="xs" />}
                          </div>
                        )}

                        <p className="text-xs leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>

                        <div className={`text-[10px] flex items-center justify-end gap-1 ${
                          isMe ? 'text-indigo-200' : 'text-slate-400'
                        }`}>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-4 py-2 bg-white/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800 flex overflow-x-auto gap-2 scrollbar-none">
              {QUICK_SUGGESTIONS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickSuggestion(chip)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer border border-slate-200/50 dark:border-slate-700"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Message Input Bar */}
            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="একটি বার্তা লিখুন..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
              চ্যাট নির্বাচন করুন
            </h3>
            <p className="text-xs max-w-xs">
              বাম পাশ থেকে যেকোনো কথোপকথন বা ক্যাম্পাস গ্রুপ নির্বাচন করে বার্তা পাঠানো শুরু করুন।
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
