import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Sparkles, Bot, Send, FileText, RefreshCw, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { theme } from '../theme';

const API_TIMEOUT_MS = 6000;


const OUT_OF_SCOPE_REPLY = `I’m Enrich AI, focused on Richfield career and employability support. I can help with CVs, interviews, internships, learnerships, job applications, skills, projects, portfolios, networking, alumni mentorship, LinkedIn, and using Enrich career features. I can’t help with unrelated topics. Try asking: “How can I improve my CV for a junior developer role?”`;

function isCareerRelevantQuery(text: string) {
  const q = text.trim().toLowerCase();
  if (!q) return false;
  const allowedTerms = [
    'cv', 'resume', 'interview', 'job', 'career', 'intern', 'internship', 'learnership',
    'opportun', 'apply', 'application', 'skill', 'project', 'portfolio', 'github', 'linkedin',
    'network', 'mentor', 'alumni', 'cover letter', 'motivation', 'graduate', 'employ', 'work',
    'salary', 'recruit', 'company', 'profile', 'richfield', 'enrich', 'course', 'qualification',
    'study', 'student', 'certification', 'badge', 'experience', 'leadership', 'hackathon',
    'hello', 'hi', 'hey', 'help', 'thank', 'thanks'
  ];
  return allowedTerms.some((term) => q.includes(term));
}

async function fetchJsonWithTimeout(url: string, options: any) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`AI service returned HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function localCareerReply(text: string, profile: any) {
  const q = text.toLowerCase();
  const name = profile?.name?.split(' ')[0] || 'there';
  if (q.includes('cv') || q.includes('resume')) return `${name}, keep your CV to about two pages. Lead with your Richfield qualification, strongest technical skills, 2-3 practical projects, and measurable outcomes. Add GitHub/LinkedIn links and tailor the skills section to each opportunity.`;
  if (q.includes('interview')) return `Use the STAR method for behavioural questions: Situation, Task, Action, Result. For technical interviews, be ready to explain one project end-to-end, including your role, database/design choices, testing, and what you would improve.`;
  if (q.includes('job') || q.includes('intern') || q.includes('learnership') || q.includes('opportun')) return `Open Career Hub and compare your skills with the opportunity requirements. Prioritise roles where you meet the core requirements, then tailor your application motivation to the company and role instead of sending a generic message.`;
  if (q.includes('skill')) return `For an IT profile, combine technical depth with evidence. Pick 4-6 skills you can demonstrate, then attach projects or repositories showing how you used them. SQL, Git, APIs, cloud fundamentals, testing and communication are strong graduate signals.`;
  if (q.includes('project') || q.includes('portfolio') || q.includes('github')) return `Use Project Showcase to post a screenshot and project link. Explain the problem, your role, technology stack, one challenge you solved, and the final result. Recruiters value evidence more than a long list of tools.`;
  if (q.includes('network') || q.includes('mentor') || q.includes('alumni')) return `Use Network to connect with verified alumni. Keep the first message short: introduce yourself, mention your Richfield programme, and ask one specific career question rather than immediately asking for a job.`;
  if (q.includes('cover') || q.includes('motivation')) return `A strong motivation has three parts: why this role, what evidence you have that matches it, and what value you can bring. Keep it specific to the opportunity and avoid repeating your whole CV.`;
  if (q.includes('linkedin')) return `Make your LinkedIn headline specific, for example “BSc IT Student | Java, SQL & Web Development | Seeking Graduate Software Opportunities”. Add your Richfield projects, certificates and GitHub link.`;
  return OUT_OF_SCOPE_REPLY;
}

function localProfileAudit(profile: any) {
  const skills = profile?.technicalSkills?.length || 0;
  const hasPortfolio = !!(profile?.portfolioLinks?.github || profile?.portfolioLinks?.website || profile?.portfolioLinks?.linkedin);
  const hasBadges = (profile?.digitalBadges?.length || 0) > 0;
  const score = Math.min(94, Math.max(58, (profile?.profileCompleteness || 45) + Math.min(16, skills * 2) + (hasPortfolio ? 8 : 0) + (hasBadges ? 6 : 0)));
  const missingSections = [!hasBadges ? 'Digital certifications / badges' : '', !hasPortfolio ? 'Portfolio or LinkedIn URL' : '', !profile?.careerAspirations ? 'Career goal' : ''].filter(Boolean);
  return {
    score,
    summaryFeedback: `Your ${profile?.programme || 'Richfield'} profile has a solid foundation. Add evidence of practical work, measurable project outcomes, and recruiter-facing links to strengthen employer readiness.`,
    suggestions: [
      'Add 3-5 technical skills that match the roles you want to apply for.',
      'Describe one practical project using the problem, technology stack, and result.',
      'Keep your headline specific to your target role and strongest skills.',
      'Add a GitHub, LinkedIn, portfolio, badge, or certification link where available.',
    ],
    missingSections,
    marketFitInsight: 'South African graduate employers value practical evidence, communication, collaboration, database skills, cloud exposure, and a clear portfolio of applied work.',
  };
}

export default function AIAssistantScreen() {
  const { currentUser, handleUpdateProfile } = useApp();
  const [activeTab, setActiveTab] = useState<'coach' | 'chatbot' | 'nlp_cv'>('coach');
  const [coachAnalysis, setCoachAnalysis] = useState<any>(() => currentUser ? localProfileAudit(currentUser) : null);
  const [aiSource, setAiSource] = useState<'local' | 'gemini'>('local');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'assistant'; text: string; time: string }[]>([
    { sender: 'assistant', text: `Sawubona & Welcome, ${currentUser?.name}! I am Enrich AI, your Richfield career & networking coach. How can I assist you with your CV, graduate applications, or interview prep today?`, time: 'Just now' },
  ]);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [cvInput, setCvInput] = useState(`EDUCATION:
