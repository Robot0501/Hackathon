import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ChevronRight, GraduationCap, Rocket, Briefcase, Star, Crown } from "lucide-react";

const stepIcon = { "Qualification": GraduationCap, "Internship": Rocket, "Junior Role": Briefcase, "Mid-Level Role": Briefcase, "Senior Role": Star, "Leadership": Crown };

export default function CareerExplorer() {
  const [paths, setPaths] = useState([]);
  const [active, setActive] = useState(null);
  useEffect(() => { api.get("/career-paths").then((r) => { setPaths(r.data); setActive(r.data[0]); }); }, []);
  if (!active) return <div className="p-8 text-slate-500">Loading…</div>;
  return (
    <div className="space-y-4">
      <h1 className="font-heading font-extrabold text-3xl">Career Path Explorer</h1>
      <p className="text-slate-600 text-sm">Explore realistic career journeys — from qualification through leadership.</p>
      <div className="grid md:grid-cols-4 gap-3">
        {paths.map((p) => (
          <button key={p.id} onClick={()=>setActive(p)} data-testid={`path-${p.id}`} className={`text-left p-4 rounded-xl border transition-all ${active.id===p.id?"border-blue-500 ring-2 ring-blue-500/20 bg-white":"bg-white hover:border-blue-300"}`}>
            <div className="font-heading font-semibold">{p.title}</div><div className="text-xs text-slate-600 mt-1 line-clamp-2">{p.description}</div>
          </button>
        ))}
      </div>
      <Card><CardContent className="p-6">
        <h2 className="font-heading font-extrabold text-2xl">{active.title}</h2>
        <p className="text-slate-600 text-sm mt-1">{active.description}</p>
        <div className="mt-6 grid lg:grid-cols-6 gap-3 relative">
          {active.steps.map((s, i) => {
            const Icon = stepIcon[s.level] || Briefcase;
            return (
              <div key={i} className="relative">
                <div className="p-4 rounded-xl border bg-white hover:shadow-md transition-all">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2"><Icon className="w-5 h-5" /></div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">{s.level}</div>
                  <div className="font-heading font-semibold text-sm mt-1">{s.title}</div>
                  <div className="mt-2 flex flex-wrap gap-1">{s.skills.map((sk) => <span key={sk} className="chip bg-slate-100 text-slate-700 border-slate-200 text-[10px]">{sk}</span>)}</div>
                </div>
                {i < active.steps.length-1 && <ChevronRight className="hidden lg:block w-5 h-5 text-slate-300 absolute -right-2 top-1/2 -translate-y-1/2" />}
              </div>
            );
          })}
        </div>
      </CardContent></Card>
    </div>
  );
}
