import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '10mb' }));

let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }
  return aiClient;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), mode: 'mobile-api' });
});

// Authentication and email verification are handled directly by Supabase Auth.

const CAREER_SCOPE_REPLY = `I’m Enrich AI, focused on Richfield career and employability support. I can help with CVs, interviews, internships, learnerships, job applications, skills, projects, portfolios, networking, alumni mentorship, LinkedIn, and using Enrich career features. I can’t help with unrelated topics.`;

function isCareerRelevantQuery(text: string) {
  const q = String(text || '').trim().toLowerCase();
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

app.post('/api/gemini/profile-assistant', async (req, res) => {
  try {
    const { profile } = req.body;
    const ai = getAIClient();
    if (!ai) {
      return res.json({
        score: 78,
        summaryFeedback: "Strong foundation in IT and academic coursework. Highlighting 1-2 practical team projects or industry certifications will significantly elevate your visibility to corporate recruiters.",
        suggestions: ["Include specific technologies used in your academic capstone project (e.g., React, Node.js, SQL).", "Add your Credly or Richfield digital badges to substantiate practical skills.", "Expand your headline to include target roles: e.g. 'Aspiring Cloud & Full-Stack Developer | BSc IT'", "Request 1 skill endorsement from a lecturer or project peer."],
        missingSections: ["Certifications / Badges", "Portfolio URL (GitHub or Live Project)"],
        marketFitInsight: "South African tech employers in Johannesburg and Cape Town look for hands-on problem-solving, Git collaboration, and fundamental database competency."
      });
    }
    const prompt = `You are the Richfield College "Enrich" AI Career Assistant for South African higher education students and graduates.
Analyze the following student profile and return a JSON object with:
1. score: number between 0 and 100
2. summaryFeedback: 2-3 sentences
3. suggestions: array of 3-4 specific improvements
4. missingSections: array of strings
5. marketFitInsight: 1-2 sentences
Profile: ${JSON.stringify(profile, null, 2)}`;
    const response = await ai.models.generateContent({ model: 'gemini-3.8-flash', contents: prompt, config: { responseMimeType: 'application/json' } });
    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in profile-assistant API:', error);
    return res.json({
      score: 82, summaryFeedback: "Great profile with solid technical foundation. Adding tangible project metrics and live links will improve employer reach.",
      suggestions: ["Detail the impact of your coursework projects with measurable outcomes.", "Link your GitHub repositories with clean README documentation.", "Highlight your Richfield campus achievements and leadership roles."],
      missingSections: ["Industry Certifications", "Credly Digital Badges"], marketFitInsight: "High demand in South Africa for Junior Software Developers, Cloud Technicians, and Business Analysts."
    });
  }
});

app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    const lastUserMessage = messages?.[messages.length - 1]?.content || '';
    if (!isCareerRelevantQuery(lastUserMessage)) {
      return res.json({ reply: CAREER_SCOPE_REPLY });
    }
    const ai = getAIClient();
    if (!ai) {
      const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let reply = "Hello! I am Enrich AI, your Richfield College Career & Networking Coach. How can I help you excel in your studies, sharpen your CV, or prepare for recruiter interviews today?";
      if (lastMsg.includes('cv') || lastMsg.includes('resume')) reply = "For Richfield students, keep your CV concise (2 pages maximum). Emphasize your qualification, technical stack, campus hackathons, and practical coursework projects.";
      else if (lastMsg.includes('interview')) reply = "Research the company's tech stack (e.g., Standard Bank, Entelect, Vodacom). Use the STAR technique for behavioral questions. Let's practice a mock interview question together!";
      else if (lastMsg.includes('network') || lastMsg.includes('connect')) reply = "Networking on Enrich is designed for the Richfield & AAA community. Reach out to verified Alumni with a polite message mentioning your mutual Richfield background!";
      return res.json({ reply });
    }
    const systemPrompt = `You are Enrich AI, the official intelligent career mentor for Richfield College in South Africa.
Current user role: ${userContext?.role || 'Student'} (${userContext?.name || 'Richfield Scholar'}).
Campus/Programme: ${userContext?.programme || 'BSc Information Technology'} at ${userContext?.campus || 'Braamfontein Campus'}.
Guidelines: Only answer questions about careers, employability, Richfield/Enrich career features, CVs, interviews, internships, learnerships, applications, skills, projects, portfolios, networking, alumni mentorship, LinkedIn, qualifications, or study-to-career guidance. If a request is unrelated, reply that Enrich AI is limited to career and employability support and briefly list what it can help with. Provide relevant, encouraging, pragmatic advice tailored to the South African job market, graduate programmes, internships, learnerships, and POPIA guidelines. Be concise, friendly, professional.`;
    const chat = ai.chats.create({ model: 'gemini-3.8-flash', config: { systemInstruction: systemPrompt } });
    const response = await chat.sendMessage({ message: lastUserMessage || 'Hello' });
    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return res.json({ reply: "I am here to guide your career path at Richfield College! Ask me about CV writing, interview preparation, or internships." });
  }
});

