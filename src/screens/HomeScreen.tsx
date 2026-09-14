import React from 'react';
import { ScrollView, View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { CheckCircle2, ShieldCheck, MapPin, GraduationCap, Award, Building2, Target, FileCheck, Users, Sparkles, ArrowRight, LogIn } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { theme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export default function HomeScreen() {
  const { users, setCurrentUser } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoBox}><Text style={styles.logoText}>R</Text></View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.brandName}>Enrich</Text>
                <View style={styles.richBadge}><Text style={styles.richBadgeText}>Richfield</Text></View>
              </View>
              <Text style={styles.brandSub}>Careers & Placement Ecosystem</Text>
            </View>
          </View>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.btnGhost} onPress={() => navigation.navigate('Login')}>
              <LogIn color={theme.colors.slate500} size={14} /><Text style={styles.btnGhostText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Register', { initialRole: 'student' })}>
              <Text style={styles.btnPrimaryText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.pill}><View style={styles.dot} /><Text style={styles.pillText}>Richfield Official Career Platform</Text></View>
          <Text style={styles.heroTitle}>Bridging Richfield Talent with South Africa’s Leading Enterprises.</Text>
          <Text style={styles.heroSub}>Verified dossiers, AI career guidance, direct hiring pipelines, and alumni mentorship for 8 national campuses.</Text>
          <View style={styles.heroBtns}>
            <TouchableOpacity style={[styles.btnLarge, { backgroundColor: theme.colors.royal }]} onPress={() => navigation.navigate('Register', { initialRole: 'student' })}>
              <Text style={styles.btnLargeText}>Get Started as Student</Text><ArrowRight color="#fff" size={16} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnLarge, styles.btnLargeOutline]} onPress={() => navigation.navigate('Login')}>
              <LogIn color={theme.colors.navy} size={16} /><Text style={[styles.btnLargeText, { color: theme.colors.navy }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.trustRow}>
            <View style={styles.trustItem}><CheckCircle2 color={theme.colors.darkCyan} size={14} /><Text style={styles.trustText}>POPIA Certified</Text></View>
            <View style={styles.trustItem}><ShieldCheck color={theme.colors.royal} size={14} /><Text style={styles.trustText}>DHET Registered</Text></View>
            <View style={styles.trustItem}><MapPin color={theme.colors.rosyBrown} size={14} /><Text style={styles.trustText}>8 Campuses</Text></View>
          </View>
          <View style={styles.heroCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80' }} style={styles.heroImage} />
            <View style={styles.heroCardBody}>
              <View style={styles.heroCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={styles.iconBox}><GraduationCap color={theme.colors.royal} size={16} /></View>
                  <View><Text style={styles.cardTitle}>Verified Career Dossier</Text><Text style={styles.cardSub}>BSc IT & Diploma in IT</Text></View>
                </View>
                <View style={styles.verifiedPill}><CheckCircle2 color={theme.colors.darkCyan} size={12} /><Text style={styles.verifiedText}>Verified</Text></View>
              </View>
              <View style={styles.metricRow}><Text style={styles.metricLabel}>Employment Readiness Score</Text><Text style={styles.metricValue}>92% (Top Tier)</Text></View>
              <View style={styles.metricRow}><Text style={styles.metricLabel}>Industry Partners</Text><Text style={styles.metricLabelValue}>Standard Bank, Vodacom, Entelect</Text></View>
            </View>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsGrid}>
          {[
            { v: '8', l: 'National Campuses', s: 'Johannesburg, Durban...' },
            { v: '92%', l: 'Placement Index', s: 'Graduate readiness' },
            { v: '250+', l: 'Vetted Employers', s: 'Direct hiring partners' },
            { v: '100%', l: 'Verified Dossiers', s: 'Accredited records' },
          ].map((m) => (
            <View key={m.l} style={styles.metricCard}>
              <Text style={styles.metricBig}>{m.v}</Text><Text style={styles.metricLabelSmall}>{m.l}</Text><Text style={styles.metricSub}>{m.s}</Text>
            </View>
          ))}
        </View>

        {/* Why Enrich */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>Our Core Purpose</Text>
          <Text style={styles.sectionTitle}>Why Enrich Was Built for Richfield</Text>
          <Text style={styles.sectionSub}>Replacing paper CVs with a verified institutional ecosystem.</Text>
          <View style={styles.cardGrid}>
            {[
              { icon: Target, t: 'Closing the Graduate Gap', d: 'Direct verified pipelines reduce friction for recruiters.', color: theme.colors.royal },
              { icon: FileCheck, t: 'Verified Credentials', d: 'GitHub, video pitches, certified badges replace self-reported CVs.', color: theme.colors.darkCyan },
              { icon: Users, t: 'Active Alumni Mentorship', d: 'Alumni mentor students, mock interviews, referrals.', color: '#B45309' },
              { icon: Sparkles, t: 'AI Career Intelligence', d: 'CV critique, interview sim, pathway roadmaps.', color: '#6D28D9' },
            ].map((c) => (
              <View key={c.t} style={styles.pillarCard}>
                <View style={[styles.pillarIcon, { backgroundColor: c.color + '15', borderColor: c.color + '30' }]}><c.icon color={c.color} size={20} /></View>
                <Text style={styles.pillarTitle}>{c.t}</Text><Text style={styles.pillarDesc}>{c.d}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Solutions */}
        <View style={styles.sectionAlt}>
          <Text style={styles.sectionEyebrow}>Platform Solutions</Text>
          <Text style={styles.sectionTitle}>Tailored for Every Stage</Text>
          {[
            { icon: GraduationCap, t: 'For Current Students', d: 'Apply to vetted internships, build verified portfolios, AI guidance.', c: theme.colors.royal, role: 'student' },
            { icon: Award, t: 'For Richfield Alumni', d: 'Mentor, post referrals, expand leadership reach.', c: theme.colors.darkCyan, role: 'alumni' },
            { icon: Building2, t: 'For Corporate Employers', d: 'Pre-vetted graduate pipeline, POPIA compliant.', c: '#4F46E5', role: 'business' },
          ].map((card) => (
            <View key={card.t} style={styles.solutionCard}>
              <View style={[styles.pillarIcon, { backgroundColor: card.c + '15' }]}><card.icon color={card.c} size={22} /></View>
              <Text style={styles.solutionTitle}>{card.t}</Text><Text style={styles.pillarDesc}>{card.d}</Text>
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: card.c, marginTop: 12 }]} onPress={() => navigation.navigate('Register', { initialRole: card.role as any })}>
                <Text style={styles.btnPrimaryText}>Register as {card.role}</Text><ArrowRight color="#fff" size={14} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>Placement Pathway</Text>
          <Text style={styles.sectionTitle}>How Enrich Works</Text>
          <View style={{ gap: 12, marginTop: 12 }}>
            {[
              { n: 1, t: 'Create & Verify Account', d: 'Institutional or corporate credentials validated.' },
              { n: 2, t: 'Build Your Career Dossier', d: 'Skills, repos, achievements, 60s video pitch.' },
              { n: 3, t: 'Get AI Guidance & Mentorship', d: 'Instant CV feedback + alumni sessions.' },
              { n: 4, t: 'Apply & Get Placed', d: 'Submit verified profile to hiring managers.' },
            ].map((s) => (
              <View key={s.n} style={styles.stepCard}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{s.n}</Text></View>
                <View style={{ flex: 1 }}><Text style={styles.stepTitle}>{s.t}</Text><Text style={styles.stepDesc}>{s.d}</Text></View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick demo login */}
        <View style={styles.demoSection}>
          <Text style={styles.sectionTitle}>Try a Demo Persona</Text>
          <Text style={styles.sectionSub}>Tap to instantly explore as a verified user.</Text>
          <View style={{ gap: 8, marginTop: 12 }}>
            {users.slice(0, 4).map((u) => (
              <TouchableOpacity key={u.id} style={styles.demoCard} onPress={() => setCurrentUser(u)}>
                <Image source={{ uri: u.avatar }} style={styles.demoAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.demoName}>{u.name}</Text><Text style={styles.demoRole}>{u.role} • {u.headline.slice(0, 48)}</Text>
                </View>
                <View style={styles.demoGo}><ArrowRight color={theme.colors.royal} size={16} /></View>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Login')}><Text style={styles.linkBtnText}>Or sign in with email →</Text></TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} Richfield College (Pty) Ltd. All rights reserved.</Text>
          <Text style={styles.footerSub}>POPIA Compliant • DHET Registered • Registration No. 2000/HE07/008</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.navy },
  container: { flex: 1, backgroundColor: theme.colors.slate50 },
  content: { paddingBottom: 24 },
  topBar: { backgroundColor: theme.colors.navy, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.royal, borderWidth: 1, borderColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  brandName: { color: '#fff', fontWeight: '800', fontSize: 16 },
  richBadge: { backgroundColor: '#1E3A8A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#334155' },
  richBadgeText: { color: '#BFDBFE', fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },
  brandSub: { color: '#94A3B8', fontSize: 10 },
  topActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  btnGhost: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  btnGhostText: { color: '#CBD5E1', fontSize: 11, fontWeight: '700' },
  btnPrimary: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: theme.colors.royal, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  btnPrimaryText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  hero: { backgroundColor: theme.colors.navy, padding: 16, gap: 12 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, alignSelf: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  pillText: { color: '#93C5FD', fontSize: 10, fontWeight: '700' },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '900', lineHeight: 28 },
  heroSub: { color: '#CBD5E1', fontSize: 12, lineHeight: 18 },
  heroBtns: { gap: 8, marginTop: 4 },
  btnLarge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  btnLargeOutline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  btnLargeText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  trustRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 12, marginTop: 4 },
  trustItem: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  trustText: { color: '#94A3B8', fontSize: 10, fontWeight: '600' },
  heroCard: { backgroundColor: '#1E293B', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#334155', marginTop: 8 },
  heroImage: { width: '100%', height: 160 },
  heroCardBody: { padding: 14, gap: 10 },
  heroCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#1E3A8A', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3B82F6' },
  cardTitle: { color: '#fff', fontWeight: '800', fontSize: 12 },
  cardSub: { color: '#94A3B8', fontSize: 10 },
  verifiedPill: { flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: '#064E3B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: '#065F46' },
  verifiedText: { color: '#6EE7B7', fontSize: 9, fontWeight: '800' },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#334155', paddingVertical: 8 },
  metricLabel: { color: '#94A3B8', fontSize: 10 },
  metricValue: { color: '#6EE7B7', fontSize: 10, fontWeight: '800' },
  metricLabelValue: { color: '#E2E8F0', fontSize: 10, fontWeight: '600', flexShrink: 1, textAlign: 'right', marginLeft: 12 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.slate200 },
  metricCard: { width: '50%', padding: 16, alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.slate100 },
  metricBig: { fontSize: 22, fontWeight: '900', color: theme.colors.royal },
  metricLabelSmall: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: theme.colors.navy, marginTop: 4, textAlign: 'center' },
  metricSub: { fontSize: 9, color: theme.colors.slate500, textAlign: 'center' },
  section: { padding: 16, backgroundColor: theme.colors.slate50, gap: 8 },
  sectionAlt: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.slate200, gap: 12 },
  sectionEyebrow: { color: theme.colors.royal, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#BFDBFE' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: theme.colors.navy },
  sectionSub: { fontSize: 11, color: theme.colors.slate500 },
  cardGrid: { gap: 12, marginTop: 8 },
  pillarCard: { backgroundColor: '#fff', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.slate200, gap: 8 },
  pillarIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  pillarTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.navy },
  pillarDesc: { fontSize: 11, color: theme.colors.slate500, lineHeight: 16 },
  solutionCard: { backgroundColor: theme.colors.slate50, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.slate200, gap: 6 },
  solutionTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.navy },
  stepCard: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.slate200, alignItems: 'center' },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.navy, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  stepTitle: { fontSize: 12, fontWeight: '800', color: theme.colors.navy },
  stepDesc: { fontSize: 10, color: theme.colors.slate500, marginTop: 2 },
  demoSection: { padding: 16, backgroundColor: '#fff', gap: 8, borderTopWidth: 1, borderColor: theme.colors.slate200 },
  demoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.colors.slate50, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.slate200 },
  demoAvatar: { width: 40, height: 40, borderRadius: 10 },
  demoName: { fontWeight: '800', fontSize: 12, color: theme.colors.navy },
  demoRole: { fontSize: 10, color: theme.colors.slate500, textTransform: 'capitalize' },
  demoGo: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BFDBFE' },
  linkBtn: { alignItems: 'center', paddingVertical: 10 },
  linkBtnText: { color: theme.colors.royal, fontWeight: '700', fontSize: 11 },
  footer: { padding: 16, backgroundColor: theme.colors.navyDark, alignItems: 'center', gap: 6 },
  footerText: { color: '#94A3B8', fontSize: 10, textAlign: 'center' },
  footerSub: { color: '#64748B', fontSize: 9, textAlign: 'center' },
});
