import React, { useEffect, useState } from 'react';
import { Building2, Check, X, Sparkles, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { profileFromRow } from '../lib/authService';
import { adminSetBusinessStatus } from '../lib/dataService';

export const BusinessesPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiTarget, setAiTarget] = useState<UserProfile | null>(null);
  const [aiReview, setAiReview] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'business').order('created_at', { ascending: false });
    const rows = (data || []).map(profileFromRow);
    setBusinesses(rows);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const pending = businesses.filter((b) => b.businessDetails?.approvalStatus === 'pending');
  const approved = businesses.filter((b) => b.businessDetails?.approvalStatus === 'approved');
  const rejected = businesses.filter((b) => b.businessDetails?.approvalStatus === 'rejected');

  const localReview = (biz: UserProfile) => {
    const d = biz.businessDetails;
    const checks = [
      { label: 'Recruiter email verified', ok: biz.verificationStatus !== 'unverified' },
      { label: 'Organisation name supplied', ok: !!d?.organizationName?.trim() },
      { label: 'CIPC reference supplied', ok: !!d?.registrationNumber?.trim() && !d.registrationNumber.toLowerCase().includes('pending') },
      { label: 'Website supplied', ok: !!d?.website?.trim() },
      { label: 'Company description supplied', ok: !!d?.companyDescription?.trim() },
      { label: 'Contact email supplied', ok: !!d?.contactEmail?.trim() },
    ];
    const passed = checks.filter((c) => c.ok).length;
    const score = Math.round((passed / checks.length) * 100);
    const risk = score >= 80 ? 'Low' : score >= 55 ? 'Medium' : 'High';
    return { score, risk, checks, summary: score >= 80 ? 'Most evidence present. Confirm externally before approval.' : 'Missing evidence. Request more info or verify manually.', disclaimer: 'AI-assisted review only. Final approval stays with admin.' };
  };

  const runAi = async (biz: UserProfile) => {
    setAiTarget(biz);
    setAiReview(null);
    setAiLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        try {
          const res = await fetch(`${apiUrl}/api/gemini/admin-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ business: biz }),
            signal: controller.signal,
          });
          if (res.ok) {
            const data = await res.json();
            setAiReview(data);
            return;
          }
        } finally {
          clearTimeout(timer);
        }
      }
      setAiReview(localReview(biz));
    } catch {
      setAiReview(localReview(biz));
    } finally {
      setAiLoading(false);
    }
  };

  const setStatus = async (id: string, approved: boolean) => {
    await adminSetBusinessStatus(id, approved);
    await load();
  };

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading businesses…</div>;

  const Row = ({ biz }: { biz: UserProfile }) => (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-slate-700" />
          <span className="font-bold text-sm text-slate-900 truncate">{biz.businessDetails?.organizationName || biz.name}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${biz.businessDetails?.approvalStatus === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : biz.businessDetails?.approvalStatus === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
            {biz.businessDetails?.approvalStatus || biz.verificationStatus}
          </span>
        </div>
        <div className="text-xs text-slate-600 mt-1">
          Contact: {biz.name} ({biz.email}) {biz.businessDetails?.website && <a href={biz.businessDetails.website} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline inline-flex items-center gap-1"> <ExternalLink size={10} /> {biz.businessDetails.website}</a>}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{biz.businessDetails?.companyDescription}</div>
        <div className="text-[10px] font-mono text-slate-500 mt-1">CIPC: {biz.businessDetails?.registrationNumber || '—'}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <button onClick={() => runAi(biz)} className="px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-bold flex items-center gap-1 hover:bg-cyan-100">
          <Sparkles size={12} /> AI Review
        </button>
        {biz.businessDetails?.approvalStatus === 'pending' ? (
          <>
            <button onClick={() => setStatus(biz.id, false)} className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 text-xs font-bold flex items-center gap-1 hover:bg-rose-100">
              <X size={12} /> Reject
            </button>
            <button onClick={() => setStatus(biz.id, true)} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-emerald-700">
              <Check size={12} /> Approve
            </button>
          </>
        ) : (
          <span className="text-[11px] text-slate-500">No action needed</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">Business Vetting</h1>
        <p className="text-sm text-slate-500">Approve employer accounts so they can post opportunities visible in mobile. Same Supabase as mobile.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-900">Pending Approval ({pending.length})</h3>
          <span className="text-[11px] px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">{pending.length} pending</span>
        </div>
        {pending.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400 bg-slate-50 border border-dashed rounded-xl">All businesses vetted.</div>
        ) : (
          <div className="space-y-3">
            {pending.map((b) => (
              <Row key={b.id} biz={b} />
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h4 className="font-bold text-sm text-slate-900 mb-3">Approved ({approved.length})</h4>
          <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
            {approved.map((b) => (
              <Row key={b.id} biz={b} />
            ))}
            {approved.length === 0 && <div className="text-xs text-slate-400">No approved businesses yet.</div>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h4 className="font-bold text-sm text-slate-900 mb-3">Rejected ({rejected.length})</h4>
          <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
            {rejected.map((b) => (
              <Row key={b.id} biz={b} />
            ))}
            {rejected.length === 0 && <div className="text-xs text-slate-400">No rejections.</div>}
          </div>
        </div>
      </div>

      {aiTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setAiTarget(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles size={16} className="text-cyan-600" /> AI Verification Assistant
              </div>
              <button onClick={() => setAiTarget(null)} className="text-slate-400 hover:text-slate-600 text-xl">
                ×
              </button>
            </div>
            <div className="text-xs text-slate-500">{aiTarget.businessDetails?.organizationName}</div>
            {aiLoading ? (
              <div className="py-10 text-center text-sm text-slate-500">Analysing submitted evidence…</div>
            ) : aiReview ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Readiness score</div>
                    <div className="text-2xl font-black text-slate-900">{aiReview.score}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Risk</div>
                    <div className="text-xl font-black text-cyan-700">{aiReview.risk}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{aiReview.summary}</p>
                <div className="space-y-1.5">
                  {(aiReview.checks || []).map((c: any, i: number) => (
                    <div key={i} className="flex gap-2 text-xs p-2 rounded-xl bg-slate-50 border">
                      <span className={c.ok ? 'text-emerald-600 font-black' : 'text-rose-600 font-black'}>{c.ok ? '✓' : '!'}</span>
                      <span className="text-slate-700">{c.label}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">{aiReview.disclaimer}</div>
                <div className="flex gap-2">
                  <button onClick={() => setStatus(aiTarget.id, false)} className="flex-1 py-2 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 font-bold text-xs">
                    Reject
                  </button>
                  <button onClick={() => setStatus(aiTarget.id, true)} className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs">
                    Approve
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
