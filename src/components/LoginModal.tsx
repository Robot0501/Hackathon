import React, { useState } from 'react';
import {
  X,
  LogIn,
  ShieldCheck,
  AlertCircle,
  Mail,
  Lock,
  GraduationCap,
  Award,
  Building2,
  KeyRound,
  UserCheck,
  Loader2
} from 'lucide-react';
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
  availableUsers
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

    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail || !passwordInput) {
      setErrorMsg('Please enter your registered email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: passwordInput,
      });

      if (error || !data.user) {
        setErrorMsg(error?.message || 'Unable to sign in. Please check your details.');
        return;
      }

      const profile = await fetchProfile(data.user.id);

      if (!profile) {
        await supabase.auth.signOut();
        setErrorMsg('Your login succeeded, but no Enrich profile was found. Please contact the team or register again.');
        return;
      }

      onLoginSuccess(profile);
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Supabase login failed:', error);
      setErrorMsg(error?.message || 'Unable to sign in right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPersonaSelect = (user: UserProfile) => {
    onLoginSuccess(user);
    onClose();
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#0F172A] text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
                Supabase Authentication Gateway
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white tracking-tight">
              Sign In to Enrich
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sign in with the account you created on Enrich.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs space-y-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E3A8A]" />
                Supported Enrich Accounts
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-1 font-bold text-blue-900">
                    <GraduationCap className="w-3 h-3" /> Students
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">@my.richfield.ac.za</p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-1 font-bold text-emerald-900">
                    <Award className="w-3 h-3" /> Alumni
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Registered alumni email</p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-1 font-bold text-indigo-900">
                    <Building2 className="w-3 h-3" /> Recruiters
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Corporate account</p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-rose-100">
                  <div className="flex items-center gap-1 font-bold text-rose-900">
                    <KeyRound className="w-3 h-3" /> Staff
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Institutional account</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#1E3A8A] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#1E3A8A] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#1E3A8A] hover:bg-[#1E40AF] disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>{isLoading ? 'Signing In...' : 'Sign In Securely'}</span>
            </button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
              <span className="bg-white px-2">Hackathon Demo Profiles</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-600 font-medium">
              Keep these demo profiles for quick judging/testing:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickPersonaSelect(user)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors flex items-center gap-2.5 group"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-300"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1E3A8A]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-500 capitalize">
                      {user.role}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">First time using Enrich?</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToRegister();
              }}
              className="font-bold text-[#1E3A8A] hover:underline flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Register new account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
