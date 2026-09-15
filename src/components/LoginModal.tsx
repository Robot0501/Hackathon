import React, { useState } from 'react';
import { X, LogIn, AlertCircle, Mail, Lock, Loader2, UserCheck } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { fetchProfile } from '../lib/profile';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onSwitchToRegister: (role?: UserRole) => void;
  availableUsers: UserProfile[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSwitchToRegister,
  availableUsers,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmailInput('');
    setPasswordInput('');
    setErrorMsg('');
    setIsLoading(false);
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const email = emailInput.trim().toLowerCase();

    if (!email || !passwordInput) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: passwordInput,
      });

      if (error || !data.user) {
        setErrorMsg(error?.message || 'Unable to sign in.');
        return;
      }

      const profile = await fetchProfile(data.user.id);
      if (!profile) {
        await supabase.auth.signOut();
        setErrorMsg('Authentication succeeded, but the Enrich profile could not be found.');
        return;
      }

      onLoginSuccess(profile);
      resetForm();
      onClose();
    } catch (error: any) {
      setErrorMsg(error?.message || 'Unable to sign in right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (user: UserProfile) => {
    onLoginSuccess(user);
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#0F172A] text-white p-5 flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Supabase Authentication</p>
            <h2 className="text-xl font-bold mt-1">Sign In to Enrich</h2>
            <p className="text-xs text-slate-400 mt-1">Use the account created through Enrich registration.</p>
          </div>
          <button onClick={() => { resetForm(); onClose(); }} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#1E3A8A] disabled:opacity-60 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {availableUsers.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <p className="text-[10px] uppercase font-bold text-slate-400">Hackathon demo profiles</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableUsers.slice(0, 4).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleDemoLogin(user)}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left"
                  >
                    <div className="text-xs font-bold text-slate-900">{user.name}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{user.role}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">New to Enrich?</span>
            <button
              type="button"
              onClick={() => { onClose(); onSwitchToRegister(); }}
              className="font-bold text-[#1E3A8A] flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" /> Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
