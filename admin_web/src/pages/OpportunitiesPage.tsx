import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Opportunity } from '../types';
import { setOpportunityStatus } from '../lib/dataService';

export const OpportunitiesPage: React.FC = () => {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending_approval' | 'approved' | 'rejected' | 'all'>('pending_approval');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });
    const mapped = (data || []).map((r: any) => ({
      id: r.id,
      companyId: r.company_id,
      companyName: r.company_name,
      companyLogo: r.company_logo || '',
      title: r.title,
      type: r.type,
      location: r.location,
      isRemote: !!r.is_remote,
      campusTarget: r.campus_target || undefined,
      requiredProgramme: r.required_programme || [],
      requiredSkills: r.required_skills || [],
      description: r.description || '',
      responsibilities: r.responsibilities || [],
      stipendSalary: r.stipend_salary || '',
      closingDate: r.closing_date || '',
      status: r.status,
      applicantsCount: r.applicants_count || 0,
    } as Opportunity));
    setOpps(mapped);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter === 'all' ? opps : opps.filter((o) => o.status === filter);

  const act = async (id: string, status: 'approved' | 'rejected') => {
    await setOpportunityStatus(id, status);
    await load();
  };

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading opportunities…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Opportunities</h1>
          <p className="text-sm text-slate-500">Verify stipend compliance. Approved posts go live in mobile Career Hub instantly.</p>
        </div>
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
          {(['pending_approval', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${filter === f ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Company</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Stipend</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/60">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{o.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{o.description}</div>
                  </td>
                  <td className="p-3 text-xs text-slate-700">{o.companyName}</td>
                  <td className="p-3">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 border text-slate-700 capitalize">{o.type.replace('_', ' ')}</span>
                  </td>
                  <td className="p-3 text-xs font-bold text-slate-900">{o.stipendSalary || '—'}</td>
                  <td className="p-3">
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full border ${o.status === 'pending_approval' ? 'bg-amber-50 text-amber-700 border-amber-200' : o.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1.5">
                      {o.status === 'pending_approval' ? (
                        <>
                          <button onClick={() => act(o.id, 'rejected')} className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50">
                            <X size={14} />
                          </button>
                          <button onClick={() => act(o.id, 'approved')} className="p-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
                            <Check size={14} />
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-8 text-center text-sm text-slate-400">No opportunities in this filter.</div>}
      </div>
    </div>
  );
};
