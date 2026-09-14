export type UserRole = 'student' | 'alumni' | 'business' | 'admin';

export type VerificationStatus = 'verified' | 'pending' | 'unverified' | 'rejected';

export interface Endorsement {
  skill: string;
  count: number;
  endorsedBy: string[];
}

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  type: 'internship' | 'learnership' | 'industry_placement' | 'entrepreneurial' | 'full_time';
}

export interface DigitalBadge {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  badgeUrl?: string;
  category: string;
}

export interface AcademicAchievement {
  id: string;
  title: string;
  category: 'academic' | 'scholarship' | 'award' | 'hackathon' | 'leadership';
  year: string;
  description: string;
}

export interface BusinessDetails {
  organizationName: string;
  industry: string;
  companyDescription: string;
  location: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  registrationNumber?: string;
  approvalStatus: 'approved' | 'pending' | 'rejected';
  talentRequirements: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  verificationId?: string; // Student number (e.g. RF-2023-8942) or Alumni ID
  avatar: string;
  headline: string;
  summary: string;
  programme?: string; // e.g. BSc Information Technology, Diploma in Business Admin
  campus?: string; // Braamfontein, Durban, Pretoria, Cape Town, etc.
  enrolmentYear?: number;
  graduationYear?: number;
  currentCompany?: string; // for alumni
  currentRole?: string; // for alumni
  technicalSkills: string[];
  professionalSkills: string[];
  endorsements: Endorsement[];
  workExperience: WorkExperience[];
  portfolioLinks: {
    github?: string;
    linkedin?: string;
    credly?: string;
    website?: string;
  };
  digitalBadges: DigitalBadge[];
  achievements: AcademicAchievement[];
  clubsSocieties: string[];
  careerInterests: string[];
  careerAspirations: string;
  cvFileName?: string;
  profileCompleteness: number; // 0 - 100
  businessDetails?: BusinessDetails;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  authorHeadline: string;
  campus?: string;
  timestamp: string;
  content: string;
  type: 'text' | 'showcase' | 'video' | 'career_journey' | 'campus_update';
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: string;
  mediaUrl?: string;
  tags: string[];
  likes: number;
  hasLiked?: boolean;
  comments: Comment[];
  flagged?: boolean;
  targetAudience: 'all' | 'students' | 'alumni' | 'business';
}

export interface Opportunity {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  title: string;
  type: 'internship' | 'learnership' | 'part_time' | 'graduate_vacancy';
  location: string;
  isRemote?: boolean;
  campusTarget?: string;
  requiredProgramme: string[];
  requiredSkills: string[];
  description: string;
  responsibilities: string[];
  stipendSalary: string;
  closingDate: string;
  status: 'approved' | 'pending_approval' | 'rejected' | 'closed';
  applicantsCount: number;
  applied?: boolean;
  matchScore?: number;
}

export interface RichfieldEvent {
  id: string;
  title: string;
  type: 'career_fair' | 'hackathon' | 'workshop' | 'industry_talk' | 'alumni_panel' | 'alumni_mixer';
  date: string;
  time: string;
  location: string;
  campus: string;
  description: string;
  organizer: string;
  rsvpCount: number;
  hasRsvp: boolean;
  speaker?: string;
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  requestedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isAi?: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'connection' | 'opportunity' | 'announcement' | 'verification' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionType?: string;
}

export interface AlumniCareerTrajectory {
  id: string;
  alumnusName: string;
  avatar: string;
  degree: string;
  graduationYear: number;
  currentRole: string;
  currentCompany: string;
  steps: {
    year: string;
    title: string;
    organization: string;
    highlight: string;
  }[];
  advice: string;
}
