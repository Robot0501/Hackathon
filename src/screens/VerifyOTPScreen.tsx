import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import {
  Mail,
  FileCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react-native';
import { theme } from '../theme';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import {
  finalizeRegistration,
  sendLoginOtp,
  sendRegistrationOtp,
  signOut,
  verifyEmailOtp
} from '../lib/authService';

export default function VerifyOTPScreen() {
  const route = useRoute<any>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { refreshSession } = useApp();

  const { email, mode, registration } =
    route.params as RootStackParamList['VerifyOTP'];

  const [inputCode, setInputCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [businessPending, setBusinessPending] = useState(false);

  const handleVerify = async () => {
    if (!inputCode.trim()) {
      setErrorMessage('Enter the code sent to your email.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const auth = await verifyEmailOtp(email, inputCode);

      // Make sure Supabase returned an authenticated user
      const verifiedUser = auth.user;

      if (!verifiedUser) {
        throw new Error(
          'Email verification succeeded, but no authenticated user was returned.'
        );
      }

      if (mode === 'register' && registration) {
        const profile = await finalizeRegistration(
          verifiedUser.id,
          registration
        );

        if (
          profile.role === 'business' &&
          profile.verificationStatus !== 'verified'
        ) {
          await signOut();
          setBusinessPending(true);
          return;
        }
      }

      const profile = await refreshSession();

      if (!profile) {
        throw new Error(
          'Your account exists, but the Enrich profile could not be loaded.'
        );
      }

      if (profile.verificationStatus !== 'verified') {
        await signOut();
        throw new Error(
          'Your account is waiting for Richfield approval.'
        );
      }

      // AppNavigator switches to Main automatically
      // when refreshSession sets currentUser.

    } catch (e: any) {
      setErrorMessage(
        e?.message ||
          'Verification failed. Check the code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setErrorMessage('');

    try {
      if (mode === 'register' && registration) {
        await sendRegistrationOtp(registration);
      } else {
        await sendLoginOtp(email);
      }
    } catch (e: any) {
      setErrorMessage(
        e?.message || 'Could not resend the code.'
      );
    } finally {
      setResending(false);
    }
  };

  if (businessPending) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.successIcon}>
          <FileCheck
            color={theme.colors.darkCyan}
            size={32}
          />
        </View>

        <Text style={styles.successTitle}>
          Email Verified
        </Text>

        <Text style={styles.successSub}>
          Your recruiter email has been verified.
          The business account is now waiting for
          approval from a Richfield administrator
          before it can access student information
          or post opportunities.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.primaryBtnText}>
            Return to Enrich
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Mail
            color={theme.colors.darkCyan}
            size={28}
          />
        </View>

        <Text style={styles.eyebrow}>
          Real Email Verification
        </Text>

        <Text style={styles.title}>
          Check your inbox
        </Text>

        <Text style={styles.sub}>
          Supabase sent a one-time verification
          code to{' '}
          <Text
            style={{
              fontWeight: '800',
              color: theme.colors.navy
            }}
          >
            {email}
          </Text>
          .
        </Text>
      </View>

      <Text style={styles.label}>
        Verification Code
      </Text>

      <TextInput
        value={inputCode}
        onChangeText={setInputCode}
        maxLength={8}
        keyboardType="number-pad"
        placeholder="Enter code"
        style={styles.otpInput}
        placeholderTextColor={theme.colors.slate400}
      />

      {errorMessage ? (
        <View style={styles.error}>
          <AlertCircle
            color="#BE123C"
            size={14}
          />
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        </View>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          gap: 12
        }}
      >
        <TouchableOpacity
          style={[styles.btn, styles.backBtn]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text
            style={[
              styles.btnText,
              {
                color: theme.colors.slate700
              }
            ]}
          >
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.btn,
            {
              backgroundColor:
                theme.colors.darkCyan,
              flex: 2
            },
            loading && {
              opacity: 0.6
            }
          ]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              color="#fff"
              size="small"
            />
          ) : (
            <Text style={styles.btnText}>
              Verify & Continue
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.resendBtn}
        onPress={resend}
        disabled={resending}
      >
        {resending ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.royal}
          />
        ) : (
          <RefreshCw
            size={13}
            color={theme.colors.royal}
          />
        )}

        <Text style={styles.resend}>
          Resend verification code
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },

  content: {
    padding: 18,
    gap: 16,
    paddingBottom: 36
  },

  card: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8
  },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.darkCyan
  },

  title: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.navy
  },

  sub: {
    fontSize: 11,
    color: theme.colors.slate500,
    textAlign: 'center',
    lineHeight: 16
  },

  label: {
    fontWeight: '800',
    fontSize: 10,
    color: theme.colors.slate700,
    textTransform: 'uppercase',
    textAlign: 'center'
  },

  otpInput: {
    textAlign: 'center',
    letterSpacing: 6,
    fontWeight: '900',
    fontSize: 20,
    backgroundColor: theme.colors.slate100,
    borderWidth: 1,
    borderColor: theme.colors.slate200,
    borderRadius: 12,
    paddingVertical: 12
  },

  error: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center'
  },

  errorText: {
    color: '#BE123C',
    fontSize: 11,
    flex: 1
  },

  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6
  },

  backBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.slate200,
    flex: 1
  },

  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12
  },

  resendBtn: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8
  },

  resend: {
    color: theme.colors.royal,
    fontWeight: '700',
    fontSize: 11
  },

  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 4,
    borderColor: '#A7F3D0'
  },

  successTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.navy,
    textAlign: 'center'
  },

  successSub: {
    fontSize: 11,
    color: theme.colors.slate500,
    textAlign: 'center',
    lineHeight: 17
  },

  primaryBtn: {
    backgroundColor: theme.colors.navy,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },

  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13
  }
});