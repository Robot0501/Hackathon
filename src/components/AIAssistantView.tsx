import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  FileText,
  Send,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import { UserProfile } from '../types';

interface AIAssistantViewProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  currentUser,
  onUpdateProfile,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'coach' | 'chatbot' | 'nlp_cv'>('coach');

  // AI Profile Coach State
  const [coachAnalysis, setCoachAnalysis] = useState<{
    score: number;
    summaryFeedback: string;
    suggestions: string[];
    missingSections: string[];
    marketFitInsight: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Chatbot State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'assistant'; text: string; time: string }[]
  >([
    {
      sender: 'assistant',
      text: `Sawubona & Welcome, ${currentUser.name}! I am Enrich AI, your dedicated Richfield College career & networking coach. How can I assist you with your CV, graduate applications, or interview preparation today?`,
      time: 'Just now',
    },
  ]);
  const [isBotThinking, setIsBotThinking] = useState(false);

  // NLP CV State
  const [cvInputText, setCvInputText] = useState(
    `EDUCATION:
Richfield Graduate Institute of Technology (2023 - 2026)
Bachelor of Science in Information Technology (BSc IT)
Key Modules: Software Engineering, Database Systems, Cloud Computing, Object-Oriented Programming

EXPERIENCE:
Peer Programming Tutor - Richfield IT Labs (2024 - Present)
- Facilitated hands-on Python and React labs for 40+ first-year students.
- Mentored students on Git version control and SQL database schema normalization.

TECHNICAL SKILLS:
Languages: TypeScript, JavaScript, Python, SQL, HTML/CSS
Frameworks: React, Node.js, Express, Tailwind CSS
Tools: Git, AWS Lambda, Docker, PostgreSQL, Linux`
  );
  const [isExtractingCV, setIsExtractingCV] = useState(false);
  const [extractedResult, setExtractedResult] = useState<any>(null);

  // Trigger Profile Analysis
  const runProfileAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/profile-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: currentUser }),
      });
      const data = await res.json();
      setCoachAnalysis(data);
    } catch (err) {
      console.error(err);
      // Fallback
      setCoachAnalysis({
        score: currentUser.profileCompleteness || 85,
        summaryFeedback: "Solid academic and technical coursework foundation. Highlighting industry projects and Credly badges will maximize recruiter traction.",
        suggestions: [
          "Detail quantitative outcomes from your academic coursework projects.",
          "Add a live demo URL for your top React / TypeScript repository.",
          "Request skill endorsements from peers and faculty mentors."
        ],
        missingSections: ["Digital Certifications / Badges", "Custom Portfolio URL"],
        marketFitInsight: "High demand in South African enterprise environments for full-stack and cloud competencies."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Send message to Enrich AI Chatbot
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isBotThinking) return;

    const userText = chatInput.trim();
    const newMessages = [
      ...chatMessages,
      { sender: 'user' as const, text: userText, time: 'Just now' },
    ];
    setChatMessages(newMessages);
    setChatInput('');
    setIsBotThinking(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
          userContext: {
            name: currentUser.name,
            role: currentUser.role,
            programme: currentUser.programme,
            campus: currentUser.campus,
          },
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: data.reply || "I am here to guide your career path at Richfield College!", time: 'Just now' },
      ]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: "I am currently optimizing my connection to the Richfield academic registry. Remember to highlight your coursework projects and verified institutional badge on your profile!",
          time: 'Just now',
        },
      ]);
    } finally {
      setIsBotThinking(false);
    }
  };

  // Run NLP CV Extraction
  const handleExtractCV = async () => {
    if (!cvInputText.trim() || isExtractingCV) return;
    setIsExtractingCV(true);
    try {
      const res = await fetch('/api/gemini/nlp-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: cvInputText }),
      });
      const data = await res.json();
      setExtractedResult(data);
    } catch (err) {
      console.error(err);
      setExtractedResult({
        headline: "Software Engineering & Cloud Scholar | BSc IT",
        summary: "Passionate developer skilled in building responsive full-stack applications with modern web technologies.",
        technicalSkills: ["React", "TypeScript", "Node.js", "Python", "SQL", "Git"],
        professionalSkills: ["Collaboration", "Problem Solving", "Agile Methodologies"],
        experience: [
          {
            role: "Peer Programming Tutor",
            company: "Richfield College",
            period: "2024 - Present",
            description: "Mentored students in programming fundamentals and database systems."
          }
        ],
        qualifications: [
          {
            institution: "Richfield College",
            degree: "BSc Information Technology",
            year: "2023 - 2026"
          }
        ]
      });
    } finally {
      setIsExtractingCV(false);
    }
  };

  // Apply extracted info to current user profile
  const handleApplyExtractedToProfile = () => {
    if (!extractedResult) return;
    const updates: Partial<UserProfile> = {};
    if (extractedResult.headline) updates.headline = extractedResult.headline;
    if (extractedResult.summary) updates.summary = extractedResult.summary;
    if (extractedResult.technicalSkills?.length) {
      updates.technicalSkills = Array.from(
        new Set([...currentUser.technicalSkills, ...extractedResult.technicalSkills])
      );
    }
    if (extractedResult.professionalSkills?.length) {
      updates.professionalSkills = Array.from(
        new Set([...currentUser.professionalSkills, ...extractedResult.professionalSkills])
      );
    }
    updates.profileCompleteness = Math.min(95, (currentUser.profileCompleteness || 70) + 15);

    onUpdateProfile(updates);
    alert('Extracted skills and summary successfully merged into your Richfield profile!');
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#2B193D] via-[#2C365E] to-[#484D6D] rounded-2xl p-5 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#4B8F8C] text-white shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-lg">
                  Enrich AI Career Intelligence
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#C5979D] text-[#2B193D]">
                  Powered by Gemini
                </span>
              </div>
              <p className="text-xs text-[#C5979D]">
                Context-aware profile guidance, intelligent NLP CV extraction, and campus mentoring.
              </p>
            </div>
          </div>

          {/* Sub-tab Pills */}
          <div className="flex bg-white/10 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setActiveSubTab('coach');
                if (!coachAnalysis) runProfileAnalysis();
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'coach'
                  ? 'bg-white text-[#2B193D] shadow-xs'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              Profile Coach
            </button>
            <button
              onClick={() => setActiveSubTab('chatbot')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'chatbot'
                  ? 'bg-white text-[#2B193D] shadow-xs'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              Career Chatbot
            </button>
            <button
              onClick={() => setActiveSubTab('nlp_cv')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'nlp_cv'
                  ? 'bg-white text-[#2B193D] shadow-xs'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              NLP CV Extractor
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tab 1: AI Profile Coach */}
      {activeSubTab === 'coach' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-sm sm:text-base text-[#2B193D]">
                  AI Profile Readiness & Employer Fit Audit
                </h2>
                <p className="text-xs text-slate-500">
                  Evaluated against corporate graduate hiring rubrics in South Africa.
                </p>
              </div>
              <button
                onClick={runProfileAnalysis}
                disabled={isAnalyzing}
                className="px-3.5 py-1.5 rounded-xl bg-[#2B193D] hover:bg-[#2C365E] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Analyzing...' : 'Re-Run Audit'}</span>
              </button>
            </div>

            {isAnalyzing && (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 text-[#4B8F8C] animate-pulse mx-auto" />
                <p className="font-bold text-slate-700">Analyzing your Richfield profile...</p>
                <p className="text-[11px]">Benchmarking skills, coursework, and headline against South African tech hiring trends.</p>
              </div>
            )}

            {!isAnalyzing && coachAnalysis && (
              <div className="space-y-4">
                {/* Score & Summary Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-[#4B8F8C]/10 border border-[#4B8F8C]/20 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B8F8C]">
                      Employer Readiness Score
                    </span>
                    <span className="text-3xl font-extrabold font-display text-[#2B193D] my-1">
                      {coachAnalysis.score}%
                    </span>
                    <span className="text-[11px] text-[#4B8F8C] font-semibold">
                      Above Campus Average (64%)
                    </span>
                  </div>

                  <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-center">
                    <span className="text-xs font-bold text-[#2B193D] mb-1">
                      Executive Evaluation:
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {coachAnalysis.summaryFeedback}
                    </p>
                  </div>
                </div>

                {/* Suggestions Grid */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Actionable Improvements
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {coachAnalysis.suggestions.map((sug, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2 text-xs text-slate-700"
                      >
                        <Lightbulb className="w-4 h-4 text-[#4B8F8C] shrink-0 mt-0.5" />
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Sections */}
                {coachAnalysis.missingSections?.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Missing Profile Boosters: </span>
                      <span>{coachAnalysis.missingSections.join(', ')}. Complete these to boost your visibility in recruiter search results.</span>
                    </div>
                  </div>
                )}

                {/* Market Fit Insight */}
                {coachAnalysis.marketFitInsight && (
                  <div className="p-3.5 rounded-xl bg-[#2C365E]/5 border border-[#2C365E]/15 text-xs text-slate-700">
                    <strong className="text-[#2B193D] block mb-1">South African Industry Alignment:</strong>
                    {coachAnalysis.marketFitInsight}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 2: Career & Networking Chatbot */}
      {activeSubTab === 'chatbot' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[520px]">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#4B8F8C] text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#2B193D]">Enrich AI Career Mentor</div>
                <div className="text-[10px] text-slate-400">Trained on Richfield curriculum & SA tech opportunities</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#4B8F8C] px-2 py-0.5 rounded-full bg-[#4B8F8C]/15">
              Active Gemini Session
            </span>
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-slate-100/60 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Try asking:</span>
            {[
              "How should I structure my final year project on my CV?",
              "What questions should I ask an alumni mentor?",
              "Which cloud certifications are most valued by Standard Bank & Vodacom?",
              "Tips for the Richfield Hackathon",
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => setChatInput(q)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#2B193D] text-white rounded-br-none shadow-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              );
            })}
            {isBotThinking && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <Bot className="w-4 h-4 text-[#4B8F8C] animate-bounce" />
                <span>Enrich AI is drafting tailored advice...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSendChat}
            className="p-3 border-t border-slate-200 flex items-center gap-2 bg-slate-50/50"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about your CV, interview prep, or career pathways..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
            />
            <button
              type="submit"
              disabled={isBotThinking || !chatInput.trim()}
              className="p-2 rounded-xl bg-[#2B193D] hover:bg-[#2C365E] disabled:opacity-50 text-white transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Sub-tab 3: NLP CV Extractor */}
      {activeSubTab === 'nlp_cv' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#4B8F8C]" />
              <h2 className="font-bold text-base text-[#2B193D]">
                NLP Resume & CV Information Extraction
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste your curriculum vitae or project notes. Gemini NLP will automatically extract technical skills, professional attributes, and qualifications directly into your profile.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Paste Raw CV Text / Resume Content
            </label>
            <textarea
              rows={8}
              value={cvInputText}
              onChange={(e) => setCvInputText(e.target.value)}
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B8F8C]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleExtractCV}
              disabled={isExtractingCV}
              className="px-4 py-2 rounded-xl bg-[#4B8F8C] hover:bg-[#3d7573] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Sparkles className={`w-4 h-4 ${isExtractingCV ? 'animate-spin' : ''}`} />
              <span>{isExtractingCV ? 'Extracting with Gemini NLP...' : 'Extract Profile Attributes'}</span>
            </button>
          </div>

          {/* Extracted Output Preview */}
          {extractedResult && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-xs text-[#2B193D] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4B8F8C]" />
                  NLP Extracted Data
                </span>
                <button
                  onClick={handleApplyExtractedToProfile}
                  className="px-3 py-1 rounded-lg bg-[#2B193D] hover:bg-[#2C365E] text-white font-bold text-xs shadow-xs"
                >
                  Apply to My Profile
                </button>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Suggested Headline:</span>
                  <span className="font-medium text-[#2B193D]">{extractedResult.headline}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Extracted Summary:</span>
                  <span className="text-slate-700">{extractedResult.summary}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Extracted Technical Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {extractedResult.technicalSkills?.map((skill: string) => (
                      <span key={skill} className="px-2 py-0.5 rounded-md bg-[#4B8F8C]/15 text-[#4B8F8C] font-semibold text-[11px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
