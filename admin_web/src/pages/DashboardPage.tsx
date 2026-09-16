import React, { useEffect, useState } from 'react';
import { Building2, Briefcase, Users, Flag, Calendar, Megaphone } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({ pendingBiz: 0, pendingOpps: 0, users: 0, posts: 0, events: 0, businesses: 0, students: 0, alumni: 0 });

  useEffect(() => {
    const load = async () => {
      const [biz, opps, profiles, posts, events] = await Promise.all([
        supabase.from('profiles').select('id, business_details').eq('role', 'business'),
        supabase.from('opportunities').select('id, status'),
        supabase.from('profiles').select('id, role'),
        supabase.from('posts').select('id'),
        supabase.from('events').select('id'),
      ]);
      const pendingBiz = (biz.data || []).filter((u: any) => u.business_details?.approvalStatus === 'pending').length;
      const pendingOpps = (opps.data || []).filter((o: any) => o.status === 'pending_approval').length;
      const users = profiles.data?.length || 0;
      const students = (profiles.data || []).filter((p: any) => p.role === 'student').length;
      const alumni = (profiles.data || []).filter((p: any) => p.role === 'alumni').length;
      const businesses = (profiles.data || []).filter((p: any) => p.role === 'business').length;
      setStats({ pendingBiz, pendingOpps, users, posts: posts.data?.length || 0, events: events.data?.length || 0, businesses, students, alumni });
    };
    load();
  }, []);

  const cards = [
    { label: 'Pending Businesses', value: stats.pendingBiz, icon: Building2, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Pending Opportunities', value: stats.pendingOpps, icon: Briefcase, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Students', value: stats.students, icon: Users, color: 'bg-slate-50 text-slate-700 border-slate-200' },
    { label: 'Alumni', value: stats.alumni, icon: Users, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Businesses', value: stats.businesses, icon: Building2, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { label: 'Posts', value: stats.posts, icon: Flag, color: 'bg-white text-slate-700 border-slate-200' },
    { label: 'Events', value: stats.events, icon: Calendar, color: 'bg-white text-slate-700 border-slate-200' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of the Enrich mobile ecosystem - same Supabase as the Android app.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`p-4 rounded-2xl border ${c.color} flex items-center gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-white border flex items-center justify-center shrink-0">
              <c.icon size={16} />
            </div>
            <div>
              <div className="text-xl font-black leading-none">{c.value}</div>
              <div className="text-[11px] font-bold uppercase tracking-wide opacity-80">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Megaphone size={16} className="text-slate-700" />
          <h3 className="font-bold text-sm text-slate-900">How this connects to mobile</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-xs leading-relaxed text-slate-600">
          <div className="p-3 rounded-xl bg-slate-50 border">
            <div className="font-bold text-slate-900 mb-1">1. Approve Business</div>
            Business creates account in mobile (pending). You approve here → `profiles.verification_status='verified'` → mobile business can now post opportunities (RLS `is_verified_business`).
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border">
            <div className="font-bold text-slate-900 mb-1">2. Approve Opportunity</div>
            Business posts (pending_approval). You publish → `opportunities.status='approved'` → mobile students see it in `Opportunities` feed.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border">
            <div className="font-bold text-slate-900 mb-1">3. Moderate / Broadcast</div>
            Deleting a post or broadcasting an announcement writes to `posts` / `notifications` → instantly visible in mobile after refresh (same DB).
          </div>
        </div>
        <div className="mt-4 text-[11px] text-slate-500 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <span className="font-bold text-amber-800">Prototype:</span> No hosting. Run <code className="bg-white px-1 rounded border">npm run dev</code> in <code className="bg-white px-1 rounded border">admin_web/</code> and <code className="bg-white px-1 rounded border">npx expo start</code> in <code className="bg-white px-1 rounded border">mobile/</code> — both point to <code className="bg-white px-1 rounded border">uzwovrzquofdsqrzphlq.supabase.co</code>.
        </div>
      </div>
    </div>
  );
};
