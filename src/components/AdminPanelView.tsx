import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  AlertTriangle,
  Calendar,
  Megaphone,
  CheckCircle2,
  XCircle,
  Trash2,
  PlusCircle,
  Send,
  Eye,
  Check,
  X,
  GraduationCap
} from 'lucide-react';
import { UserProfile, Opportunity, RichfieldEvent, Post } from '../types';

interface AdminPanelViewProps {
  users: UserProfile[];
  opportunities: Opportunity[];
  events: RichfieldEvent[];
  posts: Post[];
  onApproveBusiness: (userId: string) => void;
  onRejectBusiness: (userId: string) => void;
  onApproveOpportunity: (oppId: string) => void;
  onRejectOpportunity: (oppId: string) => void;
  onDeletePost: (postId: string) => void;
  onCreateEvent: (event: RichfieldEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onBroadcastAnnouncement: (title: string, message: string, target: 'all' | 'students' | 'alumni' | 'business') => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  users,
  opportunities,
  events,
  posts,
  onApproveBusiness,
  onRejectBusiness,
  onApproveOpportunity,
  onRejectOpportunity,
  onDeletePost,
  onCreateEvent,
  onDeleteEvent,
  onBroadcastAnnouncement,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<
    'approvals' | 'users' | 'moderation' | 'events' | 'announcements'
  >('approvals');

  // New Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<RichfieldEvent['type']>('career_fair');
  const [eventDate, setEventDate] = useState('24 October 2026');
  const [eventTime, setEventTime] = useState('10:00 - 15:00');
  const [eventLocation, setEventLocation] = useState('Braamfontein Auditorium & Virtual');
  const [eventDesc, setEventDesc] = useState('');

  // Announcement State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annTarget, setAnnTarget] = useState<'all' | 'students' | 'alumni' | 'business'>('all');
  const [annSuccessNotice, setAnnSuccessNotice] = useState(false);

  const pendingBusinesses = users.filter(
    (u) => u.role === 'business' && u.businessDetails?.approvalStatus === 'pending'
  );

  const pendingOpportunities = opportunities.filter(
    (o) => o.status === 'pending_approval'
  );

  const handleCreateNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEv: RichfieldEvent = {
      id: `ev-${Date.now()}`,
      title: eventTitle,
      type: eventType,
      date: eventDate,
      time: eventTime,
      location: eventLocation,
      campus: eventLocation.includes('Pretoria') ? 'Pretoria Campus' : 'Braamfontein Campus',
      organizer: 'Richfield Academic Administration',
      description: eventDesc || 'Official institutional event for Richfield College scholars and industry partners.',
      rsvpCount: 0,
      hasRsvp: false
    };

    onCreateEvent(newEv);
    setEventTitle('');
    setEventDesc('');
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    onBroadcastAnnouncement(annTitle, annMessage, annTarget);
    setAnnTitle('');
    setAnnMessage('');
    setAnnSuccessNotice(true);
    setTimeout(() => setAnnSuccessNotice(false), 4000);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Admin Title Card */}
      <div className="bg-gradient-to-r from-[#2B193D] via-[#2C365E] to-[#484D6D] rounded-2xl p-5 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#4B8F8C]" />
            <h1 className="font-display font-extrabold text-lg">
              Richfield Central Academic Administration
            </h1>
          </div>
          <p className="text-xs text-[#C5979D] mt-0.5">
            Elevated governance controls: Corporate vetting, opportunities approval, and platform moderation.
          </p>
        </div>

