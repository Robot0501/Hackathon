import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { profileFromRow } from '../lib/authService';
import { UserProfile } from '../types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filter, setFilter] = useState<'all' | 'student' | 'alumni' | 'business' | 'admin'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const mapped = (data || []).map(profileFromRow).filter((u) => !u.isShowcase);
      setUsers(mapped);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = users.filter((u) => {
    if (filter !== 'all' && u.role !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.campus?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const counts = {
    all: users.length,
    student: users.filter((u) => u.role === 'student').length,
    alumni: users.filter((u) => u.role === 'alumni').length,
    business: users.filter((u) => u.role === 'business').length,
    admin: users.filter((u) => u.role === 'admin').length,
  };

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading users…</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Users</h1>
        <p className="text-sm text-slate-500">Grouped by platform role - same profiles the mobile app sees.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'student', 'alumni', 'business', 'admin'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border ${filter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {f} ({counts[f]})
          </button>
        ))}
        <div className="ml-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, campus…"
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs w-56 focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Campus / Org</th>
                <th className="text-left p-3">Verification</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{u.name || 'Richfield member'}</div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-slate-100 border capitalize">{u.role}</span>
                  </td>
                  <td className="p-3 text-xs text-slate-600">{u.role === 'business' ? u.businessDetails?.organizationName || '—' : u.campus || '—'}</td>
                  <td className="p-3 text-[11px] font-mono text-slate-600">{u.verificationId || '—'}</td>
                  <td className="p-3">
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full border ${u.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : u.verificationStatus === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {u.verificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-8 text-center text-sm text-slate-400">No users match filter.</div>}
      </div>
    </div>
  );
};
