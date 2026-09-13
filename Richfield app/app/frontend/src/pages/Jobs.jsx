import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { toast } from "sonner";
import { Search, MapPin, Briefcase, Clock, Building2, Sparkles } from "lucide-react";

const JobCard = ({ j }) => (
  <Link to={`/jobs/${j.id}`} data-testid={`job-${j.id}`} className="block">
    <Card className="hover:border-blue-300 hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap"><h3 className="font-heading font-semibold text-lg">{j.title}</h3>
              {j.match && <Badge className="bg-emerald-100 text-emerald-800"><Sparkles className="w-3 h-3 mr-1" /> {j.match.score}% Match</Badge>}</div>
            <div className="text-sm text-slate-600 mt-1 flex items-center gap-3 flex-wrap"><span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {j.employer?.company_name || "Company"}</span><span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {j.location}</span><Badge variant="outline">{j.employment_type}</Badge><Badge variant="outline">{j.work_mode}</Badge></div>
            <p className="text-sm text-slate-700 mt-2 line-clamp-2">{j.description}</p>
            <div className="flex flex-wrap gap-1 mt-3">{(j.skills || []).slice(0, 6).map((s) => <span key={s} className="chip bg-blue-50 text-blue-700 border-blue-100">{s}</span>)}</div>
          </div>
        </div>
      </CardContent></Card>
  </Link>
);

export function JobsList() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [employment, setEmployment] = useState("all");
  const [mode, setMode] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState([]);
  const load = async () => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (employment !== "all") params.append("employment_type", employment);
    if (mode !== "all") params.append("work_mode", mode);
    const r = await api.get(`/jobs?${params.toString()}`);
    setJobs(r.data);
    if (user.role === "student" || user.role === "alumni") {
      try { setMatches((await api.get("/ai/job-matches?limit=6")).data); } catch {}
    }
  };
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q, employment, mode]);
  return (
    <div className="space-y-4">
      <h1 className="font-heading font-extrabold text-3xl">Jobs & Internships</h1>
      <Card><CardContent className="p-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" /><Input data-testid="jobs-search" className="pl-9" placeholder="Search jobs, skills, companies…" value={q} onChange={(e)=>setQ(e.target.value)} /></div>
          <Select value={employment} onValueChange={setEmployment}><SelectTrigger data-testid="jobs-filter-type"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="all">All types</SelectItem><SelectItem value="full-time">Full-time</SelectItem><SelectItem value="part-time">Part-time</SelectItem><SelectItem value="internship">Internship</SelectItem><SelectItem value="graduate">Graduate</SelectItem></SelectContent></Select>
          <Select value={mode} onValueChange={setMode}><SelectTrigger data-testid="jobs-filter-mode"><SelectValue placeholder="Mode" /></SelectTrigger><SelectContent><SelectItem value="all">All modes</SelectItem><SelectItem value="remote">Remote</SelectItem><SelectItem value="hybrid">Hybrid</SelectItem><SelectItem value="onsite">On-site</SelectItem></SelectContent></Select>
        </div>
      </CardContent></Card>
      {matches.length > 0 && (
        <div><h2 className="font-heading font-semibold text-lg mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-600" /> Top matches for you</h2>
          <div className="grid md:grid-cols-2 gap-3">{matches.slice(0,4).map((j) => <JobCard key={j.id} j={j} />)}</div></div>
      )}
      <div><h2 className="font-heading font-semibold text-lg mb-2">All jobs ({jobs.length})</h2>
        <div className="grid md:grid-cols-2 gap-3">{jobs.map((j) => <JobCard key={j.id} j={j} />)}</div>
        {!jobs.length && <div className="text-slate-500 text-center py-10">No jobs found.</div>}
      </div>
    </div>
  );
}

