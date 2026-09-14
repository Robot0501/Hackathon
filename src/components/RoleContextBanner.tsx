import React from 'react';
import {
  GraduationCap,
  Award,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Briefcase,
  Users,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface RoleContextBannerProps {
  currentUser: UserProfile;
  onNavigateTab: (tab: string) => void;
  onLogout: () => void;
  pendingBusinessApprovalsCount?: number;
}

export const RoleContextBanner: React.FC<RoleContextBannerProps> = ({
  currentUser,
  onNavigateTab,
  onLogout,
  pendingBusinessApprovalsCount = 1
}) => {
  const { role } = currentUser;

  if (role === 'student') {
    return (
      <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900/80 border border-blue-700 flex items-center justify-center text-blue-300 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/80">
                  Student Portal
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {currentUser.programme || 'BSc Information Technology'}
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-xs text-slate-400">
                  {currentUser.campus || 'Braamfontein Campus'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Verified student profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'alumni') {
    return (
      <div className="bg-[#042F2E] text-white border-b border-emerald-900/80 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700 flex items-center justify-center text-emerald-300 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Alumni Mentorship Network
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {currentUser.currentCompany ? `${currentUser.currentRole} at ${currentUser.currentCompany}` : 'Richfield Alumnus'}
                </span>
                <span className="text-emerald-500/50 hidden sm:inline">•</span>
                <span className="text-xs text-emerald-200/80">
                  Class of {currentUser.graduationYear || '2021'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/70 mt-0.5">
                Alumni Mentorship Badge Active • 24 Students Mentored Across Richfield Campuses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onLogout}
              className="p-1.5 text-emerald-400 hover:text-rose-400 hover:bg-emerald-950 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'business') {
    return (
      <div className="bg-[#1E1B4B] text-white border-b border-indigo-950 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-900/60 border border-indigo-700 flex items-center justify-center text-indigo-300 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  Enterprise Recruiter Mode
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {currentUser.businessDetails?.organizationName || 'Corporate Partner'}
                </span>
                <span className="text-indigo-400 hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> CIPC Verified
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Vetted access to direct Richfield graduates • POPIA compliance active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigateTab('opportunities')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Post Graduate Vacancy</span>
            </button>
            <button
              onClick={() => onNavigateTab('network')}
              className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-800 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Candidate Pool</span>
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 text-indigo-400 hover:text-rose-400 hover:bg-indigo-950 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Role
  return (
    <div className="bg-[#450A0A] text-white border-b border-rose-950 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-900/60 border border-rose-700 flex items-center justify-center text-rose-300 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                Institutional Administration
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Placement Office & Dean's Console
              </span>
              <span className="text-rose-400 hidden sm:inline">•</span>
              <span className="text-xs text-rose-300">
                Full Vetting & Governance Authority
              </span>
            </div>
            <p className="text-xs text-rose-200/80 mt-0.5">
              Auditing institutional compliance, student identity credentials, and corporate partner listings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateTab('admin')}
            className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Control Panel</span>
          </button>
          <button
            onClick={onLogout}
            className="p-1.5 text-rose-300 hover:text-rose-100 hover:bg-rose-950 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
