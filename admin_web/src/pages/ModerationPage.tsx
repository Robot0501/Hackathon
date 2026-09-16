import React, { useEffect, useState } from 'react';
import { Trash2, Flag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Post } from '../types';
import { deletePost } from '../lib/dataService';

export const ModerationPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [postRows, likeRows, commentRows, profiles] = await Promise.all([
      supabase.from('posts').select('*').order('created_at', { ascending: false }).then((r) => r.data || []),
      supabase.from('post_likes').select('*').then((r) => r.data || []),
      supabase.from('comments').select('*').then((r) => r.data || []),
      supabase.from('profiles').select('id,name,role,avatar,headline,campus').then((r) => r.data || []),
    ]);
    const map = new Map((profiles as any[]).map((p) => [p.id, p]));
    const mapped = (postRows as any[]).map((row) => {
      const author: any = map.get(row.author_id);
      const likes = (likeRows as any[]).filter((l) => l.post_id === row.id);
      const comments = (commentRows as any[]).filter((c) => c.post_id === row.id);
      return {
        id: row.id,
        authorId: row.author_id,
        authorName: author?.name || 'Richfield member',
        authorRole: author?.role || 'student',
        authorAvatar: author?.avatar || '',
        authorHeadline: author?.headline || '',
        campus: author?.campus,
        timestamp: new Date(row.created_at).toLocaleDateString(),
        content: row.content,
        type: row.type,
        tags: row.tags || [],
        likes: likes.length,
        comments: comments.map((c: any) => ({ id: c.id, content: c.content })),
        flagged: !!row.flagged,
        isShowcase: row.id?.startsWith('showcase-post:'),
      } as Post;
    });
    setPosts(mapped.filter((p) => !p.isShowcase));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this post? This will remove it from mobile feed instantly (same DB).')) return;
    await deletePost(id);
    await load();
  };

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading posts…</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Moderation</h1>
        <p className="text-sm text-slate-500">Audit live feed. Deleting here removes from mobile instantly.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No posts to moderate.</div>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="p-4 flex gap-4">
              <img src={p.authorAvatar || `https://ui-avatars.com/api/?name=${p.authorName}`} alt={p.authorName} className="w-9 h-9 rounded-xl object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-900">{p.authorName}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 border text-slate-600 capitalize">{p.authorRole}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 border uppercase">{p.type}</span>
                  {p.flagged && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-1">
                      <Flag size={10} /> Flagged
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 mt-1 line-clamp-2">{p.content}</p>
                <div className="text-[11px] text-slate-500 mt-1">
                  {p.likes} likes • {p.comments.length} comments • {p.campus || '—'} • {p.timestamp}
                </div>
              </div>
              <button onClick={() => remove(p.id)} className="self-start px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 text-xs font-bold flex items-center gap-1 hover:bg-rose-100 shrink-0">
                <Trash2 size={12} /> Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
