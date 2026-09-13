import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../components/ui/dialog";
import { toast } from "sonner";
import { Upload, FileText, Github, Linkedin, Globe, MessageSquare, UserPlus, Pencil, Sparkles, Award } from "lucide-react";

export default function Profile() {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [endorsements, setEndorsements] = useState({ skill_counts: {} });
  const [recs, setRecs] = useState([]);
  const [conn, setConn] = useState("none");
  const [edit, setEdit] = useState({});
  const [cvOpen, setCvOpen] = useState(false);
  const [cvExtract, setCvExtract] = useState(null);
  const [cvLoading, setCvLoading] = useState(false);

  const isMe = me?.id === userId;

  const load = async () => {
    const r = await api.get(`/profiles/${userId}`);
    setProfile(r.data);
    setEdit(r.data);
    const e = await api.get(`/endorsements/${userId}`); setEndorsements(e.data);
    const rr = await api.get(`/recommendations/${userId}`); setRecs(rr.data);
    if (!isMe) {
      const cs = await api.get("/connections?status=accepted");
      if (cs.data.find((c) => c.user.id === userId)) setConn("connected");
      else {
        const p = await api.get("/connections?status=pending");
        const pend = p.data.find((c) => c.user.id === userId);
        if (pend) setConn(pend.requested_by === me.id ? "pending_out" : "pending_in");
        else setConn("none");
      }
    }
  };
  useEffect(() => { if (userId) load(); }, [userId]);

  const save = async () => {
    const patch = { ...edit };
    if (typeof patch.skills === "string") patch.skills = patch.skills.split(",").map(s => s.trim()).filter(Boolean);
    if (typeof patch.career_interests === "string") patch.career_interests = patch.career_interests.split(",").map(s => s.trim()).filter(Boolean);
    delete patch.completion; delete patch.password;
    const r = await api.put("/profiles/me", patch);
    setProfile(r.data); toast.success("Profile updated");
  };

  const uploadAvatar = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const fd = new FormData(); fd.append("file", f);
    await api.post("/uploads/avatar", fd, { headers: { "Content-Type": "multipart/form-data" } });
    toast.success("Photo updated"); load();
  };
  const uploadCV = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const fd = new FormData(); fd.append("file", f);
    await api.post("/uploads/cv", fd, { headers: { "Content-Type": "multipart/form-data" } });
    toast.success("CV uploaded"); load();
  };
  const extractCV = async () => {
    setCvLoading(true);
    try { const r = await api.post("/ai/cv-extract"); setCvExtract(r.data); setCvOpen(true); }
    catch (e) { toast.error(e.response?.data?.detail || "Extract failed"); }
    finally { setCvLoading(false); }
  };
  const applyCV = async () => {
    await api.post("/ai/cv-apply", cvExtract);
    toast.success("Added to profile"); setCvOpen(false); load();
  };

  const connect = async () => { await api.post(`/connections/request/${userId}`); toast.success("Request sent"); setConn("pending_out"); };
  const message = async () => { navigate(`/messages?to=${userId}`); };
  const endorse = async (skill) => { await api.post("/endorsements", { user_id: userId, skill }); toast.success(`Endorsed ${skill}`); load(); };

  if (!profile) return <div className="p-8 text-slate-500">Loading…</div>;
  const roleTone = { student: "bg-blue-100 text-blue-800", alumni: "bg-emerald-100 text-emerald-800", employer: "bg-purple-100 text-purple-800", admin: "bg-amber-100 text-amber-800" };
  const initials = `${(profile.first_name||"?")[0]}${(profile.last_name||"")[0]||""}`.toUpperCase();

  return (
    <div className="space-y-4">
      <Card>
        <div className="h-28 bg-gradient-to-r from-slate-900 via-blue-800 to-blue-600 rounded-t-xl" />
        <CardContent className="pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <Avatar className="w-24 h-24 border-4 border-white shadow-md"><AvatarFallback className="bg-slate-900 text-white text-2xl">{initials}</AvatarFallback></Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap"><h1 className="font-heading font-extrabold text-2xl">{profile.first_name} {profile.last_name}</h1>
                <Badge className={roleTone[profile.role]}>{profile.role}</Badge>
                {profile.status !== "active" && <Badge variant="outline" className="text-amber-700 border-amber-300">{profile.status?.replace("_"," ")}</Badge>}
              </div>
              <div className="text-slate-600 text-sm">{profile.headline || (profile.company_name ? profile.company_name : "")}</div>
              <div className="text-xs text-slate-500 mt-1">{profile.institution} {profile.qualification && `· ${profile.qualification}`}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {isMe ? (
                <>
                  <label className="btn-secondary cursor-pointer flex items-center gap-2" data-testid="upload-avatar-btn"><Upload className="w-4 h-4" /> Photo
                    <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} /></label>
                </>
              ) : (
                <>
                  {conn === "none" && <Button onClick={connect} className="bg-blue-600 hover:bg-blue-700" data-testid="connect-btn"><UserPlus className="w-4 h-4 mr-1" /> Connect</Button>}
                  {conn === "pending_out" && <Button disabled variant="outline" data-testid="conn-pending">Request sent</Button>}
                  {conn === "pending_in" && <Button onClick={async ()=>{await api.post(`/connections/${userId}/accept`); load();}} data-testid="accept-conn">Accept request</Button>}
                  {conn === "connected" && <Badge className="bg-emerald-100 text-emerald-800 px-3 py-2">Connected</Badge>}
                  <Button variant="outline" onClick={message} data-testid="message-btn"><MessageSquare className="w-4 h-4 mr-1" /> Message</Button>
                </>
              )}
            </div>
          </div>
          {isMe && profile.completion && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-1"><span className="text-xs uppercase text-slate-500">Profile strength</span><span className="text-xs font-semibold text-blue-700">{profile.completion.percentage}%</span></div>
              <Progress value={profile.completion.percentage} />
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="about">
        <TabsList><TabsTrigger value="about" data-testid="tab-about">About</TabsTrigger><TabsTrigger value="skills" data-testid="tab-skills">Skills</TabsTrigger><TabsTrigger value="experience" data-testid="tab-exp">Experience</TabsTrigger><TabsTrigger value="recs" data-testid="tab-recs">Recommendations</TabsTrigger>{isMe && <TabsTrigger value="edit" data-testid="tab-edit">Edit</TabsTrigger>}</TabsList>

        <TabsContent value="about" className="mt-4">
          <Card><CardContent className="p-5 space-y-3">
            <div><div className="text-xs uppercase text-slate-500 mb-1">Biography</div><p className="text-sm text-slate-700 whitespace-pre-line">{profile.bio || "No biography added yet."}</p></div>
            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              {profile.github && <a target="_blank" rel="noreferrer" href={profile.github} className="flex items-center gap-2 text-sm text-blue-600"><Github className="w-4 h-4" /> GitHub</a>}
              {profile.linkedin && <a target="_blank" rel="noreferrer" href={profile.linkedin} className="flex items-center gap-2 text-sm text-blue-600"><Linkedin className="w-4 h-4" /> LinkedIn</a>}
              {profile.portfolio && <a target="_blank" rel="noreferrer" href={profile.portfolio} className="flex items-center gap-2 text-sm text-blue-600"><Globe className="w-4 h-4" /> Portfolio</a>}
            </div>
            {isMe && (profile.role === "student" || profile.role === "alumni") && (
              <div className="pt-3 border-t"><div className="text-xs uppercase text-slate-500 mb-2">CV / Resume</div>
                {profile.cv_path ? <div className="text-sm text-slate-700 flex items-center gap-2"><FileText className="w-4 h-4" /> {profile.cv_filename || "Uploaded"}</div> : <div className="text-sm text-slate-500">No CV uploaded</div>}
                <div className="flex flex-wrap gap-2 mt-2">
                  <label className="btn-secondary cursor-pointer flex items-center gap-2" data-testid="upload-cv-btn"><Upload className="w-4 h-4" /> {profile.cv_path ? "Replace CV" : "Upload CV"}<input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={uploadCV} /></label>
                  {profile.cv_path && <Button onClick={extractCV} disabled={cvLoading} className="bg-blue-600 hover:bg-blue-700" data-testid="ai-extract-cv"><Sparkles className="w-4 h-4 mr-2" /> {cvLoading ? "Analysing…" : "AI CV analysis"}</Button>}
                </div>
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <Card><CardContent className="p-5">
            {(profile.skills || []).length ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                {profile.skills.map((s) => (
                  <div key={s} className="p-3 rounded-lg border flex items-center justify-between" data-testid={`skill-${s}`}>
                    <div><div className="font-medium text-sm">{s}</div><div className="text-xs text-slate-500 flex items-center gap-1"><Award className="w-3 h-3" /> {endorsements.skill_counts?.[s] || 0} endorsements</div></div>
                    {!isMe && <Button size="sm" variant="outline" onClick={() => endorse(s)} data-testid={`endorse-${s}`}>Endorse</Button>}
                  </div>
                ))}
              </div>
            ) : <div className="text-sm text-slate-500">No skills listed.</div>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="experience" className="mt-4">
          <Card><CardContent className="p-5 space-y-3">
            <div className="text-xs uppercase text-slate-500">Work experience</div>
            {(profile.work_experience || []).map((w, i) => (
              <div key={i} className="p-3 rounded-lg border"><div className="font-medium">{w.role}</div><div className="text-sm text-slate-600">{w.company} · {w.from} – {w.to}</div><div className="text-sm text-slate-700 mt-1">{w.description}</div></div>
            ))}
            {!(profile.work_experience || []).length && <div className="text-sm text-slate-500">No experience added.</div>}
            <div className="text-xs uppercase text-slate-500 pt-3">Projects</div>
            {(profile.projects || []).map((p, i) => (
              <div key={i} className="p-3 rounded-lg border"><div className="font-medium">{p.name}</div><div className="text-sm text-slate-700">{p.description}</div></div>
            ))}
            <div className="text-xs uppercase text-slate-500 pt-3">Certifications</div>
            {(profile.certifications || []).map((c, i) => (
              <div key={i} className="p-3 rounded-lg border"><div className="font-medium">{c.name}</div><div className="text-sm text-slate-600">{c.issuer} · {c.year}</div></div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="recs" className="mt-4">
          <Card><CardContent className="p-5 space-y-3">
            {recs.length ? recs.map((r) => (
              <div key={r.id} className="p-4 rounded-lg border"><div className="text-sm text-slate-700 italic">"{r.content}"</div><div className="text-xs text-slate-500 mt-2">— {r.author?.first_name} {r.author?.last_name} · {r.relationship}</div></div>
            )) : <div className="text-sm text-slate-500">No recommendations yet.</div>}
            {!isMe && me && <RecForm recipient_id={userId} onDone={load} />}
          </CardContent></Card>
        </TabsContent>

        {isMe && (
          <TabsContent value="edit" className="mt-4">
            <Card><CardContent className="p-5 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Headline</Label><Input data-testid="edit-headline" value={edit.headline||""} onChange={(e)=>setEdit({...edit,headline:e.target.value})} /></div>
                <div><Label>Location</Label><Input data-testid="edit-location" value={edit.location||""} onChange={(e)=>setEdit({...edit,location:e.target.value})} /></div>
              </div>
              <div><Label>Biography</Label><Textarea rows={4} data-testid="edit-bio" value={edit.bio||""} onChange={(e)=>setEdit({...edit,bio:e.target.value})} /></div>
              <div><Label>Skills (comma separated)</Label><Input data-testid="edit-skills" value={Array.isArray(edit.skills)?edit.skills.join(", "):(edit.skills||"")} onChange={(e)=>setEdit({...edit,skills:e.target.value})} /></div>
              {(me.role === "student" || me.role === "alumni") && (
                <div className="grid sm:grid-cols-3 gap-3">
                  <div><Label>GitHub</Label><Input data-testid="edit-github" value={edit.github||""} onChange={(e)=>setEdit({...edit,github:e.target.value})} /></div>
                  <div><Label>LinkedIn</Label><Input data-testid="edit-linkedin" value={edit.linkedin||""} onChange={(e)=>setEdit({...edit,linkedin:e.target.value})} /></div>
                  <div><Label>Portfolio</Label><Input data-testid="edit-portfolio" value={edit.portfolio||""} onChange={(e)=>setEdit({...edit,portfolio:e.target.value})} /></div>
                </div>
              )}
              {me.role === "student" && <div><Label>Career interests (comma separated)</Label><Input data-testid="edit-career" value={Array.isArray(edit.career_interests)?edit.career_interests.join(", "):(edit.career_interests||"")} onChange={(e)=>setEdit({...edit,career_interests:e.target.value})} /></div>}
              {me.role === "alumni" && <div className="grid sm:grid-cols-2 gap-3"><div><Label>Current position</Label><Input data-testid="edit-position" value={edit.current_position||""} onChange={(e)=>setEdit({...edit,current_position:e.target.value})} /></div><div><Label>Company</Label><Input data-testid="edit-company" value={edit.company||""} onChange={(e)=>setEdit({...edit,company:e.target.value})} /></div></div>}
              {me.role === "employer" && (
                <div className="space-y-3"><div><Label>Company description</Label><Textarea rows={3} data-testid="edit-company-desc" value={edit.company_description||""} onChange={(e)=>setEdit({...edit,company_description:e.target.value})} /></div><div className="grid sm:grid-cols-2 gap-3"><div><Label>Company website</Label><Input data-testid="edit-company-web" value={edit.company_website||""} onChange={(e)=>setEdit({...edit,company_website:e.target.value})} /></div><div><Label>Industry</Label><Input data-testid="edit-company-industry" value={edit.company_industry||""} onChange={(e)=>setEdit({...edit,company_industry:e.target.value})} /></div></div></div>
              )}
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={save} data-testid="save-profile"><Pencil className="w-4 h-4 mr-2" /> Save changes</Button>
            </CardContent></Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={cvOpen} onOpenChange={setCvOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>AI CV Analysis — confirm what to add</DialogTitle></DialogHeader>
          {cvExtract && (
            <div className="space-y-3 text-sm max-h-[60vh] overflow-y-auto">
              <div><div className="text-xs uppercase text-slate-500 mb-1">Detected skills</div><div className="flex flex-wrap gap-1">{(cvExtract.skills||[]).map((s)=><span key={s} className="chip bg-blue-50 text-blue-700 border-blue-100">{s}</span>)}</div></div>
              <div><div className="text-xs uppercase text-slate-500 mb-1">Education</div>{(cvExtract.education||[]).map((e,i)=><div key={i} className="text-slate-700">{e.qualification} — {e.institution} {e.year && `(${e.year})`}</div>)}</div>
              <div><div className="text-xs uppercase text-slate-500 mb-1">Work experience</div>{(cvExtract.work_experience||[]).map((w,i)=><div key={i} className="text-slate-700">{w.role} — {w.company} {w.from && `(${w.from} – ${w.to||"present"})`}</div>)}</div>
              <div><div className="text-xs uppercase text-slate-500 mb-1">Certifications</div>{(cvExtract.certifications||[]).map((c,i)=><div key={i} className="text-slate-700">{c.name} — {c.issuer}</div>)}</div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={()=>setCvOpen(false)}>Cancel</Button><Button className="bg-blue-600 hover:bg-blue-700" onClick={applyCV} data-testid="cv-apply">Add to profile</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RecForm({ recipient_id, onDone }) {
  const [open, setOpen] = useState(false);
  const [rel, setRel] = useState("");
  const [content, setContent] = useState("");
  const submit = async () => {
    if (!content || !rel) return toast.error("Fill both fields");
    await api.post("/recommendations", { recipient_id, relationship: rel, content });
    toast.success("Recommendation posted"); setOpen(false); setContent(""); setRel(""); onDone?.();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" data-testid="write-rec-btn">Write a recommendation</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Recommendation</DialogTitle></DialogHeader>
        <div className="space-y-3"><Input placeholder="Relationship (e.g. Mentor)" value={rel} onChange={(e)=>setRel(e.target.value)} data-testid="rec-relationship" /><Textarea rows={5} placeholder="Your recommendation..." value={content} onChange={(e)=>setContent(e.target.value)} data-testid="rec-content" /></div>
        <DialogFooter><Button onClick={submit} className="bg-blue-600 hover:bg-blue-700" data-testid="rec-submit">Post</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
