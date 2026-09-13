import React, { useEffect, useState } from "react";
import { api, fetchBlobUrl } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Heart, MessageCircle, Image as ImageIcon, Video, Send, Trash2, Flag } from "lucide-react";

function Post({ post, me, onChange }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newC, setNewC] = useState("");
  const [mediaBlob, setMediaBlob] = useState(null);
  useEffect(() => { if (post.media_url) fetchBlobUrl(post.media_url).then(setMediaBlob); }, [post.media_url]);
  const openComments = async () => { const r = await api.get(`/posts/${post.id}/comments`); setComments(r.data); setShowComments(true); };
  const submitC = async () => { if (!newC) return; await api.post(`/posts/${post.id}/comments`, { content: newC }); setNewC(""); const r = await api.get(`/posts/${post.id}/comments`); setComments(r.data); onChange?.(); };
  const like = async () => { await api.post(`/posts/${post.id}/like`); onChange?.(); };
  const del = async () => { if (!window.confirm("Delete this post?")) return; await api.delete(`/posts/${post.id}`); onChange?.(); };
  const report = async () => { const cat = prompt("Report category (spam, harassment, inappropriate, other):", "spam"); if (!cat) return; await api.post("/reports", { target_type: "post", target_id: post.id, category: cat }); toast.success("Reported"); };
  const initials = `${(post.author?.first_name||"?")[0]}${(post.author?.last_name||"")[0]||""}`.toUpperCase();
  return (
    <Card><CardContent className="p-5">
      <div className="flex items-start gap-3">
        <Avatar className="w-11 h-11"><AvatarFallback className="bg-slate-900 text-white">{initials}</AvatarFallback></Avatar>
        <div className="flex-1">
          <Link to={`/profile/${post.author?.id}`} data-testid={`post-author-${post.id}`} className="font-medium hover:text-blue-600">{post.author?.first_name} {post.author?.last_name}</Link>
          <div className="text-xs text-slate-500">{post.author?.role} · {new Date(post.created_at).toLocaleString()}</div>
        </div>
        {(me.id === post.author_id || me.role === "admin") && <Button size="icon" variant="ghost" onClick={del} data-testid={`del-post-${post.id}`}><Trash2 className="w-4 h-4 text-slate-500" /></Button>}
        {me.id !== post.author_id && <Button size="icon" variant="ghost" onClick={report} data-testid={`report-post-${post.id}`}><Flag className="w-4 h-4 text-slate-500" /></Button>}
      </div>
      <p className="mt-3 text-sm text-slate-800 whitespace-pre-line">{post.content}</p>
      {mediaBlob && (post.media_type === "video" ? <video controls src={mediaBlob} className="mt-3 rounded-lg max-h-96 w-full" /> : <img src={mediaBlob} alt="" className="mt-3 rounded-lg max-h-96" />)}
      <div className="mt-4 flex items-center gap-4">
        <button onClick={like} data-testid={`like-${post.id}`} className={`flex items-center gap-1 text-sm ${post.liked_by_me ? "text-red-600" : "text-slate-600"} hover:text-red-600`}><Heart className={`w-4 h-4 ${post.liked_by_me?"fill-red-600":""}`} /> {post.likes_count}</button>
        <button onClick={openComments} data-testid={`comment-${post.id}`} className="flex items-center gap-1 text-sm text-slate-600 hover:text-blue-600"><MessageCircle className="w-4 h-4" /> {post.comments_count}</button>
      </div>
      {showComments && (
        <div className="mt-4 space-y-2 border-t pt-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2"><Avatar className="w-7 h-7"><AvatarFallback className="text-[10px] bg-slate-700 text-white">{c.author?.first_name?.[0]}</AvatarFallback></Avatar><div className="bg-slate-100 rounded-lg px-3 py-2 flex-1"><div className="text-xs font-medium">{c.author?.first_name} {c.author?.last_name}</div><div className="text-sm">{c.content}</div></div></div>
          ))}
          <div className="flex gap-2 pt-2"><Input value={newC} onChange={(e)=>setNewC(e.target.value)} placeholder="Write a comment…" data-testid={`comment-input-${post.id}`} /><Button onClick={submitC} className="bg-blue-600 hover:bg-blue-700" data-testid={`comment-submit-${post.id}`}><Send className="w-4 h-4" /></Button></div>
        </div>
      )}
    </CardContent></Card>
  );
}

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [posting, setPosting] = useState(false);

  const load = async () => setPosts((await api.get("/posts")).data);
  useEffect(() => { load(); }, []);

  const post = async () => {
    if (!content && !media) return;
    setPosting(true);
    try {
      let media_url = null, media_type = null;
      if (media) {
        const fd = new FormData(); fd.append("file", media);
        const r = await api.post("/uploads/media", fd, { headers: { "Content-Type": "multipart/form-data" } });
        media_url = r.data.path; media_type = r.data.kind;
      }
      await api.post("/posts", { content, media_url, media_type });
      setContent(""); setMedia(null); toast.success("Posted"); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed to post"); }
    finally { setPosting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="font-heading font-extrabold text-3xl">Feed</h1>
      <Card><CardContent className="p-5">
        <Textarea data-testid="post-content" rows={3} placeholder="Share a professional update, project, or opportunity…" value={content} onChange={(e)=>setContent(e.target.value)} />
        {media && <Badge variant="outline" className="mt-2">{media.name} ({(media.size/1024/1024).toFixed(1)}MB)</Badge>}
        <div className="mt-3 flex items-center gap-2">
          <label className="btn-secondary cursor-pointer flex items-center gap-1 text-xs" data-testid="post-image-btn"><ImageIcon className="w-4 h-4" /> Image<input type="file" accept="image/*" className="hidden" onChange={(e)=>setMedia(e.target.files[0])} /></label>
          <label className="btn-secondary cursor-pointer flex items-center gap-1 text-xs" data-testid="post-video-btn"><Video className="w-4 h-4" /> Video<input type="file" accept="video/*" className="hidden" onChange={(e)=>setMedia(e.target.files[0])} /></label>
          <Button className="ml-auto bg-blue-600 hover:bg-blue-700" onClick={post} disabled={posting} data-testid="post-submit">{posting ? "Posting…" : "Post"}</Button>
        </div>
      </CardContent></Card>
      <div className="space-y-3">{posts.map((p) => <Post key={p.id} post={p} me={user} onChange={load} />)}</div>
      {!posts.length && <div className="text-center text-slate-500 py-10">Be the first to share.</div>}
    </div>
  );