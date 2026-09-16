import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Share } from 'react-native';
import { MapPin, GraduationCap, Award, CheckCircle2, Plus, Trash2, Download, Building2, ThumbsUp, BarChart3 } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { theme } from '../theme';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import UserAvatar from '../components/UserAvatar';
import { uploadUserImage } from '../lib/dataService';

export default function ProfileScreen() {
  const { currentUser, users, opportunities, handleUpdateProfile, handleAddEndorsement, signOutUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [headline, setHeadline] = useState(currentUser?.headline || '');
  const [summary, setSummary] = useState(currentUser?.summary || '');
  const [programme, setProgramme] = useState(currentUser?.programme || '');
  const [campus, setCampus] = useState(currentUser?.campus || '');
  const [graduationYear, setGraduationYear] = useState(currentUser?.graduationYear ? String(currentUser.graduationYear) : '');
  const [currentCompany, setCurrentCompany] = useState(currentUser?.currentCompany || '');
  const [currentRole, setCurrentRole] = useState(currentUser?.currentRole || '');
  const [careerAspirations, setCareerAspirations] = useState(currentUser?.careerAspirations || '');
  const [github, setGithub] = useState(currentUser?.portfolioLinks?.github || '');
  const [linkedin, setLinkedin] = useState(currentUser?.portfolioLinks?.linkedin || '');
  const [website, setWebsite] = useState(currentUser?.portfolioLinks?.website || currentUser?.businessDetails?.website || '');
  const [businessIndustry, setBusinessIndustry] = useState(currentUser?.businessDetails?.industry || 'Information Technology & Services');
  const [businessLocation, setBusinessLocation] = useState(currentUser?.businessDetails?.location || 'South Africa');
  const [businessDescription, setBusinessDescription] = useState(currentUser?.businessDetails?.companyDescription || '');
  const [businessPhone, setBusinessPhone] = useState(currentUser?.businessDetails?.contactPhone || '');
  const [talentRequirements, setTalentRequirements] = useState((currentUser?.businessDetails?.talentRequirements || []).join(', '));
  const [newTech, setNewTech] = useState('');
  const [newSoft, setNewSoft] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [newAch, setNewAch] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  if (!currentUser) return null;
  const isBusiness = currentUser.role === 'business';
  const isAdmin = currentUser.role === 'admin';
  const user = currentUser;
  const ownOpportunities = opportunities.filter((o) => o.companyId === user.id);
  const realBusinessStats = [
    { label: 'Active Opportunities', value: `${ownOpportunities.filter((o) => o.status === 'approved').length} Listings` },
    { label: 'Candidate Pool', value: `${users.filter((u) => !u.isShowcase && u.role === 'student' && u.verificationStatus === 'verified').length} Students` },
    { label: 'Applications', value: `${ownOpportunities.reduce((sum, o) => sum + (o.applicantsCount || 0), 0)} Total` },
    { label: 'Pending Review', value: `${ownOpportunities.filter((o) => o.status === 'pending_approval').length} Listings` },
  ];

  const saveProfile = () => {
    const updates: any = {
      headline: headline.trim(),
      summary: summary.trim(),
      profileCompleteness: Math.max(user.profileCompleteness || 0, 70),
    };

    if (isBusiness) {
      updates.businessDetails = {
        ...user.businessDetails!,
        industry: businessIndustry.trim(),
        companyDescription: businessDescription.trim(),
        location: businessLocation.trim(),
        website: website.trim(),
        contactPhone: businessPhone.trim(),
        talentRequirements: talentRequirements.split(',').map((v) => v.trim()).filter(Boolean),
      };
      updates.portfolioLinks = { ...user.portfolioLinks, website: website.trim() };
    } else {
      updates.programme = programme.trim();
      updates.campus = campus.trim();
      if (graduationYear.trim()) updates.graduationYear = Number(graduationYear) || user.graduationYear;
      updates.careerAspirations = careerAspirations.trim();
      updates.portfolioLinks = {
        ...user.portfolioLinks,
        github: github.trim(),
        linkedin: linkedin.trim(),
        website: website.trim(),
      };
      if (user.role === 'alumni') {
        updates.currentCompany = currentCompany.trim();
        updates.currentRole = currentRole.trim();
      }
    }

    handleUpdateProfile(updates);
    setIsEditing(false);
  };
  const addTech = () => { if (!newTech.trim() || user.technicalSkills.includes(newTech.trim())) return; handleUpdateProfile({ technicalSkills: [...user.technicalSkills, newTech.trim()] }); setNewTech(''); };
  const removeTech = (skill: string) => handleUpdateProfile({ technicalSkills: user.technicalSkills.filter((s) => s !== skill) });
  const addSoft = () => { if (!newSoft.trim() || user.professionalSkills.includes(newSoft.trim())) return; handleUpdateProfile({ professionalSkills: [...user.professionalSkills, newSoft.trim()] }); setNewSoft(''); };
  const addBadge = () => { if (!newBadge.trim()) return; handleUpdateProfile({ digitalBadges: [...user.digitalBadges, { id: `badge-${Date.now()}`, title: newBadge.trim(), issuer: 'Richfield Academic Senate', issueDate: '2026', category: 'Specialization' }] }); setNewBadge(''); };
  const addAch = () => { if (!newAch.trim()) return; handleUpdateProfile({ achievements: [...user.achievements, { id: `ach-${Date.now()}`, title: newAch.trim(), category: 'academic', year: '2026', description: 'Campus recognition & academic achievement.' }] }); setNewAch(''); };

  const handleExport = async () => {
    const content = `RICHFIELD COLLEGE - VERIFIED ${user.role.toUpperCase()} DOSSIER
Name: ${user.name}
Role: ${user.role.toUpperCase()}
Email: ${user.email}
Campus: ${user.campus || 'Braamfontein'}
Programme: ${user.programme || 'BSc Information Technology'}
Headline: ${user.headline}

SUMMARY:
${user.summary}

TECHNICAL SKILLS:
${user.technicalSkills.join(', ')}

PROFESSIONAL SKILLS:
${user.professionalSkills.join(', ')}

VERIFIED BY RICHFIELD COLLEGE REGISTRY`;
    try {
      const dir = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || '';
      const fileUri = dir + `${user.name.replace(/\s+/g, '_')}_Richfield_CV.txt`;
      await (FileSystem as any).writeAsStringAsync(fileUri, content);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(fileUri);
      else Alert.alert('CV Generated', content.slice(0, 400));
    } catch {
      Alert.alert('CV Preview', content.slice(0, 800));
    }
  };

  const changeProfilePhoto = async () => {
    if (isUploadingAvatar) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to choose a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setIsUploadingAvatar(true);
    try {
      const publicUrl = await uploadUserImage(user.id, result.assets[0].uri, 'profile');
      handleUpdateProfile({ avatar: publicUrl });
    } catch (error: any) {
      Alert.alert('Photo upload failed', error?.message || 'Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = () => { void signOutUser(); };

  if (isAdmin) {
    const realUsers = users.filter((u) => !u.isShowcase);
    const pendingBusinesses = realUsers.filter(
      (u) => u.role === 'business' && u.businessDetails?.approvalStatus === 'pending'
    ).length;
    const pendingOpportunities = opportunities.filter((o) => o.status === 'pending_approval').length;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.cover} />
          <View style={styles.profileRow}>
            <UserAvatar uri={user.avatar} name={user.name || user.email} size={72} radius={16} style={styles.avatar as any} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <Text style={styles.name}>{user.name || 'Enrich Administrator'}</Text>
                <View style={styles.verifiedPill}>
                  <CheckCircle2 color={theme.colors.darkCyan} size={10} />
                  <Text style={styles.verifiedText}>Verified Admin</Text>
                </View>
              </View>
              <Text style={styles.role}>ADMINISTRATOR</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => void changeProfilePhoto()} style={styles.photoBtn}><Text style={styles.photoBtnText}>{isUploadingAvatar ? 'Uploading...' : 'Change Profile Photo'}</Text></TouchableOpacity>
          <Text style={styles.headline}>Richfield Enrich Governance Account</Text>
          <Text style={styles.summary}>
            This account is provisioned internally for governance, approvals, moderation, events and platform notices. Student career tools are intentionally hidden.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Administrator Access</Text>
          <View style={{ gap: 8, marginTop: 8 }}>
            <View style={styles.row}><Text style={styles.rowLabel}>Email</Text><Text style={styles.rowValue}>{user.email}</Text></View>
            <View style={styles.row}><Text style={styles.rowLabel}>Access level</Text><Text style={styles.rowValue}>Platform Administrator</Text></View>
            <View style={styles.row}><Text style={styles.rowLabel}>Verified users</Text><Text style={styles.rowValue}>{realUsers.length}</Text></View>
            <View style={styles.row}><Text style={styles.rowLabel}>Pending businesses</Text><Text style={styles.rowValue}>{pendingBusinesses}</Text></View>
            <View style={styles.row}><Text style={styles.rowLabel}>Pending opportunities</Text><Text style={styles.rowValue}>{pendingOpportunities}</Text></View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Governance Responsibilities</Text>
          <Text style={styles.boxText}>• Verify or reject business registrations</Text>
          <Text style={styles.boxText}>• Approve or reject opportunity listings</Text>
          <Text style={styles.boxText}>• Moderate community posts</Text>
          <Text style={styles.boxText}>• Create official Richfield events</Text>
          <Text style={styles.boxText}>• Send platform-wide or role-specific announcements</Text>
        </View>

        <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]} onPress={handleLogout}>
          <Text style={[styles.exportText, { color: '#BE123C' }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <View style={styles.cover} />
        <View style={styles.profileRow}>
          <UserAvatar uri={user.avatar} name={user.name || user.email} size={72} radius={16} style={styles.avatar as any} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}><Text style={styles.name}>{user.name}</Text>{user.verificationStatus === 'verified' && <View style={styles.verifiedPill}><CheckCircle2 color={theme.colors.darkCyan} size={10} /><Text style={styles.verifiedText}>Verified</Text></View>}</View>
            <Text style={styles.role}>{user.role.toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(!isEditing)}><Text style={styles.editBtnText}>{isEditing ? 'Cancel' : 'Edit'}</Text></TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => void changeProfilePhoto()} style={styles.photoBtn}><Text style={styles.photoBtnText}>{isUploadingAvatar ? 'Uploading...' : user.avatar ? 'Change Profile Photo' : 'Add Profile Photo'}</Text></TouchableOpacity>
        {isEditing ? (
          <View style={styles.editBox}>
            <Text style={styles.editSection}>Core Profile</Text>
            <Text style={styles.label}>Headline</Text><TextInput value={headline} onChangeText={setHeadline} style={styles.input} placeholder="e.g. Aspiring Cloud & Software Developer" placeholderTextColor={theme.colors.slate400} />
            <Text style={styles.label}>About / Summary</Text><TextInput value={summary} onChangeText={setSummary} style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]} multiline placeholder="Tell recruiters what you are building, learning or hiring for." placeholderTextColor={theme.colors.slate400} />
            {isBusiness ? (
              <>
                <Text style={styles.editSection}>Organisation Details</Text>
                <Text style={styles.label}>Industry</Text><TextInput value={businessIndustry} onChangeText={setBusinessIndustry} style={styles.input} placeholderTextColor={theme.colors.slate400} />
                <Text style={styles.label}>Location</Text><TextInput value={businessLocation} onChangeText={setBusinessLocation} style={styles.input} placeholderTextColor={theme.colors.slate400} />
                <Text style={styles.label}>Company Overview</Text><TextInput value={businessDescription} onChangeText={setBusinessDescription} style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]} multiline placeholderTextColor={theme.colors.slate400} />
                <Text style={styles.label}>Website</Text><TextInput value={website} onChangeText={setWebsite} style={styles.input} autoCapitalize="none" placeholder="https://company.co.za" placeholderTextColor={theme.colors.slate400} />
                <Text style={styles.label}>Contact Phone</Text><TextInput value={businessPhone} onChangeText={setBusinessPhone} style={styles.input} keyboardType="phone-pad" placeholderTextColor={theme.colors.slate400} />
                <Text style={styles.label}>Talent Requirements (comma separated)</Text><TextInput value={talentRequirements} onChangeText={setTalentRequirements} style={styles.input} placeholder="Java, SQL, Cloud, Business Analysis" placeholderTextColor={theme.colors.slate400} />
              </>
            ) : (
              <>
                <Text style={styles.editSection}>Academic & Career Details</Text>
                <Text style={styles.label}>Programme</Text><TextInput value={programme} onChangeText={setProgramme} style={styles.input} placeholderTextColor={theme.colors.slate400} />
                <Text style={styles.label}>Campus</Text><TextInput value={campus} onChangeText={setCampus} style={styles.input} placeholderTextColor={theme.colors.slate400} />
                <Text style={styles.label}>Graduation Year</Text><TextInput value={graduationYear} onChangeText={setGraduationYear} style={styles.input} keyboardType="number-pad" placeholderTextColor={theme.colors.slate400} />
                {user.role === 'alumni' && <><Text style={styles.label}>Current Company</Text><TextInput value={currentCompany} onChangeText={setCurrentCompany} style={styles.input} placeholderTextColor={theme.colors.slate400} /><Text style={styles.label}>Current Role</Text><TextInput value={currentRole} onChangeText={setCurrentRole} style={styles.input} placeholderTextColor={theme.colors.slate400} /></>}
                <Text style={styles.label}>Career Goal</Text><TextInput value={careerAspirations} onChangeText={setCareerAspirations} style={[styles.input, { height: 62, textAlignVertical: 'top', paddingTop: 10 }]} multiline placeholder="What role or industry are you working toward?" placeholderTextColor={theme.colors.slate400} />
                <Text style={styles.editSection}>Portfolio Links</Text>
                <Text style={styles.label}>GitHub</Text><TextInput value={github} onChangeText={setGithub} style={styles.input} autoCapitalize="none" placeholder="https://github.com/..." placeholderTextColor={theme.colors.slate400} />
                <Text style={styles.label}>LinkedIn</Text><TextInput value={linkedin} onChangeText={setLinkedin} style={styles.input} autoCapitalize="none" placeholder="https://linkedin.com/in/..." placeholderTextColor={theme.colors.slate400} />
                <Text style={styles.label}>Portfolio / Project Website</Text><TextInput value={website} onChangeText={setWebsite} style={styles.input} autoCapitalize="none" placeholder="https://..." placeholderTextColor={theme.colors.slate400} />
              </>
            )}
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}><TouchableOpacity onPress={() => setIsEditing(false)} style={styles.btnGhost}><Text style={styles.btnGhostText}>Cancel</Text></TouchableOpacity><TouchableOpacity onPress={saveProfile} style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>Save Changes</Text></TouchableOpacity></View>
          </View>
        ) : (
          <View style={{ gap: 6 }}>
            <Text style={styles.headline}>{user.headline}</Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}><GraduationCap color={theme.colors.darkCyan} size={12} /><Text style={styles.meta}>{user.programme || 'Richfield Faculty of IT'}</Text><Text style={styles.dot}>•</Text><MapPin color={theme.colors.darkCyan} size={12} /><Text style={styles.meta}>{user.campus || 'Braamfontein'}</Text><Text style={styles.dot}>•</Text><Text style={styles.meta}>Class of {user.graduationYear || '2026'}</Text></View>
            {user.summary ? <Text style={styles.summary}>{user.summary}</Text> : null}
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}><Download color={theme.colors.darkCyan} size={14} /><Text style={styles.exportText}>Export CV</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]} onPress={handleLogout}><Text style={[styles.exportText, { color: '#BE123C' }]}>Sign Out</Text></TouchableOpacity>
        </View>
      </View>

      {isBusiness ? (
        <>
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><Building2 color={theme.colors.navy} size={14} /><Text style={styles.cardTitle}>Business Credentials</Text></View>
            <View style={{ gap: 8, marginTop: 8 }}>
              <View style={styles.row}><Text style={styles.rowLabel}>Organisation</Text><Text style={styles.rowValue}>{user.businessDetails?.organizationName}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Industry</Text><Text style={styles.rowValue}>{user.businessDetails?.industry}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Location</Text><Text style={styles.rowValue}>{user.businessDetails?.location}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Website</Text><Text style={[styles.rowValue, { color: theme.colors.royal }]}>{user.businessDetails?.website}</Text></View>
              <View style={styles.box}><Text style={styles.boxLabel}>Company Overview</Text><Text style={styles.boxText}>{user.businessDetails?.companyDescription || user.summary}</Text></View>
              <View style={styles.box}><Text style={styles.boxLabel}>Talent Requirements</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{(user.businessDetails?.talentRequirements || ['Graduate talent']).map((t) => <View key={t} style={styles.reqTag}><Text style={styles.reqText}>{t}</Text></View>)}</View></View>
            </View>
          </View>
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><BarChart3 color={theme.colors.darkCyan} size={14} /><Text style={styles.cardTitle}>Placement Analytics</Text></View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {realBusinessStats.map((s) => <View key={s.label} style={styles.stat}><Text style={styles.statLabel}>{s.label}</Text><Text style={styles.statValue}>{s.value}</Text></View>)}
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={styles.cardTitle}>Technical Skills & Endorsements</Text><Text style={styles.count}>{user.technicalSkills.length} Verified</Text></View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {user.technicalSkills.map((skill) => {
                const end = user.endorsements.find((e) => e.skill.toLowerCase() === skill.toLowerCase());
                return <View key={skill} style={styles.skillPill}><Text style={styles.skillPillText}>{skill}</Text>{end && <View style={styles.endBadge}><Text style={styles.endBadgeText}>+{end.count}</Text></View>}<TouchableOpacity onPress={() => removeTech(skill)} style={{ marginLeft: 4 }}><Trash2 color={theme.colors.slate400} size={12} /></TouchableOpacity></View>;
              })}
            </View>
            <View style={styles.addRow}><TextInput value={newTech} onChangeText={setNewTech} placeholder="Add skill (e.g. AWS Lambda, Docker...)" style={[styles.input, { flex: 1 }]} placeholderTextColor={theme.colors.slate400} /><TouchableOpacity onPress={addTech} style={styles.addBtn}><Plus color="#fff" size={14} /><Text style={styles.addBtnText}>Add</Text></TouchableOpacity></View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Professional & Interpersonal Competencies</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>{user.professionalSkills.map((s) => <View key={s} style={styles.softPill}><Text style={styles.softText}>{s}</Text></View>)}</View>
            <View style={styles.addRow}><TextInput value={newSoft} onChangeText={setNewSoft} placeholder="Add competency (e.g. Agile Leadership...)" style={[styles.input, { flex: 1 }]} placeholderTextColor={theme.colors.slate400} /><TouchableOpacity onPress={addSoft} style={styles.addBtnDark}><Text style={styles.addBtnText}>Add</Text></TouchableOpacity></View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Academic Distinctions & Societies</Text>
            <View style={{ gap: 8, marginTop: 8 }}>{user.achievements.map((a: any, i: number) => <View key={i} style={styles.ach}><Award color={theme.colors.darkCyan} size={14} /><View style={{ flex: 1 }}><Text style={styles.achTitle}>{a.title || a}</Text>{a.description && <Text style={styles.achDesc}>{a.description}</Text>}</View></View>)}</View>
            <View style={styles.addRow}><TextInput value={newAch} onChangeText={setNewAch} placeholder="Add distinction (e.g. Dean's Merit List 2025)" style={[styles.input, { flex: 1 }]} placeholderTextColor={theme.colors.slate400} /><TouchableOpacity onPress={addAch} style={styles.addBtnDark}><Text style={styles.addBtnText}>Add</Text></TouchableOpacity></View>
          </View>

          <View style={styles.card}>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><Award color={theme.colors.darkCyan} size={14} /><Text style={styles.cardTitle}>Verified Digital Badges</Text></View>
            <View style={{ gap: 8, marginTop: 8 }}>{user.digitalBadges.map((b) => <View key={b.id} style={styles.badge}><Text style={styles.badgeTitle}>{b.title}</Text><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={styles.badgeIssuer}>{b.issuer}</Text><Text style={styles.badgeDate}>{b.issueDate}</Text></View></View>)}</View>
            <View style={styles.addRow}><TextInput value={newBadge} onChangeText={setNewBadge} placeholder="Add badge (e.g. AWS Certified Cloud Practitioner)" style={[styles.input, { flex: 1 }]} placeholderTextColor={theme.colors.slate400} /><TouchableOpacity onPress={addBadge} style={styles.addBtn}><Text style={styles.addBtnText}>Claim Badge</Text></TouchableOpacity></View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Verified Portfolio & Repositories</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {user.portfolioLinks.github && <TouchableOpacity style={styles.linkCard}><Text style={styles.linkText}>GitHub Code Projects</Text><Text style={styles.linkUrl}>{user.portfolioLinks.github}</Text></TouchableOpacity>}
              {user.portfolioLinks.linkedin && <TouchableOpacity style={styles.linkCard}><Text style={styles.linkText}>LinkedIn Profile</Text><Text style={styles.linkUrl}>{user.portfolioLinks.linkedin}</Text></TouchableOpacity>}
              {user.portfolioLinks.website && <TouchableOpacity style={styles.linkCard}><Text style={styles.linkText}>Live Project Showcase</Text><Text style={styles.linkUrl}>{user.portfolioLinks.website}</Text></TouchableOpacity>}
              {!user.portfolioLinks.github && !user.portfolioLinks.linkedin && !user.portfolioLinks.website && <Text style={styles.empty}>No portfolio links yet. Add via edit.</Text>}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.slate50 },
  content: { padding: 12, gap: 12, paddingBottom: 24 },
  headerCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: theme.colors.slate200, overflow: 'hidden', paddingBottom: 14 },
  cover: { height: 80, backgroundColor: theme.colors.navy },
  profileRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 14, marginTop: -32, alignItems: 'flex-end' },
  avatar: { width: 72, height: 72, borderRadius: 16, borderWidth: 3, borderColor: '#fff' },
  name: { fontWeight: '900', fontSize: 14, color: theme.colors.navy },
  verifiedPill: { flexDirection: 'row', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#A7F3D0', alignItems: 'center' },
  verifiedText: { fontSize: 9, fontWeight: '800', color: theme.colors.darkCyan },
  role: { fontSize: 10, color: theme.colors.slate500, fontWeight: '700' },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  editBtnText: { color: theme.colors.navy, fontWeight: '700', fontSize: 11 },
  photoBtn: { marginHorizontal: 14, marginTop: 8, alignSelf: 'flex-start', backgroundColor: theme.colors.slate100, borderWidth: 1, borderColor: theme.colors.slate200, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  photoBtnText: { fontSize: 10, fontWeight: '800', color: theme.colors.navy },
  headline: { fontWeight: '700', fontSize: 12, color: theme.colors.slate700, paddingHorizontal: 14, marginTop: 12 },
  meta: { fontSize: 10, color: theme.colors.slate500 },
  dot: { color: theme.colors.slate400, fontSize: 10 },
  summary: { fontSize: 11, color: theme.colors.slate600, lineHeight: 16, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: theme.colors.slate100, paddingTop: 10, marginTop: 8 },
  editBox: { margin: 14, backgroundColor: theme.colors.slate50, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.slate200, gap: 8 },
  editSection: { fontWeight: '900', fontSize: 11, color: theme.colors.navy, marginTop: 4, borderBottomWidth: 1, borderBottomColor: theme.colors.slate200, paddingBottom: 5 },
  label: { fontWeight: '700', fontSize: 10, color: theme.colors.slate700 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 10, paddingHorizontal: 10, height: 40, fontSize: 11, color: theme.colors.navy },
  btnGhost: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.slate200 },
  btnGhostText: { fontWeight: '700', fontSize: 11, color: theme.colors.slate600 },
  btnPrimary: { backgroundColor: theme.colors.navy, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  exportBtn: { flex: 1, flexDirection: 'row', gap: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  exportText: { fontWeight: '700', fontSize: 11, color: theme.colors.slate700 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.slate200, gap: 4 },
  cardTitle: { fontWeight: '800', fontSize: 12, color: theme.colors.navy },
  count: { fontSize: 10, color: theme.colors.slate400 },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.slate100, paddingVertical: 6 },
  rowLabel: { fontSize: 10, color: theme.colors.slate500, fontWeight: '700', textTransform: 'uppercase' },
  rowValue: { fontSize: 11, color: theme.colors.navy, fontWeight: '600', flexShrink: 1, textAlign: 'right', marginLeft: 12 },
  box: { backgroundColor: theme.colors.slate50, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.slate200, gap: 6 },
  boxLabel: { fontWeight: '700', fontSize: 10, color: theme.colors.slate400, textTransform: 'uppercase' },
  boxText: { fontSize: 11, color: theme.colors.slate600, lineHeight: 16 },
  reqTag: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#C7D2FE' },
  reqText: { fontSize: 10, color: theme.colors.delftBlue, fontWeight: '700' },
  stat: { width: '48%', backgroundColor: theme.colors.slate50, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.slate200 },
  statLabel: { fontSize: 9, color: theme.colors.slate400, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontWeight: '900', fontSize: 14, color: theme.colors.navy, marginTop: 4 },
  skillPill: { flexDirection: 'row', gap: 6, backgroundColor: theme.colors.slate50, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.slate200, alignItems: 'center' },
  skillPillText: { fontWeight: '700', fontSize: 11, color: theme.colors.slate700 },
  endBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#A7F3D0' },
  endBadgeText: { fontSize: 9, fontWeight: '800', color: theme.colors.darkCyan },
  addRow: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: theme.colors.slate100, paddingTop: 10, marginTop: 8 },
  addBtn: { backgroundColor: theme.colors.darkCyan, paddingHorizontal: 12, borderRadius: 10, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  addBtnDark: { backgroundColor: theme.colors.navy, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  softPill: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#C7D2FE' },
  softText: { fontSize: 11, fontWeight: '700', color: theme.colors.delftBlue },
  ach: { flexDirection: 'row', gap: 8, backgroundColor: theme.colors.slate50, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.slate100 },
  achTitle: { fontWeight: '700', fontSize: 11, color: theme.colors.navy },
  achDesc: { fontSize: 10, color: theme.colors.slate500, marginTop: 2 },
  badge: { backgroundColor: '#ECFDF5', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#A7F3D0', gap: 4 },
  badgeTitle: { fontWeight: '800', fontSize: 11, color: theme.colors.navy },
  badgeIssuer: { fontSize: 9, color: theme.colors.slate500 },
  badgeDate: { fontSize: 9, color: theme.colors.darkCyan, fontWeight: '700', fontFamily: 'monospace' },
  linkCard: { backgroundColor: theme.colors.slate50, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.slate200 },
  linkText: { fontWeight: '700', fontSize: 11, color: theme.colors.navy },
  linkUrl: { fontSize: 10, color: theme.colors.slate500, marginTop: 2 },
  empty: { fontSize: 10, color: theme.colors.slate400, textAlign: 'center', paddingVertical: 8 },
});
