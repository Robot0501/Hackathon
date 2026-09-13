import React, { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Eye, Users, Briefcase, AlertCircle, TrendingUp, CheckCircle2, XCircle, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const StatCard = ({ icon: Icon, label, value, testid }) => (
  <Card data-testid={testid}><CardContent className="p-5">
    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Icon className="w-5 h-5" /></div>
      <div><div className="text-xs uppercase tracking-wider text-slate-500">{label}</div><div className="stat-num text-2xl">{value}</div></div>
    </div></CardContent></Card>
);

function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [matches, setMatches] = useState([]);
  useEffect(() => {
    api.get("/dashboard/student").then((r) => setData(r.data));
    api.get("/ai/job-matches?limit=5").then((r) => setMatches(r.data)).catch(() => {});
  }, []);
  if (!data) return <div className="p-8 text-slate-500">Loading…</div>;
  const pieData = Object.entries(data.applications_by_status || {}).map(([k, v]) => ({ name: k.replace("_", " "), value: v }));
  const colors = ["#2563eb", "#059669", "#f59e0b", "#8b5cf6", "#10b981", "#ef4444"];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="font-heading font-extrabold text-3xl">Welcome back, {user.first_name}</h1>
          <p className="text-slate-600 text-sm mt-1">Your professional dashboard</p></div>
        <Button onClick={() => window.location.href = "/ai"} className="bg-blue-600 hover:bg-blue-700" data-testid="dash-ai-btn"><Sparkles className="w-4 h-4 mr-2" /> Ask AI Coach</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Profile Strength" value={`${data.completion.percentage}%`} testid="stat-profile" />
        <StatCard icon={Eye} label="Profile Views" value={data.profile_views} testid="stat-views" />
        <StatCard icon={Users} label="Connections" value={data.connections} testid="stat-connections" />
        <StatCard icon={Briefcase} label="Applications" value={Object.values(data.applications_by_status).reduce((a,b)=>a+b,0)} testid="stat-apps" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2"><CardContent className="p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-heading font-semibold text-lg">Complete your profile</h3><Badge>{data.completion.percentage}%</Badge></div>
          <Progress value={data.completion.percentage} className="mb-4" />
          {data.completion.missing.length > 0 ? (
            <ul className="grid sm:grid-cols-2 gap-2 text-sm">
              {data.completion.missing.map((m) => <li key={m} className="flex items-center gap-2 text-slate-700"><AlertCircle className="w-4 h-4 text-amber-500" /> {m}</li>)}
            </ul>
          ) : <div className="text-emerald-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Your profile looks great!</div>}
          <Button variant="outline" className="mt-4" onClick={() => window.location.href = `/profile/${user.id}`} data-testid="edit-profile-btn">Edit profile</Button>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <h3 className="font-heading font-semibold text-lg mb-3">Applications</h3>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                  {pieData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="text-sm text-slate-500 py-6 text-center">No applications yet</div>}
        </CardContent></Card>
      </div>
      <Card><CardContent className="p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="font-heading font-semibold text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-600" /> Top job matches for you</h3>
          <Link to="/jobs" className="text-sm text-blue-600" data-testid="see-all-jobs">See all →</Link></div>
        {matches.length ? (
          <div className="grid md:grid-cols-2 gap-3">
            {matches.map((j) => (
              <Link key={j.id} to={`/jobs/${j.id}`} data-testid={`match-${j.id}`} className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between"><div className="font-medium">{j.title}</div><Badge className="bg-emerald-100 text-emerald-800">{j.match.score}% Match</Badge></div>
                <div className="text-xs text-slate-500 mt-1">{j.employer?.company_name} · {j.location} · {j.employment_type}</div>
                <div className="mt-2 flex flex-wrap gap-1">{(j.match.matched_skills || []).slice(0, 4).map((s) => <span key={s} className="chip bg-blue-50 text-blue-700 border-blue-100">{s}</span>)}</div>
              </Link>
            ))}
          </div>
        ) : <div className="text-sm text-slate-500 py-6 text-center">Add skills to see personalised job matches.</div>}
      </CardContent></Card>
    </div>
  );
}

function EmployerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { api.get("/dashboard/employer").then((r) => setData(r.data)); }, []);
  if (!data) return <div className="p-8 text-slate-500">Loading…</div>;
  const statusData = Object.entries(data.applications_by_status || {}).map(([k, v]) => ({ name: k.replace("_", " "), value: v }));
  const isPending = user.status === "pending_approval";
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="font-heading font-extrabold text-3xl">{user.company_name || "Employer"} dashboard</h1><p className="text-slate-600 text-sm mt-1">Manage your talent pipeline</p></div>
        <Button onClick={() => navigate("/employer/jobs/new")} disabled={isPending} className="bg-blue-600 hover:bg-blue-700" data-testid="new-job-btn">+ Post a job</Button>
      </div>
      {isPending && <Card className="border-amber-200 bg-amber-50"><CardContent className="p-5 flex items-center gap-3"><Clock className="w-5 h-5 text-amber-600" /><div><div className="font-medium text-amber-900">Awaiting admin approval</div><div className="text-sm text-amber-800">You'll be able to post jobs once an administrator approves your company.</div></div></CardContent></Card>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Active jobs" value={data.active_jobs} testid="emp-stat-active" />
        <StatCard icon={Clock} label="Pending jobs" value={data.pending_jobs} testid="emp-stat-pending" />
        <StatCard icon={Users} label="Applications" value={data.total_applications} testid="emp-stat-apps" />
        <StatCard icon={TrendingUp} label="Shortlisted" value={data.applications_by_status?.shortlisted || 0} testid="emp-stat-shortlist" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-5"><h3 className="font-heading font-semibold text-lg mb-3">Applications per job</h3>
          {data.applications_per_job.length ? <ResponsiveContainer width="100%" height={240}><BarChart data={data.applications_per_job}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="job" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="count" fill="#2563eb" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer> : <div className="text-sm text-slate-500 py-6 text-center">No jobs yet</div>}
        </CardContent></Card>
        <Card><CardContent className="p-5"><h3 className="font-heading font-semibold text-lg mb-3">Pipeline breakdown</h3>
          {statusData.length ? <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90}>{statusData.map((_,i)=><Cell key={i} fill={["#2563eb","#059669","#f59e0b","#8b5cf6","#10b981","#ef4444"][i%6]}/>)}</Pie><Legend wrapperStyle={{fontSize:11}} /></PieChart></ResponsiveContainer> : <div className="text-sm text-slate-500 py-6 text-center">No applications yet</div>}
        </CardContent></Card>
      </div>
      <Card><CardContent className="p-5"><h3 className="font-heading font-semibold text-lg mb-3">Recent jobs</h3>
        <div className="space-y-2">
          {data.recent_jobs.map((j) => (
            <Link key={j.id} to={`/jobs/${j.id}`} data-testid={`emp-job-${j.id}`} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300">
              <div><div className="font-medium">{j.title}</div><div className="text-xs text-slate-500">{j.location} · {j.employment_type}</div></div>
              <Badge className={j.status === "approved" ? "bg-emerald-100 text-emerald-800" : j.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}>{j.status}</Badge>
            </Link>
          ))}
          {!data.recent_jobs.length && <div className="text-sm text-slate-500 py-6 text-center">Post your first job to get started.</div>}
        </div>
      </CardContent></Card>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [series, setSeries] = useState([]);
  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data));
    api.get("/admin/timeseries/users").then((r) => setSeries(r.data));
  }, []);
  if (!stats) return <div className="p-8 text-slate-500">Loading…</div>;
  return (
    <div className="space-y-6">
      <div><h1 className="font-heading font-extrabold text-3xl">Admin dashboard</h1><p className="text-slate-600 text-sm mt-1">Platform overview</p></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total users" value={stats.users_total} testid="admin-users" />
        <StatCard icon={Briefcase} label="Applications" value={stats.applications_total} testid="admin-apps" />
        <StatCard icon={Clock} label="Pending" value={stats.pending_alumni + stats.pending_employers + stats.pending_jobs} testid="admin-pending" />
        <StatCard icon={AlertCircle} label="Open reports" value={stats.reports_open} testid="admin-reports" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card><CardContent className="p-5"><h3 className="font-heading font-semibold mb-3">User distribution</h3>
          <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={[{name:"Students",value:stats.student},{name:"Alumni",value:stats.alumni},{name:"Employers",value:stats.employer}]} dataKey="value" nameKey="name" outerRadius={80}>{["#2563eb","#059669","#8b5cf6"].map((c,i)=><Cell key={i} fill={c}/>)}</Pie><Legend wrapperStyle={{fontSize:11}} /></PieChart></ResponsiveContainer>
        </CardContent></Card>
        <Card className="lg:col-span-2"><CardContent className="p-5"><h3 className="font-heading font-semibold mb-3">User growth</h3>
          <ResponsiveContainer width="100%" height={220}><LineChart data={series}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="date" tick={{fontSize:10}}/><YAxis tick={{fontSize:11}}/><Tooltip/><Line type="monotone" dataKey="students" stroke="#2563eb"/><Line type="monotone" dataKey="alumni" stroke="#059669"/><Line type="monotone" dataKey="employers" stroke="#8b5cf6"/></LineChart></ResponsiveContainer>
        </CardContent></Card>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/admin?tab=alumni" className="p-5 rounded-xl border bg-white hover:shadow-md" data-testid="quick-alumni"><div className="text-xs uppercase text-slate-500">Pending alumni</div><div className="stat-num text-2xl">{stats.pending_alumni}</div></Link>
        <Link to="/admin?tab=employers" className="p-5 rounded-xl border bg-white hover:shadow-md" data-testid="quick-employers"><div className="text-xs uppercase text-slate-500">Pending employers</div><div className="stat-num text-2xl">{stats.pending_employers}</div></Link>
        <Link to="/admin?tab=jobs" className="p-5 rounded-xl border bg-white hover:shadow-md" data-testid="quick-jobs"><div className="text-xs uppercase text-slate-500">Pending jobs</div><div className="stat-num text-2xl">{stats.pending_jobs}</div></Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "employer") return <EmployerDashboard />;
  if (user.role === "admin") return <AdminDashboard />;
  return <StudentDashboard />;
}
