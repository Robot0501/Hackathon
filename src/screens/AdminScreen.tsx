import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { ShieldCheck, Building2, Check, X, Trash2, Calendar } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { theme } from '../theme';
import { RichfieldEvent } from '../types';

export default function AdminScreen() {
  const { users, opportunities, events, posts, handleApproveBusiness, handleRejectBusiness, handleApproveOpportunity, handleRejectOpportunity, handleDeletePost, handleCreateEvent, handleDeleteEvent, handleBroadcastAnnouncement } = useApp();
  const [activeTab, setActiveTab] = useState<'approvals' | 'users' | 'moderation' | 'events' | 'broadcast'>('approvals');
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<RichfieldEvent['type']>('career_fair');
  const [eventDate, setEventDate] = useState('24 October 2026');
  const [eventTime, setEventTime] = useState('10:00 - 15:00');
  const [eventLocation, setEventLocation] = useState('Braamfontein Auditorium & Virtual');
  const [eventDesc, setEventDesc] = useState('');
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annTarget, setAnnTarget] = useState<'all' | 'students' | 'alumni' | 'business'>('all');

  const pendingBusinesses = users.filter((u) => u.role === 'business' && u.businessDetails?.approvalStatus === 'pending');
  const pendingOpps = opportunities.filter((o) => o.status === 'pending_approval');

  const createEvent = () => {
    if (!eventTitle.trim()) return;
    const ev: RichfieldEvent = { id: `ev-${Date.now()}`, title: eventTitle, type: eventType, date: eventDate, time: eventTime, location: eventLocation, campus: eventLocation.includes('Pretoria') ? 'Pretoria Campus' : 'Braamfontein Campus', organizer: 'Richfield Academic Administration', description: eventDesc || 'Official institutional event.', rsvpCount: 0, hasRsvp: false };
    handleCreateEvent(ev); setEventTitle(''); setEventDesc('');
  };
  const broadcast = () => {
    if (!annTitle.trim() || !annMessage.trim()) return;
    handleBroadcastAnnouncement(annTitle, annMessage, annTarget); setAnnTitle(''); setAnnMessage('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><ShieldCheck color={theme.colors.darkCyan} size={20} /><Text style={styles.headerTitle}>Richfield Central Administration</Text></View>
        <Text style={styles.headerSub}>Governance: Corporate vetting, opportunities approval, moderation.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { id: 'approvals', label: `Vetting (${pendingBusinesses.length + pendingOpps.length})` },
              { id: 'users', label: `Users (${users.length})` },
              { id: 'moderation', label: `Moderation (${posts.length})` },
              { id: 'events', label: `Events (${events.length})` },
              { id: 'broadcast', label: 'Broadcast' },
            ].map((tab) => (
              <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id as any)} style={[styles.pill, activeTab === tab.id && styles.pillActive]}><Text style={[styles.pillText, activeTab === tab.id && styles.pillTextActive]}>{tab.label}</Text></TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'approvals' && (
          <>
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><View><Text style={styles.cardTitle}>Corporate Registrations</Text><Text style={styles.cardSub}>Business accounts require institutional signoff.</Text></View><View style={styles.badge}><Text style={styles.badgeText}>{pendingBusinesses.length} Pending</Text></View></View>
              {pendingBusinesses.length === 0 ? <View style={styles.empty}><Text style={styles.emptyText}>All business accounts vetted and approved.</Text></View> : pendingBusinesses.map((biz) => (
                <View key={biz.id} style={styles.approvalRow}>
                  <View style={{ flex: 1 }}><View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><Building2 color={theme.colors.darkCyan} size={12} /><Text style={styles.approvalTitle}>{biz.businessDetails?.organizationName || biz.name}</Text></View><Text style={styles.approvalSub}>Contact: {biz.name} ({biz.email})</Text><Text style={styles.approvalDesc}>{biz.businessDetails?.companyDescription}</Text></View>
                  <View style={{ flexDirection: 'row', gap: 6 }}><TouchableOpacity onPress={() => handleRejectBusiness(biz.id)} style={styles.btnReject}><X color="#BE123C" size={12} /><Text style={styles.btnRejectText}>Reject</Text></TouchableOpacity><TouchableOpacity onPress={() => handleApproveBusiness(biz.id)} style={styles.btnApprove}><Check color="#fff" size={12} /><Text style={styles.btnApproveText}>Approve</Text></TouchableOpacity></View>
                </View>
              ))}
            </View>
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><View><Text style={styles.cardTitle}>Opportunities Requiring Approval</Text><Text style={styles.cardSub}>Verifying stipend compliance.</Text></View><View style={styles.badge}><Text style={styles.badgeText}>{pendingOpps.length} In Review</Text></View></View>
              {pendingOpps.length === 0 ? <View style={styles.empty}><Text style={styles.emptyText}>All opportunities are currently live.</Text></View> : pendingOpps.map((opp) => (
                <View key={opp.id} style={styles.approvalRow}>
                  <View style={{ flex: 1 }}><Text style={styles.approvalTitle}>{opp.title}</Text><Text style={styles.approvalSub}>Posted by: {opp.companyName} • {opp.stipendSalary}</Text><Text style={styles.approvalDesc} numberOfLines={1}>{opp.description}</Text></View>
                  <View style={{ flexDirection: 'row', gap: 6 }}><TouchableOpacity onPress={() => handleRejectOpportunity(opp.id)} style={styles.btnReject}><X color="#BE123C" size={12} /><Text style={styles.btnRejectText}>Reject</Text></TouchableOpacity><TouchableOpacity onPress={() => handleApproveOpportunity(opp.id)} style={styles.btnApproveDark}><Check color="#fff" size={12} /><Text style={styles.btnApproveText}>Publish</Text></TouchableOpacity></View>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'users' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Richfield Identity Registry</Text><Text style={styles.cardSub}>Validation overview of all registered users.</Text>
            {users.map((u) => (
              <View key={u.id} style={styles.userRow}>
                <Image source={{ uri: u.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}><Text style={styles.userName}>{u.name}</Text><Text style={styles.userEmail}>{u.email}</Text></View>
                <View style={{ alignItems: 'flex-end' }}><Text style={styles.userRole}>{u.role}</Text><View style={[styles.statusPill, u.verificationStatus === 'verified' ? styles.statusVerified : styles.statusPending]}><Text style={styles.statusText}>{u.verificationStatus}</Text></View></View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'moderation' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Content Moderation & Safety Desk</Text><Text style={styles.cardSub}>Audit live feeds and remove flagged submissions.</Text>
            {posts.map((p) => (
              <View key={p.id} style={styles.moderationRow}>
                <View style={{ flex: 1 }}><View style={{ flexDirection: 'row', gap: 6 }}><Text style={styles.moderationAuthor}>{p.authorName}</Text><Text style={styles.moderationRole}>({p.authorRole})</Text><View style={styles.typeTag}><Text style={styles.typeTagText}>{p.type}</Text></View></View><Text style={styles.moderationContent} numberOfLines={2}>{p.content}</Text><Text style={styles.moderationMeta}>{p.likes} likes • {p.comments.length} comments • {p.campus}</Text></View>
                <TouchableOpacity onPress={() => handleDeletePost(p.id)} style={styles.btnReject}><Trash2 color="#BE123C" size={12} /><Text style={styles.btnRejectText}>Remove</Text></TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'events' && (
          <>
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><Calendar color={theme.colors.darkCyan} size={14} /><Text style={styles.cardTitle}>Publish Official Campus Event</Text></View>
              <Text style={styles.label}>Event Title</Text><TextInput value={eventTitle} onChangeText={setEventTitle} style={styles.input} placeholder="e.g. Graduate Recruitment Gala 2026" placeholderTextColor={theme.colors.slate400} />
              <Text style={styles.label}>Type</Text><View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>{(['career_fair', 'hackathon', 'industry_talk', 'alumni_mixer'] as const).map((t) => <TouchableOpacity key={t} onPress={() => setEventType(t)} style={[styles.typePill, eventType === t && styles.typeActive]}><Text style={[styles.typeText, eventType === t && styles.typeActiveText]}>{t.replace('_', ' ')}</Text></TouchableOpacity>)}</View>
              <Text style={styles.label}>Date</Text><TextInput value={eventDate} onChangeText={setEventDate} style={styles.input} placeholderTextColor={theme.colors.slate400} />
              <Text style={styles.label}>Time</Text><TextInput value={eventTime} onChangeText={setEventTime} style={styles.input} placeholderTextColor={theme.colors.slate400} />
              <Text style={styles.label}>Venue</Text><TextInput value={eventLocation} onChangeText={setEventLocation} style={styles.input} placeholderTextColor={theme.colors.slate400} />
              <Text style={styles.label}>Description</Text><TextInput value={eventDesc} onChangeText={setEventDesc} style={[styles.input, { height: 60, textAlignVertical: 'top', paddingTop: 8 }]} multiline placeholderTextColor={theme.colors.slate400} />
              <TouchableOpacity onPress={createEvent} style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>Publish Event to Community</Text></TouchableOpacity>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Active Institutional Events</Text>
              {events.map((ev) => <View key={ev.id} style={styles.eventRow}><View style={{ flex: 1 }}><Text style={styles.eventTitle}>{ev.title}</Text><Text style={styles.eventMeta}>{ev.date} • {ev.location} • {ev.rsvpCount} RSVPs</Text></View><TouchableOpacity onPress={() => handleDeleteEvent(ev.id)}><Trash2 color={theme.colors.slate400} size={14} /></TouchableOpacity></View>)}
            </View>
          </>
        )}

        {activeTab === 'broadcast' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Broadcast Institutional Announcement</Text><Text style={styles.cardSub}>Sends high-priority notification to targeted users.</Text>
            <Text style={styles.label}>Target Audience</Text><View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>{(['all', 'students', 'alumni', 'business'] as const).map((t) => <TouchableOpacity key={t} onPress={() => setAnnTarget(t)} style={[styles.typePill, annTarget === t && styles.typeActive]}><Text style={[styles.typeText, annTarget === t && styles.typeActiveText]}>{t}</Text></TouchableOpacity>)}</View>
            <Text style={styles.label}>Announcement Title</Text><TextInput value={annTitle} onChangeText={setAnnTitle} style={styles.input} placeholder="e.g. 2026 Graduate Placement Fair Registration Open" placeholderTextColor={theme.colors.slate400} />
            <Text style={styles.label}>Announcement Message</Text><TextInput value={annMessage} onChangeText={setAnnMessage} style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 8 }]} multiline placeholder="Details regarding the broadcast..." placeholderTextColor={theme.colors.slate400} />
            <TouchableOpacity onPress={broadcast} style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>Dispatch Broadcast</Text></TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.slate50 },
  header: { backgroundColor: theme.colors.navy, padding: 14, gap: 6 },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 14 },
  headerSub: { color: theme.colors.rosyBrown, fontSize: 10 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  pillActive: { backgroundColor: '#fff' },
  pillText: { fontSize: 10, fontWeight: '700', color: '#CBD5E1' },
  pillTextActive: { color: theme.colors.navy },
  content: { padding: 12, gap: 12, paddingBottom: 24 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.slate200, gap: 10 },
  cardTitle: { fontWeight: '800', fontSize: 12, color: theme.colors.navy },
  cardSub: { fontSize: 10, color: theme.colors.slate500 },
  badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A' },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#92400E' },
  empty: { backgroundColor: theme.colors.slate50, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.slate200, borderStyle: 'dashed', alignItems: 'center' },
  emptyText: { fontSize: 11, color: theme.colors.slate400 },
  approvalRow: { backgroundColor: theme.colors.slate50, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.slate200, gap: 10 },
  approvalTitle: { fontWeight: '800', fontSize: 11, color: theme.colors.navy },
  approvalSub: { fontSize: 10, color: theme.colors.slate600, marginTop: 2 },
  approvalDesc: { fontSize: 10, color: theme.colors.slate500, marginTop: 2 },
  btnReject: { flexDirection: 'row', gap: 4, borderWidth: 1, borderColor: '#FECDD3', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignItems: 'center', backgroundColor: '#FFF1F2' },
  btnRejectText: { fontSize: 10, fontWeight: '700', color: '#BE123C' },
  btnApprove: { flexDirection: 'row', gap: 4, backgroundColor: theme.colors.darkCyan, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  btnApproveDark: { flexDirection: 'row', gap: 4, backgroundColor: theme.colors.navy, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  btnApproveText: { color: '#fff', fontWeight: '800', fontSize: 10 },
  userRow: { flexDirection: 'row', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.slate100, alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  userName: { fontWeight: '800', fontSize: 11, color: theme.colors.navy },
  userEmail: { fontSize: 9, color: theme.colors.slate500 },
  userRole: { fontSize: 10, color: theme.colors.slate600, textTransform: 'capitalize', fontWeight: '700' },
  statusPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  statusVerified: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  statusPending: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A' },
  statusText: { fontSize: 9, fontWeight: '800', textTransform: 'capitalize' },
  moderationRow: { flexDirection: 'row', gap: 10, backgroundColor: theme.colors.slate50, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.slate200 },
  moderationAuthor: { fontWeight: '800', fontSize: 11, color: theme.colors.navy },
  moderationRole: { fontSize: 10, color: theme.colors.slate500 },
  typeTag: { backgroundColor: theme.colors.slate200, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  typeTagText: { fontSize: 9, fontWeight: '700', color: theme.colors.slate700, textTransform: 'uppercase' },
  moderationContent: { fontSize: 11, color: theme.colors.slate700, marginTop: 4 },
  moderationMeta: { fontSize: 9, color: theme.colors.slate400, marginTop: 4 },
  label: { fontWeight: '700', fontSize: 11, color: theme.colors.slate700, marginTop: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 10, paddingHorizontal: 10, height: 40, fontSize: 11, color: theme.colors.navy, marginTop: 4 },
  typePill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: theme.colors.slate100, borderWidth: 1, borderColor: theme.colors.slate200 },
  typeActive: { backgroundColor: theme.colors.navy, borderColor: theme.colors.navy },
  typeText: { fontSize: 10, fontWeight: '700', color: theme.colors.slate600, textTransform: 'capitalize' },
  typeActiveText: { color: '#fff' },
  btnPrimary: { backgroundColor: theme.colors.navy, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  eventRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.colors.slate50, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.slate200, alignItems: 'center' },
  eventTitle: { fontWeight: '700', fontSize: 11, color: theme.colors.navy },
  eventMeta: { fontSize: 10, color: theme.colors.slate500, marginTop: 2 },
});