export function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  useEffect(() => {
    api.get(`/jobs/${id}`).then((r) => setJob(r.data));
    if (user.role === "student" || user.role === "alumni") api.get("/applications/mine").then((r) => { if (r.data.find((a) => a.job_id === id)) setApplied(true); });
  }, [id]);
  const apply = async () => {
    try { await api.post(`/jobs/${id}/apply`, { cover_letter: coverLetter }); toast.success("Application submitted"); setApplied(true); }
    catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  if (!job) return <div className="p-8 text-slate-500">Loading…</div>;
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Card><CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div><h1 className="font-heading font-extrabold text-3xl">{job.title}</h1>
            <div className="text-slate-600 mt-2 flex flex-wrap gap-3 items-center"><span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {job.employer?.company_name}</span><span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span><Badge>{job.employment_type}</Badge><Badge variant="outline">{job.work_mode}</Badge>{job.salary_range && <Badge variant="outline">{job.salary_range}</Badge>}</div>
          </div>
          {(user.role === "student" || user.role === "alumni") && (applied ? <Badge className="bg-emerald-100 text-emerald-800 px-3 py-2">Applied</Badge> : <Button className="bg-blue-600 hover:bg-blue-700" onClick={apply} data-testid="apply-btn">Apply now</Button>)}
        </div>
      </CardContent></Card>
      <Card><CardContent className="p-6 space-y-4">
        <div><div className="text-xs uppercase text-slate-500 mb-1">Description</div><p className="text-sm text-slate-700 whitespace-pre-line">{job.description}</p></div>
        <div><div className="text-xs uppercase text-slate-500 mb-1">Requirements</div><p className="text-sm text-slate-700 whitespace-pre-line">{job.requirements}</p></div>
        <div><div className="text-xs uppercase text-slate-500 mb-1">Qualifications</div><p className="text-sm text-slate-700 whitespace-pre-line">{job.qualifications}</p></div>
        <div><div className="text-xs uppercase text-slate-500 mb-1">Skills</div><div className="flex flex-wrap gap-1">{(job.skills || []).map((s) => <span key={s} className="chip bg-blue-50 text-blue-700 border-blue-100">{s}</span>)}</div></div>
      </CardContent></Card>
      {(user.role === "student" || user.role === "alumni") && !applied && (
        <Card><CardContent className="p-6"><Label>Cover letter (optional)</Label>
          <Textarea rows={5} value={coverLetter} onChange={(e)=>setCoverLetter(e.target.value)} data-testid="cover-letter" placeholder="Tell the employer why you're a strong candidate…" />
          <Button className="mt-3 bg-blue-600 hover:bg-blue-700" onClick={apply} data-testid="apply-btn-2">Submit application</Button>
        </CardContent></Card>
      )}
    </div>
  );
}

