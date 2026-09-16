import { UserProfile, UserRole } from '../types';
import { supabase } from './supabase';

export type RegistrationRole = Exclude<UserRole, 'admin'>;

export interface RegistrationPayload {
  role: RegistrationRole;
  name: string;
  email: string;
  password: string;
  campus?: string;
  programme?: string;
  graduationYear?: number;
  currentCompany?: string;
  organizationName?: string;
  organizationWebsite?: string;
  registrationNumber?: string;
}

export const normalizeEmail = (value: string) => value.trim().toLowerCase();
export const isRichfieldLearnerEmail = (email: string) => normalizeEmail(email).endsWith('@my.richfield.ac.za');

function validatePassword(password: string) {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }
}

export async function sendRegistrationOtp(payload: RegistrationPayload) {
  const email = normalizeEmail(payload.email);
  validatePassword(payload.password);

  if ((payload.role === 'student' || payload.role === 'alumni') && !isRichfieldLearnerEmail(email)) {
    throw new Error('Students and alumni must use their @my.richfield.ac.za email address.');
  }

  const businessDetails = payload.role === 'business'
    ? {
        organizationName: payload.organizationName || '',
        industry: 'Information Technology & Services',
        companyDescription: `${payload.organizationName || 'This organisation'} is applying to join the Richfield Enrich employer network.`,
        location: 'South Africa',
        website: payload.organizationWebsite || '',
        contactEmail: email,
        contactPhone: '',
        registrationNumber: payload.registrationNumber || 'Pending verification',
        approvalStatus: 'pending',
        talentRequirements: [],
      }
    : null;

  // Registration uses Supabase email OTP first so the email is proven to belong to the user.
  // The password is NOT sent in metadata. It is attached only after OTP verification succeeds.
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: {
        role: payload.role,
        name: payload.name.trim(),
        campus: payload.campus || '',
        programme: payload.programme || '',
        graduation_year: payload.graduationYear ? String(payload.graduationYear) : '',
        current_company: payload.currentCompany || '',
        business_details: businessDetails,
      },
    },
  });

  if (error) throw error;
}

// Kept as a fallback for passwordless recovery/testing, but normal login now uses password.
export async function sendLoginOtp(emailValue: string) {
  const email = normalizeEmail(emailValue);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  if (error) throw error;
}

export async function signInWithPassword(emailValue: string, password: string) {
  const email = normalizeEmail(emailValue);
  if (!email) throw new Error('Enter your email address.');
  if (!password) throw new Error('Enter your password.');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Login succeeded but no user account was returned.');
  return data;
}

export async function verifyEmailOtp(emailValue: string, token: string) {
  const email = normalizeEmail(emailValue);
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: token.trim(),
    type: 'email',
  });
  if (error) throw error;
  if (!data.user) throw new Error('Verification succeeded but no user account was returned.');
  return data;
}

