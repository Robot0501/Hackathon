import React, { useState } from 'react';
import {
  MOCK_USERS,
  MOCK_OPPORTUNITIES,
  MOCK_POSTS,
  MOCK_EVENTS,
  INITIAL_NOTIFICATIONS
} from './data/mockData';
import {
  UserProfile,
  UserRole,
  Post,
  Opportunity,
  RichfieldEvent,
  ChatMessage,
  NotificationItem
} from './types';
import { HomePage } from './components/HomePage';
import { Header } from './components/Header';
import { RoleContextBanner } from './components/RoleContextBanner';
import { Navigation } from './components/Navigation';
import { FeedView } from './components/FeedView';
import { OpportunitiesView } from './components/OpportunitiesView';
import { NetworkView } from './components/NetworkView';
import { AIAssistantView } from './components/AIAssistantView';
import { AnalyticsView } from './components/AnalyticsView';
import { AdminPanelView } from './components/AdminPanelView';
import { ProfileView } from './components/ProfileView';
import { VerificationModal } from './components/VerificationModal';
import { LoginModal } from './components/LoginModal';

export default function App() {
  // App state
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  // Default to null so user arrives at the HomePage where registration and first-time login begin
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [registerInitialRole, setRegisterInitialRole] = useState<UserRole>('student');

  // Platform Collections
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [events, setEvents] = useState<RichfieldEvent[]>(MOCK_EVENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Networking & Chat State
  const [connections, setConnections] = useState<{ [userId: string]: 'pending' | 'accepted' | 'declined' }>({
    'user-alumni-1': 'accepted',
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      senderId: 'user-alumni-1',
      receiverId: 'user-student-1',
      text: 'Sawubona! Impressive work on your React portfolio. Are you attending the Richfield recruitment session next Tuesday?',
      timestamp: 'Yesterday at 14:20'
    },
    {
      id: 'msg-init-2',
      senderId: 'user-student-1',
      receiverId: 'user-alumni-1',
      text: 'Thanks Lerato! Yes, I registered and uploaded my pitch video on Enrich. Would love any tips you have for standard graduate assessments.',
      timestamp: 'Yesterday at 15:05'
    }
  ]);

  // Feed Actions
  const handleAddPost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasLiked = !p.hasLiked;
          return {
            ...p,
            hasLiked,
            likes: hasLiked ? p.likes + 1 : p.likes - 1,
          };
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
          return {
            ...p,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );
  };

  // Opportunities Actions
  const handleApplyOpportunity = (oppId: string) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === oppId ? { ...o, applied: true, applicantsCount: o.applicantsCount + 1 } : o))
    );

    const targetOpp = opportunities.find((o) => o.id === oppId);
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Application Dispatched',
      message: `Your verified Richfield dossier has been submitted for: ${targetOpp?.title || 'Graduate Role'}.`,
      timestamp: 'Just now',
      read: false,
      type: 'opportunity'
    };
    setNotifications([notif, ...notifications]);
  };

  const handlePostOpportunity = (newOpp: Opportunity) => {
    setOpportunities([newOpp, ...opportunities]);
    if (newOpp.status === 'pending_approval') {
      const notif: NotificationItem = {
        id: `notif-biz-${Date.now()}`,
        title: 'Opportunity Under Vetting',
        message: `Your posting "${newOpp.title}" has been submitted to the Richfield Placement Office for approval.`,
        timestamp: 'Just now',
        read: false,
        type: 'opportunity'
      };
      setNotifications([notif, ...notifications]);
    }
  };

  const handleRsvpEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              hasRsvp: !ev.hasRsvp,
              rsvpCount: ev.hasRsvp ? ev.rsvpCount - 1 : ev.rsvpCount + 1,
            }
          : ev
      )
    );
  };

  // Networking Actions
  const handleSendConnectionRequest = (targetUserId: string) => {
    setConnections((prev) => ({ ...prev, [targetUserId]: 'pending' }));
    const target = users.find((u) => u.id === targetUserId);
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Connection Request Sent',
      message: `Your invitation was sent to ${target?.name || 'Richfield member'}.`,
      timestamp: 'Just now',
      read: false,
      type: 'connection'
    };
    setNotifications([notif, ...notifications]);
  };

  const handleAcceptConnectionRequest = (targetUserId: string) => {
    setConnections((prev) => ({ ...prev, [targetUserId]: 'accepted' }));
  };

  const handleDeclineConnectionRequest = (targetUserId: string) => {
    setConnections((prev) => ({ ...prev, [targetUserId]: 'declined' }));
  };

  const handleSendMessage = (receiverId: string, text: string) => {
    if (!currentUser) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      text,
      timestamp: 'Just now',
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Profile Updates & Endorsements
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
            return {
              ...u,
              endorsements: [
                ...u.endorsements,
                { skill, count: 1, endorsedBy: [currentUser.name] },
              ],
            };
          }
        }
        return u;
      })
    );
  };

  // Admin Actions
  const handleApproveBusiness = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            verificationStatus: 'verified',
            businessDetails: u.businessDetails
              ? { ...u.businessDetails, approvalStatus: 'approved' }
              : undefined,
          };
        }
        return u;
      })
    );
  };

  const handleRejectBusiness = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            verificationStatus: 'rejected',
            businessDetails: u.businessDetails
              ? { ...u.businessDetails, approvalStatus: 'rejected' }
              : undefined,
          };
        }
        return u;
      })
    );
  };

  const handleApproveOpportunity = (oppId: string) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === oppId ? { ...o, status: 'approved' } : o))
    );
  };

  const handleRejectOpportunity = (oppId: string) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === oppId ? { ...o, status: 'rejected' } : o))
    );
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleCreateEvent = (event: RichfieldEvent) => {
    setEvents([event, ...events]);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const handleBroadcastAnnouncement = (
    title: string,
    message: string,
    target: 'all' | 'students' | 'alumni' | 'business'
  ) => {
    const newNotif: NotificationItem = {
      id: `ann-${Date.now()}`,
      title: `Richfield Notice: ${title}`,
      message,
      timestamp: 'Just now',
      read: false,
      type: 'announcement'
    };
    setNotifications([newNotif, ...notifications]);
  };

  // Registration callback
  const handleRegisterSuccess = (newUser: UserProfile) => {
    setUsers([newUser, ...users]);
    setCurrentUser(newUser);
    setActiveTab(newUser.role === 'admin' ? 'admin' : 'profile');

    const welcomeNotif: NotificationItem = {
      id: `welcome-${Date.now()}`,
      title: 'Institutional Verification Confirmed',
      message: `Welcome to Enrich for Richfield College, ${newUser.name}! Your ${newUser.role} profile is active.`,
      timestamp: 'Just now',
      read: false,
      type: 'verification'
    };
    setNotifications([welcomeNotif, ...notifications]);
  };

  // Handle opening registration from any entry point
  const handleOpenRegistration = (role: UserRole = 'student') => {
    setRegisterInitialRole(role);
    setIsAuthModalOpen(true);
  };

  return (
    <div
      className={`min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 transition-all ${
        isMobileFrame ? 'max-w-md mx-auto my-4 shadow-2xl rounded-3xl border-8 border-slate-800 overflow-hidden min-h-[850px]' : ''
      }`}
    >
      {currentUser ? (
        <>
          {/* Top Application Header */}
          <Header
            currentUser={currentUser}
            allUsers={users}
            onSwitchUser={(user) => {
              setCurrentUser(user);
              if (user.role === 'admin') setActiveTab('admin');
            }}
            onOpenAuthModal={() => handleOpenRegistration('student')}
            onLogout={() => setCurrentUser(null)}
            isMobileFrame={isMobileFrame}
            onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
            notifications={notifications}
            onMarkNotificationRead={(id) =>
              setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
              )
            }
            onClearAllNotifications={() =>
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
            }
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Distinct Role Context Banner */}
          <RoleContextBanner
            currentUser={currentUser}
            onNavigateTab={setActiveTab}
            onLogout={() => setCurrentUser(null)}
          />

          {/* Main Tab Navigation */}
          <Navigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userRole={currentUser.role}
            unreadMessagesCount={chatMessages.length > 0 ? 1 : 0}
          />

          {/* Main Content Area */}
          <main className="flex-1 p-3 sm:p-5 max-w-7xl w-full mx-auto pb-20 md:pb-8">
            {activeTab === 'feed' && (
              <FeedView
                currentUser={currentUser}
                posts={posts}
                onAddPost={handleAddPost}
                onLikePost={handleLikePost}
                onAddComment={handleAddComment}
              />
            )}

            {activeTab === 'opportunities' && (
              <OpportunitiesView
                currentUser={currentUser}
                opportunities={opportunities}
                events={events}
                onApply={handleApplyOpportunity}
                onPostOpportunity={handlePostOpportunity}
                onRsvpEvent={handleRsvpEvent}
              />
            )}

            {activeTab === 'network' && (
              <NetworkView
                currentUser={currentUser}
                allUsers={users}
                connections={connections}
                onSendConnectionRequest={handleSendConnectionRequest}
                onAcceptConnectionRequest={handleAcceptConnectionRequest}
                onDeclineConnectionRequest={handleDeclineConnectionRequest}
                chatMessages={chatMessages}
                onSendMessage={handleSendMessage}
              />
            )}

            {(activeTab === 'ai-assistant' || activeTab === 'ai_assistant') && (
              <AIAssistantView
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPanelView
                users={users}
                opportunities={opportunities}
                events={events}
                posts={posts}
                onApproveBusiness={handleApproveBusiness}
                onRejectBusiness={handleRejectBusiness}
                onApproveOpportunity={handleApproveOpportunity}
                onRejectOpportunity={handleRejectOpportunity}
                onDeletePost={handleDeletePost}
                onCreateEvent={handleCreateEvent}
                onDeleteEvent={handleDeleteEvent}
                onBroadcastAnnouncement={handleBroadcastAnnouncement}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                user={currentUser}
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
                onAddEndorsement={handleAddEndorsement}
              />
            )}
          </main>
        </>
      ) : (
        /* Unauthenticated Home Page where users start their registration or sign in */
        <HomePage
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenRegister={handleOpenRegistration}
          onQuickDemoLogin={(user) => {
            setCurrentUser(user);
            setActiveTab(user.role === 'admin' ? 'admin' : 'feed');
          }}
          availableDemoUsers={users}
        />
      )}

      {/* Institutional Verification / Registration Modal */}
      <VerificationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
        initialRole={registerInitialRole}
        onSwitchToLogin={() => {
          setIsAuthModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* First-Time Sign In / Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab(user.role === 'admin' ? 'admin' : 'feed');
        }}
        onSwitchToRegister={(role) => {
          setIsLoginModalOpen(false);
          handleOpenRegistration(role || 'student');
        }}
        availableUsers={users}
      />
    </div>
  );
}
