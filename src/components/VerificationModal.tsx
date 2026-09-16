import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, Mail, GraduationCap, Building2, ArrowRight, Lock, Loader2 } from 'lucide-react';
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

  React.useEffect(() => { setSelectedRole(initialRole); }, [initialRole, isOpen]);
  if (!isOpen) return null;

  const buildProfile = (id: string): UserProfile => {
    const student = selectedRole === 'student';
    const alumni = selectedRole === 'alumni';
    const business = selectedRole === 'business';

    return {
      id,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role: selectedRole,
      verificationStatus: business ? 'pending' : 'verified',
      verificationId: student
        ? `RF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
        : alumni ? (alumniId.trim() || undefined) : undefined,
      avatar: '',
      headline: student
        ? `${programme} Scholar | ${campus}`
        : alumni
          ? `${currentCompany ? `${currentCompany} | ` : ''}Richfield Alumnus (${graduationYear})`
          : `Talent Partner @ ${orgName}`,
      summary: student
        ? `Richfield student pursuing ${programme} at ${campus}.`
        : alumni
          ? `Richfield College graduate (${graduationYear}) in ${programme}.`
          : `Recruitment and talent acquisition representative at ${orgName}.`,
      programme: business ? undefined : programme,
      campus: business ? 'Corporate Partner' : campus,
      enrolmentYear: student ? new Date().getFullYear() - 1 : alumni ? Number(graduationYear) - 3 : undefined,
      graduationYear: business ? undefined : Number(graduationYear),
      currentCompany: alumni ? currentCompany : undefined,
      technicalSkills: business ? ['Talent Sourcing', 'Graduate Recruitment'] : [],
      professionalSkills: business ? ['Employer Branding', 'Technical Assessment'] : [],
      endorsements: [],
      workExperience: [],
      portfolioLinks: business ? { website: orgWebsite || undefined } : {},
      digitalBadges: [],
      achievements: [],
      clubsSocieties: [],
      careerInterests: [],
      careerAspirations: '',
      profileCompleteness: business ? 70 : 50,
      businessDetails: business ? {
        organizationName: orgName,
        industry: 'Information Technology & Services',
        companyDescription: `${orgName} is a Richfield industry partner.`,
        location: 'South Africa',
        website: orgWebsite,
        contactEmail: email.trim().toLowerCase(),
        contactPhone: '',
        registrationNumber: cipcNumber || 'Pending verification',
        approvalStatus: 'pending',
        talentRequirements: [programme],
      } : undefined,
    };
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() || !cleanEmail) return setErrorMessage('Please enter your full name and email.');
    if (selectedRole === 'student' && !cleanEmail.endsWith('@my.richfield.ac.za') && !cleanEmail.endsWith('@richfield.ac.za')) {
      return setErrorMessage('Students must use a Richfield email address.');
    }
    if (selectedRole === 'business' && !orgName.trim()) return setErrorMessage('Please enter the company name.');
    if (password.length < 6) return setErrorMessage('Password must contain at least 6 characters.');
    if (password !== confirmPassword) return setErrorMessage('Passwords do not match.');

    setIsLoading(true);
    try {
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
            business_details: selectedRole === 'business' ? {
              organizationName: orgName,
              industry: 'Information Technology & Services',
              companyDescription: `${orgName} is a Richfield industry partner.`,
              location: 'South Africa',
              website: orgWebsite,
              contactEmail: cleanEmail,
              contactPhone: '',
              registrationNumber: cipcNumber || 'Pending verification',
              approvalStatus: 'pending',
              talentRequirements: [programme],
            } : null,
          },
        },
      });

      if (error || !data.user) return setErrorMessage(error?.message || 'Unable to create the account.');
      const profile = buildProfile(data.user.id);
      if (data.session) {
        const saved = await saveProfile(profile);
        setCreatedUser(saved);
      } else {
        setRequiresEmailConfirmation(true);
        setCreatedUser(profile);
      }
    } catch (error: any) {
      setErrorMessage(error?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#2B193D] via-[#2C365E] to-[#484D6D] p-5 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4"><X className="w-4 h-4" /></button>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4B8F8C]"><ShieldCheck className="w-5 h-5" /></div>
            <div><h2 className="text-lg font-bold">Create Enrich Account</h2><p className="text-xs text-[#C5979D]">Supabase-secured registration</p></div>
          </div>
        </div>

        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {!createdUser ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'student', label: 'Student', icon: GraduationCap },
                  { role: 'alumni', label: 'Alumni', icon: CheckCircle2 },
                  { role: 'business', label: 'Recruiter', icon: Building2 },
                ].map((item) => {
                  const Icon = item.icon;
                  return <button type="button" key={item.role} onClick={() => setSelectedRole(item.role as UserRole)} className={`p-3 rounded-xl border text-left ${selectedRole === item.role ? 'border-[#4B8F8C] bg-[#4B8F8C]/10' : 'border-slate-200'}`}><Icon className="w-5 h-5 mb-1" /><div className="text-xs font-bold">{item.label}</div></button>;
                })}
              </div>

              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300" />
              <div className="relative"><Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300" /></div>

              {selectedRole !== 'business' && <div className="grid grid-cols-2 gap-2"><select value={campus} onChange={(e) => setCampus(e.target.value)} className="px-3 py-2.5 text-xs rounded-xl border border-slate-300">{RICHFIELD_CAMPUSES.map((c) => <option key={c}>{c}</option>)}</select><select value={programme} onChange={(e) => setProgramme(e.target.value)} className="px-3 py-2.5 text-xs rounded-xl border border-slate-300">{RICHFIELD_PROGRAMMES.map((p) => <option key={p}>{p}</option>)}</select></div>}

              {selectedRole === 'alumni' && <div className="grid grid-cols-2 gap-2"><input value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="Graduation year" className="px-3 py-2.5 text-xs rounded-xl border border-slate-300" /><input value={alumniId} onChange={(e) => setAlumniId(e.target.value)} placeholder="Student/Alumni ID" className="px-3 py-2.5 text-xs rounded-xl border border-slate-300" /><input value={currentCompany} onChange={(e) => setCurrentCompany(e.target.value)} placeholder="Current company" className="col-span-2 px-3 py-2.5 text-xs rounded-xl border border-slate-300" /></div>}

              {selectedRole === 'business' && <div className="space-y-2"><input required value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Company name" className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300" /><input value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} placeholder="Company website" className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300" /><input value={cipcNumber} onChange={(e) => setCipcNumber(e.target.value)} placeholder="CIPC / registration number" className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300" /></div>}

              <div className="grid grid-cols-2 gap-2"><div className="relative"><Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" /><input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300" /></div><input required type="password" minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="px-3 py-2.5 text-xs rounded-xl border border-slate-300" /></div>

              {errorMessage && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{errorMessage}</div>}

              <button disabled={isLoading} className="w-full py-2.5 rounded-xl bg-[#1E3A8A] text-white font-bold text-xs flex justify-center gap-2">{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}{isLoading ? 'Creating...' : 'Create Account'}</button>

              {onSwitchToLogin && <button type="button" onClick={() => { onClose(); onSwitchToLogin(); }} className="w-full text-xs font-bold text-[#1E3A8A]">Already registered? Sign in</button>}
            </form>
          ) : (
            <div className="text-center py-5 space-y-4"><CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" /><h3 className="font-bold text-lg">{requiresEmailConfirmation ? 'Confirm Your Email' : 'Account Created'}</h3><p className="text-xs text-slate-600">{requiresEmailConfirmation ? `Confirm ${createdUser.email}, then sign in.` : 'Your profile is stored in Supabase.'}</p><button onClick={() => { if (requiresEmailConfirmation) { onClose(); onSwitchToLogin?.(); } else { onRegisterSuccess(createdUser); onClose(); } }} className="w-full py-2.5 rounded-xl bg-[#2B193D] text-white font-bold text-xs">{requiresEmailConfirmation ? 'Go to Sign In' : 'Launch Enrich'}</button></div>
          )}
        </div>
      </div>
    </div>
  );
};
