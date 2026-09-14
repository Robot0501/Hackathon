import React, { useState } from 'react';
import {
  X,
  LogIn,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  ArrowRight,
  GraduationCap,
  Award,
  Building2,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

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
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<UserRole | 'all'>('all');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSimulatingOtp, setIsSimulatingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);

  if (!isOpen) return null;

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your registered institutional or corporate email.');
      return;
    }

    const matchedUser = availableUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (matchedUser) {
      // Initiate instant 2FA OTP simulation for institutional security
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(code);
      setPendingUser(matchedUser);
      setIsSimulatingOtp(true);
    } else {
      // Check if student domain was provided
      if (cleanEmail.includes('@my.richfield.ac.za') || cleanEmail.includes('@richfield.ac.za')) {
        setErrorMsg(
          `No account found for "${cleanEmail}". Since this is a valid Richfield student format, please click "Register New Account" below to initialize your verified profile.`
        );
      } else {
        setErrorMsg(
          `No account found for "${cleanEmail}". Please check your email format or register a new profile.`
        );
      }
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== otpCode) {
      setErrorMsg('Invalid authentication code. Please check the simulated OTP alert above.');
      return;
    }

    if (pendingUser) {
      onLoginSuccess(pendingUser);
      onClose();
      resetForm();
    }
  };

  const handleQuickPersonaSelect = (user: UserProfile) => {
    onLoginSuccess(user);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setEmailInput('');
    setPasswordInput('');
    setErrorMsg('');
    setIsSimulatingOtp(false);
    setOtpCode('');
    setEnteredOtp('');
    setPendingUser(null);
  };

  const filteredUsers =
    selectedRoleFilter === 'all'
      ? availableUsers
      : availableUsers.filter((u) => u.role === selectedRoleFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#0F172A] text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
                Institutional Authentication Gateway
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white tracking-tight">
              Sign In to Enrich
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Official career access for Richfield students, alumni, and vetted employers.
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

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              <div className="pt-1 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    onSwitchToRegister(
                      emailInput.includes('@my.richfield.ac.za') ? 'student' : 'student'
                    );
                  }}
                  className="px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                >
                  Register This Account
                </button>
              </div>
            </div>
          )}

          {!isSimulatingOtp ? (
            <>
              {/* Form 1: Email / Password Sign In */}
              <form onSubmit={handleStandardLogin} className="space-y-4">
                {/* Role-by-Role Email Format Specification Banner */}
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      Sign-In Email Format Requirements
                    </span>
                    <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-1.5 py-0.5 rounded">
                      Click to test format
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setEmailInput('thabo.molefe@my.richfield.ac.za')}
                      className="bg-white p-2 rounded-lg border border-blue-100 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 font-bold text-blue-900">
                          <GraduationCap className="w-3 h-3 text-[#1E3A8A]" />
                          <span>Students</span>
                        </div>
                        <span className="text-[9px] text-blue-600 font-semibold group-hover:underline">Use</span>
                      </div>
                      <code className="text-[#1E3A8A] font-mono text-[10px] font-semibold block mt-0.5">
                        Student Number@my.richfield.ac.za
                      </code>
                      <p className="text-[10px] text-slate-500 mt-0.5">Official Richfield student address</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmailInput('lerato.khumalo@alumni.richfield.ac.za')}
                      className="bg-white p-2 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 font-bold text-emerald-900">
                          <Award className="w-3 h-3 text-emerald-700" />
                          <span>Alumni Mentors</span>
                        </div>
                        <span className="text-[9px] text-emerald-600 font-semibold group-hover:underline">Use</span>
                      </div>
                      <code className="text-emerald-800 font-mono text-[10px] font-semibold block mt-0.5">
                        name@company.co.za or personal
                      </code>
                      <p className="text-[10px] text-slate-500 mt-0.5">Registered alumni email</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmailInput('s.jenkins@standardbank.co.za')}
                      className="bg-white p-2 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 font-bold text-indigo-900">
                          <Building2 className="w-3 h-3 text-indigo-700" />
                          <span>Corporate Recruiters</span>
                        </div>
                        <span className="text-[9px] text-indigo-600 font-semibold group-hover:underline">Use</span>
                      </div>
                      <code className="text-indigo-800 font-mono text-[10px] font-semibold block mt-0.5">
                        company name@company.com
                      </code>
                      <p className="text-[10px] text-slate-500 mt-0.5">Verified enterprise domain</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmailInput('dean.dlamini@richfield.ac.za')}
                      className="bg-white p-2 rounded-lg border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 font-bold text-rose-900">
                          <KeyRound className="w-3 h-3 text-rose-700" />
                          <span>Staff / Dean's Office</span>
                        </div>
                        <span className="text-[9px] text-rose-600 font-semibold group-hover:underline">Use</span>
                      </div>
                      <code className="text-rose-800 font-mono text-[10px] font-semibold block mt-0.5">
                        staff@richfield.ac.za
                      </code>
                      <p className="text-[10px] text-slate-500 mt-0.5">Institutional staff domain</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@my.richfield.ac.za or recruiter@company.co.za"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#1E3A8A] focus:bg-white transition-colors font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Please ensure the email matches the designated format for your institutional role above.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Password or PIN
                    </label>
                    <span className="text-[11px] text-slate-500">
                      (Richfield Portal PIN)
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#1E3A8A] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Verify Identity & Proceed</span>
                </button>
              </form>

              {/* Or Quick One-Click First-Time Access */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                  <span className="bg-white px-2">First-Time / Instant Demo Access</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-600 font-medium">
                  Select an accredited profile to test role-specific workflows:
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
                        <div className="text-[10px] text-slate-500 capitalize flex items-center gap-1">
                          <span>{user.role}</span>
                          <span className="text-slate-300">•</span>
                          <span className="truncate">{user.campus?.split(',')[0]}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* OTP Verification Simulation */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-[#1E3A8A]">
                  <KeyRound className="w-4 h-4" />
                  <span>Institutional 2-Factor Verification</span>
                </div>
                <p className="text-slate-600">
                  A 6-digit security token has been dispatched to:
                </p>
                <p className="font-semibold text-slate-900">{pendingUser?.email}</p>
                <div className="mt-2 pt-2 border-t border-blue-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Simulated Richfield SMS/Email Code:</span>
                  <span className="font-mono font-bold text-sm text-[#1E3A8A] tracking-wider px-2 py-0.5 rounded bg-white border border-blue-300">
                    {otpCode}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter 6-Digit Verification Token
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 849201"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="w-full text-center tracking-widest font-mono text-lg font-bold py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-[#1E3A8A] focus:bg-white transition-colors"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSimulatingOtp(false)}
                  className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Confirm & Enter Portal</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer: Link to Register */}
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
