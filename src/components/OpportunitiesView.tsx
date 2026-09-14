import React, { useState } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Building2,
  Search,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { Opportunity, RichfieldEvent, UserProfile } from '../types';

interface OpportunitiesViewProps {
  currentUser: UserProfile;
  opportunities: Opportunity[];
  events: RichfieldEvent[];
  onApply: (opportunityId: string) => void;
  onPostOpportunity: (newOpp: Opportunity) => void;
  onRsvpEvent: (eventId: string) => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  currentUser,
  opportunities,
  events,
  onApply,
  onPostOpportunity,
  onRsvpEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'events'>('jobs');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [applicationOpportunity, setApplicationOpportunity] = useState<Opportunity | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: '',
    availability: '',
    motivation: '',
  });

  // New opportunity form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'internship' | 'learnership' | 'graduate_vacancy' | 'part_time'>('graduate_vacancy');
  const [newLocation, setNewLocation] = useState('Johannesburg, Gauteng');
  const [newProgramme, setNewProgramme] = useState('BSc Information Technology');
  const [newSkills, setNewSkills] = useState('React, TypeScript, SQL');
  const [newSalary, setNewSalary] = useState('R25,000 / month');
  const [newDescription, setNewDescription] = useState('');

  // Smart Matching Logic: computes matching score against student profile
  const computeMatchScore = (opp: Opportunity): number => {
    let score = 50;
    // Programme match (+25)
    if (
      currentUser.programme &&
      opp.requiredProgramme.some((p) =>
        currentUser.programme?.toLowerCase().includes(p.toLowerCase()) ||
        p.toLowerCase().includes(currentUser.programme?.toLowerCase() || '')
      )
    ) {
      score += 25;
    }
    // Skill overlap (+5 per match, max +25)
    const userSkills = currentUser.technicalSkills.map((s) => s.toLowerCase());
    const matchedSkills = opp.requiredSkills.filter((req) =>
      userSkills.some((us) => us.includes(req.toLowerCase()) || req.toLowerCase().includes(us))
    );
    score += Math.min(25, matchedSkills.length * 7);

    return Math.min(98, score);
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    // Only approved opportunities go live for students unless current user is admin/the poster
    if (opp.status !== 'approved' && currentUser.role !== 'admin' && currentUser.id !== opp.companyId) {
      return false;
    }
    if (filterType !== 'all' && opp.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = opp.title.toLowerCase().includes(q);
      const matchCompany = opp.companyName.toLowerCase().includes(q);
      const matchSkill = opp.requiredSkills.some((s) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchCompany && !matchSkill) return false;
    }
    return true;
  });

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationOpportunity) return;

    onApply(applicationOpportunity.id);
    setApplicationOpportunity(null);
    setApplicationForm({
      name: currentUser.name,
      email: currentUser.email,
      phone: '',
      availability: '',
      motivation: '',
    });
  };

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      companyId: currentUser.id,
      companyName: currentUser.businessDetails?.organizationName || currentUser.name,
      companyLogo: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=100&h=100&fit=crop',
      title: newTitle,
      type: newType,
      location: newLocation,
      campusTarget: 'All Campuses',
      requiredProgramme: [newProgramme],
      requiredSkills: newSkills.split(',').map((s) => s.trim()),
      description: newDescription || 'Exciting opportunity for Richfield students to gain industry experience.',
      responsibilities: [
        'Deliver on key milestone sprint tasks',
        'Participate in agile ceremonies and team standups'
      ],
      stipendSalary: newSalary,
      closingDate: '30 November 2026',
      // If posted by admin: approved; if posted by business user: pending admin review
      status: currentUser.role === 'admin' ? 'approved' : 'pending_approval',
      applicantsCount: 0,
      matchScore: 90
    };

    onPostOpportunity(newOpp);
    setIsPostingModalOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Header & Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-lg text-[#2B193D]">
              Career Hub & Placements
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#4B8F8C]/15 text-[#4B8F8C] font-bold text-[10px]">
              Verified Institutional
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Smart job matching tailored to your Richfield qualification & skill profile.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'jobs'
                  ? 'bg-white text-[#2B193D] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Opportunities ({opportunities.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'events'
                  ? 'bg-white text-[#2B193D] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Campus Events ({events.length})
            </button>
          </div>

          {(currentUser.role === 'business' || currentUser.role === 'admin') && (
            <button
              onClick={() => setIsPostingModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#2B193D] hover:bg-[#2C365E] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-[#4B8F8C]" />
              <span className="hidden sm:inline">Post Opportunity</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'jobs' ? (
        <>
          {/* Filters & Search */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by role, company, or skills (e.g. React, Python, Cloud)..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'all', label: 'All Openings' },
                { id: 'graduate_vacancy', label: 'Graduate Programmes' },
                { id: 'internship', label: 'Internships' },
                { id: 'learnership', label: 'Learnerships (12m)' },
                { id: 'part_time', label: 'Campus Part-Time' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setFilterType(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    filterType === pill.id
                      ? 'bg-[#2B193D] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunities List */}
          <div className="space-y-3">
            {filteredOpportunities.map((opp) => {
              const match = computeMatchScore(opp);
              return (
                <div
                  key={opp.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-[#4B8F8C]/50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={opp.companyLogo}
                        alt={opp.companyName}
                        className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm sm:text-base text-[#2B193D] group-hover:text-[#4B8F8C] transition-colors">
                            {opp.title}
                          </h3>
                          {opp.status === 'pending_approval' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              Pending Admin Review
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5 flex-wrap">
                          <span className="font-semibold text-slate-800">{opp.companyName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3 h-3 text-[#4B8F8C]" /> {opp.location}
                          </span>
                          <span>•</span>
                          <span className="text-[#2B193D] font-bold">{opp.stipendSalary}</span>
                        </div>
                      </div>
                    </div>

                    {/* Smart Match Score Badge */}
                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#4B8F8C]/15 to-[#2C365E]/15 border border-[#4B8F8C]/30 text-xs font-bold text-[#2B193D]">
                        <Sparkles className="w-3.5 h-3.5 text-[#4B8F8C]" />
                        <span>{match}% Match</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Based on your BSc IT profile
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1.5">
                      {opp.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOpportunity(opp)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => setApplicationOpportunity(opp)}
                        disabled={opp.applied}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
                          opp.applied
                            ? 'bg-[#4B8F8C]/20 text-[#4B8F8C] cursor-default'
                            : 'bg-[#4B8F8C] hover:bg-[#3d7573] text-white'
                        }`}
                      >
                        {opp.applied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Applied</span>
                          </>
                        ) : (
                          <span>Express Interest / Apply</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Events Listing */
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C5979D]/20 text-[#2B193D] font-bold text-[10px] uppercase">
                    {event.type.replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-[#2B193D]">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {event.description}
                  </p>
                </div>

                <button
                  onClick={() => onRsvpEvent(event.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                    event.hasRsvp
                      ? 'bg-[#4B8F8C]/20 text-[#4B8F8C]'
                      : 'bg-[#2B193D] hover:bg-[#2C365E] text-white shadow-xs'
                  }`}
                >
                  {event.hasRsvp ? 'RSVP Confirmed' : 'RSVP Free'}
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-[#4B8F8C]" /> {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {event.location}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {event.rsvpCount} students attending
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Opportunity Details Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedOpportunity.companyLogo}
                  alt={selectedOpportunity.companyName}
                  className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h2 className="font-bold text-base text-[#2B193D]">
                    {selectedOpportunity.title}
                  </h2>
                  <p className="text-xs text-slate-600">
                    {selectedOpportunity.companyName} • {selectedOpportunity.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#4B8F8C]/10 rounded-2xl border border-[#4B8F8C]/20 flex items-center justify-between text-xs">
              <span className="font-semibold text-[#2B193D]">Estimated Stipend / Compensation</span>
              <span className="font-extrabold text-[#4B8F8C]">{selectedOpportunity.stipendSalary}</span>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                Role Description
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedOpportunity.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                Key Responsibilities
              </h4>
              <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1">
                {selectedOpportunity.responsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                Required Richfield Qualifications
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedOpportunity.requiredProgramme.map((prog) => (
                  <span
                    key={prog}
                    className="px-2.5 py-1 rounded-lg bg-[#2C365E]/10 text-[#2C365E] font-semibold text-xs"
                  >
                    {prog}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Closes: {selectedOpportunity.closingDate}
              </span>
              <button
                onClick={() => {
                  setApplicationOpportunity(selectedOpportunity);
                  setSelectedOpportunity(null);
                }}
                disabled={selectedOpportunity.applied}
                className="px-4 py-2 rounded-xl bg-[#4B8F8C] hover:bg-[#3d7573] text-white font-bold text-xs shadow-xs"
              >
                {selectedOpportunity.applied ? 'Application Submitted' : 'Complete Student Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Application Form Modal */}
      {applicationOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleApplicationSubmit}
            className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#2B193D]">Apply for {applicationOpportunity.title}</h3>
                <p className="text-[11px] text-slate-500">{applicationOpportunity.companyName}</p>
              </div>
              <button
                type="button"
                onClick={() => setApplicationOpportunity(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full name</label>
                <input
                  type="text"
                  value={applicationForm.name}
                  onChange={(e) => setApplicationForm({ ...applicationForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={applicationForm.email}
                  onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone number</label>
                <input
                  type="tel"
                  value={applicationForm.phone}
                  onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })}
                  placeholder="e.g. 071 234 5678"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Availability / notice period</label>
                <input
                  type="text"
                  value={applicationForm.availability}
                  onChange={(e) => setApplicationForm({ ...applicationForm, availability: e.target.value })}
                  placeholder="e.g. Available from 1 November 2026"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motivation / interest</label>
                <textarea
                  rows={5}
                  value={applicationForm.motivation}
                  onChange={(e) => setApplicationForm({ ...applicationForm, motivation: e.target.value })}
                  placeholder="Tell the employer why you are interested in this role and how your Richfield qualification supports your fit."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApplicationOpportunity(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#2B193D] hover:bg-[#2C365E] text-white text-xs font-bold shadow-xs"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recruiter / Admin Post Job Modal */}
      {isPostingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateOpportunity}
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-[#2B193D]">Post Opportunity for Richfield Talent</h3>
              <button
                type="button"
                onClick={() => setIsPostingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opportunity Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Junior Cloud Engineer Intern"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                >
                  <option value="graduate_vacancy">Graduate Programme</option>
                  <option value="internship">Internship</option>
                  <option value="learnership">Learnership (12m)</option>
                  <option value="part_time">Part-Time Student Role</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Stipend</label>
                <input
                  type="text"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  placeholder="R18,000 / month"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (comma separated)</label>
              <input
                type="text"
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                placeholder="React, TypeScript, SQL, Git"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brief Description</label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Details on what the candidate will learn and accomplish..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
            </div>

            {currentUser.role === 'business' && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                Notice: Opportunities posted by business users require Administrator approval before going live to all students.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPostingModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#2B193D] hover:bg-[#2C365E] text-white font-bold text-xs"
              >
                Submit Opportunity
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
