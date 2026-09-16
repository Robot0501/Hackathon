import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChatMessage,
  NotificationItem,
  Opportunity,
  Post,
  QuestionThread,
  RichfieldEvent,
  UserProfile,
} from '../types';
import { getProfile, signOut as authSignOut } from '../lib/authService';
import { supabase } from '../lib/supabase';
import {
  ApplicationFormData,
  addComment,
  addEndorsement,
  adminSetBusinessStatus,
  answerQuestion,
  applyToOpportunity,
  askQuestion,
  broadcastAnnouncement,
  createEvent,
  createOpportunity,
  createPost,
  deleteEvent,
  deletePost,
  listConnections,
  listEvents,
  listMessages,
  listNotifications,
  listOpportunities,
  listPosts,
  listProfiles,
  listQuestions,
  sendConnectionRequest,
  sendMessage,
  setConnectionStatus,
  setOpportunityStatus,
  toggleEventRsvp,
  togglePostLike,
  updateOwnProfile,
} from '../lib/dataService';

export type ConnectionState = 'pending_incoming' | 'pending_outgoing' | 'accepted' | 'declined';
type Connections = { [userId: string]: ConnectionState };

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
  questions: QuestionThread[];
  isBootstrapping: boolean;
  isFirstVisit: boolean;
  markWelcomeSeen: () => void;
  refreshSession: () => Promise<UserProfile | null>;
  refreshAll: () => Promise<void>;
  signOutUser: () => Promise<void>;
  handleAddPost: (p: Post) => void;
  handleLikePost: (id: string) => void;
  handleAddComment: (postId: string, text: string) => void;
  handleApplyOpportunity: (oppId: string, form?: ApplicationFormData) => void;
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
  handleAskQuestion: (title: string, body: string) => void;
  handleAnswerQuestion: (questionId: string, content: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [events, setEvents] = useState<RichfieldEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [connections, setConnections] = useState<Connections>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [questions, setQuestions] = useState<QuestionThread[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  const clearData = useCallback(() => {
    setCurrentUser(null);
    setUsers([]);
    setPosts([]);
    setOpportunities([]);
    setEvents([]);
    setNotifications([]);
    setConnections({});
    setChatMessages([]);
    setQuestions([]);
    setIsFirstVisit(false);
  }, []);

  const welcomeKey = (userId: string) => `enrich:welcome-seen:${userId}`;

  const syncWelcomeState = useCallback(async (userId: string) => {
    const seen = await AsyncStorage.getItem(welcomeKey(userId));
    setIsFirstVisit(seen !== '1');
  }, []);

  const markWelcomeSeen = useCallback(() => {
    if (!currentUser) return;
    // Keep the current session showing "Welcome". The next login will show
    // "Welcome back" because this flag is now persisted on the device.
    void AsyncStorage.setItem(welcomeKey(currentUser.id), '1');
  }, [currentUser]);

  const loadDataFor = useCallback(async (profile: UserProfile) => {
    const allProfiles = await listProfiles();
    const visibleProfiles = profile.role === 'admin'
      ? allProfiles
      : allProfiles.filter((u) => (u.verificationStatus === 'verified' || u.id === profile.id) && u.role !== 'admin');

    const [postData, opportunityData, eventData, connectionData, messageData, notificationData, questionData] = await Promise.all([
      listPosts(profile.id, visibleProfiles),
      listOpportunities(profile.id),
      listEvents(profile.id),
      listConnections(profile.id),
      listMessages(profile.id),
      listNotifications(profile.id),
      listQuestions(visibleProfiles),
    ]);

    setUsers(visibleProfiles);
    setPosts(postData);
    setOpportunities(opportunityData);
    setEvents(eventData);
    setConnections(connectionData);
    setChatMessages(messageData);
    setNotifications(notificationData);
    setQuestions(questionData);
  }, []);

  const refreshSession = useCallback(async (): Promise<UserProfile | null> => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const authUser = data.session?.user;
    if (!authUser) {
      clearData();
      return null;
    }

    const profile = await getProfile(authUser.id);
    if (!profile) {
      setCurrentUser(null);
      return null;
    }

    const allowed = profile.role === 'admin'
      ? profile.verificationStatus === 'verified'
      : profile.verificationStatus === 'verified';

    if (!allowed) {
      setCurrentUser(null);
      return profile;
    }

    await syncWelcomeState(profile.id);
    setCurrentUser(profile);
    await loadDataFor(profile);
    return profile;
  }, [clearData, loadDataFor, syncWelcomeState]);

  const refreshAll = useCallback(async () => {
    if (!currentUser) return;
    const fresh = await getProfile(currentUser.id);
    if (!fresh) return;
    setCurrentUser(fresh);
    await loadDataFor(fresh);
  }, [currentUser, loadDataFor]);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        await refreshSession();
      } catch (error) {
        console.error('Supabase startup failed:', error);
        if (mounted) clearData();
      } finally {
        if (mounted) setIsBootstrapping(false);
      }
    };

    void boot();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearData();
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setTimeout(() => void refreshSession().catch((e) => console.error('Session refresh failed:', e)), 0);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [clearData, refreshSession]);

  const signOutUser = async () => {
    await authSignOut();
    clearData();
  };

  const handleAddPost = (newPost: Post) => {
    if (!currentUser) return;
    void (async () => {
      try {
        await createPost(currentUser.id, newPost);
        setPosts(await listPosts(currentUser.id, users));
      } catch (error) { console.error('Create post failed:', error); }
    })();
  };

  const handleLikePost = (postId: string) => {
    if (!currentUser) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, hasLiked: !p.hasLiked, likes: p.likes + (p.hasLiked ? -1 : 1) } : p));
    void togglePostLike(postId, currentUser.id, !!post.hasLiked).catch(async (error) => {
      console.error('Like failed:', error);
      setPosts(await listPosts(currentUser.id, users));
    });
  };

  const handleAddComment = (postId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    void (async () => {
      try {
        await addComment(postId, currentUser.id, text);
        setPosts(await listPosts(currentUser.id, users));
      } catch (error) { console.error('Comment failed:', error); }
    })();
  };

  const handleApplyOpportunity = (oppId: string, form: ApplicationFormData = {}) => {
    if (!currentUser) return;
    void (async () => {
      try {
        await applyToOpportunity(oppId, currentUser.id, {
          name: form.name || currentUser.name,
          email: form.email || currentUser.email,
          phone: form.phone || '',
          availability: form.availability || '',
          motivation: form.motivation || '',
        });
        setOpportunities(await listOpportunities(currentUser.id));
        setNotifications(await listNotifications(currentUser.id));
      } catch (error) { console.error('Application failed:', error); }
    })();
  };

  const handlePostOpportunity = (opp: Opportunity) => {
    if (!currentUser) return;
    void (async () => {
      try {
        await createOpportunity(currentUser.id, opp);
        setOpportunities(await listOpportunities(currentUser.id));
      } catch (error) { console.error('Post opportunity failed:', error); }
    })();
  };

  const handleRsvpEvent = (eventId: string) => {
    if (!currentUser) return;
    const event = events.find((e) => e.id === eventId);
    if (!event) return;
    void (async () => {
      try {
        await toggleEventRsvp(eventId, currentUser.id, event.hasRsvp);
        setEvents(await listEvents(currentUser.id));
      } catch (error) { console.error('RSVP failed:', error); }
    })();
  };

  const handleSendConnectionRequest = (targetUserId: string) => {
    if (!currentUser) return;
    setConnections((prev) => ({ ...prev, [targetUserId]: 'pending_outgoing' }));
    void sendConnectionRequest(currentUser.id, targetUserId).catch((error) => console.error('Connection request failed:', error));
  };

  const handleAcceptConnectionRequest = (targetUserId: string) => {
    if (!currentUser) return;
    void (async () => {
      try {
        await setConnectionStatus(currentUser.id, targetUserId, 'accepted');
        setConnections(await listConnections(currentUser.id));
      } catch (error) { console.error('Accept connection failed:', error); }
    })();
  };

  const handleDeclineConnectionRequest = (targetUserId: string) => {
    if (!currentUser) return;
    void (async () => {
      try {
        await setConnectionStatus(currentUser.id, targetUserId, 'declined');
        setConnections(await listConnections(currentUser.id));
      } catch (error) { console.error('Decline connection failed:', error); }
    })();
  };

  const handleSendMessage = (receiverId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    void (async () => {
      try {
        await sendMessage(currentUser.id, receiverId, text);
        setChatMessages(await listMessages(currentUser.id));
      } catch (error) { console.error('Message failed:', error); }
    })();
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    if (!currentUser) return;
    const optimistic = { ...currentUser, ...updated };
    setCurrentUser(optimistic);
    setUsers((prev) => prev.map((u) => u.id === optimistic.id ? optimistic : u));
    void (async () => {
      try {
        const saved = await updateOwnProfile(currentUser.id, updated);
        setCurrentUser(saved);
        const refreshed = await listProfiles();
        setUsers(saved.role === 'admin' ? refreshed : refreshed.filter((u) => (u.verificationStatus === 'verified' || u.id === saved.id) && u.role !== 'admin'));
      } catch (error) { console.error('Profile update failed:', error); }
    })();
  };

  const handleAddEndorsement = (targetUserId: string, skill: string) => {
    if (!currentUser || !skill.trim() || targetUserId === currentUser.id) return;
    void (async () => {
      try {
        await addEndorsement(targetUserId, currentUser.id, skill);
        const refreshed = await listProfiles();
        setUsers(currentUser.role === 'admin' ? refreshed : refreshed.filter((u) => (u.verificationStatus === 'verified' || u.id === currentUser.id) && u.role !== 'admin'));
      } catch (error) { console.error('Endorsement failed:', error); }
    })();
  };

  const handleApproveBusiness = (userId: string) => {
    void (async () => {
      try {
        await adminSetBusinessStatus(userId, true);
        setUsers(await listProfiles());
      } catch (error) { console.error('Business approval failed:', error); }
    })();
  };

  const handleRejectBusiness = (userId: string) => {
    void (async () => {
      try {
        await adminSetBusinessStatus(userId, false);
        setUsers(await listProfiles());
      } catch (error) { console.error('Business rejection failed:', error); }
    })();
  };

  const handleApproveOpportunity = (oppId: string) => {
    if (!currentUser) return;
    void (async () => {
      try {
        await setOpportunityStatus(oppId, 'approved');
        setOpportunities(await listOpportunities(currentUser.id));
      } catch (error) { console.error('Opportunity approval failed:', error); }
    })();
  };

  const handleRejectOpportunity = (oppId: string) => {
    if (!currentUser) return;
    void (async () => {
      try {
        await setOpportunityStatus(oppId, 'rejected');
        setOpportunities(await listOpportunities(currentUser.id));
      } catch (error) { console.error('Opportunity rejection failed:', error); }
    })();
  };

  const handleDeletePost = (postId: string) => {
    if (!currentUser) return;
    void (async () => {
      try {
        await deletePost(postId);
        setPosts(await listPosts(currentUser.id, users));
      } catch (error) { console.error('Delete post failed:', error); }
    })();
  };

  const handleCreateEvent = (event: RichfieldEvent) => {
    if (!currentUser) return;
    void (async () => {
      try {
        await createEvent(currentUser.id, event);
        setEvents(await listEvents(currentUser.id));
      } catch (error) { console.error('Create event failed:', error); }
    })();
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!currentUser) return;
    void (async () => {
      try {
        await deleteEvent(eventId);
        setEvents(await listEvents(currentUser.id));
      } catch (error) { console.error('Delete event failed:', error); }
    })();
  };

  const handleBroadcastAnnouncement = (title: string, message: string, target: 'all' | 'students' | 'alumni' | 'business') => {
    if (!currentUser) return;
    void (async () => {
      try {
        await broadcastAnnouncement(title, message, target);
        setNotifications(await listNotifications(currentUser.id));
      } catch (error) { console.error('Broadcast failed:', error); }
    })();
  };

  const handleAskQuestion = (title: string, body: string) => {
    if (!currentUser) return;
    void (async () => {
      try {
        await askQuestion(currentUser.id, title, body);
        setQuestions(await listQuestions(users));
      } catch (error) { console.error('Question failed:', error); }
    })();
  };

  const handleAnswerQuestion = (questionId: string, content: string) => {
    if (!currentUser) return;
    void (async () => {
      try {
        await answerQuestion(currentUser.id, questionId, content);
        setQuestions(await listQuestions(users));
      } catch (error) { console.error('Answer failed:', error); }
    })();
  };

  // Kept for compatibility with older UI code. Real registration now uses Supabase Auth.
  const handleRegisterSuccess = (newUser: UserProfile) => {
    setIsFirstVisit(true);
    setCurrentUser(newUser);
    setUsers((prev) => prev.some((u) => u.id === newUser.id) ? prev.map((u) => u.id === newUser.id ? newUser : u) : [newUser, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      users, setUsers, currentUser, setCurrentUser,
      posts, setPosts, opportunities, setOpportunities,
      events, setEvents, notifications, setNotifications,
      connections, setConnections, chatMessages, setChatMessages,
      questions, isBootstrapping, isFirstVisit, markWelcomeSeen, refreshSession, refreshAll, signOutUser,
      handleAddPost, handleLikePost, handleAddComment, handleApplyOpportunity,
      handlePostOpportunity, handleRsvpEvent, handleSendConnectionRequest,
      handleAcceptConnectionRequest, handleDeclineConnectionRequest, handleSendMessage,
      handleUpdateProfile, handleAddEndorsement, handleApproveBusiness, handleRejectBusiness,
      handleApproveOpportunity, handleRejectOpportunity, handleDeletePost, handleCreateEvent,
      handleDeleteEvent, handleBroadcastAnnouncement, handleRegisterSuccess,
      handleAskQuestion, handleAnswerQuestion,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
