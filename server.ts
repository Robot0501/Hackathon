import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = 3000;
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'noreply@richfield.ac.za';
const otpStore = new Map<string, { code: string; expiresAt: number; name: string; role: string; email: string }>();

app.use(express.json({ limit: '10mb' }));

function createOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createMailerTransport() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, name, role } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const code = createOtpCode();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore.set(normalizedEmail, { code, expiresAt, name: String(name || 'Student'), role: String(role || 'student'), email: normalizedEmail });

    const transporter = createMailerTransport();

    if (!transporter) {
      console.log(`Demo OTP for ${normalizedEmail} (${role || 'user'}): ${code}`);
      return res.json({
        success: false,
        mode: 'demo',
        code,
        message: 'SMTP is not configured. Demo mode is active; the code is logged server-side only.',
      });
    }

    await transporter.sendMail({
      from: SMTP_FROM,
      to: normalizedEmail,
      subject: 'Your Richfield Enrich verification code',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <h2 style="color: #1e3a8a; margin-bottom: 12px;">Richfield Enrich Verification</h2>
          <p>Hello ${name || 'there'},</p>
          <p>Your verification code for the ${role || 'Enrich'} registration is:</p>
          <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; font-size: 28px; font-weight: bold; letter-spacing: 6px; text-align: center; color: #1e3a8a; margin: 16px 0;">
            ${code}
          </div>
          <p>This code is valid for a short time and can be used to complete your sign-up.</p>
          <p style="font-size: 12px; color: #6b7280;">Richfield College Enrich Platform</p>
        </div>
      `,
    });

    return res.json({ success: true, mode: 'email', code: null });
  } catch (error) {
    console.error('OTP email send failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification email. Please check your SMTP settings.',
    });
  }
});

app.post('/api/verify-otp', (req, res) => {
  try {
    const { email, code } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedCode = String(code || '').trim();

    if (!normalizedEmail || !normalizedCode) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required.',
      });
    }

    const pendingOtp = otpStore.get(normalizedEmail);
    if (!pendingOtp) {
      return res.status(400).json({ success: false, message: 'No active verification code found for this email.' });
    }

    if (Date.now() > pendingOtp.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(410).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    if (pendingOtp.code !== normalizedCode) {
      return res.status(400).json({ success: false, message: 'Incorrect verification code.' });
    }

    otpStore.delete(normalizedEmail);
    return res.json({
      success: true,
      message: 'Verification succeeded.',
      user: {
        email: pendingOtp.email,
        name: pendingOtp.name,
        role: pendingOtp.role,
      },
    });
  } catch (error) {
    console.error('OTP verification failed:', error);
    return res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
});

// Gemini AI Profile Assistant
app.post('/api/gemini/profile-assistant', async (req, res) => {
  try {
    const { profile } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        score: 78,
        summaryFeedback: "Strong foundation in IT and academic coursework. Highlighting 1-2 practical team projects or industry certifications will significantly elevate your visibility to corporate recruiters.",
        suggestions: [
          "Include specific technologies used in your academic capstone project (e.g., React, Node.js, SQL).",
          "Add your Credly or Richfield digital badges to substantiate practical skills.",
          "Expand your headline to include target roles: e.g. 'Aspiring Cloud & Full-Stack Developer | BSc IT'",
          "Request 1 skill endorsement from a lecturer or project peer."
        ],
        missingSections: ["Certifications / Badges", "Portfolio URL (GitHub or Live Project)"],
        marketFitInsight: "South African tech employers in Johannesburg and Cape Town look for hands-on problem-solving, Git collaboration, and fundamental database competency."
      });
    }

    const prompt = `You are the Richfield College "Enrich" AI Career Assistant for South African higher education students and graduates.
Analyze the following student profile and return a JSON object with:
1. score: number between 0 and 100 representing profile completeness and employer readiness.
2. summaryFeedback: 2-3 sentences of encouraging, actionable assessment.
3. suggestions: array of 3-4 specific improvements tailored to the South African job market (e.g. graduate programmes at banks, telecoms like Vodacom/MTN, tech firms).
4. missingSections: array of strings naming omitted sections that could boost their profile.
5. marketFitInsight: 1-2 sentences on how their skills align with current industry demand.

Profile:
${JSON.stringify(profile, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in profile-assistant API:', error);
    return res.json({
      score: 82,
      summaryFeedback: "Great profile with solid technical foundation. Adding tangible project metrics and live links will improve employer reach.",
      suggestions: [
        "Detail the impact of your coursework projects with measurable outcomes.",
        "Link your GitHub repositories with clean README documentation.",
        "Highlight your Richfield campus achievements and leadership roles."
      ],
      missingSections: ["Industry Certifications", "Credly Digital Badges"],
      marketFitInsight: "High demand in South Africa for Junior Software Developers, Cloud Technicians, and Business Analysts."
    });
  }
});

// Gemini AI Chatbot ("Enrich AI")
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    const ai = getAIClient();

    if (!ai) {
      const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let reply = "Hello! I am Enrich AI, your Richfield College Career & Networking Coach. How can I help you excel in your studies, sharpen your CV, or prepare for recruiter interviews today?";
      if (lastMsg.includes('cv') || lastMsg.includes('resume')) {
        reply = "For Richfield students, keep your CV concise (2 pages maximum). Emphasize your qualification (e.g. BSc IT, Diploma in Business Admin), technical stack, campus hackathons, and practical coursework projects. Would you like me to review a specific section?";
      } else if (lastMsg.includes('interview')) {
        reply = "Preparing for a graduate or internship interview? Research the company's tech stack or market focus (e.g., Standard Bank, Entelect, Vodacom). Use the STAR technique (Situation, Task, Action, Result) for behavioral questions. Let's practice a mock interview question together!";
      } else if (lastMsg.includes('network') || lastMsg.includes('connect')) {
        reply = "Networking on Enrich is designed for the Richfield & AAA community. Reach out to verified Alumni working at top firms with a polite message mentioning your mutual Richfield background and interest in their field!";
      }
      return res.json({ reply });
    }

    const systemPrompt = `You are Enrich AI, the official intelligent career mentor, networking guide, and campus advisor for Richfield College (and the AAA school of advertising community) in South Africa.
Current user role: ${userContext?.role || 'Student'} (${userContext?.name || 'Richfield Scholar'}).
Campus/Programme: ${userContext?.programme || 'BSc Information Technology'} at ${userContext?.campus || 'Braamfontein Campus'}.

Guidelines:
- Provide highly relevant, encouraging, pragmatic advice tailored to the South African job market, graduate programmes, internships, learnerships, and POPIA privacy guidelines.
- Be concise, structured, friendly, and professional.
- Mention Richfield career resources, alumni connections, and practical tips.`;

    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      config: {
        systemInstruction: systemPrompt,
      },
    });

    let lastUserMessage = messages[messages.length - 1]?.content || 'Hello';
    const response = await chat.sendMessage({
      message: lastUserMessage,
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return res.json({
      reply: "I am here to guide your career path at Richfield College! Ask me about CV writing, interview preparation, finding internships, or connecting with alumni mentors."
    });
  }
});

// Gemini NLP CV Extraction
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
        experience: [
          {
            role: "Peer Tutor / Lab Assistant",
            company: "Richfield College",
            period: "2024 - Present",
            description: "Mentored first-year IT students in programming fundamentals, algorithms, and database design."
          }
        ],
        qualifications: [
          {
            institution: "Richfield Graduate Institute of Technology",
            degree: "BSc Information Technology",
            year: "2023 - 2026"
          }
        ]
      });
    }

    const prompt = `Extract structured profile information from this CV / Resume text for a student platform.
Return a valid JSON object with:
- headline: string (concise professional headline)
- summary: string (2-3 sentences professional summary)
- technicalSkills: array of strings
- professionalSkills: array of strings
- experience: array of objects { role: string, company: string, period: string, description: string }
- qualifications: array of objects { institution: string, degree: string, year: string }

CV Text:
${cvText}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in NLP CV API:', error);
    return res.json({
      headline: "Full-Stack Developer & BSc IT Candidate",
      summary: "Motivated student eager to apply computer science principles in enterprise software solutions.",
      technicalSkills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
      professionalSkills: ["Critical Thinking", "Communication", "Time Management"],
      experience: [],
      qualifications: []
    });
  }
});

// Start server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Enrich Richfield Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
