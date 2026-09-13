import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.first_name}`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative bg-slate-900">
        <img src="https://images.unsplash.com/photo-1530099486328-e021101a494a?crop=entropy&cs=srgb&fm=jpg&q=85" alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="relative z-10 p-12 h-full flex flex-col justify-between text-white">
          <Link to="/" className="flex items-center gap-2" data-testid="brand-link">
            <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center font-bold font-heading">R</div>
            <div className="font-heading font-extrabold text-lg">Richfield Connect</div>
          </Link>
          <div><h2 className="font-heading font-extrabold text-4xl leading-tight">Welcome back.</h2><p className="mt-2 text-slate-200">Sign in to continue building your professional future.</p></div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="font-heading text-2xl font-bold">Sign in</div>
              <p className="text-sm text-slate-600 mt-1">Use your Richfield Connect credentials.</p>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div><Label>Email</Label><Input data-testid="login-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" /></div>
              <div><Label>Password</Label><Input data-testid="login-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete="current-password" /></div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading} data-testid="login-submit">{loading ? "Signing in…" : "Sign in"}</Button>
            </form>
            <p className="text-sm text-slate-600 mt-6 text-center">New to Richfield Connect? <Link to="/register" className="text-blue-600 font-medium" data-testid="login-to-register">Create an account</Link></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
