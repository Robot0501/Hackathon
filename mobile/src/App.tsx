import React, { useEffect, useState } from 'react';
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
import { supabase, isUuid } from './lib/supabase';
import { fetchProfile } from './lib/profile';
import {
  addComment,
  addEndorsement,
  addPost,
  applyForOpportunity,
  broadcastAnnouncement,
  createEvent,
  createNotification,
  deleteEvent,
  deletePost,
  loadPlatformData,
  markAllNotificationsRead,
  markNotificationRead,
  postOpportunity,
  sendConnectionRequest,
  sendMessage,
  setBusinessApproval,
  setConnectionStatus,
  setOpportunityStatus,
  toggleEventRsvp,
  togglePostLike,
  updateProfile,
} from './lib/enrichData';

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [registerInitialRole, setRegisterInitialRole] = useState<UserRole>('student');

  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [events, setEvents] = useState<RichfieldEvent[]>(MOCK_EVENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [connections, setConnections] = useState<Record<string, 'pending' | 'accepted' | 'declined'>>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const isRealUser = Boolean(currentUser && isUuid(currentUser.id));

  const refreshPlatform = async (user: UserProfile) => {
    if (!isUuid(user.id)) return;
    try {
      const data = await loadPlatformData(user.id);
      setUsers(data.users.length ? data.users : [user]);
      setPosts(data.posts);
      setOpportunities(data.opportunities);
      setEvents(data.events);
      setNotifications(data.notifications);
      setConnections(data.connections);
      setChatMessages(data.chatMessages);
    } catch (error) {
      console.error('Failed to load Supabase platform data:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const restore = async () => {
      const { data } = await supabase.auth.getSession();
      const authUser = data.session?.user;
      if (!authUser || !mounted) return;

      const profile = await fetchProfile(authUser.id);
      if (!profile || !mounted) return;
      setCurrentUser(profile);
      setActiveTab(profile.role === 'admin' ? 'admin' : 'feed');
      await refreshPlatform(profile);
    };

    restore();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && mounted) setCurrentUser(null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (currentUser && isUuid(currentUser.id)) {
      refreshPlatform(currentUser);
    }
  }, [currentUser?.id]);

  const handleLogout = async () => {
    if (isRealUser) await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveTab('feed');
    setUsers(MOCK_USERS);
    setPosts(MOCK_POSTS);
    setOpportunities(MOCK_OPPORTUNITIES);
    setEvents(MOCK_EVENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setConnections({});
    setChatMessages([]);
  };

  const handleAddPost = async (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    if (!isRealUser) return;
    try { await addPost(newPost); }
    catch (error) { console.error(error); await refreshPlatform(currentUser!); }
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    if (!isRealUser) {
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, hasLiked: !p.hasLiked, likes: p.hasLiked ? p.likes - 1 : p.likes + 1 } : p));
      return;
    }

    try {
      const liked = await togglePostLike(postId, currentUser.id);
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, hasLiked: liked, likes: p.likes + (liked ? 1 : -1) } : p));
    } catch (error) { console.error(error); }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    if (!currentUser) return;
    if (!isRealUser) {
      const localComment = {
        id: `comm-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        authorAvatar: currentUser.avatar,
        content: commentText,
        timestamp: 'Just now',
      };
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comments: [...p.comments, localComment] } : p));
      return;
    }

    try {
      const comment = await addComment(postId, currentUser, commentText);
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
    } catch (error) { console.error(error); }
  };

  const handleApplyOpportunity = async (oppId: string) => {
    if (!currentUser) return;
    setOpportunities((prev) => prev.map((o) => o.id === oppId ? { ...o, applied: true, applicantsCount: o.applicantsCount + (o.applied ? 0 : 1) } : o));
    const targetOpp = opportunities.find((o) => o.id === oppId);
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Application Dispatched',
      message: `Your verified Richfield dossier has been submitted for: ${targetOpp?.title || 'Graduate Role'}.`,
      timestamp: 'Just now', read: false, type: 'opportunity'
    };
    setNotifications((prev) => [notif, ...prev]);
    if (!isRealUser) return;
    try {
      await applyForOpportunity(oppId, currentUser.id);
      await createNotification(currentUser.id, notif);
    } catch (error) { console.error(error); }
  };

  const handlePostOpportunity = async (newOpp: Opportunity) => {
    if (!currentUser) return;
    setOpportunities((prev) => [newOpp, ...prev]);
    if (newOpp.status === 'pending_approval') {
      const notif: NotificationItem = {
        id: `notif-biz-${Date.now()}`,
        title: 'Opportunity Under Vetting',
        message: `Your posting "${newOpp.title}" has been submitted to the Richfield Placement Office for approval.`,
        timestamp: 'Just now', read: false, type: 'opportunity'
      };
      setNotifications((prev) => [notif, ...prev]);
      if (isRealUser) await createNotification(currentUser.id, notif).catch(console.error);
    }
    if (!isRealUser) return;
    await postOpportunity(newOpp, currentUser.id).catch(console.error);
  };

  const handleRsvpEvent = async (eventId: string) => {
    if (!currentUser) return;
    if (!isRealUser) {
      setEvents((prev) => prev.map((ev) => ev.id === eventId ? { ...ev, hasRsvp: !ev.hasRsvp, rsvpCount: ev.hasRsvp ? ev.rsvpCount - 1 : ev.rsvpCount + 1 } : ev));
      return;
    }
    try {
      const active = await toggleEventRsvp(eventId, currentUser.id);
      setEvents((prev) => prev.map((ev) => ev.id === eventId ? { ...ev, hasRsvp: active, rsvpCount: ev.rsvpCount + (active ? 1 : -1) } : ev));
    } catch (error) { console.error(error); }
  };

  const handleSendConnectionRequest = async (targetUserId: string) => {
    if (!currentUser) return;
    setConnections((prev) => ({ ...prev, [targetUserId]: 'pending' }));
    if (!isRealUser || !isUuid(targetUserId)) return;
    await sendConnectionRequest(currentUser.id, targetUserId).catch(console.error);
  };

  const handleAcceptConnectionRequest = async (targetUserId: string) => {
    if (!currentUser) return;
    setConnections((prev) => ({ ...prev, [targetUserId]: 'accepted' }));
    if (!isRealUser || !isUuid(targetUserId)) return;
    await setConnectionStatus(currentUser.id, targetUserId, 'accepted').catch(console.error);
  };

  const handleDeclineConnectionRequest = async (targetUserId: string) => {
    if (!currentUser) return;
    setConnections((prev) => ({ ...prev, [targetUserId]: 'declined' }));
    if (!isRealUser || !isUuid(targetUserId)) return;
    await setConnectionStatus(currentUser.id, targetUserId, 'declined').catch(console.error);
  };

  const handleSendMessage = async (receiverId: string, text: string) => {
    if (!currentUser) return;
    const newMsg: ChatMessage = { id: `msg-${Date.now()}`, senderId: currentUser.id, receiverId, text, timestamp: 'Just now' };
    setChatMessages((prev) => [...prev, newMsg]);
    if (!isRealUser || !isUuid(receiverId)) return;
    await sendMessage(newMsg).catch(console.error);
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updated };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => u.id === currentUser.id ? updatedUser : u));
    if (!isRealUser) return;
    await updateProfile(updatedUser).catch(console.error);
  };

  const handleAddEndorsement = async (targetUserId: string, skill: string) => {
    if (!currentUser) return;
    setUsers((prev) => prev.map((u) => {
      if (u.id !== targetUserId) return u;
      const existing = u.endorsements.find((e) => e.skill.toLowerCase() === skill.toLowerCase());
      if (existing?.endorsedBy.includes(currentUser.name)) return u;
      if (existing) return { ...u, endorsements: u.endorsements.map((e) => e.skill.toLowerCase() === skill.toLowerCase() ? { ...e, count: e.count + 1, endorsedBy: [...e.endorsedBy, currentUser.name] } : e) };
      return { ...u, endorsements: [...u.endorsements, { skill, count: 1, endorsedBy: [currentUser.name] }] };
    }));
    if (!isRealUser || !isUuid(targetUserId)) return;
    await addEndorsement(targetUserId, skill, currentUser).catch(console.error);
  };

  const handleApproveBusiness = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, verificationStatus: 'verified', businessDetails: u.businessDetails ? { ...u.businessDetails, approvalStatus: 'approved' } : undefined } : u));
    if (isRealUser && isUuid(userId)) await setBusinessApproval(user, 'approved').catch(console.error);
  };

  const handleRejectBusiness = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, verificationStatus: 'rejected', businessDetails: u.businessDetails ? { ...u.businessDetails, approvalStatus: 'rejected' } : undefined } : u));
    if (isRealUser && isUuid(userId)) await setBusinessApproval(user, 'rejected').catch(console.error);
  };

  const handleApproveOpportunity = async (oppId: string) => {
    setOpportunities((prev) => prev.map((o) => o.id === oppId ? { ...o, status: 'approved' } : o));
    if (isRealUser) await setOpportunityStatus(oppId, 'approved').catch(console.error);
  };

  const handleRejectOpportunity = async (oppId: string) => {
    setOpportunities((prev) => prev.map((o) => o.id === oppId ? { ...o, status: 'rejected' } : o));
    if (isRealUser) await setOpportunityStatus(oppId, 'rejected').catch(console.error);
  };

  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    if (isRealUser) await deletePost(postId).catch(console.error);
  };

  const handleCreateEvent = async (event: RichfieldEvent) => {
    setEvents((prev) => [event, ...prev]);
    if (isRealUser) await createEvent(event).catch(console.error);
  };

  const handleDeleteEvent = async (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    if (isRealUser) await deleteEvent(eventId).catch(console.error);
  };

  const handleBroadcastAnnouncement = async (
    title: string,
    message: string,
    target: 'all' | 'students' | 'alumni' | 'business'
  ) => {
    const newNotif: NotificationItem = { id: `ann-${Date.now()}`, title: `Richfield Notice: ${title}`, message, timestamp: 'Just now', read: false, type: 'announcement' };
    setNotifications((prev) => [newNotif, ...prev]);
    if (isRealUser) await broadcastAnnouncement(title, message, target).catch(console.error);
  };

  const handleMarkNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    if (isRealUser) await markNotificationRead(id).catch(console.error);
  };

  const handleClearAllNotifications = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (currentUser && isRealUser) await markAllNotificationsRead(currentUser.id).catch(console.error);
  };

  const handleRegisterSuccess = async (newUser: UserProfile) => {
    setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
    setCurrentUser(newUser);
    setActiveTab(newUser.role === 'admin' ? 'admin' : 'profile');
    const welcomeNotif: NotificationItem = {
      id: `welcome-${Date.now()}`,
      title: 'Institutional Verification Confirmed',
      message: `Welcome to Enrich for Richfield College, ${newUser.name}! Your ${newUser.role} profile is active.`,
      timestamp: 'Just now', read: false, type: 'verification'
    };
    setNotifications((prev) => [welcomeNotif, ...prev]);
    if (isUuid(newUser.id)) await createNotification(newUser.id, welcomeNotif).catch(console.error);
  };

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
            onLogout={handleLogout}
            isMobileFrame={isMobileFrame}
            onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onClearAllNotifications={handleClearAllNotifications}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Distinct Role Context Banner */}
          <RoleContextBanner
            currentUser={currentUser}
            onNavigateTab={setActiveTab}
            onLogout={handleLogout}
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
