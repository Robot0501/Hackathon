import React from 'react';
import {
  Compass,
  Briefcase,
  Users,
  BarChart3,
  ShieldAlert,
  User
} from 'lucide-react';
import { UserRole } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  unreadMessagesCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  unreadMessagesCount = 0,
}) => {
  const navItems = [
    { id: 'feed', label: 'Campus Feed', icon: Compass },
    { id: 'opportunities', label: 'Graduate Roles & Vacancies', icon: Briefcase },
    { id: 'network', label: 'Richfield Network', icon: Users, badge: unreadMessagesCount },
    ...(userRole === 'admin'
      ? [{ id: 'admin', label: 'Administration Console', icon: ShieldAlert, adminOnly: true }]
      : []),
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Desktop Sub-Nav / Tabs */}
      <nav className="hidden md:block bg-white border-b border-slate-200 sticky top-[57px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : item.adminOnly
                      ? 'text-rose-700 hover:bg-rose-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-blue-400'
                        : item.adminOnly
                        ? 'text-rose-600'
                        : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : null}
                  {item.adminOnly && (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                      Dean's Staff
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors relative ${
                  isActive ? 'text-[#0F172A]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? 'bg-blue-100 text-[#0F172A]' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="mt-0.5 truncate max-w-[65px]">
                  {item.label.split(' ').slice(0, 2).join(' ')}
                </span>
                {item.badge ? (
                  <span className="absolute top-0 right-2 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
          {/* More / Profile button on mobile */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
              activeTab === 'profile' || activeTab === 'admin'
                ? 'text-[#0F172A]'
                : 'text-slate-500'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                activeTab === 'profile' ? 'bg-blue-100 text-[#0F172A]' : ''
              }`}
            >
              <User className="w-5 h-5" />
            </div>
            <span className="mt-0.5">Dossier</span>
          </button>
        </div>
      </nav>
    </>
  );
};
