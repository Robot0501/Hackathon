import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Search, GraduationCap, Briefcase, Building2, MessageSquare, UserPlus, CheckCircle2, Trophy, Send, MapPin } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { theme } from '../theme';

export default function NetworkScreen() {
  const { currentUser, users, connections, handleSendConnectionRequest, chatMessages, handleSendMessage } = useApp();
  const [activeTab, setActiveTab] = useState<'discover' | 'messages' | 'questions' | 'leaderboard'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const isBusiness = currentUser?.role === 'business';
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'alumni' | 'business'>(isBusiness ? 'student' : 'all');
  const [selectedChatUser, setSelectedChatUser] = useState<any>(users.find((u) => u.id !== currentUser?.id) || null);
  const [messageInput, setMessageInput] = useState('');
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionBody, setQuestionBody] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [questionThreads, setQuestionThreads] = useState([
    { id: 'q-1', authorName: 'Lerato Mokoena', authorRole: 'alumni', title: 'How should I prepare for my first software engineering interview?', body: 'I have a strong portfolio but I am nervous about the technical interview process. What kinds of questions should I expect?', answers: [{ id: 'a-1', authorName: 'Aphiwe Ndlovu', content: 'Practice problem-solving out loud and explain your thinking.', timestamp: '2h ago' }] },
    { id: 'q-2', authorName: 'Nandi Khumalo', authorRole: 'student', title: 'Where is the best place to look for internship opportunities?', body: 'I am in my final year and want to start applying early. Are there channels students should use?', answers: [{ id: 'a-3', authorName: 'Tinashe Dlamini', content: 'Use campus placement channels and alumni referrals.', timestamp: '5h ago' }] },
  ]);

  if (!currentUser) return null;

  const otherUsers = users.filter((u) => u.id !== currentUser.id);
  const filteredUsers = otherUsers.filter((u) => {
    if (isBusiness && u.role !== 'student') return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.campus?.toLowerCase().includes(q) && !u.programme?.toLowerCase().includes(q) && !u.technicalSkills.some((s) => s.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const conversation = chatMessages.filter((m) => (m.senderId === currentUser.id && m.receiverId === selectedChatUser?.id) || (m.senderId === selectedChatUser?.id && m.receiverId === currentUser.id));

  const leaderboard = [...users].map((u) => ({ name: u.name, role: u.role, score: 18 + u.technicalSkills.length * 2 + u.endorsements.reduce((s, e) => s + e.count, 0) })).sort((a, b) => b.score - a.score).slice(0, 10);

  const handleAsk = () => {
    if (!questionTitle.trim() || !questionBody.trim()) return;
    setQuestionThreads((prev) => [{ id: `q-${Date.now()}`, authorName: currentUser.name, authorRole: currentUser.role, title: questionTitle.trim(), body: questionBody.trim(), answers: [] }, ...prev]);
    setQuestionTitle(''); setQuestionBody('');
  };

  const handleAnswer = (qid: string) => {
    const draft = (answerDrafts[qid] || '').trim();
    if (!draft) return;
    setQuestionThreads((prev) => prev.map((t) => t.id === qid ? { ...t, answers: [...t.answers, { id: `a-${Date.now()}`, authorName: currentUser.name, content: draft, timestamp: 'Just now' }] } : t));
    setAnswerDrafts((p) => ({ ...p, [qid]: '' }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Richfield Professional Network</Text><Text style={styles.headerSub}>Connect with verified students, alumni mentors, and enterprise recruiters.</Text>
        <View style={styles.pillsRow}>
          {[
            { id: 'discover', label: 'Discover', icon: Search },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'questions', label: 'Q&A', icon: MessageSquare },
            { id: 'leaderboard', label: 'Leaders', icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id as any)} style={[styles.pill, active && styles.pillActive]}>
                <Icon color={active ? theme.colors.navy : theme.colors.slate500} size={12} /><Text style={[styles.pillText, active && styles.pillTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'discover' && (
          <>
            <View style={styles.searchCard}>
              <View style={styles.searchWrap}><Search color={theme.colors.slate400} size={14} /><TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search by name, campus, programme, or skills..." style={styles.searchInput} placeholderTextColor={theme.colors.slate400} /></View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {(isBusiness ? [{ id: 'student', label: 'Student Talent' }] : [{ id: 'all', label: 'All Community' }, { id: 'student', label: 'Students' }, { id: 'alumni', label: 'Alumni' }, { id: 'business', label: 'Recruiters' }]).map((pill: any) => (
                    <TouchableOpacity key={pill.id} onPress={() => setRoleFilter(pill.id)} style={[styles.filterPill, roleFilter === pill.id && styles.filterActive]}><Text style={[styles.filterText, roleFilter === pill.id && styles.filterActiveText]}>{pill.label}</Text></TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            {filteredUsers.map((user) => {
              const status = connections[user.id];
              return (
                <View key={user.id} style={styles.userCard}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                    <View style={{ flex: 1 }}><View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><Text style={styles.userName}>{user.name}</Text>{user.verificationStatus === 'verified' && <CheckCircle2 color={theme.colors.darkCyan} size={12} />}</View><Text style={styles.userHeadline} numberOfLines={1}>{user.headline}</Text><View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}><MapPin color={theme.colors.darkCyan} size={10} /><Text style={styles.userMeta} numberOfLines={1}>{user.campus}</Text></View></View>
                  </View>
                  <View style={styles.skillRow}>{user.technicalSkills.slice(0, 3).map((s) => <View key={s} style={styles.skillTag}><Text style={styles.skillText}>{s}</Text></View>)}</View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.btnGhost} onPress={() => { setSelectedChatUser(user); setActiveTab('messages'); }}><MessageSquare color={theme.colors.darkCyan} size={12} /><Text style={styles.btnGhostText}>Message</Text></TouchableOpacity>
                    {status === 'accepted' ? <View style={styles.connected}><CheckCircle2 color={theme.colors.darkCyan} size={12} /><Text style={styles.connectedText}>Connected</Text></View> : status === 'pending' ? <View style={styles.pending}><Text style={styles.pendingText}>Request Pending</Text></View> : <TouchableOpacity style={styles.btnPrimary} onPress={() => handleSendConnectionRequest(user.id)}><UserPlus color="#fff" size={12} /><Text style={styles.btnPrimaryText}>Connect</Text></TouchableOpacity>}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {activeTab === 'messages' && (
          <>
            <View style={styles.chatPicker}>
              <Text style={styles.sectionTitle}>Conversations</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {otherUsers.map((u) => {
                    const selected = selectedChatUser?.id === u.id;
                    return (
                      <TouchableOpacity key={u.id} onPress={() => setSelectedChatUser(u)} style={[styles.chatUserPill, selected && styles.chatUserActive]}>
                        <Image source={{ uri: u.avatar }} style={styles.chatAvatar} /><Text style={[styles.chatUserName, selected && { color: theme.colors.navy }]} numberOfLines={1}>{u.name.split(' ')[0]}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
              {selectedChatUser && (
                <View style={styles.chatHeader}><Image source={{ uri: selectedChatUser.avatar }} style={styles.chatAvatarLarge} /><View><Text style={styles.chatName}>{selectedChatUser.name}</Text><Text style={styles.chatMeta}>{selectedChatUser.role} • {selectedChatUser.campus}</Text></View></View>
              )}
            </View>
            <View style={styles.chatBox}>
              {conversation.length === 0 ? <View style={styles.emptyChat}><MessageSquare color={theme.colors.slate300} size={28} /><Text style={styles.emptyTitle}>Start the conversation</Text><Text style={styles.emptySub}>Send a message to {selectedChatUser?.name} to discuss projects or career tips.</Text></View> : conversation.map((m) => {
                const isMe = m.senderId === currentUser.id;
                return <View key={m.id} style={[styles.msgRow, isMe ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}><View style={[styles.msgBubble, isMe ? styles.msgMe : styles.msgOther]}><Text style={[styles.msgText, isMe && { color: '#fff' }]}>{m.text}</Text></View><Text style={styles.msgTime}>{m.timestamp}</Text></View>;
              })}
              <View style={styles.msgInputRow}><TextInput value={messageInput} onChangeText={setMessageInput} placeholder={`Message ${selectedChatUser?.name || ''}...`} style={styles.msgInput} placeholderTextColor={theme.colors.slate400} onSubmitEditing={() => { if (!selectedChatUser || !messageInput.trim()) return; handleSendMessage(selectedChatUser.id, messageInput.trim()); setMessageInput(''); }} /><TouchableOpacity style={styles.sendBtn} onPress={() => { if (!selectedChatUser || !messageInput.trim()) return; handleSendMessage(selectedChatUser.id, messageInput.trim()); setMessageInput(''); }}><Send color="#fff" size={14} /></TouchableOpacity></View>
            </View>
          </>
        )}

        {activeTab === 'questions' && (
          <>
            <View style={styles.qComposer}><Text style={styles.sectionTitle}>Ask the Richfield Community</Text><TextInput value={questionTitle} onChangeText={setQuestionTitle} placeholder="Ask a question about careers, projects, or campus life..." style={styles.input} placeholderTextColor={theme.colors.slate400} /><TextInput value={questionBody} onChangeText={setQuestionBody} placeholder="Add context so others can help you more effectively." style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]} multiline placeholderTextColor={theme.colors.slate400} /><TouchableOpacity style={styles.btnPrimary} onPress={handleAsk}><Text style={styles.btnPrimaryText}>Post Question</Text></TouchableOpacity></View>
            {questionThreads.map((thread) => (
              <View key={thread.id} style={styles.threadCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><View><Text style={styles.threadRole}>{thread.authorRole}</Text><Text style={styles.threadTitle}>{thread.title}</Text></View><View style={styles.replyBadge}><Text style={styles.replyBadgeText}>{thread.answers.length} repl{thread.answers.length === 1 ? 'y' : 'ies'}</Text></View></View>
                <Text style={styles.threadBody}>{thread.body}</Text><Text style={styles.threadMeta}>Asked by {thread.authorName}</Text>
                {thread.answers.map((a: any) => <View key={a.id} style={styles.answer}><Text style={styles.answerAuthor}>{a.authorName}</Text><Text style={styles.answerText}>{a.content}</Text><Text style={styles.answerTime}>{a.timestamp}</Text></View>)}
                {thread.answers.length === 0 && <View style={styles.noAnswer}><Text style={styles.noAnswerText}>No answers yet. Be the first to help.</Text></View>}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}><TextInput value={answerDrafts[thread.id] || ''} onChangeText={(v) => setAnswerDrafts((p) => ({ ...p, [thread.id]: v }))} placeholder="Share your answer..." style={[styles.input, { flex: 1 }]} placeholderTextColor={theme.colors.slate400} /><TouchableOpacity style={styles.btnSmall} onPress={() => handleAnswer(thread.id)}><Text style={styles.btnSmallText}>Reply</Text></TouchableOpacity></View>
              </View>
            ))}
          </>
        )}

        {activeTab === 'leaderboard' && (
          <View style={styles.leaderCard}>
            <Text style={styles.sectionTitle}>This Week’s Top Helpers</Text><Text style={styles.sectionSub}>Community leaders who answered the most questions.</Text>
            {leaderboard.map((p, i) => (
              <View key={p.name} style={styles.leaderRow}>
                <View style={styles.rank}><Text style={styles.rankText}>#{i + 1}</Text></View>
                <View style={{ flex: 1 }}><Text style={styles.leaderName}>{p.name}</Text><Text style={styles.leaderRole}>{p.role}</Text></View>
                <View style={{ alignItems: 'flex-end' }}><Text style={styles.leaderScore}>{p.score}</Text><Text style={styles.leaderSub}>Helpful points</Text></View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.slate50 },
  header: { backgroundColor: '#fff', padding: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.slate200, gap: 8 },
  headerTitle: { fontWeight: '900', fontSize: 14, color: theme.colors.navy },
  headerSub: { fontSize: 10, color: theme.colors.slate500 },
  pillsRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  pill: { flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: theme.colors.slate100, alignItems: 'center' },
  pillActive: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200 },
  pillText: { fontSize: 10, fontWeight: '700', color: theme.colors.slate500 },
  pillTextActive: { color: theme.colors.navy },
  content: { padding: 12, gap: 12, paddingBottom: 24 },
  searchCard: { backgroundColor: '#fff', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.slate200 },
  searchWrap: { flexDirection: 'row', gap: 8, borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 12, paddingHorizontal: 10, height: 38, alignItems: 'center', backgroundColor: '#fff' },
  searchInput: { flex: 1, fontSize: 11, color: theme.colors.navy },
  filterPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: theme.colors.slate100 },
  filterActive: { backgroundColor: theme.colors.navy },
  filterText: { fontSize: 10, fontWeight: '700', color: theme.colors.slate600 },
  filterActiveText: { color: '#fff' },
  userCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.colors.slate200, gap: 10 },
  avatar: { width: 48, height: 48, borderRadius: 12 },
  userName: { fontWeight: '800', fontSize: 12, color: theme.colors.navy },
  userHeadline: { fontSize: 10, color: theme.colors.slate600 },
  userMeta: { fontSize: 10, color: theme.colors.slate400 },
  skillRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  skillTag: { backgroundColor: theme.colors.slate100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  skillText: { fontSize: 9, color: theme.colors.slate600, fontWeight: '600' },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.colors.slate100, paddingTop: 10 },
  btnGhost: { flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.slate200, alignItems: 'center' },
  btnGhostText: { fontSize: 11, fontWeight: '700', color: theme.colors.slate700 },
  btnPrimary: { flexDirection: 'row', gap: 6, backgroundColor: theme.colors.navy, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  connected: { flexDirection: 'row', gap: 6, backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#A7F3D0' },
  connectedText: { color: theme.colors.darkCyan, fontWeight: '800', fontSize: 11 },
  pending: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  pendingText: { color: '#92400E', fontWeight: '800', fontSize: 11 },
  chatPicker: { backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: theme.colors.slate200, gap: 10 },
  sectionTitle: { fontWeight: '800', fontSize: 12, color: theme.colors.navy },
  chatUserPill: { alignItems: 'center', gap: 4, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.slate200, backgroundColor: theme.colors.slate50, width: 70 },
  chatUserActive: { backgroundColor: '#fff', borderColor: theme.colors.darkCyan, borderWidth: 2 },
  chatAvatar: { width: 36, height: 36, borderRadius: 18 },
  chatAvatarLarge: { width: 36, height: 36, borderRadius: 18 },
  chatUserName: { fontSize: 9, color: theme.colors.slate600, textAlign: 'center' },
  chatHeader: { flexDirection: 'row', gap: 10, backgroundColor: theme.colors.slate50, padding: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.slate200 },
  chatName: { fontWeight: '800', fontSize: 12, color: theme.colors.navy },
  chatMeta: { fontSize: 10, color: theme.colors.slate500 },
  chatBox: { backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: theme.colors.slate200, gap: 10, minHeight: 300 },
  emptyChat: { alignItems: 'center', gap: 6, paddingVertical: 30 },
  emptyTitle: { fontWeight: '800', fontSize: 12, color: theme.colors.slate600 },
  emptySub: { fontSize: 10, color: theme.colors.slate400, textAlign: 'center' },
  msgRow: { gap: 4 },
  msgBubble: { maxWidth: '80%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  msgMe: { backgroundColor: theme.colors.navy, borderBottomRightRadius: 4 },
  msgOther: { backgroundColor: theme.colors.slate100, borderBottomLeftRadius: 4 },
  msgText: { fontSize: 11, color: theme.colors.slate700, lineHeight: 16 },
  msgTime: { fontSize: 9, color: theme.colors.slate400 },
  msgInputRow: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: theme.colors.slate100, paddingTop: 10, marginTop: 8 },
  msgInput: { flex: 1, backgroundColor: theme.colors.slate50, borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 12, paddingHorizontal: 12, height: 40, fontSize: 11, color: theme.colors.navy },
  sendBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: theme.colors.darkCyan, alignItems: 'center', justifyContent: 'center' },
  qComposer: { backgroundColor: '#fff', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.slate200, gap: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 10, paddingHorizontal: 10, height: 40, fontSize: 11, color: theme.colors.navy },
  threadCard: { backgroundColor: '#fff', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.slate200, gap: 8 },
  threadRole: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', color: theme.colors.slate400 },
  threadTitle: { fontWeight: '800', fontSize: 12, color: theme.colors.navy },
  replyBadge: { backgroundColor: theme.colors.slate100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  replyBadgeText: { fontSize: 9, color: theme.colors.slate600, fontWeight: '700' },
  threadBody: { fontSize: 11, color: theme.colors.slate600, lineHeight: 16 },
  threadMeta: { fontSize: 9, color: theme.colors.slate400 },
  answer: { backgroundColor: theme.colors.slate50, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.slate200, gap: 4 },
  answerAuthor: { fontSize: 10, fontWeight: '800', color: theme.colors.navy },
  answerText: { fontSize: 11, color: theme.colors.slate700 },
  answerTime: { fontSize: 9, color: theme.colors.slate400 },
  noAnswer: { backgroundColor: theme.colors.slate50, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.slate200, borderStyle: 'dashed' },
  noAnswerText: { fontSize: 10, color: theme.colors.slate500 },
  btnSmall: { backgroundColor: theme.colors.darkCyan, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, justifyContent: 'center' },
  btnSmallText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  leaderCard: { backgroundColor: '#fff', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.slate200, gap: 10 },
  sectionSub: { fontSize: 10, color: theme.colors.slate500 },
  leaderRow: { flexDirection: 'row', gap: 12, backgroundColor: theme.colors.slate50, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.slate200, alignItems: 'center' },
  rank: { width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.navy, alignItems: 'center', justifyContent: 'center' },
  rankText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  leaderName: { fontWeight: '800', fontSize: 11, color: theme.colors.navy },
  leaderRole: { fontSize: 9, color: theme.colors.slate500, textTransform: 'uppercase' },
  leaderScore: { fontWeight: '900', fontSize: 14, color: theme.colors.darkCyan },
  leaderSub: { fontSize: 9, color: theme.colors.slate400 },
});
