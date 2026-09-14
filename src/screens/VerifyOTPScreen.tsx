import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Mail, FileCheck, AlertCircle, Sparkles } from 'lucide-react-native';
import { theme } from '../theme';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { RICHFIELD_CAMPUSES, RICHFIELD_PROGRAMMES } from '../data/mockData';

export default function VerifyOTPScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { handleRegisterSuccess } = useApp();
  const { email, name, role, code: initialCode } = route.params as { email: string; name: string; role: string; code: string };
  const [generatedCode] = useState(initialCode || Math.floor(100000 + Math.random() * 900000).toString());
  const [inputCode, setInputCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [step, setStep] = useState<2 | 3>(2);

  const handleVerify = () => {
    setErrorMessage('');
    if (inputCode.trim() !== generatedCode) {
      setErrorMessage('Incorrect verification code. Use the demo code shown.');
      return;
    }
    setStep(3);
  };

  const completeRegistration = () => {
    if (role === 'student' || role === 'alumni') {
      const studentId = `RF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newUser: any = {
        id: `user-${Date.now()}`,
        name, email: email.toLowerCase(), role, verificationStatus: 'verified',
        verificationId: role === 'student' ? studentId : `RF-ALUM-${Math.floor(1000 + Math.random() * 9000)}`,
        avatar: role === 'student'
          ? 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=300&h=300&fit=crop&crop=face'
          : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
        headline: role === 'student' ? `${RICHFIELD_PROGRAMMES[0]} Scholar | ${RICHFIELD_CAMPUSES[0]}` : `Richfield Alumnus (2026)`,
        summary: role === 'student' ? `Richfield student pursuing ${RICHFIELD_PROGRAMMES[0]}.` : `Richfield graduate.`,
        programme: RICHFIELD_PROGRAMMES[0], campus: RICHFIELD_CAMPUSES[0],
        enrolmentYear: 2024, graduationYear: 2026,
        technicalSkills: ['Programming Logic', 'Problem Solving', 'Data Structures'],
        professionalSkills: ['Communication', 'Teamwork'], endorsements: [], workExperience: [],
        portfolioLinks: { linkedin: `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '-')}` },
        digitalBadges: [{ id: `badge-init-${Date.now()}`, title: 'Institutional Verified Scholar', issuer: 'Richfield Registry', issueDate: 'Today', category: 'Identity' }],
        achievements: [], clubsSocieties: ['Richfield Career Network'], careerInterests: ['Information Technology'], careerAspirations: 'To excel in high-impact roles.', profileCompleteness: 65
      };
      handleRegisterSuccess(newUser);
    }
  };

  if (step === 3) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.successIcon}><FileCheck color={theme.colors.darkCyan} size={32} /></View>
        <Text style={styles.successTitle}>{role === 'business' ? 'Registration Submitted for Vetting' : 'Verification Complete!'}</Text>
        <Text style={styles.successSub}>Welcome, {name}! Your {role} account has been validated against Richfield registry.</Text>
        <View style={styles.detailsBox}>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Account Type</Text><Text style={styles.detailValue}>{role}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Institutional ID</Text><Text style={[styles.detailValue, { color: theme.colors.darkCyan }]}>RF-2026-ACTIVE</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Email</Text><Text style={styles.detailValue}>{email}</Text></View>
        </View>
        <TouchableOpacity style={styles.primaryBtn} onPress={completeRegistration}>
          <Text style={styles.primaryBtnText}>Launch Enrich Workspace</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <View style={styles.iconCircle}><Mail color={theme.colors.darkCyan} size={28} /></View>
        <Text style={styles.eyebrow}>Email Verification</Text>
        <Text style={styles.title}>Check your inbox</Text>
        <Text style={styles.sub}>We sent a 6-digit code to <Text style={{ fontWeight: '800', color: theme.colors.navy }}>{email}</Text>. Enter it below.</Text>
      </View>

      <View style={styles.banner}>
        <Sparkles color={theme.colors.darkCyan} size={14} />
        <Text style={styles.bannerText}>Demo mode active: use code {generatedCode} for verification (SMTP not configured)</Text>
      </View>
      <TouchableOpacity style={styles.autoFill} onPress={() => setInputCode(generatedCode)}><Text style={styles.autoFillText}>Auto-Fill OTP</Text></TouchableOpacity>

      <Text style={styles.label}>6-Digit Verification Code</Text>
      <TextInput value={inputCode} onChangeText={setInputCode} maxLength={6} keyboardType="number-pad" placeholder="000000" style={styles.otpInput} placeholderTextColor={theme.colors.slate400} />

      {errorMessage ? <View style={styles.error}><AlertCircle color="#BE123C" size={14} /><Text style={styles.errorText}>{errorMessage}</Text></View> : null}

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, flex: 1 }]} onPress={() => navigation.goBack()}><Text style={[styles.btnText, { color: theme.colors.slate700 }]}>Back</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.colors.darkCyan, flex: 1 }]} onPress={handleVerify}><Text style={styles.btnText}>Verify & Continue</Text></TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => setInputCode(generatedCode)}><Text style={styles.resend}>Resend verification code</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  card: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', padding: 16, borderRadius: 16, alignItems: 'center', gap: 8 },
  iconCircle: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#A7F3D0' },
  eyebrow: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: theme.colors.darkCyan },
  title: { fontSize: 20, fontWeight: '900', color: theme.colors.navy },
  sub: { fontSize: 11, color: theme.colors.slate500, textAlign: 'center', lineHeight: 16 },
  banner: { flexDirection: 'row', gap: 8, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', padding: 10, borderRadius: 10, alignItems: 'center' },
  bannerText: { fontSize: 10, color: theme.colors.navy, flex: 1, fontWeight: '600' },
  autoFill: { backgroundColor: theme.colors.darkCyan, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  autoFillText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  label: { fontWeight: '800', fontSize: 10, color: theme.colors.slate700, textTransform: 'uppercase', textAlign: 'center' },
  otpInput: { textAlign: 'center', letterSpacing: 8, fontWeight: '900', fontSize: 20, backgroundColor: theme.colors.slate100, borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 12, paddingVertical: 12 },
  error: { flexDirection: 'row', gap: 8, backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FECDD3', padding: 10, borderRadius: 10, alignItems: 'center' },
  errorText: { color: '#BE123C', fontSize: 11, flex: 1 },
  btn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, flexDirection: 'row', gap: 6 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  resend: { color: theme.colors.royal, fontWeight: '700', fontSize: 11, textAlign: 'center', marginTop: 4 },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', borderWidth: 4, borderColor: '#A7F3D0' },
  successTitle: { fontSize: 18, fontWeight: '900', color: theme.colors.navy, textAlign: 'center' },
  successSub: { fontSize: 11, color: theme.colors.slate500, textAlign: 'center', lineHeight: 16 },
  detailsBox: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 12, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { color: theme.colors.slate500, fontSize: 10 },
  detailValue: { fontWeight: '700', fontSize: 11, color: theme.colors.navy, textTransform: 'capitalize' },
  primaryBtn: { backgroundColor: theme.colors.navy, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
