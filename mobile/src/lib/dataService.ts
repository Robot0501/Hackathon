import {
  ChatMessage,
  Comment,
  NotificationItem,
  Opportunity,
  JobApplication,
  Post,
  QuestionThread,
  RichfieldEvent,
  UserProfile,
} from '../types';
import { profileFromRow } from './authService';
import { supabase } from './supabase';

const fmt = (value: string | null | undefined) => {
  if (!value) return 'Just now';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

async function must<T>(promise: PromiseLike<{ data: T | null; error: any }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw error;
  return data as T;
}

export async function listProfiles(): Promise<UserProfile[]> {
  const [rows, endorsementRows] = await Promise.all([
    must<any[]>(supabase.from('profiles').select('*').order('name')),
    must<any[]>(supabase.from('endorsements').select('*')),
  ]);

  const byUser = new Map<string, Map<string, { count: number; endorsedBy: string[] }>>();
  const names = new Map(rows.map((r) => [r.id, r.name || 'Richfield member']));

  for (const row of endorsementRows || []) {
    if (!byUser.has(row.target_user_id)) byUser.set(row.target_user_id, new Map());
    const skillMap = byUser.get(row.target_user_id)!;
    const key = String(row.skill || '').trim();
    const existing = skillMap.get(key) || { count: 0, endorsedBy: [] };
    existing.count += 1;
    existing.endorsedBy.push(names.get(row.endorser_user_id) || 'Richfield member');
    skillMap.set(key, existing);
  }

  return (rows || []).map((row) => {
    const profile = profileFromRow(row);
    const skillMap = byUser.get(profile.id);
    if (skillMap) {
      profile.endorsements = [...skillMap.entries()].map(([skill, value]) => ({ skill, ...value }));
    }
    return profile;
  });
}

export async function updateOwnProfile(userId: string, updated: Partial<UserProfile>) {
  const patch: any = { updated_at: new Date().toISOString() };
  if (updated.name !== undefined) patch.name = updated.name;
  if (updated.avatar !== undefined) patch.avatar = updated.avatar;
  if (updated.headline !== undefined) patch.headline = updated.headline;
  if (updated.summary !== undefined) patch.summary = updated.summary;
  if (updated.programme !== undefined) patch.programme = updated.programme;
  if (updated.campus !== undefined) patch.campus = updated.campus;
  if (updated.enrolmentYear !== undefined) patch.enrolment_year = updated.enrolmentYear;
  if (updated.graduationYear !== undefined) patch.graduation_year = updated.graduationYear;
  if (updated.currentCompany !== undefined) patch.current_company = updated.currentCompany;
  if (updated.currentRole !== undefined) patch.current_role = updated.currentRole;
  if (updated.technicalSkills !== undefined) patch.technical_skills = updated.technicalSkills;
  if (updated.professionalSkills !== undefined) patch.professional_skills = updated.professionalSkills;
  if (updated.workExperience !== undefined) patch.work_experience = updated.workExperience;
  if (updated.portfolioLinks !== undefined) patch.portfolio_links = updated.portfolioLinks;
  if (updated.digitalBadges !== undefined) patch.digital_badges = updated.digitalBadges;
  if (updated.achievements !== undefined) patch.achievements = updated.achievements;
  if (updated.clubsSocieties !== undefined) patch.clubs_societies = updated.clubsSocieties;
  if (updated.careerInterests !== undefined) patch.career_interests = updated.careerInterests;
  if (updated.careerAspirations !== undefined) patch.career_aspirations = updated.careerAspirations;
  if (updated.cvFileName !== undefined) patch.cv_file_name = updated.cvFileName;
  if (updated.profileCompleteness !== undefined) patch.profile_completeness = updated.profileCompleteness;
  if (updated.businessDetails !== undefined) patch.business_details = updated.businessDetails;

  const row = await must<any>(supabase.from('profiles').update(patch).eq('id', userId).select('*').single());
  return profileFromRow(row);
}

export async function adminSetBusinessStatus(userId: string, approved: boolean) {
  const { data: existing, error: readError } = await supabase.from('profiles').select('business_details').eq('id', userId).single();
  if (readError) throw readError;
  const details = existing?.business_details || {};
  const patch = {
    verification_status: approved ? 'verified' : 'rejected',
    business_details: { ...details, approvalStatus: approved ? 'approved' : 'rejected' },
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

export async function addEndorsement(targetUserId: string, endorserUserId: string, skill: string) {
  if (targetUserId.startsWith('showcase-profile:')) return;
  const { error } = await supabase.from('endorsements').insert({
    target_user_id: targetUserId,
    endorser_user_id: endorserUserId,
    skill: skill.trim(),
  });
  if (error && error.code !== '23505') throw error;
}

export async function listPosts(currentUserId: string, profiles: UserProfile[]): Promise<Post[]> {
  const [postRows, commentRows, likeRows] = await Promise.all([
    must<any[]>(supabase.from('posts').select('*').order('created_at', { ascending: false })),
    must<any[]>(supabase.from('comments').select('*').order('created_at', { ascending: true })),
    must<any[]>(supabase.from('post_likes').select('*')),
  ]);
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  return (postRows || []).map((row) => {
    const author = profileMap.get(row.author_id);
    const likes = (likeRows || []).filter((l) => l.post_id === row.id);
    const comments: Comment[] = (commentRows || [])
      .filter((c) => c.post_id === row.id)
      .map((c) => {
        const a = profileMap.get(c.author_id);
        return {
          id: c.id,
          authorId: c.author_id,
          authorName: a?.name || 'Richfield member',
          authorRole: a?.role || 'student',
          authorAvatar: a?.avatar || '',
          content: c.content,
          timestamp: fmt(c.created_at),
        };
      });
    return {
      id: row.id,
      authorId: row.author_id,
      authorName: author?.name || 'Richfield member',
      authorRole: author?.role || 'student',
      authorAvatar: author?.avatar || '',
      authorHeadline: author?.headline || '',
      campus: author?.campus,
      timestamp: fmt(row.created_at),
      content: row.content,
      type: row.type,
      videoUrl: row.video_url || undefined,
      videoThumbnail: row.video_thumbnail || undefined,
      videoDuration: row.video_duration || undefined,
      mediaUrl: row.media_url || undefined,
      tags: row.tags || [],
      likes: likes.length,
      hasLiked: likes.some((l) => l.user_id === currentUserId),
      comments,
      flagged: !!row.flagged,
      targetAudience: row.target_audience || 'all',
    } as Post;
  });
}

export async function createPost(userId: string, post: Post) {
  const { data, error } = await supabase.from('posts').insert({
    author_id: userId,
    content: post.content,
    type: post.type,
    video_url: post.videoUrl || null,
    video_thumbnail: post.videoThumbnail || null,
    video_duration: post.videoDuration || null,
    media_url: post.mediaUrl || null,
    tags: post.tags || [],
    flagged: !!post.flagged,
    target_audience: post.targetAudience || 'all',
  }).select('id').single();
  if (error) throw error;
  if (post.hasLiked && data?.id) {
    await supabase.from('post_likes').insert({ post_id: data.id, user_id: userId });
  }
}

export async function togglePostLike(postId: string, userId: string, hasLiked: boolean) {
  if (postId.startsWith('showcase-post:')) return;
  if (hasLiked) {
    const { error } = await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
    if (error && error.code !== '23505') throw error;
  }
}

export async function addComment(postId: string, userId: string, content: string) {
  if (postId.startsWith('showcase-post:')) return;
  const { error } = await supabase.from('comments').insert({ post_id: postId, author_id: userId, content: content.trim() });
  if (error) throw error;
}

export async function deletePost(postId: string) {
  if (postId.startsWith('showcase-post:')) return;
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
}

export async function listOpportunities(currentUserId: string): Promise<Opportunity[]> {
  const [rows, apps] = await Promise.all([
    must<any[]>(supabase.from('opportunities').select('*').order('created_at', { ascending: false })),
    must<any[]>(supabase.from('applications').select('opportunity_id').eq('user_id', currentUserId)),
  ]);
  const applied = new Set((apps || []).map((a) => a.opportunity_id));
  return (rows || []).map((row) => ({
    id: row.id,
    companyId: row.company_id,
    companyName: row.company_name,
    companyLogo: row.company_logo || '',
    title: row.title,
    type: row.type,
    location: row.location,
    isRemote: !!row.is_remote,
    campusTarget: row.campus_target || undefined,
    requiredProgramme: row.required_programme || [],
    requiredSkills: row.required_skills || [],
    description: row.description || '',
    responsibilities: row.responsibilities || [],
    stipendSalary: row.stipend_salary || '',
    closingDate: row.closing_date || '',
    status: row.status,
    applicantsCount: row.applicants_count || 0,
    applied: applied.has(row.id),
  } as Opportunity));
}

export async function createOpportunity(userId: string, opp: Opportunity) {
  const { error } = await supabase.from('opportunities').insert({
    company_id: userId,
    company_name: opp.companyName,
    company_logo: opp.companyLogo || '',
    title: opp.title,
    type: opp.type,
    location: opp.location,
    is_remote: !!opp.isRemote,
    campus_target: opp.campusTarget || null,
    required_programme: opp.requiredProgramme || [],
    required_skills: opp.requiredSkills || [],
    description: opp.description || '',
    responsibilities: opp.responsibilities || [],
    stipend_salary: opp.stipendSalary || '',
    closing_date: opp.closingDate || '',
    status: opp.status,
  });
  if (error) throw error;
}

export interface ApplicationFormData {
  name?: string;
  email?: string;
  phone?: string;
  availability?: string;
  motivation?: string;
}

export async function applyToOpportunity(opportunityId: string, userId: string, form: ApplicationFormData = {}) {
  if (opportunityId.startsWith('showcase-opp:')) return;
  const { error } = await supabase.from('applications').insert({
    opportunity_id: opportunityId,
    user_id: userId,
    full_name: form.name || '',
    email: form.email || '',
    phone: form.phone || '',
    availability: form.availability || '',
    motivation: form.motivation || '',
  });
  if (error && error.code !== '23505') throw error;
}

export async function listApplicationsForOpportunity(opportunityId: string): Promise<JobApplication[]> {
  if (opportunityId.startsWith('showcase-opp:')) return [];
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    opportunityId: row.opportunity_id,
    userId: row.user_id,
    fullName: row.full_name || '',
    email: row.email || '',
    phone: row.phone || '',
    availability: row.availability || '',
    motivation: row.motivation || '',
    status: row.status || 'submitted',
    createdAt: fmt(row.created_at),
  }));
}

