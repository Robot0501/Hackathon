import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { toast } from "sonner";

export default function Register() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [extra, setExtra] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const changeE = (k) => (e) => setExtra({ ...extra, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, role, ...extra };
      if (extra.graduation_year) payload.graduation_year = parseInt(extra.graduation_year, 10);
      const u = await register(payload);
      toast.success(`Welcome, ${u.first_name}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative bg-slate-900">
        <img src="https://images.unsplash.com/photo-1758270705317-3ef6142d306f?crop=entropy&cs=srgb&fm=jpg&q=85" alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="relative z-10 p-12 h-full flex flex-col justify-between text-white">
          <Link to="/" className="flex items-center gap-2" data-testid="brand-link">
            <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center font-bold font-heading">R</div>
            <div className="font-heading font-extrabold text-lg">Richfield Connect</div>
          </Link>
          <div><h2 className="font-heading font-extrabold text-4xl leading-tight">Start building your future.</h2><p className="mt-2 text-slate-200">Join students, verified alumni and approved employers.</p></div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="font-heading text-2xl font-bold">Create account</div>
              <p className="text-sm text-slate-600 mt-1">Choose your role to get started.</p>
            </div>
            <Tabs value={role} onValueChange={setRole} className="mb-6">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="student" data-testid="role-student">Student</TabsTrigger>
                <TabsTrigger value="alumni" data-testid="role-alumni">Alumni</TabsTrigger>
                <TabsTrigger value="employer" data-testid="role-employer">Employer</TabsTrigger>
              </TabsList>
            </Tabs>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>First name</Label><Input data-testid="reg-first-name" value={form.first_name} onChange={change("first_name")} required /></div>
                <div><Label>Last name</Label><Input data-testid="reg-last-name" value={form.last_name} onChange={change("last_name")} required /></div>
              </div>
              <div><Label>Email {role === "student" && <span className="text-xs text-slate-500">(richfield.ac.za or aaa.ac.za)</span>}</Label>
                <Input data-testid="reg-email" type="email" value={form.email} onChange={change("email")} required /></div>
              <div><Label>Password</Label><Input data-testid="reg-password" type="password" value={form.password} onChange={change("password")} required minLength={8} /></div>
              {role === "student" && (
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Institution</Label><Input data-testid="reg-institution" onChange={changeE("institution")} placeholder="Richfield / AAA" /></div>
                  <div><Label>Qualification</Label><Input data-testid="reg-qualification" onChange={changeE("qualification")} placeholder="Diploma in IT" /></div>
                </div>
              )}
              {role === "alumni" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Institution</Label><Input data-testid="reg-institution" onChange={changeE("institution")} placeholder="Richfield" required /></div>
                    <div><Label>Graduation year</Label><Input data-testid="reg-grad-year" type="number" onChange={changeE("graduation_year")} placeholder="2022" required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Qualification</Label><Input data-testid="reg-qualification" onChange={changeE("qualification")} placeholder="BSc IT" required /></div>
                    <div><Label>Student number</Label><Input data-testid="reg-student-num" onChange={changeE("student_number")} placeholder="e.g. R123456" /></div>
                  </div>
                  <p className="text-xs text-slate-500">Alumni accounts require admin verification before full access.</p>
                </>
              )}
              {role === "employer" && (
                <>
                  <div><Label>Company name</Label><Input data-testid="reg-company" onChange={changeE("company_name")} required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Website</Label><Input data-testid="reg-company-web" onChange={changeE("company_website")} placeholder="https://" /></div>
                    <div><Label>Industry</Label><Input data-testid="reg-company-industry" onChange={changeE("company_industry")} placeholder="Technology" /></div>
                  </div>
                  <p className="text-xs text-slate-500">Employer accounts require admin approval before posting jobs.</p>
                </>
              )}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading} data-testid="reg-submit">{loading ? "Creating…" : "Create account"}</Button>
            </form>
            <p className="text-sm text-slate-600 mt-6 text-center">Already have an account? <Link to="/login" className="text-blue-600 font-medium" data-testid="reg-to-login">Sign in</Link></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
