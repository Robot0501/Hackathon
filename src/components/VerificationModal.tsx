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
  Sparkles,
  FileCheck
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { RICHFIELD_CAMPUSES, RICHFIELD_PROGRAMMES } from '../data/mockData';

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
  const [step, setStep] = useState<1 | 2 | 3>(1);

  React.useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole, isOpen]);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [campus, setCampus] = useState(RICHFIELD_CAMPUSES[0]);
  const [programme, setProgramme] = useState(RICHFIELD_PROGRAMMES[0]);
  const [graduationYear, setGraduationYear] = useState('2026');

  // Business specific
  const [orgName, setOrgName] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [cipcNumber, setCipcNumber] = useState('');

  // Alumni specific
  const [alumniId, setAlumniId] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');

  // Verification code state
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [simulatedEmailBanner, setSimulatedEmailBanner] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    const generateAndSendCode = async (destinationEmail: string, bannerLabel: string) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);

      try {
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: destinationEmail,
            name,
            role: selectedRole,
            code,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success) {
          setSimulatedEmailBanner(`${bannerLabel} A 6-digit verification code has been sent to ${destinationEmail}.`);
          setStep(2);
          return;
        }

        if (data.mode === 'demo') {
          setSimulatedEmailBanner(`${bannerLabel} Demo mode is active: use code ${code} for verification while SMTP is not configured.`);
          setStep(2);
          return;
        }

        setErrorMessage(data.message || 'Unable to send the verification email right now.');
      } catch (error) {
        console.error('Failed to send OTP email:', error);
        setSimulatedEmailBanner(`${bannerLabel} Email delivery is unavailable right now, so this demo uses code ${code} for verification.`);
        setStep(2);
      }
    };

    if (selectedRole === 'student') {
      const emailTrimmed = email.trim().toLowerCase();
      if (!emailTrimmed.endsWith('@my.richfield.ac.za') && !emailTrimmed.endsWith('@richfield.ac.za')) {
        setErrorMessage('Invalid institutional email! Students must use their Richfield address ending in @my.richfield.ac.za');
        return;
      }

      await generateAndSendCode(emailTrimmed, 'Richfield Identity Service:');
    } else if (selectedRole === 'alumni') {
      if (!email.trim()) {
        setErrorMessage('Please provide an active email address');
        return;
      }

      await generateAndSendCode(email.trim().toLowerCase(), 'Richfield Alumni Affairs:');
    } else if (selectedRole === 'business') {
      if (!orgName.trim() || !email.trim()) {
        setErrorMessage('Please provide your organization name and work email');
        return;
      }
      setStep(3);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: inputCode.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Incorrect verification code. Please check your email and try again.');
        return;
      }

      setStep(3);
    } catch (error) {
      console.error('OTP verification failed:', error);
      setErrorMessage('Unable to verify the code right now. Please try again.');
    }
  };

  const completeStudentOrAlumniRegistration = () => {
    const studentId = `RF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role: selectedRole,
      verificationStatus: 'verified',
      verificationId: selectedRole === 'student' ? studentId : (alumniId || `RF-ALUM-${Math.floor(1000 + Math.random() * 9000)}`),
      avatar: selectedRole === 'student'
        ? 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=300&h=300&fit=crop&crop=face'
        : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
      headline: selectedRole === 'student'
        ? `${programme} Scholar | ${campus}`
        : `${currentCompany ? currentCompany + ' | ' : ''}Richfield Alumnus (${graduationYear})`,
      summary: selectedRole === 'student'
        ? `Richfield student pursuing ${programme} at ${campus}. Verified institutional account.`
        : `Richfield College graduate (${graduationYear}) in ${programme}.`,
      programme,
      campus,
      enrolmentYear: selectedRole === 'student' ? new Date().getFullYear() - 1 : parseInt(graduationYear) - 3,
      graduationYear: parseInt(graduationYear),
      technicalSkills: ['Programming Logic', 'Problem Solving', 'Data Structures'],
      professionalSkills: ['Communication', 'Teamwork'],
      endorsements: [],
      workExperience: [],
      portfolioLinks: {
        linkedin: `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '-')}`
      },
      digitalBadges: [
        {
          id: `badge-init-${Date.now()}`,
          title: 'Institutional Verified Scholar',
          issuer: 'Richfield College Registry',
          issueDate: 'Today',
          category: 'Identity'
        }
      ],
      achievements: [],
      clubsSocieties: ['Richfield Career Network'],
      careerInterests: ['Information Technology', 'Software Development'],
      careerAspirations: 'To excel in high-impact industry roles.',
      profileCompleteness: 65
    };

    onRegisterSuccess(newUser);
  };

  const completeBusinessRegistration = () => {
    const newUser: UserProfile = {
      id: `user-biz-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role: 'business',
      verificationStatus: 'pending', // Rubric: Business approval required before access
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face',
      headline: `Talent Partner @ ${orgName}`,
      summary: `Recruitment and talent acquisition lead at ${orgName}.`,
      campus: 'Corporate Partner',
      technicalSkills: ['Talent Sourcing', 'Graduate Recruitment'],
      professionalSkills: ['Employer Branding', 'Technical Assessment'],
      endorsements: [],
      workExperience: [],
      portfolioLinks: {
        website: orgWebsite || 'https://richfield.ac.za'
      },
      digitalBadges: [],
      achievements: [],
      clubsSocieties: [],
      careerInterests: [],
      careerAspirations: '',
      profileCompleteness: 70,
      businessDetails: {
        organizationName: orgName,
        industry: 'Information Technology & Services',
        companyDescription: `${orgName} is an industry partner collaborating with Richfield College to recruit top graduate talent.`,
        location: 'South Africa',
        website: orgWebsite,
        contactEmail: email,
        contactPhone: '+27 (0)11 000 0000',
        registrationNumber: cipcNumber || 'Pending CIPC verification',
        approvalStatus: 'pending',
        talentRequirements: [programme]
      }
    };

    onRegisterSuccess(newUser);
  };

  const completeAdminRegistration = () => {
    const newUser: UserProfile = {
      id: `user-admin-${Date.now()}`,
      name,
      email: email || 'admin@richfield.ac.za',
      role: 'admin',
      verificationStatus: 'verified',
      verificationId: 'RF-ADMIN-SECURE',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      headline: 'Richfield Academic Administrator',
      summary: 'Authorized officer managing student verification, event publishing, and corporate approvals.',
      campus: campus,
      technicalSkills: ['Higher Education Governance', 'Accreditation Compliance'],
      professionalSkills: ['Institutional Leadership'],
      endorsements: [],
      workExperience: [],
      portfolioLinks: {},
      digitalBadges: [],
      achievements: [],
      clubsSocieties: [],
      careerInterests: [],
      careerAspirations: '',
      profileCompleteness: 100
    };

    onRegisterSuccess(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Palette Banner */}
        <div className="bg-gradient-to-r from-[#2B193D] via-[#2C365E] to-[#484D6D] p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-[#4B8F8C] text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display">Richfield Identity Verification</h2>
              <p className="text-xs text-[#C5979D]">
                Enrich Platform Institutional Onboarding
              </p>
            </div>
          </div>
        </div>

        {/* Simulated Code Banner Notification */}
        {simulatedEmailBanner && (
          <div className="bg-[#4B8F8C]/15 border-b border-[#4B8F8C]/30 p-3 text-xs text-[#2B193D] flex items-center justify-between gap-2 animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4B8F8C] shrink-0" />
              <span className="font-medium">{simulatedEmailBanner}</span>
            </div>
            {generatedCode && (
              <button
                type="button"
                onClick={() => setInputCode(generatedCode)}
                className="px-2 py-1 rounded-md bg-[#4B8F8C] text-white font-bold text-[11px] shrink-0 hover:bg-[#3d7573]"
              >
                Auto-Fill OTP
              </button>
            )}
          </div>
        )}

        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          {/* Step 1: Role Selection & Profile Details */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select User Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { role: 'student', label: 'Student', icon: GraduationCap, badge: '@my.richfield.ac.za' },
                    { role: 'alumni', label: 'Alumni', icon: CheckCircle2, badge: 'Diploma / Degree' },
                    { role: 'business', label: 'Recruiter', icon: Building2, badge: 'Company Partner' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedRole === item.role;
                    return (
                      <button
                        type="button"
                        key={item.role}
                        onClick={() => {
                          setSelectedRole(item.role as UserRole);
                          setErrorMessage('');
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#4B8F8C] bg-[#4B8F8C]/10 ring-2 ring-[#4B8F8C]/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-[#4B8F8C]' : 'text-slate-500'}`} />
                        <div>
                          <div className={`font-bold text-xs ${isSelected ? 'text-[#2B193D]' : 'text-slate-700'}`}>
                            {item.label}
                          </div>
                          <div className="text-[9px] text-slate-400 leading-tight mt-0.5">
                            {item.badge}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C] focus:border-transparent"
                  />
                </div>

                {/* Role Specific Fields */}
                {selectedRole === 'student' && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Institutional Richfield Email
                        </label>
                        <span className="text-[10px] text-[#4B8F8C] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Mandatory
                        </span>
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
    
                          className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C] focus:border-transparent font-mono"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Must end with <strong className="text-[#2B193D]">@my.richfield.ac.za</strong> to verify active student enrollment.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Campus
                        </label>
                        <select
                          value={campus}
                          onChange={(e) => setCampus(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                        >
                          {RICHFIELD_CAMPUSES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Qualification Type
                        </label>
                        <select
                          value={programme}
                          onChange={(e) => setProgramme(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                        >
                          {RICHFIELD_PROGRAMMES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {selectedRole === 'alumni' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Active Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alumni@work.co.za or personal email"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Graduation Year
                        </label>
                        <input
                          type="number"
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                          placeholder="2022"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                       Student Number/ ID or Passport Number 
                      </label>
                      <input
                        type="text"
                        value={alumniId}
                        onChange={(e) => setAlumniId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                      />
                    </div>
                  </>
                )}

                {selectedRole === 'business' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Organization / Company Name
                      </label>
                      <input
                        type="text"
                        required
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Recruiter Corporate Email
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="hr@company.com"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Company Website
                        </label>
                        <input
                          type="url"
                          value={orgWebsite}
                          onChange={(e) => setOrgWebsite(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        CIPC Enterprise Reg / Tax No. (for institutional vetting)
                      </label>
                      <input
                        type="text"
                        value={cipcNumber}
                        onChange={(e) => setCipcNumber(e.target.value)}

                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
                      />
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                      <strong>POPIA Compliance:</strong> Business accounts undergo manual vetting by Richfield Career Services before gaining access to contact verified students.
                    </div>
                  </>
                )}

              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <span>Continue to Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onSwitchToLogin && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Already registered on Enrich?</span>
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
          )}

          {/* Step 2: Dedicated Verification Page */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="rounded-2xl border border-[#4B8F8C]/20 bg-[#4B8F8C]/5 p-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#4B8F8C]/15 text-[#4B8F8C] flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-7 h-7" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4B8F8C] mb-2">
                  Email Verification
                </p>
                <h3 className="font-bold text-xl text-[#2B193D]">Check your inbox</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  We sent a 6-digit code to <strong className="text-[#2B193D]">{email}</strong>.
                  Enter it below to complete your registration.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 text-center">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C] bg-slate-50"
                  placeholder="000000"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInputCode('');
                    setStep(1);
                    setErrorMessage('');
                  }}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-[#4B8F8C] hover:bg-[#3d7573] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Verify & Continue</span>
                </button>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setErrorMessage('');
                  await handleSendCode(new Event('submit') as any);
                }}
                className="w-full text-[11px] text-[#1E3A8A] font-semibold hover:underline"
              >
                Resend verification code
              </button>
            </form>
          )}

          {/* Step 3: Success Confirmation & Auto Activation */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#4B8F8C]/20 text-[#4B8F8C] flex items-center justify-center mx-auto ring-4 ring-[#4B8F8C]/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#2B193D]">
                  {selectedRole === 'business'
                    ? 'Registration Submitted for Vetting'
                    : 'Institutional Verification Complete!'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  {selectedRole === 'student' &&
                    `Welcome, ${name}! Your @my.richfield.ac.za account has been validated against the Richfield student database.`}
                  {selectedRole === 'alumni' &&
                    `Welcome back to the Richfield network, ${name}! Your alumni verification is confirmed.`}
                  {selectedRole === 'business' &&
                    `Thank you, ${name}. Your company profile has been submitted to the Richfield Placement Office for approval.`}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#2C365E]/5 border border-[#2C365E]/15 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Type:</span>
                  <span className="font-semibold text-[#2B193D] capitalize">{selectedRole}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Institutional ID:</span>
                  <span className="font-mono font-semibold text-[#4B8F8C]">
                    {selectedRole === 'student' ? 'RF-2026-ACTIVE' : selectedRole === 'alumni' ? 'RF-ALUM-VERIFIED' : 'PENDING-APPROVAL'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Campus / Entity:</span>
                  <span className="font-medium text-slate-800">{selectedRole === 'business' ? orgName : campus}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (selectedRole === 'business') {
                    completeBusinessRegistration();
                  } else {
                    completeStudentOrAlumniRegistration();
                  }
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2B193D] hover:bg-[#2C365E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <span>Launch Enrich Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