export function EmployerJobs() {
  const [tab, setTab] = useState("list");
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title:"", description:"", requirements:"", qualifications:"", skills:"", location:"", work_mode:"onsite", employment_type:"full-time", salary_range:"", industry:"", experience_level:"" });
  const load = async () => setJobs((await api.get("/jobs")).data);
  useEffect(() => { load(); }, []);
  const create = async () => {
    const payload = { ...form, skills: form.skills.split(",").map(s=>s.trim()).filter(Boolean) };
    try { await api.post("/jobs", payload); toast.success("Job submitted — pending admin approval"); setTab("list"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="font-heading font-extrabold text-3xl">My Jobs</h1><Button onClick={()=>setTab("new")} className="bg-blue-600 hover:bg-blue-700" data-testid="employer-new-job">+ New job</Button></div>
      <Tabs value={tab} onValueChange={setTab}><TabsList><TabsTrigger value="list">Jobs</TabsTrigger><TabsTrigger value="new">Create</TabsTrigger></TabsList>
        <TabsContent value="list" className="space-y-3 mt-3">{jobs.map((j) => (<Card key={j.id}><CardContent className="p-4 flex items-center justify-between gap-3"><div className="min-w-0"><Link to={`/jobs/${j.id}`} className="font-medium hover:text-blue-600" data-testid={`emp-job-title-${j.id}`}>{j.title}</Link><div className="text-xs text-slate-500">{j.location} · {j.employment_type} · {j.work_mode}</div></div><Badge className={j.status==="approved"?"bg-emerald-100 text-emerald-800":j.status==="pending"?"bg-amber-100 text-amber-800":"bg-slate-100 text-slate-700"}>{j.status}</Badge><Link to={`/jobs/${j.id}/applicants`} className="text-sm text-blue-600" data-testid={`view-applicants-${j.id}`}>Applicants →</Link></CardContent></Card>))}
          {!jobs.length && <div className="text-slate-500 text-center py-10">No jobs yet.</div>}
        </TabsContent>
        <TabsContent value="new" className="mt-3">
          <Card><CardContent className="p-5 space-y-3">
            <div><Label>Title</Label><Input data-testid="job-title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} /></div>
            <div><Label>Description</Label><Textarea rows={4} data-testid="job-desc" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} /></div>
            <div className="grid md:grid-cols-2 gap-3"><div><Label>Requirements</Label><Textarea rows={3} data-testid="job-req" value={form.requirements} onChange={(e)=>setForm({...form,requirements:e.target.value})} /></div><div><Label>Qualifications</Label><Textarea rows={3} data-testid="job-quals" value={form.qualifications} onChange={(e)=>setForm({...form,qualifications:e.target.value})} /></div></div>
            <div><Label>Skills (comma separated)</Label><Input data-testid="job-skills" value={form.skills} onChange={(e)=>setForm({...form,skills:e.target.value})} /></div>
            <div className="grid md:grid-cols-3 gap-3"><div><Label>Location</Label><Input data-testid="job-location" value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})} /></div><div><Label>Type</Label><Select value={form.employment_type} onValueChange={(v)=>setForm({...form,employment_type:v})}><SelectTrigger data-testid="job-type"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="full-time">Full-time</SelectItem><SelectItem value="part-time">Part-time</SelectItem><SelectItem value="internship">Internship</SelectItem><SelectItem value="graduate">Graduate</SelectItem></SelectContent></Select></div><div><Label>Mode</Label><Select value={form.work_mode} onValueChange={(v)=>setForm({...form,work_mode:v})}><SelectTrigger data-testid="job-mode"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="remote">Remote</SelectItem><SelectItem value="hybrid">Hybrid</SelectItem><SelectItem value="onsite">On-site</SelectItem></SelectContent></Select></div></div>
            <div className="grid md:grid-cols-3 gap-3"><div><Label>Salary range</Label><Input data-testid="job-salary" value={form.salary_range} onChange={(e)=>setForm({...form,salary_range:e.target.value})} /></div><div><Label>Industry</Label><Input data-testid="job-industry" value={form.industry} onChange={(e)=>setForm({...form,industry:e.target.value})} /></div><div><Label>Experience level</Label><Input data-testid="job-exp" value={form.experience_level} onChange={(e)=>setForm({...form,experience_level:e.target.value})} /></div></div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={create} data-testid="job-submit">Submit for approval</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function JobApplicants() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [apps, setApps] = useState([]);
  const load = async () => { setJob((await api.get(`/jobs/${id}`)).data); setApps((await api.get(`/jobs/${id}/applications`)).data); };
  useEffect(() => { load(); }, [id]);
  const setStatus = async (aid, status) => { await api.put(`/applications/${aid}/status?status=${status}`); toast.success("Updated"); load(); };
  const stages = ["applied","under_review","shortlisted","interview","accepted","rejected"];
  return (
    <div className="space-y-4">
      <h1 className="font-heading font-extrabold text-2xl">Applicants — {job?.title}</h1>
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((s) => (
          <div key={s} className="bg-slate-100 rounded-lg p-3 min-h-[240px]">
            <div className="text-xs uppercase font-semibold text-slate-600 mb-2">{s.replace("_"," ")} ({apps.filter(a=>a.status===s).length})</div>
            <div className="space-y-2">{apps.filter(a=>a.status===s).map((a) => (
              <Card key={a.id}><CardContent className="p-3">
                <Link to={`/profile/${a.applicant?.id}`} className="font-medium text-sm hover:text-blue-600" data-testid={`applicant-${a.id}`}>{a.applicant?.first_name} {a.applicant?.last_name}</Link>
                <div className="text-[10px] text-slate-500">{a.applicant?.headline}</div>
                <Select onValueChange={(v)=>setStatus(a.id,v)}><SelectTrigger className="mt-2 h-7 text-xs" data-testid={`stage-${a.id}`}><SelectValue placeholder="Change stage" /></SelectTrigger><SelectContent>{stages.map(x => <SelectItem key={x} value={x}>{x.replace("_"," ")}</SelectItem>)}</SelectContent></Select>
              </CardContent></Card>
            ))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
