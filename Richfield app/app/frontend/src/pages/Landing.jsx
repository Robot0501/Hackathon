import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Sparkles, Briefcase, Users, GraduationCap, Building2, ArrowRight, CheckCircle2, Rocket, Target, ShieldCheck } from "lucide-react";

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all">
    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3"><Icon className="w-5 h-5" /></div>
    <div className="font-heading font-semibold text-slate-900">{title}</div>
    <p className="text-sm text-slate-600 mt-1">{desc}</p>
  </div>
);

const Stat = ({ n, l }) => (
  <div>
    <div className="stat-num text-3xl sm:text-4xl text-slate-900">{n}</div>
    <div className="text-xs uppercase tracking-wider text-slate-500 mt-1">{l}</div>
  </div>
);

const BenefitCard = ({ icon: Icon, title, items, color }) => (
  <div className={`rounded-2xl border p-6 ${color}`}>
    <Icon className="w-6 h-6" />
    <div className="font-heading font-bold text-lg mt-3">{title}</div>
    <ul className="mt-3 space-y-2 text-sm">
      {items.map((i, idx) => <li key={idx} className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {i}</li>)}
    </ul>
  </div>
);

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2" data-testid="brand-link">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-slate-900 flex items-center justify-center text-white font-bold font-heading">R</div>
            <div className="font-heading font-extrabold text-lg tracking-tight">Richfield Connect</div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/login")} data-testid="landing-login-btn">Sign in</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate("/register")} data-testid="landing-register-btn">Get Started</Button>
          </div>
        </div>
      </header>

      <section className="grain-bg">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <Badge variant="outline" className="mb-4 bg-white border-blue-200 text-blue-700" data-testid="hero-badge">
              <Sparkles className="w-3 h-3 mr-1" /> Richfield & AAA Employability Network
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] font-heading text-slate-900">
              Build Your <span className="text-blue-600">Professional Future</span>.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl">
              The career ecosystem for Richfield and AAA students, alumni and employers. Craft a professional profile, discover verified opportunities, get AI‑powered coaching, and connect with the people who will shape your path.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate("/register")} data-testid="hero-cta-primary">
                Build Your Professional Future <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")} data-testid="hero-cta-secondary">I already have an account</Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              <Stat n="4" l="Roles" />
              <Stat n="AI" l="Career Coach" />
              <Stat n="1×" l="Ecosystem" />
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1520881363902-a0ff4e722963?crop=entropy&cs=srgb&fm=jpg&q=85"
                   alt="Students networking" className="rounded-2xl shadow-xl border border-slate-200" />
              <Card className="absolute -bottom-6 -left-6 w-64 shadow-xl border-slate-200 hidden sm:block">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-600" /><span className="text-xs font-medium uppercase tracking-wide text-slate-500">AI Assistant Preview</span></div>
                  <p className="text-sm mt-2 text-slate-700">"Your profile is 68% complete. Add 2 projects and your GitHub to unlock more matches."</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs uppercase tracking-widest text-blue-700 font-semibold">Why Richfield Connect</div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-heading">One platform, three journeys.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <BenefitCard icon={GraduationCap} color="bg-blue-50 border-blue-100 text-blue-900" title="For Students"
            items={["Professional profile & portfolio", "Verified alumni mentorship", "AI job matching", "CV analysis & employability score", "Apply and track applications"]} />
          <BenefitCard icon={Users} color="bg-emerald-50 border-emerald-100 text-emerald-900" title="For Alumni"
            items={["Showcase your journey", "Mentor current students", "Share opportunities", "Provide recommendations", "Contribute to career paths"]} />
          <BenefitCard icon={Building2} color="bg-purple-50 border-purple-100 text-purple-900" title="For Employers"
            items={["Discover verified talent", "Post approved jobs & internships", "Manage applicant pipeline", "Company profile & analytics", "Direct candidate messaging"]} />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid md:grid-cols-4 gap-4">
          <Feature icon={Sparkles} title="AI Career Coach" desc="Get personalised guidance grounded in your real profile — never invented." />
          <Feature icon={Target} title="Smart Job Matching" desc="See match scores with clear reasons — matched skills, qualifications, experience." />
          <Feature icon={Rocket} title="Career Path Explorer" desc="Interactive pathways from qualification to leadership, informed by alumni." />
          <Feature icon={ShieldCheck} title="Verified Community" desc="Institutional email verification, alumni verification, employer approval." />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="rounded-2xl bg-slate-900 text-white p-8 sm:p-12 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-heading font-extrabold text-3xl sm:text-4xl">Your career, connected.</h3>
            <p className="mt-3 text-slate-300 max-w-xl">Join Richfield Connect today with your institutional email and start building the profile that opens doors.</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" onClick={() => navigate("/register")} data-testid="footer-register-btn">
              Create your account <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" onClick={() => navigate("/login")} data-testid="footer-login-btn">Sign in</Button>
          </div>
        </div>
      </section>
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">© 2026 Richfield Connect · Built for Richfield & AAA</footer>
    </div>
  );
}
