import React, { useState } from 'react';
import {
  GitFork,
  CheckCircle2,
  Briefcase,
  ArrowRight,
  Sparkles,
  Quote,
  GraduationCap,
  ChevronRight
} from 'lucide-react';
import { ALUMNI_TRAJECTORIES } from '../data/mockData';
import { AlumniCareerTrajectory } from '../types';

export const CareerPathwayExplorer: React.FC = () => {
  const [selectedTrajectory, setSelectedTrajectory] = useState<AlumniCareerTrajectory>(
    ALUMNI_TRAJECTORIES[0]
  );
  const [filterDegree, setFilterDegree] = useState<string>('all');

  const filtered = ALUMNI_TRAJECTORIES.filter((traj) => {
    if (filterDegree === 'all') return true;
    return traj.degree.toLowerCase().includes(filterDegree.toLowerCase());
  });

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-lg text-[#2B193D]">
              Alumni Career Trajectory Explorer
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#C5979D]/20 text-[#2B193D] font-bold text-[10px]">
              Proven Pathways
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover real career journeys from Richfield graduates to senior tech leadership.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setFilterDegree('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterDegree === 'all' ? 'bg-white text-[#2B193D] shadow-2xs' : 'text-slate-600'
            }`}
          >
            All Degrees
          </button>
          <button
            onClick={() => setFilterDegree('BSc')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterDegree === 'BSc' ? 'bg-white text-[#2B193D] shadow-2xs' : 'text-slate-600'
            }`}
          >
            BSc IT
          </button>
          <button
            onClick={() => setFilterDegree('Diploma')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterDegree === 'Diploma' ? 'bg-white text-[#2B193D] shadow-2xs' : 'text-slate-600'
            }`}
          >
            Diploma IT
          </button>
          <button
            onClick={() => setFilterDegree('BCom')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterDegree === 'BCom' ? 'bg-white text-[#2B193D] shadow-2xs' : 'text-slate-600'
            }`}
          >
            BCom Info
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Alumni Selector Sidebar */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Featured Richfield Alumni
          </h3>
          {filtered.map((traj) => {
            const isSelected = selectedTrajectory.id === traj.id;
            return (
              <div
                key={traj.id}
                onClick={() => setSelectedTrajectory(traj)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'bg-[#2B193D] text-white border-[#2B193D] shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                }`}
              >
                <img
                  src={traj.avatar}
                  alt={traj.alumnusName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#4B8F8C] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs truncate flex items-center gap-1">
                    <span>{traj.alumnusName}</span>
                    <CheckCircle2 className="w-3 h-3 text-[#4B8F8C] shrink-0" />
                  </div>
                  <div className={`text-[11px] truncate ${isSelected ? 'text-[#C5979D]' : 'text-slate-500'}`}>
                    {traj.currentRole}
                  </div>
                  <div className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {traj.currentCompany} • Class of {traj.graduationYear}
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#4B8F8C]' : 'text-slate-300'}`} />
              </div>
            );
          })}
        </div>

        {/* Selected Trajectory Step-by-Step Pathway */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
          {/* Header of Trajectory */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <img
                src={selectedTrajectory.avatar}
                alt={selectedTrajectory.alumnusName}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#4B8F8C]"
              />
              <div>
                <h2 className="font-bold text-base text-[#2B193D]">
                  {selectedTrajectory.alumnusName}
                </h2>
                <p className="text-xs font-semibold text-[#4B8F8C]">
                  {selectedTrajectory.currentRole} @ {selectedTrajectory.currentCompany}
                </p>
                <p className="text-[11px] text-slate-400">
                  Richfield Qualification: {selectedTrajectory.degree} (Graduated {selectedTrajectory.graduationYear})
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-[#4B8F8C]/15 text-[#4B8F8C] font-bold text-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Verified Alum
            </span>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Career Trajectory Milestones
            </h3>
            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-8">
              {selectedTrajectory.steps.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline bullet */}
                  <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-white border-4 border-[#4B8F8C] shadow-2xs" />
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[#2B193D]">{step.title}</span>
                      <span className="font-mono text-[10px] text-slate-400 font-semibold">{step.year}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-[#2C365E] mb-1">
                      {step.organization}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.highlight}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alumnus Advice Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2B193D]/5 to-[#2C365E]/5 border border-[#2C365E]/15 flex items-start gap-3 text-xs">
            <Quote className="w-5 h-5 text-[#C5979D] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#2B193D] block mb-0.5">
                Advice to Richfield Undergraduates:
              </span>
              <p className="text-slate-700 italic">"{selectedTrajectory.advice}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