        {/* Admin Tabs */}
        <div className="flex bg-white/10 p-1 rounded-xl text-xs font-semibold overflow-x-auto no-scrollbar">
          {[
            { id: 'approvals', label: `Vetting Queue (${pendingBusinesses.length + pendingOpportunities.length})` },
            { id: 'users', label: `Users (${users.length})` },
            { id: 'moderation', label: `Moderation (${posts.length})` },
            { id: 'events', label: `Events (${events.length})` },
            { id: 'announcements', label: 'Broadcast' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeAdminTab === tab.id
                  ? 'bg-white text-[#2B193D] shadow-xs'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: APPROVALS & VETTING */}
      {activeAdminTab === 'approvals' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Corporate Registrations Pending Approval */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#2B193D]">
                  Corporate Employer & Recruiter Registrations
                </h3>
                <p className="text-xs text-slate-500">
                  Business accounts require institutional signoff before they can contact verified students.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                {pendingBusinesses.length} Pending Vetting
              </span>
            </div>

            {pendingBusinesses.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                All registered business accounts have been vetted and approved.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBusinesses.map((biz) => (
                  <div
                    key={biz.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#4B8F8C]" />
                        <span className="font-bold text-xs text-[#2B193D]">
                          {biz.businessDetails?.organizationName || biz.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                          {biz.businessDetails?.registrationNumber || 'CIPC Unverified'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Contact: {biz.name} ({biz.email}) • Website: {biz.businessDetails?.website || 'N/A'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {biz.businessDetails?.companyDescription}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onRejectBusiness(biz.id)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => onApproveBusiness(biz.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#4B8F8C] hover:bg-[#3d7573] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Access
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Job Vacancies */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#2B193D]">
                  Opportunities Requiring Publication Approval
                </h3>
                <p className="text-xs text-slate-500">
                  Verifying stipend compliance and academic relevance for Richfield students.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                {pendingOpportunities.length} In Review
              </span>
            </div>

            {pendingOpportunities.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                All submitted opportunities are currently active and live.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#2B193D]">{opp.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5979D]/20 text-[#2B193D] font-bold capitalize">
                          {opp.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Posted by: <strong>{opp.companyName}</strong> • Stipend: {opp.stipendSalary}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {opp.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onRejectOpportunity(opp.id)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => onApproveOpportunity(opp.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#2B193D] hover:bg-[#2C365E] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Publish to Students
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div>
            <h3 className="font-bold text-sm text-[#2B193D]">Richfield Identity Registry</h3>
            <p className="text-xs text-slate-500">
              Institutional validation overview of all registered scholars, alumni, and partner recruiters.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Institutional Role</th>
                  <th className="py-2.5 px-3">Campus / Entity</th>
                  <th className="py-2.5 px-3">Verification ID</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <span className="font-bold text-slate-800">{u.name}</span>
                          <span className="block text-[10px] text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 capitalize font-medium text-slate-700">
                      {u.role}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {u.role === 'business' ? u.businessDetails?.organizationName : u.campus}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#4B8F8C]">
                      {u.verificationId || 'PENDING'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.verificationStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {u.verificationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONTENT MODERATION */}
      {activeAdminTab === 'moderation' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div>
            <h3 className="font-bold text-sm text-[#2B193D]">Content Moderation & Safety Desk</h3>
            <p className="text-xs text-slate-500">
              Audit live feeds, remove flagged submissions, and uphold Richfield academic standards.
            </p>
          </div>

          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2B193D]">{post.authorName}</span>
                    <span className="text-[10px] text-slate-400">({post.authorRole})</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 uppercase">
                      {post.type}
                    </span>
                  </div>
                  <p className="text-slate-700 mt-1 line-clamp-2">{post.content}</p>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {post.likes} likes • {post.comments.length} comments • Campus: {post.campus}
                  </div>
                </div>

                <button
                  onClick={() => onDeletePost(post.id)}
                  className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold flex items-center gap-1 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Post
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EVENT PUBLISHER */}
      {activeAdminTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
          {/* Create Event Form */}
          <form
            onSubmit={handleCreateNewEvent}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Calendar className="w-4 h-4 text-[#4B8F8C]" />
              <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">
                Publish Official Campus Event
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title</label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. Richfield Graduate Recruitment Gala 2026"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                >
                  <option value="career_fair">Career Fair</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="industry_talk">Industry Masterclass</option>
                  <option value="alumni_mixer">Alumni Mixer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="24 Oct 2026"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                <input
                  type="text"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="09:00 - 14:00"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Campus Auditorium"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                placeholder="Details, key speakers, requirements..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-[#2B193D] hover:bg-[#2C365E] text-white font-bold text-xs shadow-xs"
            >
              Publish Event to Community
            </button>
          </form>

          {/* Current Events List */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">Active Institutional Events</h3>
            <div className="space-y-2.5">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-bold text-[#2B193D]">{ev.title}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {ev.date} • {ev.location} • {ev.rsvpCount} RSVPs
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteEvent(ev.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BROADCAST ANNOUNCEMENTS */}
      {activeAdminTab === 'announcements' && (
        <form
          onSubmit={handleSendAnnouncement}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 max-w-xl mx-auto animate-in fade-in"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Megaphone className="w-5 h-5 text-[#4B8F8C]" />
            <div>
              <h3 className="font-bold text-sm text-[#2B193D]">Broadcast Institutional Announcement</h3>
              <p className="text-xs text-slate-500">Sends high-priority notification to targeted users.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
            <select
              value={annTarget}
              onChange={(e) => setAnnTarget(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
            >
              <option value="all">Entire Richfield Community (All Users)</option>
              <option value="students">Students Only (@my.richfield.ac.za)</option>
              <option value="alumni">Alumni Cohort Only</option>
              <option value="business">Corporate Recruiter Partners Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Title</label>
            <input
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="e.g. 2026 Graduate Placement Fair Registration Open"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Message</label>
            <textarea
              required
              rows={3}
              value={annMessage}
              onChange={(e) => setAnnMessage(e.target.value)}
              placeholder="Details regarding the broadcast notice..."
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
            />
          </div>

          {annSuccessNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Announcement dispatched successfully to {annTarget.toUpperCase()} recipients.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-[#2B193D] hover:bg-[#2C365E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
          >
            <Send className="w-3.5 h-3.5 text-[#4B8F8C]" />
            <span>Dispatch Broadcast</span>
          </button>
        </form>
      )}
    </div>
  );
};
