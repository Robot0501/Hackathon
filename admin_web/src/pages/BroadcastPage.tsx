import React, { useState } from 'react';
import { Megaphone, Send } from 'lucide-react';
import { broadcastAnnouncement } from '../lib/dataService';

export const BroadcastPage: React.FC = () => {
  const [target, setTarget] = useState<'all' | 'students' | 'alumni' | 'business'>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setLoading(true);
    try {
      await broadcastAnnouncement(title.trim(), message.trim(), target);
      setTitle('');
      setMessage('');
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Broadcast failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Megaphone size={16} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900">Broadcast Announcement</h1>
            <p className="text-xs text-slate-500">Sends high-priority notification to targeted users in mobile app (same DB).</p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'students', 'alumni', 'business'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setTarget(t)} className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border ${target === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {t}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Inserts into <code className="bg-slate-100 px-1 rounded">notifications</code> for each matching <code className="bg-slate-100 px-1 rounded">profiles.role</code>.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 2026 Graduate Placement Fair Registration Open" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-slate-400" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Details regarding the broadcast notice…" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-slate-400" required />
          </div>

          {done && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">Broadcast dispatched to {target.toUpperCase()} recipients.</div>}

          <button type="submit" disabled={loading} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2">
            <Send size={14} /> {loading ? 'Dispatching…' : 'Dispatch Broadcast'}
          </button>
        </form>

        <div className="mt-6 p-3 rounded-xl bg-slate-50 border text-[11px] text-slate-600 leading-relaxed">
          <span className="font-bold">Prototype note:</span> This writes directly to Supabase <code className="bg-white px-1 rounded border">notifications</code>. Mobile users see it after next <code className="bg-white px-1 rounded border">listNotifications()</code> refresh or realtime.
        </div>
      </div>
    </div>
  );
};
