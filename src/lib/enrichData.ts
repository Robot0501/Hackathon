import {
  ChatMessage,
  Comment,
  NotificationItem,
  Opportunity,
  Post,
  RichfieldEvent,
  UserProfile,
} from '../types';
import { supabase } from './supabase';
import { fetchAllProfiles, profileToRow } from './profile';

const displayTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export interface PlatformData {
  users: UserProfile[];
  posts: Post[];
  opportunities: Opportunity[];
  events: RichfieldEvent[];
  notifications: NotificationItem[];
  connections: Record<string, 'pending' | 'accepted' | 'declined'>;
  chatMessages: ChatMessage[];
}

export async function loadPlatformData(currentUserId: string): Promise<PlatformData> {
  const [users, posts, opportunities, events, notifications, connections, chatMessages] =
    await Promise.all([
      fetchAllProfiles(),
      fetchPosts(currentUserId),
      fetchOpportunities(currentUserId),
      fetchEvents(currentUserId),
      fetchNotifications(currentUserId),
      fetchConnections(currentUserId),
      fetchMessages(currentUserId),
    ]);

  return { users, posts, opportunities, events, notifications, connections, chatMessages };
}

export async function fetchPosts(currentUserId: string): Promise<Post[]> {
  const { data: postRows, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const ids = (postRows || []).map((p) => p.id);
  if (!ids.length) return [];

  const [{ data: commentRows, error: commentsError }, { data: likeRows, error: likesError }] =
    await Promise.all([
      supabase.from('comments').select('*').in('post_id', ids).order('created_at', { ascending: true }),
      supabase.from('post_likes').select('post_id,user_id').in('post_id', ids),
    ]);
  if (commentsError) throw commentsError;
  if (likesError) throw likesError;

  return (postRows || []).map((row) => {
    const comments: Comment[] = (commentRows || [])
      .filter((c) => c.post_id === row.id)
      .map((c) => ({
        id: c.id,
        authorId: c.author_id,
        authorName: c.author_name,
        authorRole: c.author_role,
        authorAvatar: c.author_avatar || '',
        content: c.content,
        timestamp: displayTime(c.created_at),
      }));

    const likes = (likeRows || []).filter((l) => l.post_id === row.id);

    return {
      id: row.id,
      authorId: row.author_id,
      authorName: row.author_name,
      authorRole: row.author_role,
      authorAvatar: row.author_avatar || '',
      authorHeadline: row.author_headline || '',
      campus: row.campus || undefined,
      timestamp: displayTime(row.created_at),
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
      flagged: row.flagged || false,
      targetAudience: row.target_audience,
    } as Post;
  });
}

export async function addPost(post: Post): Promise<void> {
  const { error } = await supabase.from('posts').insert({
    id: post.id,
    author_id: post.authorId,
    author_name: post.authorName,
    author_role: post.authorRole,
    author_avatar: post.authorAvatar,
    author_headline: post.authorHeadline,
    campus: post.campus ?? null,
    content: post.content,
    type: post.type,
    video_url: post.videoUrl ?? null,
    video_thumbnail: post.videoThumbnail ?? null,
    video_duration: post.videoDuration ?? null,
    media_url: post.mediaUrl ?? null,
    tags: post.tags,
    flagged: post.flagged ?? false,
    target_audience: post.targetAudience,
  });
  if (error) throw error;
}

export async function togglePostLike(postId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;

  if (data) {
    const { error: deleteError } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (deleteError) throw deleteError;
    return false;
  }

  const { error: insertError } = await supabase
    .from('post_likes')
    .insert({ post_id: postId, user_id: userId });
  if (insertError) throw insertError;
  return true;
}

export async function addComment(postId: string, user: UserProfile, content: string): Promise<Comment> {
  const comment: Comment = {
    id: `comm-${Date.now()}`,
    authorId: user.id,
    authorName: user.name,
    authorRole: user.role,
    authorAvatar: user.avatar,
    content,
    timestamp: 'Just now',
  };

  const { error } = await supabase.from('comments').insert({
    id: comment.id,
    post_id: postId,
    author_id: user.id,
    author_name: user.name,
    author_role: user.role,
    author_avatar: user.avatar,
    content,
  });
  if (error) throw error;
  return comment;
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
}

export async function fetchOpportunities(currentUserId: string): Promise<Opportunity[]> {
  const { data: rows, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const { data: applications, error: appError } = await supabase
    .from('applications')
    .select('opportunity_id')
    .eq('applicant_id', currentUserId);
  if (appError) throw appError;

  const appliedIds = new Set((applications || []).map((a) => a.opportunity_id));

  return (rows || []).map((row) => ({
    id: row.id,
    companyId: row.company_id || '',
    companyName: row.company_name,
    companyLogo: row.company_logo || '',
    title: row.title,
    type: row.type,
    location: row.location,
    isRemote: row.is_remote ?? false,
    campusTarget: row.campus_target || undefined,
    requiredProgramme: row.required_programme || [],
    requiredSkills: row.required_skills || [],
    description: row.description,
    responsibilities: row.responsibilities || [],
    stipendSalary: row.stipend_salary || '',
    closingDate: row.closing_date || '',
    status: row.status,
    applicantsCount: row.applicants_count || 0,
    applied: appliedIds.has(row.id),
    matchScore: row.match_score ?? undefined,
  } as Opportunity));
}

export async function applyForOpportunity(opportunityId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('applications').insert({
    opportunity_id: opportunityId,
    applicant_id: userId,
  });
  if (error && error.code !== '23505') throw error;
}

export async function postOpportunity(opportunity: Opportunity, companyId: string): Promise<void> {
  const { error } = await supabase.from('opportunities').insert({
    id: opportunity.id,
    company_id: companyId,
    company_name: opportunity.companyName,
    company_logo: opportunity.companyLogo,
    title: opportunity.title,
    type: opportunity.type,
    location: opportunity.location,
    is_remote: opportunity.isRemote ?? false,
    campus_target: opportunity.campusTarget ?? null,
    required_programme: opportunity.requiredProgramme,
    required_skills: opportunity.requiredSkills,
    description: opportunity.description,
    responsibilities: opportunity.responsibilities,
    stipend_salary: opportunity.stipendSalary,
    closing_date: opportunity.closingDate,
    status: opportunity.status,
    match_score: opportunity.matchScore ?? null,
  });
  if (error) throw error;
}

export async function setOpportunityStatus(
  opportunityId: string,
  status: 'approved' | 'rejected' | 'closed'
): Promise<void> {
  const { error } = await supabase.from('opportunities').update({ status }).eq('id', opportunityId);
  if (error) throw error;
}

export async function fetchEvents(currentUserId: string): Promise<RichfieldEvent[]> {
  const { data: rows, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date_sort', { ascending: true });
  if (error) throw error;

  const { data: rsvps, error: rsvpError } = await supabase
    .from('event_rsvps')
    .select('event_id')
    .eq('user_id', currentUserId);
  if (rsvpError) throw rsvpError;
  const rsvpIds = new Set((rsvps || []).map((r) => r.event_id));

  return (rows || []).map((row) => ({
    id: row.id,
    title: row.title,
    type: row.type,
    date: row.date_label,
    time: row.time_label,
    location: row.location,
    campus: row.campus,
    description: row.description,
    organizer: row.organizer,
    rsvpCount: row.rsvp_count || 0,
    hasRsvp: rsvpIds.has(row.id),
    speaker: row.speaker || undefined,
  } as RichfieldEvent));
}

export async function toggleEventRsvp(eventId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('event_rsvps')
    .select('event_id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;

  if (data) {
    const { error: deleteError } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);
    if (deleteError) throw deleteError;
    return false;
  }

  const { error: insertError } = await supabase
    .from('event_rsvps')
    .insert({ event_id: eventId, user_id: userId });
  if (insertError) throw insertError;
  return true;
}

export async function createEvent(event: RichfieldEvent): Promise<void> {
  const sortDate = new Date(`${event.date} ${event.time.split('-')[0] || ''}`);
  const { error } = await supabase.from('events').insert({
    id: event.id,
    title: event.title,
    type: event.type,
    date_label: event.date,
    time_label: event.time,
    event_date_sort: Number.isNaN(sortDate.getTime()) ? new Date().toISOString() : sortDate.toISOString(),
    location: event.location,
    campus: event.campus,
    description: event.description,
    organizer: event.organizer,
    speaker: event.speaker ?? null,
  });
  if (error) throw error;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) throw error;
}

export async function fetchConnections(
  currentUserId: string
): Promise<Record<string, 'pending' | 'accepted' | 'declined'>> {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`requester_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);
  if (error) throw error;

  const result: Record<string, 'pending' | 'accepted' | 'declined'> = {};
  for (const row of data || []) {
    const otherId = row.requester_id === currentUserId ? row.receiver_id : row.requester_id;
    result[otherId] = row.status;
  }
  return result;
}

export async function sendConnectionRequest(requesterId: string, receiverId: string): Promise<void> {
  const { error } = await supabase.from('connections').insert({ requester_id: requesterId, receiver_id: receiverId });
  if (error && error.code !== '23505') throw error;
}

export async function setConnectionStatus(
  currentUserId: string,
  otherUserId: string,
  status: 'accepted' | 'declined'
): Promise<void> {
  const { data, error } = await supabase
    .from('connections')
    .select('id')
    .or(
      `and(requester_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
    )
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Connection request not found.');

  const { error: updateError } = await supabase.from('connections').update({ status }).eq('id', data.id);
  if (updateError) throw updateError;
}

export async function fetchMessages(currentUserId: string): Promise<ChatMessage[]> {
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
    timestamp: displayTime(row.created_at),
    isAi: row.is_ai || false,
  }));
}

