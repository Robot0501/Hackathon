import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getProfile } from '../lib/authService';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error('No user returned');

      const profile = await getProfile(data.user.id);
      if (!profile || profile.role !== 'admin' || profile.verificationStatus !== 'verified') {
        await supabase.auth.signOut();
        throw new Error('Access restricted to verified Richfield administrators. Your account is not an admin.');
      }

      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Brand */}
      <div className="hidden lg:flex w-[46%] bg-[#0F172A] text-white p-10 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] border border-blue-600 flex items-center justify-center font-black">R</div>
            <div>
              <div className="font-bold">Enrich Admin</div>
              <div className="text-xs text-slate-400">Richfield College • Prototype</div>
            </div>
          </div>
          <div className="mt-16 max-w-md">
            <h1 className="text-3xl font-black leading-tight">Institutional governance for the mobile Enrich ecosystem.</h1>
            <p className="text-sm text-slate-300 mt-4 leading-relaxed">
              This web portal shares the same Supabase project as the Android app <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">uzwovrzquofdsqrzphlq</code>. Approvals here are instantly visible in the mobile app.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-lg font-black">Vetting</div>
                <div className="text-[11px] text-slate-400">Businesses</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-lg font-black">Moderation</div>
                <div className="text-[11px] text-slate-400">Feed</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-lg font-black">Live DB</div>
                <div className="text-[11px] text-slate-400">Supabase</div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">© {new Date().getFullYear()} Richfield College (Pty) Ltd • Prototype - not hosted</div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-white">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Administrator Sign In</h2>
                <p className="text-xs text-slate-500">Use your verified admin account (Supabase Auth)</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Administrator Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@richfield.ac.za"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#1E3A8A] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#1E3A8A] focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Admins are created via Supabase Dashboard → Auth, then promoted to `role='admin'` in `profiles`.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors"
              >
                {loading ? 'Verifying…' : 'Sign In to Admin Portal'}
              </button>
            </form>

            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-[11px] font-bold text-amber-800">Prototype Note</div>
              <div className="text-[11px] text-amber-700 leading-relaxed">
                Only verified <code className="bg-white px-1 rounded">role='admin'</code> can access. Student/alumni/business logins are rejected here and should use the mobile app.
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-slate-500">
              Mobile app: <span className="font-mono text-slate-700">mobile/</span> • Same Supabase project
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-700">
              Need a test admin? See <code className="bg-white border px-1 rounded">mobile/supabase/ADMIN_SETUP.md</code>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
