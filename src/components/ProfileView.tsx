import React, { useState } from 'react';
import {
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  FileText,
  UploadCloud,
  ThumbsUp,
  Download,
  Building2,
  ExternalLink,
  Edit3,
  BarChart3
} from 'lucide-react';
import { UserProfile, Endorsement, AcademicAchievement } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  currentUser: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onAddEndorsement: (targetUserId: string, skill: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  currentUser,
  onUpdateProfile,
  onAddEndorsement,
}) => {
  const isOwner = user.id === currentUser.id;
  const isBusinessProfile = user.role === 'business';
  const [isEditing, setIsEditing] = useState(false);

  // Form edit states
  const [headline, setHeadline] = useState(user.headline || '');
  const [summary, setSummary] = useState(user.summary || '');
  const [newTechSkill, setNewTechSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [newBadgeTitle, setNewBadgeTitle] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [newPortfolioLink, setNewPortfolioLink] = useState('');
  const [newCareerInterest, setNewCareerInterest] = useState('');

  // Save profile edits
  const handleSaveProfile = () => {
    onUpdateProfile({
      headline,
      summary,
    });
    setIsEditing(false);
  };

  const handleAddTechnicalSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechSkill.trim()) return;
    if (user.technicalSkills.includes(newTechSkill.trim())) return;
    onUpdateProfile({
      technicalSkills: [...user.technicalSkills, newTechSkill.trim()]
    });
    setNewTechSkill('');
  };

  const handleRemoveTechnicalSkill = (skill: string) => {
    onUpdateProfile({
      technicalSkills: user.technicalSkills.filter((s) => s !== skill)
    });
  };

  const handleAddProfessionalSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSoftSkill.trim()) return;
    if (user.professionalSkills.includes(newSoftSkill.trim())) return;
    onUpdateProfile({
      professionalSkills: [...user.professionalSkills, newSoftSkill.trim()]
    });
    setNewSoftSkill('');
  };

  const handleAddBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadgeTitle.trim()) return;
    const newBadge = {
      id: `badge-${Date.now()}`,
      title: newBadgeTitle.trim(),
      issuer: 'Richfield Academic Senate',
      issueDate: '2026',
      category: 'Specialization'
    };
    onUpdateProfile({
      digitalBadges: [...user.digitalBadges, newBadge]
    });
    setNewBadgeTitle('');
  };

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchievement.trim()) return;
    const newAch: AcademicAchievement = {
      id: `ach-${Date.now()}`,
      title: newAchievement.trim(),
      category: 'academic',
      year: '2026',
      description: 'Campus recognition & academic achievement.'
    };
    onUpdateProfile({
      achievements: [...user.achievements, newAch]
    });
    setNewAchievement('');
  };

  // Mock CV Download / Preview
  const handleSimulateCvDownload = () => {
    const cvContent = `RICHFIELD COLLEGE - VERIFIED STUDENT DOSSIER
Name: ${user.name}
Role: ${user.role.toUpperCase()}
Institutional Email: ${user.email}
Campus: ${user.campus || 'Braamfontein'}
Programme: ${user.programme || 'BSc Information Technology'}
Headline: ${user.headline}

SUMMARY:
${user.summary}

TECHNICAL SKILLS:
${user.technicalSkills.join(', ')}

PROFESSIONAL SKILLS:
${user.professionalSkills.join(', ')}

VERIFIED BY RICHFIELD COLLEGE REGISTRY`;

    const blob = new Blob([cvContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user.name.replace(/\s+/g, '_')}_Richfield_CV.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Cover Canvas using user uploaded palette */}
        <div className="h-32 bg-gradient-to-r from-[#2B193D] via-[#2C365E] to-[#484D6D] relative p-4 flex items-end justify-end">
          {isOwner && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
            </button>
          )}
        </div>

        {/* Profile Details Bar */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-3.5">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-white shadow-md"
              />
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-bold text-lg sm:text-xl text-[#2B193D]">
                    {user.name}
                  </h1>
                  {user.verificationStatus === 'verified' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#4B8F8C]/15 text-[#4B8F8C] font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Institutional Verified
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {user.role.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleSimulateCvDownload}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#4B8F8C]" />
                <span>Export CV</span>
              </button>
            </div>
          </div>

          {/* Edit Form or Display */}
          {isEditing ? (
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">About / Summary</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-4 py-1.5 rounded-xl bg-[#2B193D] text-white text-xs font-bold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                {user.headline}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#4B8F8C]" />
                  {user.programme || 'Richfield Faculty of IT'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#4B8F8C]" />
                  {user.campus || 'Campus Braamfontein'}
                </span>
                <span>•</span>
                <span>Class of {user.graduationYear || '2026'}</span>
              </div>
              {user.summary && (
                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                  {user.summary}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {isBusinessProfile ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#2B193D]" />
              <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">
                Business Credentials
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 text-xs text-slate-700">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-1">Organisation</div>
                  <div className="font-bold text-sm text-[#2B193D]">{user.businessDetails?.organizationName || 'Business Profile'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-1">Industry</div>
                  <div>{user.businessDetails?.industry || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-1">Location</div>
                  <div>{user.businessDetails?.location || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-1">Registration Number</div>
                  <div>{user.businessDetails?.registrationNumber || 'Not provided'}</div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-1">Corporate Website</div>
                  <a href={user.businessDetails?.website || '#'} target="_blank" rel="noreferrer" className="text-[#2B193D] font-semibold hover:underline break-all">
                    {user.businessDetails?.website || 'Not provided'}
                  </a>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-1">Contact Email</div>
                  <div>{user.businessDetails?.contactEmail || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-1">Contact Phone</div>
                  <div>{user.businessDetails?.contactPhone || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-1">Status</div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 text-[10px] font-bold uppercase">
                    {user.businessDetails?.approvalStatus || 'Approved'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-2">Company Overview</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {user.businessDetails?.companyDescription || user.summary || 'No company description provided.'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-2">Talent Requirements</div>
              <div className="flex flex-wrap gap-2">
                {(user.businessDetails?.talentRequirements?.length ? user.businessDetails.talentRequirements : ['Graduate talent pipeline', 'Technical assessment support']).map((item) => (
                  <span key={item} className="px-2.5 py-1 rounded-full bg-[#2C365E]/10 text-[#2C365E] text-[10px] font-semibold">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#4B8F8C]" />
              <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">
                Placement Analytics
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Active Opportunities', value: '4 Listings' },
                { label: 'Total Candidate Pool', value: '1,842 Students' },
                { label: 'Applications Received', value: '124 Total' },
                { label: 'Shortlist Rate', value: '38% Qualified' },
              ].map((stat, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-1">{stat.label}</div>
                  <div className="text-lg font-bold text-[#2B193D]">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Column: Skills & Endorsements */}
          <div className="md:col-span-2 space-y-4">
            {/* Technical Skills Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">
                  Technical Skills & Endorsements
                </h3>
                <span className="text-[11px] text-slate-400">
                  {user.technicalSkills.length} Verified Skills
                </span>
              </div>

            <div className="flex flex-wrap gap-2">
              {user.technicalSkills.map((skill) => {
                const endorsementObj = user.endorsements.find((e) => e.skill.toLowerCase() === skill.toLowerCase());
                const count = endorsementObj ? endorsementObj.count : 0;
                return (
                  <div
                    key={skill}
                    className="group px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs flex items-center gap-2"
                  >
                    <span className="font-semibold text-slate-800">{skill}</span>
                    {count > 0 && (
                      <span className="px-1.5 py-0.2 rounded-md bg-[#4B8F8C]/15 text-[#4B8F8C] font-bold text-[10px]">
                        +{count}
                      </span>
                    )}
                    {!isOwner && (
                      <button
                        onClick={() => onAddEndorsement(user.id, skill)}
                        className="text-slate-400 hover:text-[#4B8F8C] transition-colors"
                        title="Endorse this skill"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveTechnicalSkill(skill)}
                        className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {isOwner && (
              <form onSubmit={handleAddTechnicalSkill} className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  value={newTechSkill}
                  onChange={(e) => setNewTechSkill(e.target.value)}
                  placeholder="Add skill (e.g. AWS Lambda, Docker, PostgreSQL)..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-[#4B8F8C] hover:bg-[#3d7573] text-white font-bold text-xs shadow-xs"
                >
                  Add Skill
                </button>
              </form>
            )}
          </div>

          {/* Professional / Soft Skills */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">
              Professional & Interpersonal Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.professionalSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-[#2C365E]/10 text-[#2C365E] font-semibold text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>

            {isOwner && (
              <form onSubmit={handleAddProfessionalSkill} className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  value={newSoftSkill}
                  onChange={(e) => setNewSoftSkill(e.target.value)}
                  placeholder="Add competency (e.g. Agile Leadership, Client Demos)..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-[#2B193D] hover:bg-[#2C365E] text-white font-bold text-xs shadow-xs"
                >
                  Add
                </button>
              </form>
            )}
          </div>

          {/* Academic Achievements & Societies */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">
              Academic Distinctions & Campus Societies
            </h3>
            <div className="space-y-2">
              {user.achievements.map((ach, i) => {
                const title = typeof ach === 'string' ? ach : ach.title;
                const desc = typeof ach === 'object' ? ach.description : '';
                return (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-xs text-slate-700"
                  >
                    <Award className="w-4 h-4 text-[#4B8F8C] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">{title}</span>
                      {desc && <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {isOwner && (
              <form onSubmit={handleAddAchievement} className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  placeholder="Add distinction (e.g. Dean's Merit List 2025)..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-[#2B193D] text-white font-bold text-xs"
                >
                  Add
                </button>
              </form>
            )}
          </div>
        </div>

          {/* Right Column: Digital Badges & Portfolios */}
          <div className="space-y-4">
            {/* Digital Credly / Senate Badges */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#4B8F8C]" />
                <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">
                  Verified Digital Badges
                </h3>
              </div>

              <div className="space-y-2">
                {user.digitalBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 rounded-xl bg-[#4B8F8C]/10 border border-[#4B8F8C]/25 space-y-1"
                  >
                    <div className="font-bold text-xs text-[#2B193D]">{badge.title}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{badge.issuer}</span>
                      <span className="font-mono text-[#4B8F8C] font-semibold">{badge.issueDate}</span>
                    </div>
                  </div>
                ))}
              </div>

              {isOwner && (
                <form onSubmit={handleAddBadge} className="space-y-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={newBadgeTitle}
                    onChange={(e) => setNewBadgeTitle(e.target.value)}
                    placeholder="Add badge (e.g. AWS Certified Cloud Practitioner)"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-xl bg-[#4B8F8C] hover:bg-[#3d7573] text-white font-bold text-xs"
                  >
                    Claim Digital Badge
                  </button>
                </form>
              )}
            </div>

            {/* Portfolio Links */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-xs sm:text-sm text-[#2B193D]">
                Verified Portfolio & Repositories
              </h3>
              <div className="space-y-2 text-xs">
                {user.portfolioLinks.github && (
                  <a
                    href={user.portfolioLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-center justify-between text-slate-700 transition-colors"
                  >
                    <span className="font-semibold">GitHub Code Projects</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
                {user.portfolioLinks.linkedin && (
                  <a
                    href={user.portfolioLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-center justify-between text-slate-700 transition-colors"
                  >
                    <span className="font-semibold">LinkedIn Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
                {user.portfolioLinks.website && (
                  <a
                    href={user.portfolioLinks.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-center justify-between text-slate-700 transition-colors"
                  >
                    <span className="font-semibold">Live Project Showcase</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