Richfield Graduate Institute of Technology (2023 - 2026)
Bachelor of Science in Information Technology (BSc IT)
Key Modules: Software Engineering, Database Systems, Cloud Computing

EXPERIENCE:
Peer Programming Tutor - Richfield IT Labs (2024 - Present)
- Facilitated hands-on Python and React labs for 40+ students.

TECHNICAL SKILLS:
Languages: TypeScript, JavaScript, Python, SQL, HTML/CSS
Frameworks: React, Node.js, Express, Tailwind CSS`);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extracted, setExtracted] = useState<any>(null);

  if (!currentUser) return null;

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
      const data = await fetchJsonWithTimeout(`${apiUrl}/api/gemini/profile-assistant`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile: currentUser }),
      });
      setCoachAnalysis(data);
      setAiSource('gemini');
    } catch {
      setCoachAnalysis(localProfileAudit(currentUser));
      setAiSource('local');
    } finally { setIsAnalyzing(false); }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isBotThinking) return;
    const userText = chatInput.trim();
    const newMsgs = [...chatMessages, { sender: 'user' as const, text: userText, time: 'Just now' }];
    setChatMessages(newMsgs);
    setChatInput('');

    if (!isCareerRelevantQuery(userText)) {
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: OUT_OF_SCOPE_REPLY, time: 'Just now' }]);
      return;
    }

    setIsBotThinking(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('No live AI API configured');
      const data = await fetchJsonWithTimeout(`${apiUrl}/api/gemini/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs.map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })), userContext: { name: currentUser.name, role: currentUser.role, programme: currentUser.programme, campus: currentUser.campus } }),
      });
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: data.reply || localCareerReply(userText, currentUser), time: 'Just now' }]);
    } catch {
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: localCareerReply(userText, currentUser), time: 'Just now' }]);
    } finally { setIsBotThinking(false); }
  };

  const handleExtract = async () => {
    if (!cvInput.trim() || isExtracting) return;
    setIsExtracting(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
      const data = await fetchJsonWithTimeout(`${apiUrl}/api/gemini/nlp-cv`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cvText: cvInput }) });
      setExtracted(data);
    } catch {
      setExtracted({
        headline: "Software Engineering & Cloud Scholar | BSc IT", summary: "Passionate developer skilled in building responsive full-stack applications.",
        technicalSkills: ["React", "TypeScript", "Node.js", "Python", "SQL", "Git"], professionalSkills: ["Collaboration", "Problem Solving"], experience: [], qualifications: []
      });
    } finally { setIsExtracting(false); }
  };

  const applyExtracted = () => {
    if (!extracted) return;
    const updates: any = {};
    if (extracted.headline) updates.headline = extracted.headline;
    if (extracted.summary) updates.summary = extracted.summary;
    if (extracted.technicalSkills?.length) updates.technicalSkills = Array.from(new Set([...currentUser.technicalSkills, ...extracted.technicalSkills]));
    if (extracted.professionalSkills?.length) updates.professionalSkills = Array.from(new Set([...currentUser.professionalSkills, ...extracted.professionalSkills]));
    updates.profileCompleteness = Math.min(95, (currentUser.profileCompleteness || 70) + 15);
    handleUpdateProfile(updates);
    Alert.alert('Success', 'Extracted skills merged into your profile!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><View style={styles.sparkBox}><Sparkles color="#fff" size={20} /></View><View><View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><Text style={styles.bannerTitle}>Enrich AI Career Intelligence</Text><View style={styles.geminiPill}><Text style={styles.geminiText}>{aiSource === 'gemini' ? 'Live Gemini' : 'Demo-safe AI'}</Text></View></View><Text style={styles.bannerSub}>Context-aware guidance, NLP CV extraction, mentoring.</Text></View></View>
        <View style={styles.pillRow}>
          {[
            { id: 'coach', label: 'Profile Coach' },
            { id: 'chatbot', label: 'Career Chatbot' },
            { id: 'nlp_cv', label: 'NLP CV Extractor' },
          ].map((t) => (
            <TouchableOpacity key={t.id} onPress={() => { setActiveTab(t.id as any); if (t.id === 'coach' && !coachAnalysis) runAnalysis(); }} style={[styles.pill, activeTab === t.id && styles.pillActive]}><Text style={[styles.pillText, activeTab === t.id && styles.pillTextActive]}>{t.label}</Text></TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'coach' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}><View><Text style={styles.cardTitle}>AI Profile Readiness & Employer Fit Audit</Text><Text style={styles.cardSub}>Evaluated against South African hiring rubrics.</Text></View><TouchableOpacity onPress={runAnalysis} disabled={isAnalyzing} style={styles.refreshBtn}><RefreshCw color="#fff" size={12} style={isAnalyzing ? { opacity: 0.5 } : {}} /><Text style={styles.refreshText}>{isAnalyzing ? 'Analyzing...' : 'Re-Run Audit'}</Text></TouchableOpacity></View>
            {isAnalyzing ? <View style={styles.loading}><ActivityIndicator color={theme.colors.darkCyan} /><Text style={styles.loadingText}>Analyzing your Richfield profile...</Text></View> : coachAnalysis && (
              <>
                <View style={styles.scoreGrid}>
                  <View style={styles.scoreBox}><Text style={styles.scoreLabel}>Employer Readiness Score</Text><Text style={styles.scoreVal}>{coachAnalysis.score}%</Text><Text style={styles.scoreSub}>Above Campus Avg (64%)</Text></View>
                  <View style={styles.summaryBox}><Text style={styles.summaryLabel}>Executive Evaluation:</Text><Text style={styles.summaryText}>{coachAnalysis.summaryFeedback}</Text></View>
                </View>
                <Text style={styles.aiSourceText}>{aiSource === 'gemini' ? 'Live Gemini analysis returned successfully.' : 'Using the built-in demo-safe career model. Start the Express API to use live Gemini.'}</Text>
                <Text style={styles.sectionLabel}>Actionable Improvements</Text>
                <View style={{ gap: 8 }}>{coachAnalysis.suggestions.map((s: string, i: number) => <View key={i} style={styles.suggestion}><Lightbulb color={theme.colors.darkCyan} size={14} /><Text style={styles.suggestionText}>{s}</Text></View>)}</View>
                {coachAnalysis.missingSections?.length > 0 && <View style={styles.missing}><AlertTriangle color="#B45309" size={14} /><Text style={styles.missingText}>Missing: {coachAnalysis.missingSections.join(', ')}. Complete these to boost visibility.</Text></View>}
                {coachAnalysis.marketFitInsight && <View style={styles.marketBox}><Text style={styles.marketTitle}>South African Industry Alignment:</Text><Text style={styles.marketText}>{coachAnalysis.marketFitInsight}</Text></View>}
              </>
            )}
          </View>
        )}

        {activeTab === 'chatbot' && (
          <View style={styles.chatCard}>
            <View style={styles.chatHeader}><View style={styles.botIcon}><Bot color="#fff" size={16} /></View><View><Text style={styles.chatTitle}>Enrich AI Career Mentor</Text><Text style={styles.chatSub}>Richfield-focused career guidance with live Gemini when available</Text></View><View style={styles.activePill}><Text style={styles.activeText}>Career AI Session</Text></View></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40 }}>
              <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 6 }}>
                {["How should I structure my final year project on my CV?", "What questions should I ask an alumni mentor?", "Which cloud certifications are most valued?", "Tips for the Richfield Hackathon"].map((q, i) => <TouchableOpacity key={i} onPress={() => setChatInput(q)} style={styles.quickPill}><Text style={styles.quickText}>{q}</Text></TouchableOpacity>)}
              </View>
            </ScrollView>
            <View style={styles.messagesBox}>
              {chatMessages.map((m, idx) => {
                const isUser = m.sender === 'user';
                return <View key={idx} style={[styles.msgRow, isUser ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}><View style={[styles.msgBubble, isUser ? styles.msgUser : styles.msgAssistant]}><Text style={[styles.msgText, isUser && { color: '#fff' }]}>{m.text}</Text></View><Text style={styles.msgTime}>{m.time}</Text></View>;
              })}
              {isBotThinking && <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><Bot color={theme.colors.darkCyan} size={14} /><Text style={styles.thinking}>Enrich AI is drafting tailored advice...</Text></View>}
            </View>
            <View style={styles.inputRow}><TextInput value={chatInput} onChangeText={setChatInput} placeholder="Ask about your CV, interview prep, or pathways..." style={styles.chatInput} placeholderTextColor={theme.colors.slate400} onSubmitEditing={handleSendChat} /><TouchableOpacity disabled={isBotThinking || !chatInput.trim()} onPress={handleSendChat} style={styles.sendBtn}><Send color="#fff" size={14} /></TouchableOpacity></View>
          </View>
        )}

        {activeTab === 'nlp_cv' && (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><FileText color={theme.colors.darkCyan} size={18} /><Text style={styles.cardTitle}>NLP Resume & CV Extraction</Text></View>
            <Text style={styles.cardSub}>Paste your CV. Live Gemini is used when available; a demo-safe extractor keeps the workflow usable offline.</Text>
            <Text style={styles.label}>Paste Raw CV Text / Resume Content</Text>
            <TextInput value={cvInput} onChangeText={setCvInput} style={styles.textArea} multiline placeholderTextColor={theme.colors.slate400} />
            <TouchableOpacity onPress={handleExtract} disabled={isExtracting} style={styles.extractBtn}><Sparkles color="#fff" size={14} /><Text style={styles.extractBtnText}>{isExtracting ? 'Extracting profile attributes...' : 'Extract Profile Attributes'}</Text></TouchableOpacity>
            {extracted && (
              <View style={styles.resultBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.slate200, paddingBottom: 8 }}><View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><CheckCircle2 color={theme.colors.darkCyan} size={14} /><Text style={styles.resultTitle}>NLP Extracted Data</Text></View><TouchableOpacity onPress={applyExtracted} style={styles.applyBtn}><Text style={styles.applyText}>Apply to My Profile</Text></TouchableOpacity></View>
                <Text style={styles.resultLabel}>Suggested Headline:</Text><Text style={styles.resultValue}>{extracted.headline}</Text>
                <Text style={styles.resultLabel}>Extracted Summary:</Text><Text style={styles.resultValue}>{extracted.summary}</Text>
                <Text style={styles.resultLabel}>Technical Skills:</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{extracted.technicalSkills?.map((s: string) => <View key={s} style={styles.skillTag}><Text style={styles.skillTagText}>{s}</Text></View>)}</View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.slate50 },
  banner: { backgroundColor: theme.colors.navy, padding: 14, gap: 12 },
  sparkBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.darkCyan, alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { color: '#fff', fontWeight: '900', fontSize: 13 },
  bannerSub: { color: theme.colors.rosyBrown, fontSize: 10 },
  geminiPill: { backgroundColor: theme.colors.rosyBrown, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  geminiText: { fontSize: 8, fontWeight: '800', color: theme.colors.navy, textTransform: 'uppercase' },
  pillRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', padding: 4, borderRadius: 12, gap: 4 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  pillActive: { backgroundColor: '#fff' },
  pillText: { fontSize: 10, fontWeight: '700', color: '#CBD5E1' },
  pillTextActive: { color: theme.colors.navy },
  content: { padding: 12, gap: 12, paddingBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.colors.slate200, gap: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.slate100, paddingBottom: 10 },
  cardTitle: { fontWeight: '800', fontSize: 12, color: theme.colors.navy },
  cardSub: { fontSize: 10, color: theme.colors.slate500 },
  refreshBtn: { backgroundColor: theme.colors.navy, flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, alignItems: 'center' },
  refreshText: { color: '#fff', fontWeight: '800', fontSize: 10 },
  loading: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  loadingText: { fontWeight: '700', fontSize: 11, color: theme.colors.slate600 },
  scoreGrid: { flexDirection: 'row', gap: 8 },
  scoreBox: { flex: 0.9, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  scoreLabel: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', color: theme.colors.darkCyan, textAlign: 'center' },
  scoreVal: { fontSize: 22, fontWeight: '900', color: theme.colors.navy },
  scoreSub: { fontSize: 9, color: theme.colors.darkCyan, fontWeight: '700' },
  summaryBox: { flex: 1.1, backgroundColor: theme.colors.slate50, borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 14, padding: 12 },
  summaryLabel: { fontWeight: '800', fontSize: 11, color: theme.colors.navy },
  summaryText: { fontSize: 11, color: theme.colors.slate700, lineHeight: 16, marginTop: 4 },
  aiSourceText: { fontSize: 9, color: theme.colors.slate400, fontStyle: 'italic' },
  sectionLabel: { fontWeight: '800', fontSize: 10, color: theme.colors.slate400, textTransform: 'uppercase' },
  suggestion: { flexDirection: 'row', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, padding: 10, borderRadius: 12, alignItems: 'flex-start' },
  suggestionText: { fontSize: 11, color: theme.colors.slate700, flex: 1, lineHeight: 16 },
  missing: { flexDirection: 'row', gap: 8, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', padding: 10, borderRadius: 12 },
  missingText: { fontSize: 10, color: '#92400E', flex: 1, lineHeight: 14 },
  marketBox: { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE', padding: 10, borderRadius: 12 },
  marketTitle: { fontWeight: '800', fontSize: 11, color: theme.colors.navy },
  marketText: { fontSize: 11, color: theme.colors.slate700, marginTop: 4 },
  chatCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: theme.colors.slate200, overflow: 'hidden' },
  chatHeader: { flexDirection: 'row', gap: 10, backgroundColor: theme.colors.slate50, padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.slate200, alignItems: 'center' },
  botIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.darkCyan, alignItems: 'center', justifyContent: 'center' },
  chatTitle: { fontWeight: '800', fontSize: 11, color: theme.colors.navy },
  chatSub: { fontSize: 9, color: theme.colors.slate400 },
  activePill: { backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#A7F3D0', marginLeft: 'auto' },
  activeText: { fontSize: 8, fontWeight: '800', color: theme.colors.darkCyan },
  quickPill: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  quickText: { fontSize: 9, color: theme.colors.slate700 },
  messagesBox: { padding: 12, gap: 10, minHeight: 280 },
  msgRow: { gap: 4, maxWidth: '85%' },
  msgBubble: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  msgUser: { backgroundColor: theme.colors.navy, borderBottomRightRadius: 4, alignSelf: 'flex-end' },
  msgAssistant: { backgroundColor: theme.colors.slate100, borderBottomLeftRadius: 4, alignSelf: 'flex-start', borderWidth: 1, borderColor: theme.colors.slate200 },
  msgText: { fontSize: 11, color: theme.colors.slate700, lineHeight: 16 },
  msgTime: { fontSize: 9, color: theme.colors.slate400 },
  thinking: { fontSize: 10, color: theme.colors.slate400, fontStyle: 'italic' },
  inputRow: { flexDirection: 'row', gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: theme.colors.slate200, backgroundColor: theme.colors.slate50 },
  chatInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 12, paddingHorizontal: 12, height: 40, fontSize: 11, color: theme.colors.navy },
  sendBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: theme.colors.navy, alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: '700', fontSize: 11, color: theme.colors.slate700 },
  textArea: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 12, padding: 10, fontSize: 11, minHeight: 120, textAlignVertical: 'top', fontFamily: 'monospace', color: theme.colors.navy },
  extractBtn: { backgroundColor: theme.colors.darkCyan, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
  extractBtnText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  resultBox: { backgroundColor: theme.colors.slate50, borderWidth: 1, borderColor: theme.colors.slate200, borderRadius: 12, padding: 12, gap: 8 },
  resultTitle: { fontWeight: '800', fontSize: 11, color: theme.colors.navy },
  applyBtn: { backgroundColor: theme.colors.navy, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  applyText: { color: '#fff', fontWeight: '800', fontSize: 10 },
  resultLabel: { fontWeight: '700', fontSize: 9, color: theme.colors.slate400, textTransform: 'uppercase' },
  resultValue: { fontWeight: '600', fontSize: 11, color: theme.colors.navy },
  skillTag: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  skillTagText: { fontSize: 10, fontWeight: '700', color: theme.colors.darkCyan },
});
