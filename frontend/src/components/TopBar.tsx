import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Shield, Sparkles, ChevronRight, Circle } from 'lucide-react';
import { useResume } from '../context/ResumeContext';

interface TopBarProps {
  onToggleMentor: () => void;
}

const PAGE_NAMES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Executive Mission Control', subtitle: 'AI-Powered Career Intelligence Hub' },
  '/digital-twin': { title: 'Digital Twin Profile', subtitle: 'Unified AI Persona & Skill Graph' },
  '/career-analysis': { title: 'Career Analysis Workspace', subtitle: 'ATS, Skill Gaps & Suitability Rankings' },
  '/marketplace': { title: 'Career Marketplace', subtitle: 'Live Job Discovery & Application Board' },
  '/learning-roadmap': { title: 'Learning & Development Hub', subtitle: 'Structured Roadmap & Priority Enhancements' },
};

export const TopBar: React.FC<TopBarProps> = ({ onToggleMentor }) => {
  const location = useLocation();
  const { parsedData, targetRole } = useResume();
  const [searchQuery, setSearchQuery] = useState('');

  const currentPage = PAGE_NAMES[location.pathname] || {
    title: 'CareerPilot AI',
    subtitle: 'Cybersecurity Career Platform',
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#070B14]/80 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition-all">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
          <span>Platform</span>
          <ChevronRight size={12} className="text-slate-600" />
          <span className="text-indigo-400 font-bold">{currentPage.title}</span>
        </div>
        <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
          {currentPage.title}
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Cyber OS 2.0
          </span>
        </h1>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles, skills, certifications, jobs..."
            className="w-full bg-[#0E1320] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF]/50 transition-all"
          />
          <kbd className="hidden lg:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls: Target Role Pill, Notifications, Mentor Trigger, Profile Avatar */}
      <div className="flex items-center gap-3">
        {targetRole && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
            <Shield size={13} className="text-indigo-400" />
            <span className="text-slate-400 font-medium">Target:</span>
            <span className="font-bold text-indigo-300 truncate max-w-[120px]">{targetRole.name}</span>
          </div>
        )}

        {/* Notifications */}
        <button
          type="button"
          aria-label="System notifications"
          className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.08] text-slate-300 hover:text-white transition-all"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
        </button>

        {/* Quick Mentor Button */}
        <button
          type="button"
          onClick={onToggleMentor}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-[#7C5CFF]/20 to-[#9B5DE5]/20 hover:from-[#7C5CFF]/30 hover:to-[#9B5DE5]/30 border border-[#7C5CFF]/40 text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-[#7C5CFF]/10"
        >
          <Sparkles size={14} className="text-[#00E5FF]" />
          <span className="hidden sm:inline">AI Mentor</span>
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#9B5DE5] flex items-center justify-center font-black text-white text-xs shadow-md shadow-[#7C5CFF]/20">
            {parsedData?.name?.[0]?.toUpperCase() || 'C'}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-white truncate max-w-[100px]">
              {parsedData?.name || 'Candidate'}
            </span>
            <span className="text-[10px] text-[#00D084] font-semibold flex items-center gap-1">
              <Circle size={6} className="fill-[#00D084]" /> Active Twin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
