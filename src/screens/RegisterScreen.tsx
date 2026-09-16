import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ShieldCheck, GraduationCap, Building2, CheckCircle2, Mail, ArrowRight, AlertCircle, Lock } from 'lucide-react-native';
import { theme } from '../theme';
import { RICHFIELD_CAMPUSES, RICHFIELD_PROGRAMMES } from '../data/mockData';
import { RegistrationPayload, sendRegistrationOtp } from '../lib/authService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export default function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const initialRole = route.params?.initialRole === 'business' || route.params?.initialRole === 'alumni' ? route.params.initialRole : 'student';
  const [selectedRole, setSelectedRole] = useState<'student' | 'alumni' | 'business'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [campus, setCampus] = useState(RICHFIELD_CAMPUSES[0]);
  const [programme, setProgramme] = useState(RICHFIELD_PROGRAMMES[0]);
  const [graduationYear, setGraduationYear] = useState(String(new Date().getFullYear()));
  const [currentCompany, setCurrentCompany] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [cipcNumber, setCipcNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setErrorMessage('');
    if (!name.trim()) { setErrorMessage('Please enter your full name.'); return; }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) { setErrorMessage('Please enter your email address.'); return; }
    if (password.length < 8) { setErrorMessage('Password must be at least 8 characters long.'); return; }
    if (password !== confirmPassword) { setErrorMessage('Passwords do not match.'); return; }

    if ((selectedRole === 'student' || selectedRole === 'alumni') && !cleanEmail.endsWith('@my.richfield.ac.za')) {
      setErrorMessage('Students and alumni must use their @my.richfield.ac.za email address.');
      return;
    }
    if (selectedRole === 'business' && !orgName.trim()) {
      setErrorMessage('Organization name is required for recruiter accounts.');
      return;
    }

    const payload: RegistrationPayload = {
      role: selectedRole,
      name: name.trim(),
      email: cleanEmail,
      password,
      campus: selectedRole === 'business' ? undefined : campus,
      programme: selectedRole === 'business' ? undefined : programme,
      graduationYear: selectedRole === 'alumni' ? Number(graduationYear) || undefined : undefined,
      currentCompany: selectedRole === 'alumni' ? currentCompany.trim() : undefined,
      organizationName: selectedRole === 'business' ? orgName.trim() : undefined,
      organizationWebsite: selectedRole === 'business' ? orgWebsite.trim() : undefined,
      registrationNumber: selectedRole === 'business' ? cipcNumber.trim() : undefined,
    };

    setLoading(true);
    try {
      await sendRegistrationOtp(payload);
      navigation.navigate('VerifyOTP', { email: cleanEmail, mode: 'register', registration: payload });
    } catch (e: any) {
      setErrorMessage(e?.message || 'Unable to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.iconBox}><ShieldCheck color="#fff" size={20} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Create Verified Enrich Account</Text>
          <Text style={styles.headerSub}>Create a password and verify your email with a real code. The password is stored securely by Supabase Auth, not in the Enrich profile table.</Text>
        </View>
      </View>

      <Text style={styles.label}>Select User Type</Text>
      <View style={styles.roleGrid}>
        {[
          { role: 'student', label: 'Student', icon: GraduationCap, badge: 'Richfield email' },
          { role: 'alumni', label: 'Alumni', icon: CheckCircle2, badge: 'Same Richfield email' },
          { role: 'business', label: 'Recruiter', icon: Building2, badge: 'Manual approval' },
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

      <View style={styles.field}><Text style={styles.label}>Full Name</Text><TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Full name" placeholderTextColor={theme.colors.slate400} /></View>

      {(selectedRole === 'student' || selectedRole === 'alumni') && (
        <>
          <View style={styles.field}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={styles.label}>Richfield Email</Text><Text style={styles.mandatory}>Mandatory</Text></View>
            <View style={styles.inputWithIcon}><Mail color={theme.colors.slate400} size={16} /><TextInput value={email} onChangeText={setEmail} style={styles.inputFlex} placeholder="studentnumber@my.richfield.ac.za" placeholderTextColor={theme.colors.slate400} autoCapitalize="none" keyboardType="email-address" /></View>
            <Text style={styles.hint}>Students and alumni use the same Richfield student email. Student → Alumni updates the same identity instead of creating a duplicate account.</Text>
          </View>
          <View style={styles.field}><Text style={styles.label}>Campus</Text><TextInput value={campus} onChangeText={setCampus} style={styles.input} placeholder="Cape Town Campus" placeholderTextColor={theme.colors.slate400} /></View>
          <View style={styles.field}><Text style={styles.label}>Qualification</Text><TextInput value={programme} onChangeText={setProgramme} style={styles.input} placeholder="BSc Information Technology" placeholderTextColor={theme.colors.slate400} /></View>
        </>
      )}

      {selectedRole === 'alumni' && (
        <>
          <View style={styles.field}><Text style={styles.label}>Graduation Year</Text><TextInput value={graduationYear} onChangeText={setGraduationYear} style={styles.input} keyboardType="number-pad" placeholderTextColor={theme.colors.slate400} /></View>
          <View style={styles.field}><Text style={styles.label}>Current Company (optional)</Text><TextInput value={currentCompany} onChangeText={setCurrentCompany} style={styles.input} placeholder="Current employer" placeholderTextColor={theme.colors.slate400} /></View>
        </>
      )}

      {selectedRole === 'business' && (
        <>
          <View style={styles.field}><Text style={styles.label}>Organization / Company Name</Text><TextInput value={orgName} onChangeText={setOrgName} style={styles.input} placeholder="Company name" placeholderTextColor={theme.colors.slate400} /></View>
          <View style={styles.field}><Text style={styles.label}>Recruiter Corporate Email</Text><TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="hr@company.co.za" autoCapitalize="none" keyboardType="email-address" placeholderTextColor={theme.colors.slate400} /></View>
          <View style={styles.field}><Text style={styles.label}>Company Website</Text><TextInput value={orgWebsite} onChangeText={setOrgWebsite} style={styles.input} placeholder="https://company.co.za" autoCapitalize="none" placeholderTextColor={theme.colors.slate400} /></View>
          <View style={styles.field}><Text style={styles.label}>CIPC / Registration No.</Text><TextInput value={cipcNumber} onChangeText={setCipcNumber} style={styles.input} placeholder="Company registration number" placeholderTextColor={theme.colors.slate400} /></View>
          <View style={styles.notice}><Text style={styles.noticeText}>The email is verified first. The business profile then remains pending until a Richfield administrator approves it.</Text></View>
        </>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>Create Password</Text>
        <View style={styles.inputWithIcon}><Lock color={theme.colors.slate400} size={16} /><TextInput value={password} onChangeText={setPassword} style={styles.inputFlex} placeholder="At least 8 characters" placeholderTextColor={theme.colors.slate400} secureTextEntry /></View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputWithIcon}><Lock color={theme.colors.slate400} size={16} /><TextInput value={confirmPassword} onChangeText={setConfirmPassword} style={styles.inputFlex} placeholder="Retype password" placeholderTextColor={theme.colors.slate400} secureTextEntry /></View>
      </View>

      <View style={styles.adminNotice}><Text style={styles.adminNoticeText}>Administrator accounts cannot self-register. They are created/promoted securely in Supabase by the project administrator.</Text></View>

      {errorMessage ? <View style={styles.error}><AlertCircle color="#BE123C" size={14} /><Text style={styles.errorText}>{errorMessage}</Text></View> : null}
      <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.6 }]} onPress={handleContinue} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" size="small" /> : <><Text style={styles.primaryBtnText}>Send Verification Code</Text><ArrowRight color="#fff" size={16} /></>}
      </TouchableOpacity>
      <View style={styles.footerRow}><Text style={styles.footerText}>Already registered?</Text><TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={styles.link}>Sign in</Text></TouchableOpacity></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: 16, gap: 14, paddingBottom: 36 },
  header: { flexDirection: 'row', gap: 10, backgroundColor: theme.colors.navy, padding: 14, borderRadius: 16, alignItems: 'center' },
  iconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.colors.darkCyan, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 13 }, headerSub: { color: '#CBD5E1', fontSize: 10, marginTop: 2, lineHeight: 14 },
  label: { fontWeight: '800', fontSize: 10, color: theme.colors.slate700, textTransform: 'uppercase' },
  roleGrid: { flexDirection: 'row', gap: 8 }, roleCard: { flex: 1, padding: 10, borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 14, gap: 5, minHeight: 82 },
  roleCardSelected: { borderColor: theme.colors.darkCyan, backgroundColor: '#ECFDF5' }, roleLabel: { fontWeight: '800', fontSize: 11, color: theme.colors.slate700 }, roleLabelSelected: { color: theme.colors.navy }, roleBadge: { fontSize: 8, color: theme.colors.slate400 },
  field: { gap: 6 }, input: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 10, paddingHorizontal: 10, minHeight: 42, fontSize: 11, color: theme.colors.navy },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 10, paddingHorizontal: 10, minHeight: 42 }, inputFlex: { flex: 1, fontSize: 11, color: theme.colors.navy },
  mandatory: { fontSize: 9, color: theme.colors.darkCyan, fontWeight: '800' }, hint: { fontSize: 9, color: theme.colors.slate500, lineHeight: 14 },
  notice: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', padding: 10, borderRadius: 10 }, noticeText: { fontSize: 10, color: '#92400E', lineHeight: 14 },
  adminNotice: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: theme.colors.slate200, padding: 10, borderRadius: 10 }, adminNoticeText: { fontSize: 9, color: theme.colors.slate500, lineHeight: 14 },
  error: { flexDirection: 'row', gap: 8, backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FECDD3', padding: 10, borderRadius: 10, alignItems: 'center' }, errorText: { color: '#BE123C', fontSize: 11, flex: 1 },
  primaryBtn: { backgroundColor: theme.colors.royal, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 }, primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.colors.slate200, paddingTop: 12 }, footerText: { color: theme.colors.slate500, fontSize: 11 }, link: { color: theme.colors.royal, fontWeight: '800', fontSize: 11 },
});
