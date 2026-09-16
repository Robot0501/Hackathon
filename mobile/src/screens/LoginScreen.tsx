import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Mail, ShieldCheck, AlertCircle, LogIn, Lock } from 'lucide-react-native';
import { theme } from '../theme';
import { sendLoginOtp, signInWithPassword } from '../lib/authService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { refreshSession } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingFallback, setSendingFallback] = useState(false);

  const login = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) { setError('Enter the email address registered on Enrich.'); return; }
    if (!password) { setError('Enter your password.'); return; }

    setLoading(true);
    setError('');
    try {
      await signInWithPassword(cleanEmail, password);
      const profile = await refreshSession();
      if (!profile) throw new Error('Your account exists, but your Enrich profile could not be loaded.');
      if (profile.verificationStatus !== 'verified') throw new Error('Your account is waiting for Richfield approval.');
    } catch (e: any) {
      setError(e?.message || 'Unable to sign in. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const sendFallbackCode = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) { setError('Enter your email first, then request a verification code.'); return; }
    setSendingFallback(true);
    setError('');
    try {
      await sendLoginOtp(cleanEmail);
      navigation.navigate('VerifyOTP', { email: cleanEmail, mode: 'login' });
    } catch (e: any) {
      setError(e?.message || 'Could not send a fallback verification code.');
    } finally {
      setSendingFallback(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.infoBox}>
        <ShieldCheck color={theme.colors.royal} size={22} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Secure password sign-in</Text>
          <Text style={styles.infoText}>Use the password created during registration. First-time users still verify ownership of their email with a real OTP code.</Text>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Registered Email Address</Text>
        <View style={styles.inputWrap}>
          <Mail color={theme.colors.slate400} size={16} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="yourname@my.richfield.ac.za"
            style={styles.input}
            placeholderTextColor={theme.colors.slate400}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <Text style={styles.hint}>Students and alumni use their Richfield student email. Approved employers and staff use their registered Enrich email.</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrap}>
          <Lock color={theme.colors.slate400} size={16} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            style={styles.input}
            placeholderTextColor={theme.colors.slate400}
            secureTextEntry
          />
        </View>
      </View>

      {error ? <View style={styles.error}><AlertCircle color="#BE123C" size={14} /><Text style={styles.errorText}>{error}</Text></View> : null}

      <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.6 }]} onPress={login} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" size="small" /> : <LogIn color="#fff" size={16} />}
        <Text style={styles.primaryBtnText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.secondaryBtn, sendingFallback && { opacity: 0.6 }]} onPress={sendFallbackCode} disabled={sendingFallback}>
        {sendingFallback ? <ActivityIndicator color={theme.colors.royal} size="small" /> : <Mail color={theme.colors.royal} size={14} />}
        <Text style={styles.secondaryBtnText}>No password yet? Verify by email code</Text>
      </TouchableOpacity>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>First time using Enrich?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register', {})}><Text style={styles.link}>Register account</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 18, gap: 18, paddingBottom: 36 },
  infoBox: { flexDirection: 'row', gap: 12, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 14, padding: 14 },
  infoTitle: { fontWeight: '900', fontSize: 13, color: theme.colors.navy },
  infoText: { fontSize: 11, color: theme.colors.slate600, lineHeight: 16, marginTop: 3 },
  field: { gap: 7 },
  label: { fontWeight: '800', fontSize: 11, color: theme.colors.slate700 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.slate100, borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 12, paddingHorizontal: 12, height: 46 },
  input: { flex: 1, fontSize: 12, color: theme.colors.navy },
  hint: { fontSize: 10, color: theme.colors.slate500, lineHeight: 15 },
  error: { flexDirection: 'row', gap: 8, backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FECDD3', padding: 10, borderRadius: 10, alignItems: 'center' },
  errorText: { color: '#BE123C', fontSize: 11, flex: 1 },
  primaryBtn: { backgroundColor: theme.colors.royal, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  secondaryBtn: { borderWidth: 1, borderColor: theme.colors.slate200, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: '#fff' },
  secondaryBtnText: { color: theme.colors.royal, fontWeight: '800', fontSize: 11 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.colors.slate200, paddingTop: 14 },
  footerText: { color: theme.colors.slate500, fontSize: 11 },
  link: { color: theme.colors.royal, fontWeight: '800', fontSize: 11 },
});
