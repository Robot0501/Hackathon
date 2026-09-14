import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Search, MapPin, Sparkles, CheckCircle2, Calendar, Clock } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { theme } from '../theme';
import { Opportunity } from '../types';

export default function OpportunitiesScreen() {
  const { currentUser, opportunities, events, handleApplyOpportunity, handlePostOpportunity, handleRsvpEvent } = useApp();
  const [activeTab, setActiveTab] = useState<'jobs' | 'events'>('jobs');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [applyOpp, setApplyOpp] = useState<Opportunity | null>(null);
  const [applyForm, setApplyForm] = useState({ name: currentUser?.name || '', email: currentUser?.email || '', phone: '', availability: '', motivation: '' });
  const [isPosting, setIsPosting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'internship' | 'learnership' | 'graduate_vacancy' | 'part_time'>('graduate_vacancy');
  const [newLocation, setNewLocation] = useState('Johannesburg, Gauteng');
  const [newSkills, setNewSkills] = useState('React, TypeScript, SQL');
  const [newSalary, setNewSalary] = useState('R25,000 / month');
  const [newDesc, setNewDesc] = useState('');

  if (!currentUser) return null;

  const computeMatch = (opp: Opportunity) => {
    let score = 50;
    if (currentUser.programme && opp.requiredProgramme.some((p) => currentUser.programme!.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(currentUser.programme!.toLowerCase()))) score += 25;
    const userSkills = currentUser.technicalSkills.map((s) => s.toLowerCase());
    const matched = opp.requiredSkills.filter((req) => userSkills.some((us) => us.includes(req.toLowerCase()) || req.toLowerCase().includes(us)));
    score += Math.min(25, matched.length * 7);
    return Math.min(98, score);
  };

  const filtered = opportunities.filter((opp) => {
    if (opp.status !== 'approved' && currentUser.role !== 'admin' && currentUser.id !== opp.companyId) return false;
    if (filterType !== 'all' && opp.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!opp.title.toLowerCase().includes(q) && !opp.companyName.toLowerCase().includes(q) && !opp.requiredSkills.some((s) => s.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const handleApplySubmit = () => {
    if (!applyOpp) return;
    if (!applyForm.phone || !applyForm.availability || !applyForm.motivation) { Alert.alert('Missing fields', 'Please fill all required fields'); return; }
    handleApplyOpportunity(applyOpp.id);
    setApplyOpp(null);
    setApplyForm({ name: currentUser.name, email: currentUser.email, phone: '', availability: '', motivation: '' });
  };

  const handleCreateOpp = () => {
    if (!newTitle.trim()) { Alert.alert('Title required'); return; }
    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`, companyId: currentUser.id, companyName: currentUser.businessDetails?.organizationName || currentUser.name,
      companyLogo: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=100&h=100&fit=crop',
      title: newTitle, type: newType, location: newLocation, campusTarget: 'All Campuses', requiredProgramme: ['BSc Information Technology'], requiredSkills: newSkills.split(',').map((s) => s.trim()), description: newDesc || 'Exciting opportunity for Richfield students.', responsibilities: ['Deliver sprint tasks', 'Participate in agile ceremonies'], stipendSalary: newSalary, closingDate: '30 November 2026', status: currentUser.role === 'admin' ? 'approved' : 'pending_approval', applicantsCount: 0, matchScore: 90
    };
    handlePostOpportunity(newOpp);
    setIsPosting(false); setNewTitle(''); setNewDesc('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View><Text style={styles.headerTitle}>Career Hub & Placements</Text><Text style={styles.headerSub}>Smart matching tailored to your Richfield profile.</Text></View>
        <View style={styles.tabPills}>
          <TouchableOpacity onPress={() => setActiveTab('jobs')} style={[styles.pill, activeTab === 'jobs' && styles.pillActive]}><Text style={[styles.pillText, activeTab === 'jobs' && styles.pillTextActive]}>Jobs ({opportunities.length})</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('events')} style={[styles.pill, activeTab === 'events' && styles.pillActive]}><Text style={[styles.pillText, activeTab === 'events' && styles.pillTextActive]}>Events ({events.length})</Text></TouchableOpacity>
        </View>
        {(currentUser.role === 'business' || currentUser.role === 'admin') && activeTab === 'jobs' && (
          <TouchableOpacity style={styles.postBtn} onPress={() => setIsPosting(true)}><Text style={styles.postBtnText}>+ Post Opportunity</Text></TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'jobs' ? (
          <>
            <View style={styles.searchCard}>
              <View style={styles.searchWrap}><Search color={theme.colors.slate400} size={16} /><TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search by role, company, or skills..." style={styles.searchInput} placeholderTextColor={theme.colors.slate400} /></View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[
                    { id: 'all', label: 'All Openings' },
                    { id: 'graduate_vacancy', label: 'Graduate Programmes' },
                    { id: 'internship', label: 'Internships' },
                    { id: 'learnership', label: 'Learnerships' },
                    { id: 'part_time', label: 'Part-Time' },
                  ].map((pill) => (
                    <TouchableOpacity key={pill.id} onPress={() => setFilterType(pill.id)} style={[styles.filterPill, filterType === pill.id && styles.filterActive]}><Text style={[styles.filterText, filterType === pill.id && styles.filterActiveText]}>{pill.label}</Text></TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            {filtered.map((opp) => {
              const match = computeMatch(opp);
              return (
                <View key={opp.id} style={styles.jobCard}>
                  <View style={styles.jobHeader}>
                    <Image source={{ uri: opp.companyLogo }} style={styles.logo} />
                    <View style={{ flex: 1 }}><View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}><Text style={styles.jobTitle}>{opp.title}</Text>{opp.status === 'pending_approval' && <View style={styles.pending}><Text style={styles.pendingText}>Pending Review</Text></View>}</View><View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}><Text style={styles.company}>{opp.companyName}</Text><View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}><MapPin color={theme.colors.darkCyan} size={10} /><Text style={styles.location}>{opp.location}</Text></View><Text style={styles.salary}>{opp.stipendSalary}</Text></View></View>
                    <View style={styles.matchBox}><Sparkles color={theme.colors.darkCyan} size={12} /><Text style={styles.matchText}>{match}% Match</Text></View>
                  </View>
                  <Text style={styles.jobDesc} numberOfLines={2}>{opp.description}</Text>
                  <View style={styles.skillsRow}>{opp.requiredSkills.map((s) => <View key={s} style={styles.skillTag}><Text style={styles.skillText}>{s}</Text></View>)}</View>
                  <View style={styles.jobActions}>
                    <TouchableOpacity style={styles.btnGhost} onPress={() => setSelectedOpp(opp)}><Text style={styles.btnGhostText}>View Details</Text></TouchableOpacity>
                    <TouchableOpacity disabled={opp.applied} onPress={() => setApplyOpp(opp)} style={[styles.btnPrimary, opp.applied && { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' }]}>{opp.applied ? <><CheckCircle2 color={theme.colors.darkCyan} size={12} /><Text style={[styles.btnPrimaryText, { color: theme.colors.darkCyan }]}>Applied</Text></> : <Text style={styles.btnPrimaryText}>Apply</Text>}</TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        ) : (
          <>
            {events.map((ev) => (
              <View key={ev.id} style={styles.eventCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                  <View style={{ flex: 1 }}><View style={styles.eventTag}><Text style={styles.eventTagText}>{ev.type.replace('_', ' ')}</Text></View><Text style={styles.eventTitle}>{ev.title}</Text><Text style={styles.eventDesc}>{ev.description}</Text></View>
                  <TouchableOpacity onPress={() => handleRsvpEvent(ev.id)} style={[styles.rsvpBtn, ev.hasRsvp ? styles.rsvpActive : styles.rsvpIdle]}><Text style={[styles.rsvpText, ev.hasRsvp && styles.rsvpTextActive]}>{ev.hasRsvp ? 'RSVP Confirmed' : 'RSVP Free'}</Text></TouchableOpacity>
                </View>
                <View style={styles.eventMeta}><View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><Calendar color={theme.colors.darkCyan} size={12} /><Text style={styles.metaText}>{ev.date}</Text></View><View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><Clock color={theme.colors.slate400} size={12} /><Text style={styles.metaText}>{ev.time}</Text></View><View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><MapPin color={theme.colors.slate400} size={12} /><Text style={styles.metaText}>{ev.location}</Text></View><Text style={styles.metaSub}>{ev.rsvpCount} attending</Text></View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Details Modal */}
      <Modal visible={!!selectedOpp} transparent animationType="slide" onRequestClose={() => setSelectedOpp(null)}>
        <View style={styles.modalOverlay}><View style={styles.modalCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', gap: 10, flex: 1 }}><Image source={{ uri: selectedOpp?.companyLogo }} style={styles.logo} /><View style={{ flex: 1 }}><Text style={styles.modalTitle}>{selectedOpp?.title}</Text><Text style={styles.modalSub}>{selectedOpp?.companyName} • {selectedOpp?.location}</Text></View></View>
            <TouchableOpacity onPress={() => setSelectedOpp(null)}><Text style={styles.close}>✕</Text></TouchableOpacity>
          </View>
          <View style={styles.salaryBox}><Text style={styles.salaryLabel}>Stipend</Text><Text style={styles.salaryValue}>{selectedOpp?.stipendSalary}</Text></View>
          <Text style={styles.sectionLabel}>Role Description</Text><Text style={styles.modalText}>{selectedOpp?.description}</Text>
          <Text style={styles.sectionLabel}>Responsibilities</Text>{selectedOpp?.responsibilities.map((r, i) => <Text key={i} style={styles.bullet}>• {r}</Text>)}
          <Text style={styles.sectionLabel}>Required Qualifications</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{selectedOpp?.requiredProgramme.map((p) => <View key={p} style={styles.qualTag}><Text style={styles.qualText}>{p}</Text></View>)}</View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.colors.slate200, paddingTop: 12, marginTop: 12 }}><Text style={styles.closes}>Closes: {selectedOpp?.closingDate}</Text><TouchableOpacity disabled={selectedOpp?.applied} onPress={() => { setApplyOpp(selectedOpp); setSelectedOpp(null); }} style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>{selectedOpp?.applied ? 'Submitted' : 'Apply Now'}</Text></TouchableOpacity></View>
        </View></View>
      </Modal>

      {/* Apply Modal */}
      <Modal visible={!!applyOpp} transparent animationType="slide" onRequestClose={() => setApplyOpp(null)}>
        <View style={styles.modalOverlay}><ScrollView contentContainerStyle={{ padding: 16 }}><View style={[styles.modalCard, { maxHeight: undefined }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.slate100, paddingBottom: 8 }}><View><Text style={styles.modalTitle}>Apply for {applyOpp?.title}</Text><Text style={styles.modalSub}>{applyOpp?.companyName}</Text></View><TouchableOpacity onPress={() => setApplyOpp(null)}><Text style={styles.close}>✕</Text></TouchableOpacity></View>
          <Text style={styles.label}>Full name</Text><TextInput value={applyForm.name} onChangeText={(v) => setApplyForm({ ...applyForm, name: v })} style={styles.input} placeholderTextColor={theme.colors.slate400} />
          <Text style={styles.label}>Email</Text><TextInput value={applyForm.email} onChangeText={(v) => setApplyForm({ ...applyForm, email: v })} style={styles.input} autoCapitalize="none" keyboardType="email-address" placeholderTextColor={theme.colors.slate400} />
          <Text style={styles.label}>Phone number</Text><TextInput value={applyForm.phone} onChangeText={(v) => setApplyForm({ ...applyForm, phone: v })} style={styles.input} placeholder="071 234 5678" keyboardType="phone-pad" placeholderTextColor={theme.colors.slate400} />
          <Text style={styles.label}>Availability</Text><TextInput value={applyForm.availability} onChangeText={(v) => setApplyForm({ ...applyForm, availability: v })} style={styles.input} placeholder="Available from 1 Nov 2026" placeholderTextColor={theme.colors.slate400} />
          <Text style={styles.label}>Motivation</Text><TextInput value={applyForm.motivation} onChangeText={(v) => setApplyForm({ ...applyForm, motivation: v })} style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 10 }]} multiline placeholder="Why are you interested?" placeholderTextColor={theme.colors.slate400} />
          <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}><TouchableOpacity onPress={() => setApplyOpp(null)} style={styles.btnGhost}><Text style={styles.btnGhostText}>Cancel</Text></TouchableOpacity><TouchableOpacity onPress={handleApplySubmit} style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>Submit Application</Text></TouchableOpacity></View>
        </View></ScrollView></View>
      </Modal>

      {/* Post Opportunity Modal */}
      <Modal visible={isPosting} transparent animationType="slide" onRequestClose={() => setIsPosting(false)}>
        <View style={styles.modalOverlay}><ScrollView contentContainerStyle={{ padding: 16 }}><View style={styles.modalCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.slate100, paddingBottom: 8 }}><Text style={styles.modalTitle}>Post Opportunity</Text><TouchableOpacity onPress={() => setIsPosting(false)}><Text style={styles.close}>✕</Text></TouchableOpacity></View>
          <Text style={styles.label}>Opportunity Title</Text><TextInput value={newTitle} onChangeText={setNewTitle} style={styles.input} placeholder="Junior Cloud Engineer Intern" placeholderTextColor={theme.colors.slate400} />
          <Text style={styles.label}>Type</Text><View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{(['graduate_vacancy', 'internship', 'learnership', 'part_time'] as const).map((t) => <TouchableOpacity key={t} onPress={() => setNewType(t)} style={[styles.typePill, newType === t && styles.typeActive]}><Text style={[styles.typeText, newType === t && styles.typeActiveText]}>{t.replace('_', ' ')}</Text></TouchableOpacity>)}</View>
          <Text style={styles.label}>Stipend</Text><TextInput value={newSalary} onChangeText={setNewSalary} style={styles.input} placeholder="R18,000 / month" placeholderTextColor={theme.colors.slate400} />
          <Text style={styles.label}>Required Skills (comma separated)</Text><TextInput value={newSkills} onChangeText={setNewSkills} style={styles.input} placeholder="React, TypeScript, SQL, Git" placeholderTextColor={theme.colors.slate400} />
          <Text style={styles.label}>Brief Description</Text><TextInput value={newDesc} onChangeText={setNewDesc} style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]} multiline placeholderTextColor={theme.colors.slate400} />
          {currentUser.role === 'business' && <View style={styles.notice}><Text style={styles.noticeText}>Notice: Business postings require Administrator approval before going live.</Text></View>}
          <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}><TouchableOpacity onPress={() => setIsPosting(false)} style={styles.btnGhost}><Text style={styles.btnGhostText}>Cancel</Text></TouchableOpacity><TouchableOpacity onPress={handleCreateOpp} style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>Submit Opportunity</Text></TouchableOpacity></View>
        </View></ScrollView></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.slate50 },
  header: { backgroundColor: '#fff', padding: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.slate200, gap: 10 },
  headerTitle: { fontWeight: '900', fontSize: 14, color: theme.colors.navy },
  headerSub: { fontSize: 10, color: theme.colors.slate500 },
  tabPills: { flexDirection: 'row', backgroundColor: theme.colors.slate100, padding: 4, borderRadius: 12, gap: 4, alignSelf: 'flex-start' },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  pillActive: { backgroundColor: '#fff', elevation: 1 },
  pillText: { fontSize: 11, fontWeight: '700', color: theme.colors.slate500 },
  pillTextActive: { color: theme.colors.navy },
  postBtn: { backgroundColor: theme.colors.navy, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start' },
  postBtnText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  content: { padding: 12, gap: 12, paddingBottom: 24 },
  searchCard: { backgroundColor: '#fff', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.slate200 },
  searchWrap: { flexDirection: 'row', gap: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 12, paddingHorizontal: 12, height: 40, alignItems: 'center' },
  searchInput: { flex: 1, fontSize: 11, color: theme.colors.navy },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: theme.colors.slate100 },
  filterActive: { backgroundColor: theme.colors.navy },
  filterText: { fontSize: 10, fontWeight: '700', color: theme.colors.slate600 },
  filterActiveText: { color: '#fff' },
  jobCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.colors.slate200, gap: 10 },
  jobHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  logo: { width: 44, height: 44, borderRadius: 12 },
  jobTitle: { fontWeight: '800', fontSize: 12, color: theme.colors.navy, flexShrink: 1 },
  pending: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#FDE68A' },
  pendingText: { fontSize: 8, fontWeight: '800', color: '#92400E' },
  company: { fontWeight: '700', fontSize: 11, color: theme.colors.slate700 },
  location: { fontSize: 10, color: theme.colors.slate500 },
  salary: { fontWeight: '800', fontSize: 11, color: theme.colors.navy },
  matchBox: { flexDirection: 'row', gap: 4, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, alignItems: 'center' },
  matchText: { fontSize: 10, fontWeight: '800', color: theme.colors.navy },
  jobDesc: { fontSize: 11, color: theme.colors.slate600, lineHeight: 16 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, borderTopWidth: 1, borderTopColor: theme.colors.slate100, paddingTop: 10 },
  skillTag: { backgroundColor: theme.colors.slate100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  skillText: { fontSize: 10, color: theme.colors.slate700, fontWeight: '600' },
  jobActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  btnGhost: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.slate200 },
  btnGhostText: { fontSize: 11, fontWeight: '700', color: theme.colors.slate700 },
  btnPrimary: { backgroundColor: theme.colors.darkCyan, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, flexDirection: 'row', gap: 6, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  eventCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.colors.slate200, gap: 10 },
  eventTag: { backgroundColor: '#FDF2F8', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#FBCFE8' },
  eventTagText: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', color: theme.colors.navy },
  eventTitle: { fontWeight: '800', fontSize: 13, color: theme.colors.navy, marginTop: 6 },
  eventDesc: { fontSize: 11, color: theme.colors.slate600, lineHeight: 16 },
  rsvpBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, alignSelf: 'flex-start' },
  rsvpIdle: { backgroundColor: theme.colors.navy },
  rsvpActive: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  rsvpText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  rsvpTextActive: { color: theme.colors.darkCyan },
  eventMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, borderTopWidth: 1, borderTopColor: theme.colors.slate100, paddingTop: 10 },
  metaText: { fontSize: 10, color: theme.colors.slate600 },
  metaSub: { fontSize: 10, color: theme.colors.slate400 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, gap: 10, maxHeight: '85%' },
  modalTitle: { fontWeight: '800', fontSize: 14, color: theme.colors.navy },
  modalSub: { fontSize: 11, color: theme.colors.slate500 },
  close: { fontSize: 16, color: theme.colors.slate400 },
  salaryBox: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', padding: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between' },
  salaryLabel: { fontWeight: '700', fontSize: 11, color: theme.colors.darkCyan },
  salaryValue: { fontWeight: '900', fontSize: 12, color: theme.colors.darkCyan },
  sectionLabel: { fontWeight: '800', fontSize: 10, color: theme.colors.slate400, textTransform: 'uppercase', marginTop: 8 },
  modalText: { fontSize: 11, color: theme.colors.slate700, lineHeight: 16 },
  bullet: { fontSize: 11, color: theme.colors.slate700 },
  qualTag: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#C7D2FE' },
  qualText: { fontSize: 10, color: theme.colors.delftBlue, fontWeight: '700' },
  closes: { fontSize: 10, color: theme.colors.slate400 },
  label: { fontWeight: '700', fontSize: 11, color: theme.colors.slate700, marginTop: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 10, paddingHorizontal: 10, height: 40, fontSize: 11, color: theme.colors.navy, marginTop: 4 },
  typePill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: theme.colors.slate100, borderWidth: 1, borderColor: theme.colors.slate200 },
  typeActive: { backgroundColor: theme.colors.navy, borderColor: theme.colors.navy },
  typeText: { fontSize: 10, fontWeight: '700', color: theme.colors.slate600, textTransform: 'capitalize' },
  typeActiveText: { color: '#fff' },
  notice: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', padding: 8, borderRadius: 8, marginTop: 8 },
  noticeText: { fontSize: 10, color: '#92400E' },
});
