import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_USERS, MOCK_OPPORTUNITIES, MOCK_POSTS, MOCK_EVENTS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import { UserProfile, Post, Opportunity, RichfieldEvent, ChatMessage, NotificationItem } from '../types';

type Connections = { [userId: string]: 'pending' | 'accepted' | 'declined' };

interface AppContextType {
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  currentUser: UserProfile | null;
  setCurrentUser: (u: UserProfile | null) => void;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  opportunities: Opportunity[];
  setOpportunities: React.Dispatch<React.SetStateAction<Opportunity[]>>;
  events: RichfieldEvent[];
  setEvents: React.Dispatch<React.SetStateAction<RichfieldEvent[]>>;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  connections: Connections;
  setConnections: React.Dispatch<React.SetStateAction<Connections>>;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  // actions
  handleAddPost: (p: Post) => void;
  handleLikePost: (id: string) => void;
  handleAddComment: (postId: string, text: string) => void;
  handleApplyOpportunity: (oppId: string) => void;
  handlePostOpportunity: (opp: Opportunity) => void;
  handleRsvpEvent: (id: string) => void;
  handleSendConnectionRequest: (targetUserId: string) => void;
  handleAcceptConnectionRequest: (targetUserId: string) => void;
  handleDeclineConnectionRequest: (targetUserId: string) => void;
  handleSendMessage: (receiverId: string, text: string) => void;
  handleUpdateProfile: (updated: Partial<UserProfile>) => void;
  handleAddEndorsement: (targetUserId: string, skill: string) => void;
  handleApproveBusiness: (userId: string) => void;
  handleRejectBusiness: (userId: string) => void;
  handleApproveOpportunity: (oppId: string) => void;
  handleRejectOpportunity: (oppId: string) => void;
  handleDeletePost: (postId: string) => void;
  handleCreateEvent: (event: RichfieldEvent) => void;
  handleDeleteEvent: (eventId: string) => void;
  handleBroadcastAnnouncement: (title: string, message: string, target: 'all' | 'students' | 'alumni' | 'business') => void;
  handleRegisterSuccess: (newUser: UserProfile) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [events, setEvents] = useState<RichfieldEvent[]>(MOCK_EVENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [connections, setConnections] = useState<Connections>({ 'user-alumni-1': 'accepted' });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      senderId: 'user-alumni-1',
      receiverId: 'user-student-1',
      text: 'Sawubona! Impressive work on your React portfolio. Are you attending the Richfield recruitment session next Tuesday?',
      timestamp: 'Yesterday at 14:20',
    },
    {
      id: 'msg-init-2',
      senderId: 'user-student-1',
      receiverId: 'user-alumni-1',
      text: 'Thanks Lerato! Yes, I registered and uploaded my pitch video on Enrich. Would love any tips you have for standard graduate assessments.',
      timestamp: 'Yesterday at 15:05',
    },
  ]);

  const handleAddPost = (newPost: Post) => setPosts((prev) => [newPost, ...prev]);
  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasLiked = !p.hasLiked;
          return { ...p, hasLiked, likes: hasLiked ? p.likes + 1 : p.likes - 1 };
        }
        return p;
      })
    );
  };
  const handleAddComment = (postId: string, commentText: string) => {
    if (!currentUser) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComment = {
            id: `comm-${Date.now()}`,
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorRole: currentUser.role,
            authorAvatar: currentUser.avatar,
            content: commentText,
            timestamp: 'Just now',
          };
          return { ...p, comments: [...p.comments, newComment] };
        }
        return p;
      })
    );
  };
  const handleApplyOpportunity = (oppId: string) => {
    setOpportunities((prev) => prev.map((o) => (o.id === oppId ? { ...o, applied: true, applicantsCount: o.applicantsCount + 1 } : o)));
    const targetOpp = opportunities.find((o) => o.id === oppId);
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Application Dispatched',
      message: `Your verified dossier has been submitted for: ${targetOpp?.title || 'Graduate Role'}.`,
      timestamp: 'Just now',
      read: false,
      type: 'opportunity',
    };
    setNotifications((prev) => [notif, ...prev]);
  };
  const handlePostOpportunity = (newOpp: Opportunity) => {
    setOpportunities((prev) => [newOpp, ...prev]);
    if (newOpp.status === 'pending_approval') {
      const notif: NotificationItem = {
        id: `notif-biz-${Date.now()}`,
        title: 'Opportunity Under Vetting',
        message: `Your posting "${newOpp.title}" has been submitted for approval.`,
        timestamp: 'Just now',
        read: false,
        type: 'opportunity',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };
  const handleRsvpEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId ? { ...ev, hasRsvp: !ev.hasRsvp, rsvpCount: ev.hasRsvp ? ev.rsvpCount - 1 : ev.rsvpCount + 1 } : ev
      )
    );
  };
  const handleSendConnectionRequest = (targetUserId: string) => {
    setConnections((prev) => ({ ...prev, [targetUserId]: 'pending' }));
    const target = users.find((u) => u.id === targetUserId);
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Connection Request Sent',
      message: `Invitation sent to ${target?.name || 'Richfield member'}.`,
      timestamp: 'Just now',
      read: false,
      type: 'connection',
    };
    setNotifications((prev) => [notif, ...prev]);
  };
  const handleAcceptConnectionRequest = (targetUserId: string) => setConnections((prev) => ({ ...prev, [targetUserId]: 'accepted' }));
  const handleDeclineConnectionRequest = (targetUserId: string) => setConnections((prev) => ({ ...prev, [targetUserId]: 'declined' }));
  const handleSendMessage = (receiverId: string, text: string) => {
    if (!currentUser) return;
    const newMsg: ChatMessage = { id: `msg-${Date.now()}`, senderId: currentUser.id, receiverId, text, timestamp: 'Just now' };
    setChatMessages((prev) => [...prev, newMsg]);
  };
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updated };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
  };
  const handleAddEndorsement = (targetUserId: string, skill: string) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetUserId) {
          const existing = u.endorsements.find((e) => e.skill.toLowerCase() === skill.toLowerCase());
          if (existing) {
            if (existing.endorsedBy.includes(currentUser.name)) return u;
            return {
              ...u,
              endorsements: u.endorsements.map((e) =>
                e.skill.toLowerCase() === skill.toLowerCase()
                  ? { ...e, count: e.count + 1, endorsedBy: [...e.endorsedBy, currentUser.name] }
                  : e
              ),
            };
          } else {
            return { ...u, endorsements: [...u.endorsements, { skill, count: 1, endorsedBy: [currentUser.name] }] };
          }
        }
        return u;
      })
    );
  };
  const handleApproveBusiness = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, verificationStatus: 'verified', businessDetails: u.businessDetails ? { ...u.businessDetails, approvalStatus: 'approved' } : undefined } : u
      )
    );
  };
  const handleRejectBusiness = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, verificationStatus: 'rejected', businessDetails: u.businessDetails ? { ...u.businessDetails, approvalStatus: 'rejected' } : undefined } : u
      )
    );
  };
  const handleApproveOpportunity = (oppId: string) => setOpportunities((prev) => prev.map((o) => (o.id === oppId ? { ...o, status: 'approved' } : o)));
  const handleRejectOpportunity = (oppId: string) => setOpportunities((prev) => prev.map((o) => (o.id === oppId ? { ...o, status: 'rejected' } : o)));
  const handleDeletePost = (postId: string) => setPosts((prev) => prev.filter((p) => p.id !== postId));
  const handleCreateEvent = (event: RichfieldEvent) => setEvents((prev) => [event, ...prev]);
  const handleDeleteEvent = (eventId: string) => setEvents((prev) => prev.filter((e) => e.id !== eventId));
  const handleBroadcastAnnouncement = (title: string, message: string, target: 'all' | 'students' | 'alumni' | 'business') => {
    const newNotif: NotificationItem = {
      id: `ann-${Date.now()}`,
      title: `Richfield Notice: ${title}`,
      message,
      timestamp: 'Just now',
      read: false,
      type: 'announcement',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };
  const handleRegisterSuccess = (newUser: UserProfile) => {
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    const welcomeNotif: NotificationItem = {
      id: `welcome-${Date.now()}`,
      title: 'Verification Confirmed',
      message: `Welcome to Enrich, ${newUser.name}! Your ${newUser.role} profile is active.`,
      timestamp: 'Just now',
      read: false,
      type: 'verification',
    };
    setNotifications((prev) => [welcomeNotif, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        users,
        setUsers,
        currentUser,
        setCurrentUser,
        posts,
        setPosts,
        opportunities,
        setOpportunities,
        events,
        setEvents,
        notifications,
        setNotifications,
        connections,
        setConnections,
        chatMessages,
        setChatMessages,
        handleAddPost,
        handleLikePost,
        handleAddComment,
        handleApplyOpportunity,
        handlePostOpportunity,
        handleRsvpEvent,
        handleSendConnectionRequest,
        handleAcceptConnectionRequest,
        handleDeclineConnectionRequest,
        handleSendMessage,
        handleUpdateProfile,
        handleAddEndorsement,
        handleApproveBusiness,
        handleRejectBusiness,
        handleApproveOpportunity,
        handleRejectOpportunity,
        handleDeletePost,
        handleCreateEvent,
        handleDeleteEvent,
        handleBroadcastAnnouncement,
        handleRegisterSuccess,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
