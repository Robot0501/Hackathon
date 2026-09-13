import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router-dom";

const stages = [
  { key: "applied", label: "Applied", tone: "bg-slate-100 text-slate-700" },
  { key: "under_review", label: "Under Review", tone: "bg-blue-100 text-blue-800" },
  { key: "shortlisted", label: "Shortlisted", tone: "bg-emerald-100 text-emerald-800" },
  { key: "interview", label: "Interview", tone: "bg-purple-100 text-purple-800" },
  { key: "accepted", label: "Accepted", tone: "bg-emerald-600 text-white" },
  { key: "rejected", label: "Rejected", tone: "bg-red-100 text-red-800" },
];

export default function Applications() {
  const [apps, setApps] = useState([]);
  useEffect(() => { api.get("/applications/mine").then((r) => setApps(r.data)); }, []);
  return (
    <div className="space-y-4">
      <h1 className="font-heading font-extrabold text-3xl">My Applications</h1>
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((s) => (
          <div key={s.key}>
            <div className="text-xs uppercase font-semibold text-slate-600 mb-2 flex items-center justify-between">{s.label} <Badge variant="outline">{apps.filter(a=>a.status===s.key).length}</Badge></div>
            <div className="space-y-2">{apps.filter(a=>a.status===s.key).map((a) => (
              <Card key={a.id}><CardContent className="p-3">
                <Link to={`/jobs/${a.job_id}`} data-testid={`app-${a.id}`} className="font-medium text-sm hover:text-blue-600 block">{a.job?.title}</Link>
                <div className="text-[10px] text-slate-500 mt-1">{new Date(a.created_at).toLocaleDateString()}</div>
                <Badge className={`mt-2 ${s.tone}`}>{s.label}</Badge>
              </CardContent></Card>
            ))}</div>
          </div>
        ))}
      </div>
      {!apps.length && <div className="text-center text-slate-500 py-10">No applications yet. <Link to="/jobs" className="text-blue-600">Browse jobs</Link></div>}
    </div>
  );
}
