import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ShieldCheck, GraduationCap, Building2, CheckCircle2, Mail, ArrowRight, AlertCircle } from 'lucide-react-native';
import { theme } from '../theme';
import { RICHFIELD_CAMPUSES, RICHFIELD_PROGRAMMES } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export default function RegisterScreen() {
  const { handleRegisterSuccess } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const initialRole = route.params?.initialRole || 'student';
  const [selectedRole, setSelectedRole] = useState<'student' | 'alumni' | 'business' | 'admin'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [campus, setCampus] = useState(RICHFIELD_CAMPUSES[0]);
  const [programme, setProgramme] = useState(RICHFIELD_PROGRAMMES[0]);
  const [graduationYear, setGraduationYear] = useState('2026');
  const [orgName, setOrgName] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [cipcNumber, setCipcNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleContinue = () => {
    setErrorMessage('');
    if (!name.trim()) { setErrorMessage('Please enter your full name'); return; }
    if (selectedRole === 'student') {
      const em = email.trim().toLowerCase();
      if (!em.endsWith('@my.richfield.ac.za') && !em.endsWith('@richfield.ac.za')) {
        setErrorMessage('Students must use @my.richfield.ac.za'); return;
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      navigation.navigate('VerifyOTP', { email: em, name, role: selectedRole, code });
    } else if (selectedRole === 'alumni') {
      if (!email.trim()) { setErrorMessage('Please provide an active email'); return; }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      navigation.navigate('VerifyOTP', { email: email.trim().toLowerCase(), name, role: selectedRole, code });
    } else if (selectedRole === 'business') {
      if (!orgName.trim() || !email.trim()) { setErrorMessage('Organization name and work email required'); return; }
      // Business pending approval - directly create without OTP for demo, but go to OTP for consistency? We'll create pending.
      const newUser: any = {
        id: `user-biz-${Date.now()}`,
        name, email: email.toLowerCase(), role: 'business', verificationStatus: 'pending',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face',
        headline: `Talent Partner @ ${orgName}`, summary: `Recruitment lead at ${orgName}.`, campus: 'Corporate Partner',
        technicalSkills: ['Talent Sourcing'], professionalSkills: ['Employer Branding'], endorsements: [], workExperience: [],
        portfolioLinks: { website: orgWebsite || 'https://richfield.ac.za' }, digitalBadges: [], achievements: [], clubsSocieties: [], careerInterests: [], careerAspirations: '', profileCompleteness: 70,
        businessDetails: { organizationName: orgName, industry: 'Information Technology & Services', companyDescription: `${orgName} is a partner collaborating with Richfield.`, location: 'South Africa', website: orgWebsite, contactEmail: email, contactPhone: '+27 (0)11 000 0000', registrationNumber: cipcNumber || 'Pending', approvalStatus: 'pending', talentRequirements: [programme] }
      };
      handleRegisterSuccess(newUser);
    } else if (selectedRole === 'admin') {
      const newUser: any = {
        id: `user-admin-${Date.now()}`, name, email: email || 'admin@richfield.ac.za', role: 'admin', verificationStatus: 'verified', verificationId: 'RF-ADMIN-SECURE',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face', headline: 'Richfield Academic Administrator', summary: 'Authorized officer managing verification.', campus: campus,
        technicalSkills: ['Higher Education Governance'], professionalSkills: ['Institutional Leadership'], endorsements: [], workExperience: [], portfolioLinks: {}, digitalBadges: [], achievements: [], clubsSocieties: [], careerInterests: [], careerAspirations: '', profileCompleteness: 100
      };
      handleRegisterSuccess(newUser);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.iconBox}><ShieldCheck color="#fff" size={20} /></View>
        <View><Text style={styles.headerTitle}>Richfield Identity Verification</Text><Text style={styles.headerSub}>Enrich Platform Institutional Onboarding</Text></View>
      </View>

      <Text style={styles.label}>Select User Type</Text>
      <View style={styles.roleGrid}>
        {[
          { role: 'student', label: 'Student', icon: GraduationCap, badge: '@my.richfield.ac.za' },
          { role: 'alumni', label: 'Alumni', icon: CheckCircle2, badge: 'Diploma / Degree' },
          { role: 'business', label: 'Recruiter', icon: Building2, badge: 'Company Partner' },
          { role: 'admin', label: 'Admin', icon: ShieldCheck, badge: 'Staff' },
        ].map((item) => {
          const Icon = item.icon;
          const selected = selectedRole === item.role;
          return (
            <TouchableOpacity key={item.role} onPress={() => setSelectedRole(item.role as any)} style={[styles.roleCard, selected && styles.roleCardSelected]}>
              <Icon color={selected ? theme.colors.darkCyan : theme.colors.slate500} size={20} />
              <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>{item.label}</Text>
              <Text style={styles.roleBadge}>{item.badge}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.field}><Text style={styles.label}>Full Name</Text><TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Thabo Molefe" placeholderTextColor={theme.colors.slate400} /></View>

      {selectedRole === 'student' && (
        <>
          <View style={styles.field}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={styles.label}>Institutional Richfield Email</Text><Text style={styles.mandatory}>Mandatory</Text></View>
            <View style={styles.inputWithIcon}><Mail color={theme.colors.slate400} size={16} /><TextInput value={email} onChangeText={setEmail} style={styles.inputFlex} placeholder="name@my.richfield.ac.za" placeholderTextColor={theme.colors.slate400} autoCapitalize="none" keyboardType="email-address" /></View>
            <Text style={styles.hint}>Must end with @my.richfield.ac.za</Text>
          </View>
          <View style={styles.field}><Text style={styles.label}>Campus</Text><TextInput value={campus} onChangeText={setCampus} style={styles.input} placeholder="Braamfontein" /></View>
          <View style={styles.field}><Text style={styles.label}>Qualification</Text><TextInput value={programme} onChangeText={setProgramme} style={styles.input} placeholder="BSc Information Technology" /></View>
        </>
      )}
      {selectedRole === 'alumni' && (
        <>
          <View style={styles.field}><Text style={styles.label}>Active Email</Text><TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="alumni@work.co.za" autoCapitalize="none" keyboardType="email-address" /></View>
          <View style={styles.field}><Text style={styles.label}>Graduation Year</Text><TextInput value={graduationYear} onChangeText={setGraduationYear} style={styles.input} keyboardType="number-pad" /></View>
        </>
      )}
      {selectedRole === 'business' && (
        <>
          <View style={styles.field}><Text style={styles.label}>Organization / Company Name</Text><TextInput value={orgName} onChangeText={setOrgName} style={styles.input} placeholder="Standard Bank Group" /></View>
          <View style={styles.field}><Text style={styles.label}>Recruiter Corporate Email</Text><TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="hr@company.com" autoCapitalize="none" keyboardType="email-address" /></View>
          <View style={styles.field}><Text style={styles.label}>Company Website</Text><TextInput value={orgWebsite} onChangeText={setOrgWebsite} style={styles.input} placeholder="https://company.co.za" autoCapitalize="none" /></View>
          <View style={styles.field}><Text style={styles.label}>CIPC / Tax No.</Text><TextInput value={cipcNumber} onChangeText={setCipcNumber} style={styles.input} placeholder="1962/000738/06" /></View>
          <View style={styles.notice}><Text style={styles.noticeText}>POPIA: Business accounts undergo manual vetting before contacting students.</Text></View>
        </>
      )}
      {selectedRole === 'admin' && (
        <View style={styles.field}><Text style={styles.label}>Staff Email</Text><TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="dean@richfield.ac.za" autoCapitalize="none" /></View>
      )}

      {errorMessage ? <View style={styles.error}><AlertCircle color="#BE123C" size={14} /><Text style={styles.errorText}>{errorMessage}</Text></View> : null}
      <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
        <Text style={styles.primaryBtnText}>{selectedRole === 'business' || selectedRole === 'admin' ? 'Complete Registration' : 'Continue to Verification'}</Text><ArrowRight color="#fff" size={16} />
      </TouchableOpacity>
      <View style={styles.footerRow}><Text style={styles.footerText}>Already registered?</Text><TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={styles.link}>Sign In</Text></TouchableOpacity></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  header: { flexDirection: 'row', gap: 12, backgroundColor: theme.colors.navy, padding: 16, borderRadius: 16, alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: theme.colors.darkCyan, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontWeight: '800', fontSize: 14 },
  headerSub: { color: theme.colors.rosyBrown, fontSize: 11 },
  label: { fontWeight: '800', fontSize: 10, color: theme.colors.slate700, textTransform: 'uppercase', letterSpacing: 0.5 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleCard: { width: '48%', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.slate200, backgroundColor: theme.colors.slate50, gap: 6 },
  roleCardSelected: { borderColor: theme.colors.darkCyan, backgroundColor: '#ECFDF5', borderWidth: 2 },
  roleLabel: { fontWeight: '800', fontSize: 12, color: theme.colors.slate700 },
  roleLabelSelected: { color: theme.colors.navy },
  roleBadge: { fontSize: 9, color: theme.colors.slate500 },
  field: { gap: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 12, paddingHorizontal: 12, height: 44, fontSize: 12, color: theme.colors.navy },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 12, paddingHorizontal: 12, height: 44 },
  inputFlex: { flex: 1, fontSize: 12, color: theme.colors.navy },
  mandatory: { color: theme.colors.darkCyan, fontSize: 9, fontWeight: '800' },
  hint: { fontSize: 9, color: theme.colors.slate500 },
  notice: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', padding: 10, borderRadius: 10 },
  noticeText: { fontSize: 10, color: '#92400E' },
  error: { flexDirection: 'row', gap: 8, backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FECDD3', padding: 10, borderRadius: 10, alignItems: 'center' },
  errorText: { color: '#BE123C', fontSize: 11, flex: 1 },
  primaryBtn: { backgroundColor: theme.colors.royal, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.colors.slate200, paddingTop: 12 },
  footerText: { color: theme.colors.slate500, fontSize: 11 },
  link: { color: theme.colors.royal, fontWeight: '800', fontSize: 11 },
});
