import { UserProfile } from '../types';
import { supabase } from './supabase';

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

export function profileToRow(profile: UserProfile) {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    verification_status: profile.verificationStatus,
    verification_id: profile.verificationId ?? null,
    avatar: profile.avatar,
    headline: profile.headline,
    summary: profile.summary,
    programme: profile.programme ?? null,
    campus: profile.campus ?? null,
    enrolment_year: profile.enrolmentYear ?? null,
    graduation_year: profile.graduationYear ?? null,
    current_company: profile.currentCompany ?? null,
    current_role: profile.currentRole ?? null,
    technical_skills: profile.technicalSkills,
    professional_skills: profile.professionalSkills,
    endorsements: profile.endorsements,
    work_experience: profile.workExperience,
    portfolio_links: profile.portfolioLinks,
    digital_badges: profile.digitalBadges,
    achievements: profile.achievements,
    clubs_societies: profile.clubsSocieties,
    career_interests: profile.careerInterests,
    career_aspirations: profile.careerAspirations,
    cv_file_name: profile.cvFileName ?? null,
    profile_completeness: profile.profileCompleteness,
    business_details: profile.businessDetails ?? null,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Could not load profile:', error);
    return null;
  }

  return data ? profileFromRow(data) : null;
}

export async function fetchAllProfiles(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const profiles = (data || []).map(profileFromRow);

  const { data: endorsements, error: endorsementError } = await supabase
    .from('endorsements')
    .select('profile_id, skill, endorsed_by_name');

  if (endorsementError) {
    console.warn('Could not load normalized endorsements:', endorsementError);
    return profiles;
  }

  const grouped = new Map<string, Map<string, string[]>>();
  for (const row of endorsements || []) {
    if (!grouped.has(row.profile_id)) grouped.set(row.profile_id, new Map());
    const skills = grouped.get(row.profile_id)!;
    const key = String(row.skill || '').trim();
    if (!skills.has(key)) skills.set(key, []);
    skills.get(key)!.push(row.endorsed_by_name || 'Enrich member');
  }

  return profiles.map((profile) => {
    const skills = grouped.get(profile.id);
    if (!skills) return profile;

    return {
      ...profile,
      endorsements: Array.from(skills.entries()).map(([skill, endorsedBy]) => ({
        skill,
        count: endorsedBy.length,
        endorsedBy,
      })),
    };
  });
}

export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileToRow(profile), { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return profileFromRow(data);
}
