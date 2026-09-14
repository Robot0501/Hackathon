import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  LogIn,
  UserCheck,
  Sparkles,
  ChevronRight,
  BookOpen,
  MapPin,
  Users,
  Briefcase,
  GitFork,
  Target,
  FileCheck,
  TrendingUp,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  Search,
  MessageSquare
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface HomePageProps {
  onOpenLogin: () => void;
  onOpenRegister: (role?: UserRole) => void;
  onQuickDemoLogin: (user: UserProfile) => void;
  availableDemoUsers: UserProfile[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenLogin,
  onOpenRegister,
  onQuickDemoLogin,
  availableDemoUsers
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'What is Enrich and what is its primary purpose?',
      a: 'Enrich is Richfield College’s dedicated career development and institutional placement ecosystem. It bridges higher education with South African industry by providing verified academic credentials, direct employment pipelines, AI-driven CV and career guidance, and an active alumni mentorship network.'
    },
    {
      q: 'Who can use the Enrich platform?',
      a: 'Enrich serves four primary communities: current Richfield students seeking internships, learnerships, and graduate roles; Richfield alumni looking to mentor or hire; vetted corporate employers and recruiters sourcing qualified talent; and Richfield academic administrators managing career placements.'
    },
    {
      q: 'How does Enrich help students get hired?',
      a: 'Students create verified digital dossiers showcasing their academic standing, project repositories, technical skills, and video elevator pitches. Top corporate partners review pre-vetted candidate profiles and recruit directly through the platform without third-party recruitment agency fees.'
    },
    {
      q: 'How does the alumni mentorship program work?',
      a: 'Alumni who have established successful careers in software engineering, cybersecurity, data science, and business management can connect directly with current students for portfolio reviews, interview preparation, and referral opportunities.'
    },
    {
      q: 'Is student information secure and compliant?',
      a: 'Yes. Enrich strictly complies with the Protection of Personal Information Act (POPIA). Student contact records and academic dossiers are shared only with vetted, approved corporate partners when a student applies for an opportunity or opts into candidate search.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Top Institutional Header & Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0F172A] text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] border border-blue-600 flex items-center justify-center font-serif font-black text-lg text-white shadow-xs">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  Enrich
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-900 text-blue-200 border border-blue-700">
                  Richfield
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Careers & Placement Ecosystem
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button
              onClick={() => scrollToSection('purpose')}
              className="hover:text-white transition-colors"
            >
              Our Purpose
            </button>
            <button
              onClick={() => scrollToSection('solutions')}
              className="hover:text-white transition-colors"
            >
              Ecosystem
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-white transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('pathways')}
              className="hover:text-white transition-colors"
            >
              Pathways
            </button>
            <button
              onClick={() => scrollToSection('partners')}
              className="hover:text-white transition-colors"
            >
              Partners
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-white transition-colors"
            >
              FAQ
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => onOpenRegister('student')}
              className="px-4 py-2 text-xs font-bold bg-[#1E3A8A] hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Join Enrich</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0F172A] text-white py-14 sm:py-20 border-b border-slate-800">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-blue-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Richfield College Official Career Development Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-serif">
              Bridging Richfield Talent with South Africa’s Leading Enterprises.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Enrich empowers Richfield students and alumni to build verified professional dossiers, master in-demand technical competencies, connect with senior alumni mentors, and step directly into accredited graduate opportunities.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onOpenRegister('student')}
                className="px-6 py-3.5 bg-[#1E3A8A] hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>Get Started as a Student</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenLogin}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Your Account</span>
              </button>
            </div>

            {/* Institutional Trust Indicators */}
            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>POPIA Certified & Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>DHET & CHE Registered</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>8 National Campuses</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-800/90 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80"
                alt="Richfield scholars collaborating in software development lab"
                className="w-full h-56 object-cover"
              />
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-700 flex items-center justify-center text-blue-300">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Verified Career Dossier</h4>
                      <p className="text-[11px] text-slate-400">BSc IT & Diploma in IT</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Verified
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-700/60 text-slate-300">
                    <span className="text-slate-400">Employment Readiness Score:</span>
                    <span className="font-semibold text-emerald-400">92% (Top Tier)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-700/60 text-slate-300">
                    <span className="text-slate-400">Direct Industry Partners:</span>
                    <span className="text-slate-200 font-medium">Standard Bank, Vodacom, Entelect</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-slate-300">
                    <span className="text-slate-400">Placement Office Governance:</span>
                    <span className="text-slate-200 font-medium">Richfield Career Directorate</span>
                  </div>
                </div>

                <button
                  onClick={() => scrollToSection('demo')}
                  className="w-full py-2 bg-[#1E3A8A]/60 hover:bg-[#1E3A8A] text-blue-200 hover:text-white border border-blue-600/40 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Explore Interactive Platform Preview</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Impact Metrics Bar */}
      <section className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] font-serif">8</div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mt-1">National Campuses</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Johannesburg, Durban, Cape Town & more</p>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-serif">92%</div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mt-1">Placement Index</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Graduate placement readiness</p>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] font-serif">250+</div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mt-1">Vetted Employers</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Direct hiring partners</p>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-serif">100%</div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mt-1">Verified Dossiers</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Accredited academic records</p>
            </div>
          </div>
        </div>
      </section>

      {/* Purpose & Mission Section */}
      <section id="purpose" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
              Our Core Purpose
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mt-3 font-serif">
              Why Enrich Was Built for Richfield College
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
              Enrich transforms how higher education connects with the real economy. By replacing outdated paper CVs and unverified resumes with an institutional digital ecosystem, Enrich ensures every Richfield scholar has a clear, supported path into professional employment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-[#1E3A8A] transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1E3A8A] mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Closing the Graduate Gap
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connects qualified Richfield graduates with top employers, reducing friction and giving recruiters immediate confidence in candidate capabilities.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-600 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Verified Credentials & Projects
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Replaces self-reported resumes with verified academic standing, certified micro-credentials, GitHub code repositories, and video pitch presentations.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-600 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Active Alumni Mentorship
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enables seasoned alumni thriving in industry to mentor current students, conduct mock technical interviews, and recommend graduates for internal company openings.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-600 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                AI Career Intelligence
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provides automated CV critique, interview simulation, elevator pitch analysis, and actionable career pathway roadmaps tailored to South Africa's tech industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions / Ecosystem Section: For Students, Alumni, Employers */}
      <section id="solutions" className="py-14 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
              Platform Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mt-3 font-serif">
              Tailored for Every Stage of Your Career Journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-3">
              Explore how Enrich serves students preparing for the workforce, alumni giving back, and employers seeking top talent.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* For Students */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-[#1E3A8A] transition-colors shadow-2xs">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#1E3A8A] flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">For Current Students</h3>
                <p className="text-xs text-slate-600 mt-1 mb-4">
                  Launch your professional career with institutional verification and direct hiring channels.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Apply directly to vetted internships and graduate developer roles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Build a verified digital portfolio with GitHub repos and video elevator pitches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Access AI-powered CV optimization and personalized career pathways</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Connect 1-on-1 with alumni mentors working in top technology firms</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200">
                <button
                  onClick={() => onOpenRegister('student')}
                  className="w-full py-2.5 bg-[#1E3A8A] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>Register as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* For Alumni */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-emerald-600 transition-colors shadow-2xs">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">For Richfield Alumni</h3>
                <p className="text-xs text-slate-600 mt-1 mb-4">
                  Give back to your alma mater, mentor students, and expand your professional leadership reach.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Mentor upcoming graduates and share industry insights and best practices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Post internal referral vacancies and hire junior engineers directly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Network with fellow alumni across banking, cloud, and consulting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Receive official institutional recognition as an Accredited Alumni Mentor</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200">
                <button
                  onClick={() => onOpenRegister('alumni')}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>Join Alumni Network</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* For Employers */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-indigo-600 transition-colors shadow-2xs">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">For Corporate Employers</h3>
                <p className="text-xs text-slate-600 mt-1 mb-4">
                  Access a direct pipeline of pre-vetted, industry-ready technology and business graduates.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Direct recruitment pipeline with zero third-party agency placement fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Review verified academic credentials and hands-on GitHub projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Post accredited internships, bursaries, and graduate trainee positions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>POPIA compliant direct communication and campus interview scheduling</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200">
                <button
                  onClick={() => onOpenRegister('business')}
                  className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>Register Enterprise Partner</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
              Placement Pathway
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mt-3 font-serif">
              How Enrich Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-3">
              A straightforward four-step process connecting academic achievement with meaningful careers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white font-bold text-xs flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">Create & Verify Account</h4>
              <p className="text-xs text-slate-600">
                Sign in with your institutional or corporate credentials. Verification ensures platform authenticity and trust.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white font-bold text-xs flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">Build Your Career Dossier</h4>
              <p className="text-xs text-slate-600">
                Showcase technical skills, programming repositories, academic achievements, and record a 60-second video elevator pitch.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white font-bold text-xs flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">Get AI Guidance & Mentorship</h4>
              <p className="text-xs text-slate-600">
                Receive instant AI feedback on your CV and interview skills, and book sessions with alumni mentors working in your field.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white font-bold text-xs flex items-center justify-center mb-4">
                4
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">Apply & Get Placed</h4>
              <p className="text-xs text-slate-600">
                Browse accredited vacancies from partner employers and submit your verified profile directly to hiring managers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Career Pathways Section */}
      <section id="pathways" className="py-14 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
              In-Demand Disciplines
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mt-3 font-serif">
              Accredited Pathways Aligned with Industry Demand
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-3">
              Explore the core career tracks supported by Richfield programmes and top South African technology employers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-blue-100 text-[#1E3A8A] rounded-xl">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Software Engineering</h4>
                  <p className="text-[11px] text-slate-500">Full-Stack, React, Java & Python</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Prepare for frontend, backend, and full-stack software development roles at financial institutions and software agencies.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">TypeScript</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">React</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">Node.js</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">SQL</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-400 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Cybersecurity & SecOps</h4>
                  <p className="text-[11px] text-slate-500">SOC Analysis, Network Defense & InfoSec</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Guard corporate infrastructure, monitor security operations centers, and audit compliance with banking standards.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">Threat Intel</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">Firewalls</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">SIEM</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">Pen-Testing</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-amber-400 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Data Analytics & BI</h4>
                  <p className="text-[11px] text-slate-500">PowerBI, SQL, Python & Dashboards</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Transform raw transactional and customer data into actionable executive insights for telecom and retail enterprises.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">Power BI</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">PostgreSQL</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">Pandas</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">Tableau</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Placement & Industry Partners */}
      <section id="partners" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
              Industry Engagement
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-3 font-serif">
              Trusted by Leading South African Employers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Our placement office actively partners with major financial, telecommunications, and software engineering corporations to recruit Richfield talent.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-center">
            {['Standard Bank', 'Vodacom', 'Entelect', 'Capitec Bank', 'Discovery', 'Derivco'].map((partner) => (
              <div
                key={partner}
                className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs hover:border-blue-400 transition-colors"
              >
                <span className="font-bold text-xs text-slate-800 tracking-tight">{partner}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Graduate Partner</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section id="faq" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
              Common Inquiries
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-3 font-serif">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Everything you need to know about the Enrich platform and the Richfield placement ecosystem.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-[#1E3A8A]"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-[#1E3A8A]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-12 sm:py-16 bg-[#0F172A] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A] border border-blue-500 mx-auto flex items-center justify-center font-serif font-bold text-xl text-white shadow-xs">
            R
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-serif">
            Ready to Accelerate Your Career with Enrich?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join thousands of Richfield scholars, alumni, and employers transforming higher education into impactful careers across South Africa.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenRegister('student')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#1E3A8A] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>Register Your Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Existing Account</span>
            </button>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="bg-[#0A0F1D] text-slate-400 text-xs py-10 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1E3A8A] flex items-center justify-center font-bold text-white text-sm">
                  R
                </div>
                <span className="font-bold text-sm text-white">Enrich Platform</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Richfield College (Pty) Ltd. Higher Education Careers & Placement Directorate.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-2">Campus Locations</h4>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li>Braamfontein Campus, Johannesburg</li>
                <li>Umhlanga Ridge Campus, Durban</li>
                <li>Cape Town City Campus</li>
                <li>Centurion Technology Park, Pretoria</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-2">Platform Portals</h4>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li><button onClick={() => onOpenRegister('student')} className="hover:text-white">Student Career Portal</button></li>
                <li><button onClick={() => onOpenRegister('alumni')} className="hover:text-white">Alumni Mentorship Network</button></li>
                <li><button onClick={() => onOpenRegister('business')} className="hover:text-white">Corporate Recruiter Access</button></li>
                <li><button onClick={onOpenLogin} className="hover:text-white">Institutional Staff Sign In</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-2">Accreditation & Compliance</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Registered with the Department of Higher Education and Training (DHET) as a private higher education institution under the Higher Education Act, 1997. Registration Certificate No. 2000/HE07/008.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} Richfield College (Pty) Ltd. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>POPIA Compliant</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
