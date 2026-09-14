import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  MessageSquare,
  Search,
  GraduationCap,
  Briefcase,
  Building2,
  Send,
  Sparkles,
  MapPin,
  Trophy,
  PlusCircle
} from 'lucide-react';
import { UserProfile, ChatMessage, UserRole } from '../types';

interface NetworkViewProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  connections: { [userId: string]: 'pending' | 'accepted' | 'declined' };
  onSendConnectionRequest: (targetUserId: string) => void;
  onAcceptConnectionRequest: (targetUserId: string) => void;
  onDeclineConnectionRequest: (targetUserId: string) => void;
  chatMessages: ChatMessage[];
  onSendMessage: (receiverId: string, text: string) => void;
}

export const NetworkView: React.FC<NetworkViewProps> = ({
  currentUser,
  allUsers,
  connections,
  onSendConnectionRequest,
  onAcceptConnectionRequest,
  onDeclineConnectionRequest,
  chatMessages,
  onSendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'discover' | 'messages' | 'questions' | 'leaderboard'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const isBusinessView = currentUser.role === 'business';
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'alumni' | 'business'>(
    isBusinessView ? 'student' : 'all'
  );
  const [selectedChatUser, setSelectedChatUser] = useState<UserProfile | null>(
    allUsers.find((u) => u.id !== currentUser.id) || null
  );
  const [messageInput, setMessageInput] = useState('');
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionBody, setQuestionBody] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [questionThreads, setQuestionThreads] = useState([
    {
      id: 'q-1',
      authorName: 'Lerato Mokoena',
      authorRole: 'alumni' as UserRole,
      title: 'How should I prepare for my first software engineering interview?',
      body: 'I have a strong portfolio but I am nervous about the technical interview process. What kinds of questions should I expect and how should I structure my prep?',
      answers: [
        {
          id: 'a-1',
          authorName: 'Aphiwe Ndlovu',
          authorRole: 'student' as UserRole,
          content: 'Practice problem-solving out loud and learn to explain your thinking. It helps to talk through your approach before coding.',
          timestamp: '2h ago'
        },
        {
          id: 'a-2',
          authorName: 'Mpho Sibanda',
          authorRole: 'alumni' as UserRole,
          content: 'Prepare for JavaScript/TypeScript fundamentals, arrays, strings, and one algorithmic question. Also be ready to talk about a project you built.',
          timestamp: '1h ago'
        }
      ]
    },
    {
      id: 'q-2',
      authorName: 'Nandi Khumalo',
      authorRole: 'student' as UserRole,
      title: 'Where is the best place to look for internship opportunities before graduation?',
      body: 'I am currently in my final year and want to start applying early. Are there channels students should use before relying on job portals?',
      answers: [
        {
          id: 'a-3',
          authorName: 'Tinashe Dlamini',
          authorRole: 'business' as UserRole,
          content: 'Use your campus placement channels, alumni referrals, and your network. Most employers will respond faster when there is a trusted introduction.',
          timestamp: '5h ago'
        }
      ]
    }
  ]);

  // Other users excluding current user
  const otherUsers = allUsers.filter((u) => u.id !== currentUser.id);

  const filteredUsers = otherUsers.filter((user) => {
    if (isBusinessView && user.role !== 'student') return false;
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = user.name.toLowerCase().includes(q);
      const matchCampus = user.campus?.toLowerCase().includes(q);
      const matchProgramme = user.programme?.toLowerCase().includes(q);
      const matchCompany = user.currentCompany?.toLowerCase().includes(q);
      const matchSkills = user.technicalSkills.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchCampus && !matchProgramme && !matchCompany && !matchSkills) {
        return false;
      }
    }
    return true;
  });

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatUser || !messageInput.trim()) return;
    onSendMessage(selectedChatUser.id, messageInput.trim());
    setMessageInput('');
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionTitle.trim() || !questionBody.trim()) return;

    setQuestionThreads((prev) => [
      {
        id: `q-${Date.now()}`,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        title: questionTitle.trim(),
        body: questionBody.trim(),
        answers: []
      },
      ...prev
    ]);

    setQuestionTitle('');
    setQuestionBody('');
    setActiveTab('questions');
  };

  const handleSubmitAnswer = (questionId: string) => {
    const draft = (answerDrafts[questionId] || '').trim();
    if (!draft) return;

    setQuestionThreads((prev) =>
      prev.map((thread) =>
        thread.id === questionId
          ? {
              ...thread,
              answers: [
                ...thread.answers,
                {
                  id: `a-${Date.now()}`,
                  authorName: currentUser.name,
                  authorRole: currentUser.role,
                  content: draft,
                  timestamp: 'Just now'
                }
              ]
            }
          : thread
      )
    );

    setAnswerDrafts((prev) => ({ ...prev, [questionId]: '' }));
  };

  const leaderboard = [...allUsers]
    .map((user) => ({
      name: user.name,
      role: user.role,
      score: 18 + user.technicalSkills.length * 2 + user.endorsements.reduce((sum, item) => sum + item.count, 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Messages between current user and selected chat user
  const conversation = chatMessages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.receiverId === selectedChatUser?.id) ||
      (m.senderId === selectedChatUser?.id && m.receiverId === currentUser.id)
  );

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student':
        return <GraduationCap className="w-3.5 h-3.5 text-[#4B8F8C]" />;
      case 'alumni':
        return <Briefcase className="w-3.5 h-3.5 text-[#C5979D]" />;
      case 'business':
        return <Building2 className="w-3.5 h-3.5 text-[#2C365E]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#2B193D]" />;
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header & Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-lg text-[#2B193D]">
              Richfield Professional Network
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#4B8F8C]/15 text-[#4B8F8C] font-bold text-[10px]">
              Institutional Community
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect with verified students, alumni mentors, and enterprise recruiters.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'discover'
                ? 'bg-white text-[#2B193D] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Discover Peers & Mentors</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'messages'
                ? 'bg-white text-[#2B193D] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#4B8F8C]" />
            <span>Direct Messaging</span>
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'questions'
                ? 'bg-white text-[#2B193D] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#C5979D]" />
            <span>Community Q&A</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-white text-[#2B193D] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Helpful Leaders</span>
          </button>
        </div>
      </div>

      {activeTab === 'discover' ? (
        <>
          {/* Search & Filters */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, campus, programme, or skills..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                ...(isBusinessView
                  ? [{ id: 'student', label: 'Student Talent', icon: GraduationCap }]
                  : [
                      { id: 'all', label: 'All Community' },
                      { id: 'student', label: 'Richfield Students', icon: GraduationCap },
                      { id: 'alumni', label: 'Alumni Mentors', icon: Briefcase },
                      { id: 'business', label: 'Corporate Recruiters', icon: Building2 },
                    ]
                )
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setRoleFilter(pill.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    roleFilter === pill.id
                      ? 'bg-[#2B193D] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pill.icon && <pill.icon className="w-3.5 h-3.5" />}
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {filteredUsers.map((user) => {
              const status = connections[user.id];
              return (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#4B8F8C] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-xs sm:text-sm text-[#2B193D] truncate">
                            {user.name}
                          </h3>
                          {user.verificationStatus === 'verified' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#4B8F8C] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1">
                          {user.headline}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#4B8F8C]" />
                          <span className="truncate">{user.campus}</span>
                        </div>
                      </div>
                    </div>

                    {/* Skill tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {user.technicalSkills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedChatUser(user);
                        setActiveTab('messages');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3 text-[#4B8F8C]" />
                      <span>Message</span>
                    </button>

                    {status === 'accepted' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-[#4B8F8C]/15 text-[#4B8F8C] text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                      </span>
                    ) : status === 'pending' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold">
                        Request Pending
                      </span>
                    ) : (
                      <button
                        onClick={() => onSendConnectionRequest(user.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#2B193D] hover:bg-[#2C365E] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#4B8F8C]" />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : activeTab === 'questions' ? (
        <div className="space-y-4">
          <form
            onSubmit={handleAskQuestion}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold text-sm text-[#2B193D]">Ask the Richfield Community</h2>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#4B8F8C]/15 text-[#4B8F8C] font-bold">
                Q&A Forum
              </span>
            </div>

            <input
              type="text"
              value={questionTitle}
              onChange={(e) => setQuestionTitle(e.target.value)}
              placeholder="Ask a question about careers, projects, or campus life..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
            />
            <textarea
              rows={3}
              value={questionBody}
              onChange={(e) => setQuestionBody(e.target.value)}
              placeholder="Add context so others can help you more effectively."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-[#2B193D] hover:bg-[#2C365E] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post Question</span>
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {questionThreads.map((thread) => (
              <div key={thread.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{thread.authorRole}</p>
                    <h3 className="font-bold text-sm text-[#2B193D] mt-0.5">{thread.title}</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                    {thread.answers.length} reply{thread.answers.length === 1 ? '' : 'ies'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{thread.body}</p>
                <p className="text-[10px] text-slate-400 mt-2">Asked by {thread.authorName}</p>

                <div className="mt-4 space-y-2">
                  {thread.answers.length > 0 ? (
                    thread.answers.map((answer) => (
                      <div key={answer.id} className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{answer.authorName}</span>
                          <span className="text-[10px] text-slate-400">{answer.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">{answer.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-500">
                      No answers yet. Be the first to help.
                    </div>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={answerDrafts[thread.id] || ''}
                    onChange={(e) => setAnswerDrafts((prev) => ({ ...prev, [thread.id]: e.target.value }))}
                    placeholder="Share your answer or guidance..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                  />
                  <button
                    type="button"
                    onClick={() => handleSubmitAnswer(thread.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#4B8F8C] hover:bg-[#3d7573] text-white text-xs font-bold"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'leaderboard' ? (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-bold text-sm text-[#2B193D]">This Week’s Top Helpers</h2>
              <p className="text-[11px] text-slate-500">Community leaders who have answered the most questions this week.</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">
              Top 10
            </span>
          </div>

          <div className="space-y-2">
            {leaderboard.map((person, index) => (
              <div
                key={person.name}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-[#2B193D] text-white font-bold text-[11px] flex items-center justify-center">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-[#2B193D]">{person.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{person.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-[#4B8F8C]">{person.score}</p>
                  <p className="text-[10px] text-slate-400">Helpful points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Direct Messaging Pane */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[520px]">
          {/* Conversation List Sidebar */}
          <div className="border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
            <div className="p-3 border-b border-slate-200 font-bold text-xs text-[#2B193D]">
              Conversations
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {otherUsers.map((u) => {
                const isSelected = selectedChatUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedChatUser(u)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-white shadow-xs border border-slate-200'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#2B193D] truncate">{u.name}</span>
                        <span className="text-[9px] uppercase px-1 rounded bg-[#4B8F8C]/15 text-[#4B8F8C] font-semibold">
                          {u.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{u.headline}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Chat Conversation */}
          <div className="md:col-span-2 flex flex-col h-full bg-white">
            {selectedChatUser ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={selectedChatUser.avatar}
                      alt={selectedChatUser.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-[#4B8F8C]"
                    />
                    <div>
                      <div className="font-bold text-xs text-[#2B193D] flex items-center gap-1">
                        <span>{selectedChatUser.name}</span>
                        <CheckCircle2 className="w-3 h-3 text-[#4B8F8C]" />
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {selectedChatUser.role.toUpperCase()} • {selectedChatUser.campus}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#4B8F8C] font-bold px-2 py-0.5 rounded-full bg-[#4B8F8C]/15">
                    Verified End-to-End
                  </span>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {conversation.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
                      <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-xs font-semibold text-slate-600">Start the conversation</p>
                      <p className="text-[11px] max-w-xs mt-1">
                        Send a message to {selectedChatUser.name} to discuss projects, career tips, or campus coursework.
                      </p>
                    </div>
                  ) : (
                    conversation.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                              isMe
                                ? 'bg-[#2B193D] text-white rounded-br-none'
                                : 'bg-slate-100 text-slate-800 rounded-bl-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 px-1">
                            {msg.timestamp}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input Field */}
                <form
                  onSubmit={handleSendMessageSubmit}
                  className="p-3 border-t border-slate-200 flex items-center gap-2 bg-slate-50/50"
                >
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Message ${selectedChatUser.name}...`}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-[#4B8F8C] hover:bg-[#3d7573] text-white transition-colors shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Select a user to begin messaging
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
