import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, Building2, Briefcase, Users, Flag, Calendar, Megaphone, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/businesses', label: 'Businesses', icon: Building2 },
  { to: '/opportunities', label: 'Opportunities', icon: Briefcase },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/moderation', label: 'Moderation', icon: Flag },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/broadcast', label: 'Broadcast', icon: Megaphone },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] border border-blue-600 flex items-center justify-center font-black text-lg">R</div>
          <div>
            <div className="font-bold tracking-tight">Enrich Admin</div>
            <div className="text-[11px] text-slate-400">Richfield Portal</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center font-bold text-xs text-white">
              {(user?.name || 'A').charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate">{user?.name || 'Administrator'}</div>
              <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
            </div>
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Live Supabase • Same DB as mobile • Prototype</span>
          </div>
          <div className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Admin: {user?.name}
          </div>
        </header>
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