async function setPasswordForVerifiedSession(password: string) {
  validatePassword(password);
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function finalizeRegistration(userId: string, payload: RegistrationPayload): Promise<UserProfile> {
  await setPasswordForVerifiedSession(payload.password);

  const email = normalizeEmail(payload.email);
  const role = payload.role;
  const businessDetails = role === 'business'
    ? {
        organizationName: payload.organizationName || '',
        industry: 'Information Technology & Services',
        companyDescription: `${payload.organizationName || 'This organisation'} is an employer partner applicant on Richfield Enrich.`,
        location: 'South Africa',
        website: payload.organizationWebsite || '',
        contactEmail: email,
        contactPhone: '',
        registrationNumber: payload.registrationNumber || 'Pending verification',
        approvalStatus: 'pending' as const,
        talentRequirements: [],
      }
    : undefined;

  const verificationStatus = role === 'business' ? 'pending' : 'verified';
  const graduationYear = payload.graduationYear || (role === 'student' ? new Date().getFullYear() + 1 : undefined);

  // signInWithOtp creates the Auth user before verification, so the DB trigger should
  // already have created a starter profile. Read it first so Student -> Alumni keeps
  // the same skills, posts, connections, badges and profile history.
  const { data: existing, error: existingError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (existingError) throw existingError;

  const patch: any = {
    email,
    name: payload.name.trim(),
    role,
    verification_status: verificationStatus,
    programme: role === 'business' ? existing?.programme ?? null : payload.programme || existing?.programme || null,
    campus: role === 'business' ? 'Corporate Partner' : payload.campus || existing?.campus || null,
    graduation_year: role === 'business' ? existing?.graduation_year ?? null : graduationYear || existing?.graduation_year || null,
    current_company: role === 'alumni' ? payload.currentCompany || existing?.current_company || null : existing?.current_company ?? null,
    business_details: role === 'business' ? businessDetails : existing?.business_details ?? null,
    updated_at: new Date().toISOString(),
  };

  if (!existing?.headline) {
    patch.headline = role === 'business'
      ? `Talent Partner @ ${payload.organizationName || 'Employer'}`
      : role === 'alumni'
        ? `${payload.currentCompany ? payload.currentCompany + ' | ' : ''}Richfield Alumni`
        : `${payload.programme || 'Richfield Student'} | ${payload.campus || 'Richfield College'}`;
  }
  if (!existing?.summary) {
    patch.summary = role === 'business'
      ? `Recruitment and talent representative at ${payload.organizationName || 'an employer partner'}.`
      : role === 'alumni'
        ? `Richfield graduate${graduationYear ? `, class of ${graduationYear}` : ''}.`
        : `Richfield student pursuing ${payload.programme || 'a qualification'} at ${payload.campus || 'Richfield College'}.`;
  }
  if (existing?.profile_completeness == null || existing.profile_completeness === 0) {
    patch.profile_completeness = role === 'business' ? 55 : 40;
  }

  const query = existing
    ? supabase.from('profiles').update(patch).eq('id', userId).select('*').single()
    : supabase.from('profiles').insert({
        id: userId,
        ...patch,
        technical_skills: role === 'business' ? ['Talent Sourcing', 'Graduate Recruitment'] : [],
        professional_skills: role === 'business' ? ['Employer Branding', 'Technical Assessment'] : [],
        portfolio_links: role === 'business' ? { website: payload.organizationWebsite || '' } : {},
        digital_badges: [],
        achievements: [],
        clubs_societies: [],
        career_interests: [],
        career_aspirations: '',
      }).select('*').single();

  const { data, error } = await query;
  if (error) throw error;
  return profileFromRow(data);
}

export function profileFromRow(row: any): UserProfile {
  return {
    id: row.id,
    email: row.email || '',
    name: row.name || '',
    role: row.role || 'student',
    verificationStatus: row.verification_status || 'unverified',
    verificationId: row.verification_id || undefined,
    avatar: row.avatar || '',
    headline: row.headline || '',
    summary: row.summary || '',
    programme: row.programme || undefined,
    campus: row.campus || undefined,
    enrolmentYear: row.enrolment_year ?? undefined,
    graduationYear: row.graduation_year ?? undefined,
    currentCompany: row.current_company || undefined,
    currentRole: row.current_role || undefined,
    technicalSkills: row.technical_skills || [],
    professionalSkills: row.professional_skills || [],
    endorsements: row.endorsements || [],
    workExperience: row.work_experience || [],
    portfolioLinks: row.portfolio_links || {},
    digitalBadges: row.digital_badges || [],
    achievements: row.achievements || [],
    clubsSocieties: row.clubs_societies || [],
    careerInterests: row.career_interests || [],
    careerAspirations: row.career_aspirations || '',
    cvFileName: row.cv_file_name || undefined,
    profileCompleteness: row.profile_completeness ?? 0,
    businessDetails: row.business_details || undefined,
  };
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data ? profileFromRow(data) : null;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
