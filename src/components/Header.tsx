import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Monitor,
  LogOut,
  UserCheck,
  ChevronDown,
  Building2,
  GraduationCap,
  Sparkles,
  Home
} from 'lucide-react';
import { UserProfile, UserRole, NotificationItem } from '../types';

interface HeaderProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenAuthModal,
  onLogout,
  isMobileFrame,
  onToggleMobileFrame,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  activeTab,
  setActiveTab,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700">
            <GraduationCap className="w-3 h-3" /> Student
          </span>
        );
      case 'alumni':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Alumni
          </span>
        );
      case 'business':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
            <Building2 className="w-3 h-3" /> Recruiter
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
            <ShieldCheck className="w-3 h-3 text-rose-400" /> Administrator
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] border border-blue-500/50 flex items-center justify-center font-bold text-lg text-white shadow-xs group-hover:scale-105 transition-transform">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-extrabold text-lg tracking-tight text-white">
                  Enrich
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-200 border border-blue-700/60">
                  Richfield
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none hidden sm:block">
                Institutional Placement & Careers Ecosystem
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Mode Toggle: Mobile Frame vs Responsive Desktop */}
          <button
            onClick={onToggleMobileFrame}
            title={isMobileFrame ? 'Switch to Full-Screen Desktop View' : 'Simulate Mobile Device View'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden md:inline">Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">Mobile Frame</span>
              </>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-900 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900">Richfield Notices</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                      {notifications.length}
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onClearAllNotifications}
                      className="text-xs text-[#1E3A8A] hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                        notif.read
                          ? 'bg-slate-50 border-slate-100 text-slate-600'
                          : 'bg-blue-50/60 border-blue-200 text-slate-900 font-medium'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-900">{notif.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                      </div>
                      <p className="mt-1 text-slate-600 leading-snug">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Selector & Verification Status */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-left"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-blue-400"
              />
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  {currentUser.verificationStatus === 'verified' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="text-[10px] text-slate-300 capitalize">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-900 p-3 z-50">
                {/* Active user header */}
                <div className="flex items-start gap-3 p-2 bg-slate-50 rounded-xl mb-3 border border-slate-100">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-300"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {currentUser.name}
                    </h4>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      {getRoleBadge(currentUser.role)}
                      {currentUser.verificationStatus === 'verified' ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-semibold">
                          Pending Approval
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Persona Switch Options */}
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                  Switch Active Persona
                </div>
                <div className="space-y-1">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                        u.id === currentUser.id
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-md object-cover" />
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{u.role}</div>
                        </div>
                      </div>
                      {u.id === currentUser.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 mt-2 pt-2 space-y-1">
                  <button
                    onClick={() => {
                      onOpenAuthModal();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-[#1E3A8A] hover:bg-blue-50 font-semibold transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-[#1E3A8A]" />
                    <span>Register New Account</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-slate-400" />
                    <span>View & Edit My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('ai-assistant');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-[#1E3A8A] hover:bg-blue-50 font-semibold transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
                    <span>Open Enrich AI Advisor</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-rose-700 hover:bg-rose-50 font-semibold transition-colors border-t border-slate-100 mt-1 pt-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out / Return to Home</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Sign Out Action */}
          <button
            onClick={onLogout}
            title="Sign Out to Institutional Home"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors hidden sm:flex items-center justify-center"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