export async function sendMessage(message: ChatMessage): Promise<void> {
  const { error } = await supabase.from('messages').insert({
    id: message.id,
    sender_id: message.senderId,
    receiver_id: message.receiverId,
    text: message.text,
    is_ai: message.isAi ?? false,
  });
  if (error) throw error;
}

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    timestamp: displayTime(row.created_at),
    read: row.read,
    actionType: row.action_type || undefined,
  }));
}

export async function createNotification(userId: string, item: NotificationItem): Promise<void> {
  const { error } = await supabase.from('notifications').insert({
    id: item.id,
    user_id: userId,
    type: item.type,
    title: item.title,
    message: item.message,
    read: item.read,
    action_type: item.actionType ?? null,
  });
  if (error) throw error;
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
  if (error) throw error;
}

export async function updateProfile(profile: UserProfile): Promise<void> {
  const { error } = await supabase.from('profiles').update(profileToRow(profile)).eq('id', profile.id);
  if (error) throw error;
}

export async function addEndorsement(
  profileId: string,
  skill: string,
  endorser: UserProfile
): Promise<void> {
  const { error } = await supabase.from('endorsements').insert({
    profile_id: profileId,
    skill,
    endorsed_by_id: endorser.id,
    endorsed_by_name: endorser.name,
  });
  if (error && error.code !== '23505') throw error;
}

export async function setBusinessApproval(
  user: UserProfile,
  status: 'approved' | 'rejected'
): Promise<void> {
  const businessDetails = user.businessDetails
    ? { ...user.businessDetails, approvalStatus: status }
    : null;

  const { error } = await supabase
    .from('profiles')
    .update({
      verification_status: status === 'approved' ? 'verified' : 'rejected',
      business_details: businessDetails,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
  if (error) throw error;
}

export async function broadcastAnnouncement(
  title: string,
  message: string,
  target: 'all' | 'students' | 'alumni' | 'business'
): Promise<void> {
  let query = supabase.from('profiles').select('id,role');
  if (target !== 'all') {
    const role = target === 'students' ? 'student' : target;
    query = query.eq('role', role);
  }
  const { data: recipients, error } = await query;
  if (error) throw error;

  const stamp = Date.now();
  const rows = (recipients || []).map((recipient, index) => ({
    id: `ann-${stamp}-${index}`,
    user_id: recipient.id,
    type: 'announcement',
    title: `Richfield Notice: ${title}`,
    message,
    read: false,
  }));

  if (!rows.length) return;
  const { error: insertError } = await supabase.from('notifications').insert(rows);
  if (insertError) throw insertError;
}