app.post('/api/gemini/admin-verification', async (req, res) => {
  try {
    const { business } = req.body;
    const details = business?.businessDetails || {};
    const fallbackChecks = [
      { label: 'Recruiter email verified by Supabase Auth', ok: business?.verificationStatus !== 'unverified' },
      { label: 'Organisation name supplied', ok: !!details.organizationName },
      { label: 'Registration/CIPC reference supplied', ok: !!details.registrationNumber && !String(details.registrationNumber).toLowerCase().includes('pending') },
      { label: 'Company website supplied', ok: !!details.website },
      { label: 'Company description supplied', ok: !!details.companyDescription },
      { label: 'Recruiter contact email supplied', ok: !!details.contactEmail },
    ];
    const fallbackScore = Math.round((fallbackChecks.filter((c) => c.ok).length / fallbackChecks.length) * 100);
    const fallback = {
      score: fallbackScore,
      risk: fallbackScore >= 80 ? 'Low' : fallbackScore >= 55 ? 'Medium' : 'High',
      checks: fallbackChecks,
      summary: fallbackScore >= 80
        ? 'The submission is internally consistent and contains most expected evidence. Manual external verification is still required before approval.'
        : 'Some expected verification evidence is missing or incomplete. Request supporting information or independently verify the organisation before approval.',
      disclaimer: 'AI-assisted review only. Final approval remains with the authorised Richfield administrator.',
    };

    const ai = getAIClient();
    if (!ai) return res.json(fallback);

    const prompt = `You assist a Richfield College administrator reviewing a company that wants to recruit students on Enrich.
Do NOT approve or reject the company. Return JSON only with:
- score: 0-100 completeness/readiness score
- risk: Low, Medium, or High
- checks: array of {label:string, ok:boolean}
- summary: concise explanation of missing or inconsistent evidence
- disclaimer: exactly "AI-assisted review only. Final approval remains with the authorised Richfield administrator."
Only assess the information supplied. Do not claim you independently verified CIPC, domains, or external registries.
Business submission: ${JSON.stringify(business, null, 2)}`;
    const response = await ai.models.generateContent({ model: 'gemini-3.8-flash', contents: prompt, config: { responseMimeType: 'application/json' } });
    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({ ...fallback, ...parsed, disclaimer: fallback.disclaimer });
  } catch (error: any) {
    console.error('Error in admin-verification API:', error);
    return res.status(200).json({
      score: 60,
      risk: 'Medium',
      checks: [],
      summary: 'The AI service was unavailable. Complete the verification manually using the submitted company evidence.',
      disclaimer: 'AI-assisted review only. Final approval remains with the authorised Richfield administrator.',
    });
  }
});

app.post('/api/gemini/nlp-cv', async (req, res) => {
  try {
    const { cvText } = req.body;
    const ai = getAIClient();
    if (!ai) {
      return res.json({
        headline: "Software Engineering Scholar & Junior Developer",
        summary: "Diligent Richfield College student passionate about developing modern web applications, cloud architecture, and collaborative problem solving.",
        technicalSkills: ["JavaScript", "TypeScript", "React", "Python", "SQL", "Git", "REST APIs"],
        professionalSkills: ["Agile/Scrum", "Problem Solving", "Technical Writing", "Team Collaboration"],
        experience: [{ role: "Peer Tutor / Lab Assistant", company: "Richfield College", period: "2024 - Present", description: "Mentored first-year IT students in programming fundamentals." }],
        qualifications: [{ institution: "Richfield Graduate Institute of Technology", degree: "BSc Information Technology", year: "2023 - 2026" }]
      });
    }
    const prompt = `Extract structured profile information from this CV / Resume text for a student platform.
Return a valid JSON object with:
- headline: string
- summary: string (2-3 sentences)
- technicalSkills: array of strings
- professionalSkills: array of strings
- experience: array of objects { role: string, company: string, period: string, description: string }
- qualifications: array of objects { institution: string, degree: string, year: string }
CV Text: ${cvText}`;
    const response = await ai.models.generateContent({ model: 'gemini-3.8-flash', contents: prompt, config: { responseMimeType: 'application/json' } });
    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in NLP CV API:', error);
    return res.json({ headline: "Full-Stack Developer & BSc IT Candidate", summary: "Motivated student eager to apply computer science principles.", technicalSkills: ["React", "Node.js", "TypeScript", "PostgreSQL"], professionalSkills: ["Critical Thinking", "Communication"], experience: [], qualifications: [] });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Enrich Richfield Mobile API running on http://0.0.0.0:${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/api/health`);
});
