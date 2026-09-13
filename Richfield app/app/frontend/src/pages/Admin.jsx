import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, Ban, Megaphone, ShieldAlert } from "lucide-react";

export default function Admin() {
  const [tab, setTab] = useState("alumni");
  const [alumni, setAlumni] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [reports, setReports] = useState([]);
  const [audit, setAudit] = useState([]);
  const [ann, setAnn] = useState({ title: "", body: "" });

  const load = async () => {
    setAlumni((await api.get("/admin/users?role=alumni&status=pending_verification")).data);
    setEmployers((await api.get("/admin/users?role=employer&status=pending_approval")).data);
    setJobs((await api.get("/jobs?status=pending")).data);
    setReports((await api.get("/admin/reports")).data);
    setAudit((await api.get("/admin/audit-logs")).data);
  };
  useEffect(() => { load(); }, []);

  const approveUser = async (id) => { await api.post(`/admin/users/${id}/approve`); toast.success("Approved"); load(); };
  const rejectUser = async (id) => { await api.post(`/admin/users/${id}/reject`); toast.success("Rejected"); load(); };
  const suspendUser = async (id) => { if (!window.confirm("Suspend this account?")) return; await api.post(`/admin/users/${id}/suspend`); toast.success("Suspended"); load(); };
  const approveJob = async (id) => { await api.post(`/admin/jobs/${id}/approve`); toast.success("Job approved"); load(); };
  const rejectJob = async (id) => { await api.post(`/admin/jobs/${id}/reject`); toast.success("Job rejected"); load(); };
  const resolveReport = async (id) => { await api.post(`/admin/reports/${id}/resolve`); load(); };
  const sendAnn = async () => { if (!ann.title || !ann.body) return; await api.post("/admin/announcements", ann); toast.success("Announcement sent"); setAnn({ title: "", body: "" }); };

  return (
    <div className="space-y-4">
      <h1 className="font-heading font-extrabold text-3xl flex items-center gap-2"><ShieldAlert className="w-6 h-6" /> Admin</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap"><TabsTrigger value="alumni" data-testid="admin-tab-alumni">Alumni ({alumni.length})</TabsTrigger><TabsTrigger value="employers" data-testid="admin-tab-employers">Employers ({employers.length})</TabsTrigger><TabsTrigger value="jobs" data-testid="admin-tab-jobs">Jobs ({jobs.length})</TabsTrigger><TabsTrigger value="reports" data-testid="admin-tab-reports">Reports ({reports.length})</TabsTrigger><TabsTrigger value="ann" data-testid="admin-tab-ann">Announcements</TabsTrigger><TabsTrigger value="audit" data-testid="admin-tab-audit">Audit</TabsTrigger></TabsList>

        <TabsContent value="alumni" className="mt-3 space-y-2">
          {alumni.map((u) => (
            <Card key={u.id}><CardContent className="p-4 flex items-center justify-between gap-3">
              <div><Link to={`/profile/${u.id}`} className="font-medium hover:text-blue-600">{u.first_name} {u.last_name}</Link><div className="text-xs text-slate-500">{u.email} · {u.qualification} · Grad {u.graduation_year} · {u.institution}</div></div>
              <div className="flex gap-2"><Button size="sm" onClick={()=>approveUser(u.id)} className="bg-emerald-600 hover:bg-emerald-700" data-testid={`approve-alumni-${u.id}`}><CheckCircle2 className="w-4 h-4 mr-1" /> Approve</Button><Button size="sm" variant="outline" onClick={()=>rejectUser(u.id)} data-testid={`reject-alumni-${u.id}`}><XCircle className="w-4 h-4 mr-1" /> Reject</Button></div>
            </CardContent></Card>
          ))}
          {!alumni.length && <div className="text-slate-500 text-center py-6">No pending alumni.</div>}
        </TabsContent>

        <TabsContent value="employers" className="mt-3 space-y-2">
          {employers.map((u) => (
            <Card key={u.id}><CardContent className="p-4 flex items-center justify-between gap-3">
              <div><div className="font-medium">{u.company_name}</div><div className="text-xs text-slate-500">{u.email} · {u.company_industry} · {u.company_website}</div></div>
              <div className="flex gap-2"><Button size="sm" onClick={()=>approveUser(u.id)} className="bg-emerald-600 hover:bg-emerald-700" data-testid={`approve-emp-${u.id}`}><CheckCircle2 className="w-4 h-4 mr-1" /> Approve</Button><Button size="sm" variant="outline" onClick={()=>rejectUser(u.id)} data-testid={`reject-emp-${u.id}`}><XCircle className="w-4 h-4 mr-1" /> Reject</Button></div>
            </CardContent></Card>
          ))}
          {!employers.length && <div className="text-slate-500 text-center py-6">No pending employers.</div>}
        </TabsContent>

        <TabsContent value="jobs" className="mt-3 space-y-2">
          {jobs.map((j) => (
            <Card key={j.id}><CardContent className="p-4 flex items-center justify-between gap-3">
              <div><Link to={`/jobs/${j.id}`} className="font-medium hover:text-blue-600">{j.title}</Link><div className="text-xs text-slate-500">{j.employer?.company_name} · {j.location} · {j.employment_type}</div></div>
              <div className="flex gap-2"><Button size="sm" onClick={()=>approveJob(j.id)} className="bg-emerald-600 hover:bg-emerald-700" data-testid={`approve-job-${j.id}`}><CheckCircle2 className="w-4 h-4 mr-1" /> Approve</Button><Button size="sm" variant="outline" onClick={()=>rejectJob(j.id)} data-testid={`reject-job-${j.id}`}><XCircle className="w-4 h-4 mr-1" /> Reject</Button></div>
            </CardContent></Card>
          ))}
          {!jobs.length && <div className="text-slate-500 text-center py-6">No pending jobs.</div>}
        </TabsContent>

        <TabsContent value="reports" className="mt-3 space-y-2">
          {reports.map((r) => (
            <Card key={r.id}><CardContent className="p-4 flex items-center justify-between gap-3">
              <div><div className="font-medium">{r.target_type} report — {r.category}</div><div className="text-xs text-slate-500">Target: {r.target_id} · Reason: {r.reason || "—"}</div></div>
              <div className="flex items-center gap-2"><Badge className={r.status==="open"?"bg-amber-100 text-amber-800":"bg-emerald-100 text-emerald-800"}>{r.status}</Badge>{r.status==="open" && <Button size="sm" onClick={()=>resolveReport(r.id)} data-testid={`resolve-${r.id}`}>Resolve</Button>}</div>
            </CardContent></Card>
          ))}
          {!reports.length && <div className="text-slate-500 text-center py-6">No reports.</div>}
        </TabsContent>

        <TabsContent value="ann" className="mt-3">
          <Card><CardContent className="p-5 space-y-3">
            <Input placeholder="Announcement title" value={ann.title} onChange={(e)=>setAnn({...ann,title:e.target.value})} data-testid="ann-title" />
            <Textarea rows={4} placeholder="Announcement body…" value={ann.body} onChange={(e)=>setAnn({...ann,body:e.target.value})} data-testid="ann-body" />
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={sendAnn} data-testid="ann-send"><Megaphone className="w-4 h-4 mr-2" /> Broadcast</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-3 space-y-1">
          {audit.map((a) => (<div key={a.id} className="text-xs text-slate-600 border-l-2 border-slate-200 pl-3 py-1"><span className="font-medium text-slate-800">{a.action}</span> — actor {a.actor_id} · target {a.target} · {new Date(a.at).toLocaleString()}</div>))}
          {!audit.length && <div className="text-slate-500 text-center py-6">No audit entries.</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
