import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Play,
  Sparkles,
  PlusCircle,
  Video,
  Send,
  Building2,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Post, UserProfile, UserRole } from '../types';

interface FeedViewProps {
  currentUser: UserProfile;
  posts: Post[];
  onAddPost: (newPost: Post) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  currentUser,
  posts,
  onAddPost,
  onLikePost,
  onAddComment,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'students'>('all');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'showcase' | 'video' | 'career_journey'>('text');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [activeVideoModal, setActiveVideoModal] = useState<Post | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({});

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'students') return post.authorRole === 'student';
    return true;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      authorHeadline: currentUser.headline || `${currentUser.role.toUpperCase()} @ Richfield`,
      campus: currentUser.campus || 'Richfield College',
      timestamp: 'Just now',
      content: postContent,
      type: postType,
      videoUrl: postType === 'video' ? (videoUrlInput || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4') : undefined,
      videoThumbnail: postType === 'video' ? 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop' : undefined,
      videoDuration: postType === 'video' ? '0:45' : undefined,
      tags: ['Enrich', 'RichfieldEcosystem', postType === 'video' ? 'VideoPitch' : 'CampusUpdate'],
      likes: 1,
      hasLiked: true,
      targetAudience: 'all',
      comments: []
    };

    onAddPost(newPost);
    setPostContent('');
    setVideoUrlInput('');
    setIsCreatingPost(false);
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student':
        return <GraduationCap className="w-3.5 h-3.5 text-[#4B8F8C]" />;
      case 'alumni':
        return <Briefcase className="w-3.5 h-3.5 text-[#C5979D]" />;
      case 'business':
        return <Building2 className="w-3.5 h-3.5 text-[#2C365E]" />;
      case 'admin':
        return <Sparkles className="w-3.5 h-3.5 text-[#4B8F8C]" />;
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Role-tailored Banner Notice */}
      <div className="bg-gradient-to-r from-[#2B193D] via-[#2C365E] to-[#484D6D] rounded-2xl p-4 text-white shadow-sm flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C5979D] px-2 py-0.5 rounded-md bg-white/10">
              Personalized Feed
            </span>
            <span className="text-xs text-slate-300">
              {currentUser.role === 'student'
                ? 'Showing Richfield peer projects & graduate openings'
                : currentUser.role === 'alumni'
                ? 'Showing alumni networks & mentorship opportunities'
                : 'Showing verified Richfield talent spotlights'}
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-bold">
            Welcome back, {currentUser.name}!
          </h2>
        </div>
        <button
          onClick={() => setIsCreatingPost(true)}
          className="px-3.5 py-2 rounded-xl bg-[#4B8F8C] hover:bg-[#3d7573] text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* Feed Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Updates' },
          { id: 'students', label: 'Student Showcases', icon: GraduationCap },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === filter.id
                ? 'bg-[#2B193D] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {filter.icon && <filter.icon className="w-3.5 h-3.5" />}
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Create Post Card / Composer */}
      {isCreatingPost ? (
        <form
          onSubmit={handleCreatePost}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-[#2B193D]">
              Share with the Richfield Community
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingPost(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="flex gap-2">
            {[
              { type: 'text', label: 'Update' },
              { type: 'showcase', label: 'Project Showcase' },
              { type: 'video', label: 'Video Pitch (45s)' },
              { type: 'career_journey', label: 'Career Story' },
            ].map((t) => (
              <button
                type="button"
                key={t.type}
                onClick={() => setPostType(t.type as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  postType === t.type
                    ? 'bg-[#4B8F8C] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <textarea
            required
            rows={3}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder={
              postType === 'video'
                ? 'Introduce your video pitch: e.g. Final year capstone project walkthrough...'
                : 'What are you working on or achieving at Richfield College?'
            }
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
          />

          {postType === 'video' && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-medium text-slate-700">
                Short-Form Video URL (or sample pitch video)
              </label>
              <input
                type="url"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
              />
              <p className="text-[11px] text-slate-500">
                💡 Pitch videos under 60 seconds receive 3x more recruiter views on Enrich.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreatingPost(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#2B193D] hover:bg-[#2C365E] text-white text-xs font-bold shadow-xs"
            >
              Publish Update
            </button>
          </div>
        </form>
      ) : (
        <div
          onClick={() => setIsCreatingPost(true)}
          className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs flex items-center gap-3 cursor-pointer hover:border-slate-300 transition-colors"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#4B8F8C]"
          />
          <div className="flex-1 bg-slate-50 hover:bg-slate-100 rounded-xl px-3.5 py-2 text-xs text-slate-500 border border-slate-200/60">
            Share a project update, pitch video, or career achievement...
          </div>
          <button
            type="button"
            className="p-2 rounded-xl bg-[#4B8F8C]/10 text-[#4B8F8C] hover:bg-[#4B8F8C]/20 transition-colors"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isCommentsOpen = expandedComments[post.id];
          return (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
            >
              {/* Post Header */}
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-[#2B193D]">
                        {post.authorName}
                      </span>
                      <span className="p-0.5 rounded-full bg-slate-100" title={post.authorRole}>
                        {getRoleIcon(post.authorRole)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {post.authorHeadline}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{post.campus}</span>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>

                {post.type === 'video' && (
                  <span className="px-2 py-0.5 rounded-full bg-[#C5979D]/20 text-[#2B193D] font-bold text-[10px] flex items-center gap-1">
                    <Video className="w-3 h-3 text-[#4B8F8C]" /> Video Pitch
                  </span>
                )}
                {post.type === 'career_journey' && (
                  <span className="px-2 py-0.5 rounded-full bg-[#4B8F8C]/15 text-[#4B8F8C] font-bold text-[10px]">
                    Career Journey
                  </span>
                )}
              </div>

              {/* Post Body */}
              <div className="px-4 pb-3">
                <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                  {post.content}
                </p>

                {/* Hashtags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] text-[#4B8F8C] font-semibold hover:underline cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Showcase Card */}
              {post.type === 'video' && post.videoUrl && (
                <div className="relative bg-slate-900 mx-4 mb-3 rounded-xl overflow-hidden aspect-video group">
                  {post.videoThumbnail ? (
                    <img
                      src={post.videoThumbnail}
                      alt="Pitch thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#2B193D] to-[#2C365E]" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button
                      onClick={() => setActiveVideoModal(post)}
                      className="w-12 h-12 rounded-full bg-[#4B8F8C] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                    >
                      <Play className="w-5 h-5 ml-0.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                    {post.videoDuration || '0:45'}
                  </div>
                </div>
              )}

              {/* Engagement Stats & Actions */}
              <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onLikePost(post.id)}
                    className={`flex items-center gap-1.5 font-medium transition-colors ${
                      post.hasLiked ? 'text-rose-600 font-bold' : 'hover:text-[#2B193D]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-rose-600' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    onClick={() =>
                      setExpandedComments((prev) => ({
                        ...prev,
                        [post.id]: !prev[post.id],
                      }))
                    }
                    className="flex items-center gap-1.5 hover:text-[#2B193D] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments.length}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Richfield Network</span>
                </div>
              </div>

              {/* Comments Section */}
              {isCommentsOpen && (
                <div className="bg-slate-50/70 p-4 border-t border-slate-100 space-y-3">
                  {post.comments.length > 0 && (
                    <div className="space-y-2">
                      {post.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="flex items-start gap-2.5 text-xs bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs"
                        >
                          <img
                            src={comment.authorAvatar}
                            alt={comment.authorName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#2B193D]">
                                {comment.authorName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {comment.timestamp}
                              </span>
                            </div>
                            <p className="text-slate-700 mt-0.5 leading-snug">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment input */}
                  <div className="flex items-center gap-2">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCommentSubmit(post.id);
                        }
                      }}
                      placeholder="Write a supportive comment..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                    />
                    <button
                      type="button"
                      onClick={() => handleCommentSubmit(post.id)}
                      className="p-1.5 rounded-xl bg-[#2B193D] text-white hover:bg-[#2C365E] transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Video Modal Player */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 text-white">
            <div className="p-3 bg-slate-900 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <img
                  src={activeVideoModal.authorAvatar}
                  alt={activeVideoModal.authorName}
                  className="w-7 h-7 rounded-full"
                />
                <div>
                  <div className="text-xs font-bold">{activeVideoModal.authorName}</div>
                  <div className="text-[10px] text-slate-400">Richfield Student Pitch Showcase</div>
                </div>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white"
              >
                Close
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={activeVideoModal.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 bg-slate-900 text-xs text-slate-300">
              <p>{activeVideoModal.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
