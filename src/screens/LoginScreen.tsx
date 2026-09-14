import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Mail, Lock, LogIn, ShieldCheck, GraduationCap, Award, Building2, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { theme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export default function LoginScreen() {
  const { users, setCurrentUser } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isOtp, setIsOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [pendingUser, setPendingUser] = useState<any>(null);

  const handleStandardLogin = () => {
    setErrorMsg('');
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) { setErrorMsg('Please enter your registered email.'); return; }
    const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matched) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(code);
      setPendingUser(matched);
      setIsOtp(true);
    } else {
      setErrorMsg(`No account found for "${cleanEmail}". Please register.`);
    }
  };

  const handleVerifyOtp = () => {
    if (enteredOtp.trim() !== otpCode) { setErrorMsg('Invalid code. Use the simulated OTP above.'); return; }
    if (pendingUser) { setCurrentUser(pendingUser); }
  };

  if (isOtp) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.otpBanner}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><KeyRound color={theme.colors.royal} size={16} /><Text style={styles.otpTitle}>Institutional 2FA Verification</Text></View>
          <Text style={styles.otpSub}>A 6-digit token sent to:</Text>
          <Text style={styles.otpEmail}>{pendingUser?.email}</Text>
          <View style={styles.codeBox}><Text style={styles.codeLabel}>Simulated Code:</Text><Text style={styles.code}>{otpCode}</Text></View>
        </View>
        <Text style={styles.label}>Enter 6-Digit Token</Text>
        <TextInput value={enteredOtp} onChangeText={setEnteredOtp} maxLength={6} keyboardType="number-pad" placeholder="000000" style={styles.otpInput} placeholderTextColor={theme.colors.slate400} />
        {errorMsg ? <View style={styles.error}><AlertCircle color="#BE123C" size={14} /><Text style={styles.errorText}>{errorMsg}</Text></View> : null}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, flex: 1 }]} onPress={() => setIsOtp(false)}><Text style={[styles.btnText, { color: theme.colors.slate700 }]}>Back</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: theme.colors.navy, flex: 1 }]} onPress={handleVerifyOtp}><CheckCircle2 color="#fff" size={14} /><Text style={styles.btnText}>Confirm & Enter</Text></TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.infoBox}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><ShieldCheck color={theme.colors.royal} size={14} /><Text style={styles.infoTitle}>Sign-In Email Format Requirements</Text></View>
        <View style={styles.formatGrid}>
          <TouchableOpacity style={styles.formatCard} onPress={() => setEmailInput('thabo.molefe@my.richfield.ac.za')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><GraduationCap color={theme.colors.royal} size={14} /><Text style={styles.formatLabel}>Students</Text></View>
            <Text style={styles.formatCode}>name@my.richfield.ac.za</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.formatCard} onPress={() => setEmailInput('lerato.khumalo@alumni.richfield.ac.za')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Award color="#047857" size={14} /><Text style={styles.formatLabel}>Alumni</Text></View>
            <Text style={styles.formatCode}>name@company.co.za</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.formatCard} onPress={() => setEmailInput('sarah.jenkins@standardbank.co.za')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Building2 color="#4F46E5" size={14} /><Text style={styles.formatLabel}>Recruiters</Text></View>
            <Text style={styles.formatCode}>company@company.com</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.formatCard} onPress={() => setEmailInput('admin@richfield.ac.za')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><KeyRound color="#BE123C" size={14} /><Text style={styles.formatLabel}>Staff</Text></View>
            <Text style={styles.formatCode}>staff@richfield.ac.za</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Your Registered Email Address</Text>
        <View style={styles.inputWrap}>
          <Mail color={theme.colors.slate400} size={16} />
          <TextInput value={emailInput} onChangeText={setEmailInput} placeholder="e.g. yourname@my.richfield.ac.za" style={styles.input} placeholderTextColor={theme.colors.slate400} autoCapitalize="none" keyboardType="email-address" />
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Password or PIN</Text>
        <View style={styles.inputWrap}>
          <Lock color={theme.colors.slate400} size={16} />
          <TextInput value={passwordInput} onChangeText={setPasswordInput} placeholder="••••••••" style={styles.input} placeholderTextColor={theme.colors.slate400} secureTextEntry />
        </View>
      </View>
      {errorMsg ? <View style={styles.error}><AlertCircle color="#BE123C" size={14} /><Text style={styles.errorText}>{errorMsg}</Text></View> : null}
      <TouchableOpacity style={styles.primaryBtn} onPress={handleStandardLogin}>
        <LogIn color="#fff" size={16} /><Text style={styles.primaryBtnText}>Verify Identity & Proceed</Text>
      </TouchableOpacity>

      <View style={styles.divider}><View style={styles.line} /><Text style={styles.dividerText}>First-Time / Instant Demo Access</Text><View style={styles.line} /></View>
      <Text style={styles.demoHint}>Select an accredited profile to test role-specific workflows:</Text>
      <View style={{ gap: 8 }}>
        {users.map((u) => (
          <TouchableOpacity key={u.id} style={styles.demoCard} onPress={() => setCurrentUser(u)}>
            <Image source={{ uri: u.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}><Text style={styles.demoName}>{u.name}</Text><Text style={styles.demoMeta}>{u.role} • {u.campus?.split(',')[0]}</Text></View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>First time using Enrich?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register', {})}><Text style={styles.link}>Register new account</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  infoBox: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 14, padding: 12, gap: 10 },
  infoTitle: { fontWeight: '800', fontSize: 11, color: theme.colors.navy },
  formatGrid: { gap: 8 },
  formatCard: { backgroundColor: '#fff', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 4 },
  formatLabel: { fontWeight: '800', fontSize: 11 },
  formatCode: { fontFamily: 'monospace', fontSize: 10, color: theme.colors.royal, fontWeight: '700' },
  field: { gap: 6 },
  label: { fontWeight: '800', fontSize: 11, color: theme.colors.slate700 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.slate100, borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 12, paddingHorizontal: 12, height: 44 },
  input: { flex: 1, fontSize: 12, color: theme.colors.navy },
  error: { flexDirection: 'row', gap: 8, backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FECDD3', padding: 10, borderRadius: 10, alignItems: 'center' },
  errorText: { color: '#BE123C', fontSize: 11, flex: 1 },
  primaryBtn: { backgroundColor: theme.colors.royal, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  line: { flex: 1, height: 1, backgroundColor: theme.colors.slate200 },
  dividerText: { fontSize: 9, fontWeight: '800', color: theme.colors.slate500, textTransform: 'uppercase' },
  demoHint: { fontSize: 11, color: theme.colors.slate600, fontWeight: '600' },
  demoCard: { flexDirection: 'row', gap: 12, backgroundColor: theme.colors.slate50, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.slate200, alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 8 },
  demoName: { fontWeight: '800', fontSize: 12, color: theme.colors.navy },
  demoMeta: { fontSize: 10, color: theme.colors.slate500, textTransform: 'capitalize' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.colors.slate200, paddingTop: 12, marginTop: 8 },
  footerText: { color: theme.colors.slate500, fontSize: 11 },
  link: { color: theme.colors.royal, fontWeight: '800', fontSize: 11 },
  otpBanner: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', padding: 14, borderRadius: 14, gap: 6 },
  otpTitle: { fontWeight: '800', color: theme.colors.royal, fontSize: 12 },
  otpSub: { color: theme.colors.slate500, fontSize: 11 },
  otpEmail: { fontWeight: '700', color: theme.colors.navy, fontSize: 12 },
  codeBox: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#BFDBFE', paddingTop: 8, marginTop: 6 },
  codeLabel: { color: theme.colors.slate500, fontSize: 10 },
  code: { fontWeight: '900', color: theme.colors.royal, letterSpacing: 2 },
  otpInput: { textAlign: 'center', letterSpacing: 6, fontWeight: '900', fontSize: 18, backgroundColor: theme.colors.slate100, borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 12, paddingVertical: 12 },
  btn: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
});
