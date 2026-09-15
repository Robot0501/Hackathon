import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Mail,
  GraduationCap,
  Building2,
  ArrowRight,
  Lock,
  Loader2
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { RICHFIELD_CAMPUSES, RICHFIELD_PROGRAMMES } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { saveProfile } from '../lib/profile';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (newUser: UserProfile) => void;
  initialRole?: UserRole;
  onSwitchToLogin?: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  initialRole = 'student',
  onSwitchToLogin,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [campus, setCampus] = useState(RICHFIELD_CAMPUSES[0]);
  const [programme, setProgramme] = useState(RICHFIELD_PROGRAMMES[0]);
  const [graduationYear, setGraduationYear] = useState('2026');
  const [orgName, setOrgName] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [cipcNumber, setCipcNumber] = useState('');
  const [alumniId, setAlumniId] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [createdUser, setCreatedUser] = useState<UserProfile | null>(null);
  const [requiresEmailConfirmation, setRequiresEmailConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    setSelectedRole(initialRole);
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setCampus(RICHFIELD_CAMPUSES[0]);
    setProgramme(RICHFIELD_PROGRAMMES[0]);
    setGraduationYear('2026');
    setOrgName('');
    setOrgWebsite('');
    setCipcNumber('');
    setAlumniId('');
    setCurrentCompany('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setCreatedUser(null);
    setRequiresEmailConfirmation(false);
    setIsLoading(false);
  };

  const buildProfile = (id: string): UserProfile => {
    const isStudent = selectedRole === 'student';
    const isAlumni = selectedRole === 'alumni';
    const isBusiness = selectedRole === 'business';

    return {
      id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: selectedRole,
      verificationStatus: isBusiness ? 'pending' : 'verified',
      verificationId: isStudent
        ? `RF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
        : isAlumni
          ? (alumniId.trim() || `RF-ALUM-${Math.floor(1000 + Math.random() * 9000)}`)
          : undefined,
      avatar: isStudent
        ? 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=300&h=300&fit=crop&crop=face'
        : isAlumni
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face'
          : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face',
      headline: isStudent
        ? `${programme} Scholar | ${campus}`
        : isAlumni
          ? `${currentCompany ? currentCompany + ' | ' : ''}Richfield Alumnus (${graduationYear})`
          : `Talent Partner @ ${orgName}`,
      summary: isStudent
        ? `Richfield student pursuing ${programme} at ${campus}.`
        : isAlumni
          ? `Richfield College graduate (${graduationYear}) in ${programme}.`
          : `Recruitment and talent acquisition representative at ${orgName}.`,
      programme: isBusiness ? undefined : programme,
      campus: isBusiness ? 'Corporate Partner' : campus,
      enrolmentYear: isStudent
        ? new Date().getFullYear() - 1
        : isAlumni
          ? Number(graduationYear) - 3
          : undefined,
      graduationYear: isBusiness ? undefined : Number(graduationYear),
      currentCompany: isAlumni ? currentCompany : undefined,
      technicalSkills: isBusiness
        ? ['Talent Sourcing', 'Graduate Recruitment']
        : ['Programming Logic', 'Problem Solving', 'Data Structures'],
      professionalSkills: isBusiness
        ? ['Employer Branding', 'Technical Assessment']
        : ['Communication', 'Teamwork'],
      endorsements: [],
      workExperience: [],
      portfolioLinks: isBusiness
        ? { website: orgWebsite || undefined }
        : { linkedin: `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '-')}` },
      digitalBadges: isBusiness
        ? []
        : [{
            id: `badge-init-${Date.now()}`,
            title: 'Institutional Verified Scholar',
            issuer: 'Richfield College Registry',
            issueDate: 'Today',
            category: 'Identity',
          }],
      achievements: [],
      clubsSocieties: isBusiness ? [] : ['Richfield Career Network'],
      careerInterests: isBusiness ? [] : ['Information Technology', 'Software Development'],
      careerAspirations: isBusiness ? '' : 'To excel in high-impact industry roles.',
      profileCompleteness: isBusiness ? 70 : 65,
      businessDetails: isBusiness
        ? {
            organizationName: orgName,
            industry: 'Information Technology & Services',
            companyDescription: `${orgName} is an industry partner collaborating with Richfield College to recruit graduate talent.`,
            location: 'South Africa',
            website: orgWebsite,
            contactEmail: email.trim().toLowerCase(),
            contactPhone: '',
            registrationNumber: cipcNumber || 'Pending CIPC verification',
            approvalStatus: 'pending',
            talentRequirements: [programme],
          }
        : undefined,
    };
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() || !cleanEmail) {
      setErrorMessage('Please enter your full name and email address.');
      return;
    }

    if (selectedRole === 'student' && !cleanEmail.endsWith('@my.richfield.ac.za') && !cleanEmail.endsWith('@richfield.ac.za')) {
      setErrorMessage('Students must use a Richfield email ending in @my.richfield.ac.za.');
      return;
    }

    if (selectedRole === 'business' && !orgName.trim()) {
      setErrorMessage('Please provide your organization name.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('The two passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const metaBusinessDetails =
        selectedRole === 'business'
          ? {
              organizationName: orgName,
              industry: 'Information Technology & Services',
              companyDescription: `${orgName} is an industry partner collaborating with Richfield College.`,
              location: 'South Africa',
              website: orgWebsite,
              contactEmail: cleanEmail,
              contactPhone: '',
              registrationNumber: cipcNumber || 'Pending CIPC verification',
              approvalStatus: 'pending',
              talentRequirements: [programme],
            }
          : null;

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: name.trim(),
            role: selectedRole,
            verification_status: selectedRole === 'business' ? 'pending' : 'verified',
            verification_id: selectedRole === 'alumni' ? alumniId.trim() : '',
            programme: selectedRole === 'business' ? '' : programme,
            campus: selectedRole === 'business' ? 'Corporate Partner' : campus,
            graduation_year: selectedRole === 'business' ? '' : graduationYear,
            current_company: selectedRole === 'alumni' ? currentCompany : '',
            business_details: metaBusinessDetails,
          },
        },
      });

      if (error || !data.user) {
        setErrorMessage(error?.message || 'Unable to create the account.');
        return;
      }

      const newUser = buildProfile(data.user.id);

      if (data.session) {
        const saved = await saveProfile(newUser);
        setCreatedUser(saved);
        setRequiresEmailConfirmation(false);
      } else {
        // The SQL trigger already created a starter profile. The user must confirm
        // their email before a session exists and the full profile can be updated.
        setCreatedUser(newUser);
        setRequiresEmailConfirmation(true);
      }
    } catch (error: any) {
      console.error('Supabase registration failed:', error);
      setErrorMessage(error?.message || 'Unable to register right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const finishRegistration = () => {
    if (!createdUser) return;

    if (requiresEmailConfirmation) {
      onClose();
      if (onSwitchToLogin) onSwitchToLogin();
      return;
    }

    onRegisterSuccess(createdUser);
    onClose();
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#2B193D] via-[#2C365E] to-[#484D6D] p-5 text-white relative">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4B8F8C] text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Create Your Enrich Account</h2>
              <p className="text-xs text-[#C5979D]">Secure registration powered by Supabase</p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          {!createdUser ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select User Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { role: 'student', label: 'Student', icon: GraduationCap },
                    { role: 'alumni', label: 'Alumni', icon: CheckCircle2 },
                    { role: 'business', label: 'Recruiter', icon: Building2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    const selected = selectedRole === item.role;
                    return (
                      <button
                        type="button"
                        key={item.role}
                        onClick={() => setSelectedRole(item.role as UserRole)}
                        className={`p-3 rounded-2xl border text-left ${
                          selected
                            ? 'border-[#4B8F8C] bg-[#4B8F8C]/10 ring-2 ring-[#4B8F8C]/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1.5 ${selected ? 'text-[#4B8F8C]' : 'text-slate-500'}`} />
                        <div className="font-bold text-xs">{item.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {selectedRole === 'student' ? 'Institutional Richfield Email' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'student' ? 'student@my.richfield.ac.za' : 'you@example.com'}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                  />
                </div>
              </div>

              {selectedRole !== 'business' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Campus</label>
                    <select
                      value={campus}
                      onChange={(e) => setCampus(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300"
                    >
                      {RICHFIELD_CAMPUSES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Programme</label>
                    <select
                      value={programme}
                      onChange={(e) => setProgramme(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300"
                    >
                      {RICHFIELD_PROGRAMMES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {selectedRole === 'alumni' && (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year</label>
                      <input
                        type="number"
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Current Company</label>
                      <input
                        type="text"
                        value={currentCompany}
                        onChange={(e) => setCurrentCompany(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Student / Alumni ID</label>
                    <input
                      type="text"
                      value={alumniId}
                      onChange={(e) => setAlumniId(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300"
                    />
                  </div>
                </>
              )}

              {selectedRole === 'business' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Company Name</label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Company Website</label>
                      <input
                        type="url"
                        value={orgWebsite}
                        onChange={(e) => setOrgWebsite(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">CIPC / Reg No.</label>
                      <input
                        type="text"
                        value={cipcNumber}
                        onChange={(e) => setCipcNumber(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {selectedRole === 'business' && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                  Business accounts are created with <strong>pending</strong> verification status until an administrator approves them.
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{isLoading ? 'Creating Account...' : 'Create Secure Account'}</span>
              </button>

              {onSwitchToLogin && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Already registered?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwitchToLogin();
                    }}
                    className="font-bold text-[#1E3A8A] hover:underline"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </form>
          ) : (
            <div className="text-center py-5 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#2B193D]">
                  {requiresEmailConfirmation ? 'Account Created — Confirm Your Email' : 'Account Created Successfully'}
                </h3>
                <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto">
                  {requiresEmailConfirmation
                    ? `Supabase has created ${createdUser.email}. Confirm the email first, then return and sign in.`
                    : `Welcome, ${createdUser.name}. Your Enrich profile is now stored in Supabase.`}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Account:</span>
                  <span className="font-semibold capitalize">{createdUser.role}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-mono font-semibold truncate">{createdUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-semibold capitalize">{createdUser.verificationStatus}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={finishRegistration}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2B193D] hover:bg-[#2C365E] text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>{requiresEmailConfirmation ? 'Go to Sign In' : 'Launch Enrich Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