export async function updateApplicationStatus(applicationId: string, status: JobApplication['status']) {
  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId);
  if (error) throw error;
}

export async function uploadUserImage(userId: string, uri: string, purpose: 'profile' | 'project') {
  const response = await fetch(uri);
  if (!response.ok) throw new Error('Could not read the selected image.');
  const buffer = await response.arrayBuffer();
  const cleanExt = (uri.split('?')[0].split('.').pop() || 'jpg').toLowerCase();
  const ext = ['jpg', 'jpeg', 'png', 'webp'].includes(cleanExt) ? cleanExt : 'jpg';
  const path = `${userId}/${purpose}/${Date.now()}.${ext}`;
  const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const { error } = await supabase.storage.from('enrich-media').upload(path, buffer, { contentType, upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('enrich-media').getPublicUrl(path);
  return data.publicUrl;
}

export async function setOpportunityStatus(opportunityId: string, status: Opportunity['status']) {
  if (opportunityId.startsWith('showcase-opp:')) return;
  const { error } = await supabase.from('opportunities').update({ status, updated_at: new Date().toISOString() }).eq('id', opportunityId);
  if (error) throw error;
}

export async function listEvents(currentUserId: string): Promise<RichfieldEvent[]> {
  const [rows, rsvps] = await Promise.all([
    must<any[]>(supabase.from('events').select('*').order('created_at', { ascending: false })),
    must<any[]>(supabase.from('event_rsvps').select('event_id').eq('user_id', currentUserId)),
  ]);
  const mine = new Set((rsvps || []).map((r) => r.event_id));
  return (rows || []).map((row) => ({
    id: row.id,
    title: row.title,
    type: row.type,
    date: row.date,
    time: row.time,
    location: row.location,
    campus: row.campus,
    description: row.description,
    organizer: row.organizer,
    rsvpCount: row.rsvp_count || 0,
    hasRsvp: mine.has(row.id),
    speaker: row.speaker || undefined,
  } as RichfieldEvent));
}

export async function toggleEventRsvp(eventId: string, userId: string, hasRsvp: boolean) {
  if (hasRsvp) {
    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('event_rsvps')
      .insert({ event_id: eventId, user_id: userId });
    if (error && error.code !== '23505') throw error;
  }
}

export async function createEvent(userId: string, event: RichfieldEvent) {
  const { error } = await supabase.from('events').insert({
    title: event.title,
    type: event.type,
    date: event.date,
    time: event.time,
    location: event.location,
    campus: event.campus,
    description: event.description,
    organizer: event.organizer,
    speaker: event.speaker || null,
    created_by: userId,
  });
  if (error) throw error;
}

export async function deleteEvent(eventId: string) {
  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) throw error;
}

export async function listConnections(currentUserId: string) {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`requester_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);
  if (error) throw error;
  const map: Record<string, 'pending_incoming' | 'pending_outgoing' | 'accepted' | 'declined'> = {};
  for (const row of data || []) {
    const isRequester = row.requester_id === currentUserId;
    const other = isRequester ? row.receiver_id : row.requester_id;
    map[other] = row.status === 'pending'
      ? (isRequester ? 'pending_outgoing' : 'pending_incoming')
      : row.status;
  }
  return map;
}

export async function sendConnectionRequest(requesterId: string, receiverId: string) {
  if (receiverId.startsWith('showcase-profile:')) return;
  const { error } = await supabase.from('connections').insert({ requester_id: requesterId, receiver_id: receiverId });
  if (error && error.code !== '23505') throw error;
}

export async function setConnectionStatus(currentUserId: string, otherUserId: string, status: 'accepted' | 'declined') {
  if (otherUserId.startsWith('showcase-profile:')) return;
  const { error } = await supabase
    .from('connections')
    .update({ status, updated_at: new Date().toISOString() })
    .or(`and(requester_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`);
  if (error) throw error;
}

export async function listMessages(currentUserId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    text: row.text,
    timestamp: fmt(row.created_at),
  }));
}

export async function sendMessage(senderId: string, receiverId: string, text: string) {
  if (receiverId.startsWith('showcase-profile:')) return;
  const { error } = await supabase.from('messages').insert({ sender_id: senderId, receiver_id: receiverId, text: text.trim() });
  if (error) throw error;
}

export async function listNotifications(userId: string): Promise<NotificationItem[]> {
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    timestamp: fmt(row.created_at),
    read: !!row.read,
    actionType: row.action_type || undefined,
  }));
}

export async function broadcastAnnouncement(title: string, message: string, target: 'all' | 'students' | 'alumni' | 'business') {
  let query = supabase.from('profiles').select('id, role');
  const { data: users, error: usersError } = await query;
  if (usersError) throw usersError;
  const filtered = (users || []).filter((u) => {
    if (target === 'all') return true;
    if (target === 'students') return u.role === 'student';
    return u.role === target;
  });
  if (!filtered.length) return;
  const rows = filtered.map((u) => ({
    user_id: u.id,
    type: 'announcement',
    title: `Richfield Notice: ${title}`,
    message,
  }));
  const { error } = await supabase.from('notifications').insert(rows);
  if (error) throw error;
}

export async function listQuestions(profiles: UserProfile[]): Promise<QuestionThread[]> {
  const [questions, answers] = await Promise.all([
    must<any[]>(supabase.from('questions').select('*').order('created_at', { ascending: false })),
    must<any[]>(supabase.from('answers').select('*').order('created_at', { ascending: true })),
  ]);
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  return (questions || []).map((q) => {
    const author = profileMap.get(q.author_id);
    return {
      id: q.id,
      authorId: q.author_id,
      authorName: author?.name || 'Richfield member',
      authorRole: author?.role || 'student',
      title: q.title,
      body: q.body,
      timestamp: fmt(q.created_at),
      answers: (answers || []).filter((a) => a.question_id === q.id).map((a) => {
        const answerAuthor = profileMap.get(a.author_id);
        return {
          id: a.id,
          authorId: a.author_id,
          authorName: answerAuthor?.name || 'Richfield member',
          content: a.content,
          timestamp: fmt(a.created_at),
        };
      }),
    } as QuestionThread;
  });
}

export async function askQuestion(authorId: string, title: string, body: string) {
  const { error } = await supabase.from('questions').insert({ author_id: authorId, title: title.trim(), body: body.trim() });
  if (error) throw error;
}

export async function answerQuestion(authorId: string, questionId: string, content: string) {
  if (questionId.startsWith('showcase-question:')) return;
  const { error } = await supabase.from('answers').insert({ author_id: authorId, question_id: questionId, content: content.trim() });
  if (error) throw error;
}
