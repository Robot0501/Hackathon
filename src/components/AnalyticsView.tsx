import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Video,
  Award,
  Briefcase,
  FileCheck,
  ShieldCheck,
  Building2,
  GraduationCap
} from 'lucide-react';
import { UserProfile } from '../types';

interface AnalyticsViewProps {
  currentUser: UserProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ currentUser }) => {
  const dashboardType =
    currentUser.role === 'admin'
      ? 'admin'
      : currentUser.role === 'business'
      ? 'business'
      : 'student';

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#4B8F8C]" />
            <h1 className="font-display font-extrabold text-lg text-[#2B193D]">
              Enrich Analytics Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time platform metrics, engagement trends, and institutional workforce insights.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
          {dashboardType === 'student' && <GraduationCap className="w-3.5 h-3.5 text-[#2B193D]" />}
          {dashboardType === 'business' && <Building2 className="w-3.5 h-3.5 text-[#2B193D]" />}
          {dashboardType === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-[#2B193D]" />}
          <span>
            {dashboardType === 'student'
              ? 'Student Dashboard'
              : dashboardType === 'business'
              ? 'Business Dashboard'
              : 'Admin Dashboard'}
          </span>
        </div>
      </div>

      {/* DASHBOARD 1: STUDENT DASHBOARD */}
      {dashboardType === 'student' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Profile Views', value: '142', change: '+28% this week', icon: Eye, color: '#4B8F8C' },
              { label: 'Connection Growth', value: '28', change: '+12 new alumni', icon: Users, color: '#2C365E' },
              { label: 'Post Engagement', value: '89', change: 'Likes & reactions', icon: TrendingUp, color: '#C5979D' },
              { label: 'Video Pitch Views', value: '310', change: 'Recruiter plays', icon: Video, color: '#2B193D' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div className="text-2xl font-display font-extrabold text-[#2B193D]">
                  {stat.value}
                </div>
                <div className="text-[11px] font-medium text-[#4B8F8C] mt-0.5">
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profile View Trend Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">Profile View Trends (7 Days)</h3>
                  <p className="text-[11px] text-slate-400">Recruiter and peer visits to your Enrich profile</p>
                </div>
                <span className="text-xs font-bold text-[#4B8F8C]">+34% vs last week</span>
              </div>

              {/* Responsive SVG Area Chart */}
              <div className="h-44 w-full pt-4">
                <svg viewBox="0 0 350 120" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="grad-teal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4B8F8C" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#4B8F8C" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="20" x2="350" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="60" x2="350" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="100" x2="350" y2="100" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Area fill */}
                  <path
                    d="M 10,95 Q 60,85 110,60 T 210,40 T 310,15 L 310,110 L 10,110 Z"
                    fill="url(#grad-teal)"
                  />
                  {/* Line */}
                  <path
                    d="M 10,95 Q 60,85 110,60 T 210,40 T 310,15"
                    fill="none"
                    stroke="#4B8F8C"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Data Points */}
                  {[
                    { x: 10, y: 95, label: 'Mon', val: 12 },
                    { x: 70, y: 80, label: 'Tue', val: 18 },
                    { x: 130, y: 55, label: 'Wed', val: 26 },
                    { x: 190, y: 45, label: 'Thu', val: 31 },
                    { x: 250, y: 35, label: 'Fri', val: 40 },
                    { x: 310, y: 15, label: 'Sat', val: 54 },
                  ].map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="4" fill="#2B193D" stroke="#fff" strokeWidth="2" />
                      <text x={p.x} y="118" fontSize="9" fill="#94a3b8" textAnchor="middle">
                        {p.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Profile Completeness Comparison */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">
                  Profile Completeness vs Campus Cohort
                </h3>
                <p className="text-[11px] text-slate-400">Higher completeness unlocks higher recruiter matchmaking</p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#2B193D]">Your Profile ({currentUser.name})</span>
                    <span className="text-[#4B8F8C] font-bold">{currentUser.profileCompleteness || 88}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#4B8F8C] to-[#2C365E] rounded-full"
                      style={{ width: `${currentUser.profileCompleteness || 88}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Richfield Campus Average</span>
                    <span className="text-slate-600 font-bold">64%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '64%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Standard Bank Preferred Threshold</span>
                    <span className="text-[#C5979D] font-bold">80%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#C5979D] rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 mt-2">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your profile is in the top 12% of Richfield candidates this term.</span>
              </div>
            </div>
          </div>

          {/* Most Searched Skills by Recruiters in SA */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">
              Most In-Demand Skills Searched by Recruiters (Gauteng & Western Cape)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { skill: 'AWS & Cloud Architecture', demand: '96% Index', inProfile: true },
                { skill: 'React & TypeScript', demand: '92% Index', inProfile: true },
                { skill: 'Relational SQL / Postgres', demand: '88% Index', inProfile: true },
                { skill: 'Python / Data Analytics', demand: '85% Index', inProfile: true },
                { skill: 'Docker & Kubernetes', demand: '78% Index', inProfile: false },
                { skill: 'Cybersecurity Fundamentals', demand: '76% Index', inProfile: false },
                { skill: 'REST API & Microservices', demand: '74% Index', inProfile: true },
                { skill: 'Agile / Scrum Methodologies', demand: '70% Index', inProfile: true },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="font-bold text-slate-800">{item.skill}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[#4B8F8C] font-semibold text-[11px]">{item.demand}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                        item.inProfile
                          ? 'bg-[#4B8F8C]/15 text-[#4B8F8C]'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.inProfile ? 'In Your Profile' : '+ Add to Profile'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD 2: BUSINESS RECRUITER DASHBOARD */}
      {dashboardType === 'business' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Top Funnel Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Active Opportunities', value: '4 Listings', icon: Briefcase, color: '#2B193D' },
              { label: 'Total Candidate Pool', value: '1,842 Students', icon: Users, color: '#4B8F8C' },
              { label: 'Applications Received', value: '124 Total', icon: FileCheck, color: '#2C365E' },
              { label: 'Shortlist Rate', value: '38% Qualified', icon: Award, color: '#C5979D' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div className="text-xl font-display font-extrabold text-[#2B193D]">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Applicant Pipeline Funnel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">
                Applicant Pipeline Funnel
              </h3>
              <div className="space-y-2.5 pt-1">
                {[
                  { stage: '1. Applications Submitted', count: 124, pct: '100%', color: '#2B193D' },
                  { stage: '2. Institutional Verification Passed', count: 118, pct: '95%', color: '#2C365E' },
                  { stage: '3. Technical Skill Filter Matched', count: 68, pct: '55%', color: '#484D6D' },
                  { stage: '4. Video Pitch Reviewed', count: 42, pct: '34%', color: '#4B8F8C' },
                  { stage: '5. Interview Invitations Sent', count: 18, pct: '15%', color: '#C5979D' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">{item.stage}</span>
                      <span className="font-bold text-[#2B193D]">{item.count} candidates</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: item.pct, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Distribution by Programme */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">
                Applicant Breakdown by Programme
              </h3>
              <div className="space-y-2.5 pt-1">
                {[
                  { name: 'BSc Information Technology', share: 58, color: '#4B8F8C' },
                  { name: 'Diploma in Software Development', share: 22, color: '#2C365E' },
                  { name: 'BCom Accounting & Information Systems', share: 12, color: '#2B193D' },
                  { name: 'AAA Digital Brand & Marketing', share: 8, color: '#C5979D' },
                ].map((prog, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">{prog.name}</span>
                      <span className="font-bold" style={{ color: prog.color }}>{prog.share}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${prog.share}%`, backgroundColor: prog.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD 3: ADMINISTRATOR DASHBOARD */}
      {dashboardType === 'admin' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Admin Platform Volume Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Registered Students', value: '1,842', sub: '98% institutional @my.richfield', color: '#4B8F8C' },
              { label: 'Verified Alumni', value: '654', sub: 'Across 14 industries', color: '#2C365E' },
              { label: 'Corporate Partners', value: '48 Approved', sub: '8 Pending vetting', color: '#2B193D' },
              { label: 'Monthly Active (MAU)', value: '2,180', sub: '84% engagement rate', color: '#C5979D' },
            ].map((card, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 block mb-1">{card.label}</span>
                <div className="text-2xl font-display font-extrabold text-[#2B193D]">{card.value}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{card.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campus Registration Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">
                Student Cohort by Richfield Campus
              </h3>
              <div className="space-y-2 pt-1">
                {[
                  { campus: 'Braamfontein Campus (JHB)', count: 620, pct: 34, color: '#2B193D' },
                  { campus: 'Pretoria Campus', count: 440, pct: 24, color: '#2C365E' },
                  { campus: 'Durban Centenary Campus', count: 380, pct: 21, color: '#484D6D' },
                  { campus: 'Cape Town Campus', count: 260, pct: 14, color: '#4B8F8C' },
                  { campus: 'Bryanston Executive & Other', count: 142, pct: 7, color: '#C5979D' },
                ].map((c, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">{c.campus}</span>
                      <span className="text-slate-500 font-mono">{c.count} ({c.pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Health & Governance */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">
                Institutional Compliance & Moderation Status
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">POPIA Data Protection Protocol</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    100% Compliant
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">Flagged Posts / Videos Queue</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">
                    0 In Review
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">Pending Business User Vetting</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                    1 Pending Approval
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">Average Time-to-Placement</span>
                  <span className="font-bold text-[#4B8F8C]">4.2 Months</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
