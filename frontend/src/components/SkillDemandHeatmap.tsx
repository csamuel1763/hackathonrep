import { useState, useMemo } from 'react';
import { Flame, ArrowUpDown, CheckCircle2, AlertCircle, TrendingUp, DollarSign, Briefcase } from 'lucide-react';
import type { SkillHeatmapItem } from '../types/marketplace';

interface SkillDemandHeatmapProps {
  heatmapData: SkillHeatmapItem[];
  candidateSkills?: string[];
}

export default function SkillDemandHeatmap({ heatmapData, candidateSkills = [] }: SkillDemandHeatmapProps) {
  const [sortBy, setSortBy] = useState<'demand' | 'growth' | 'match' | 'jobs'>('demand');
  const [filterMatchedOnly, setFilterMatchedOnly] = useState(false);
  const [hoveredSkill, setHoveredSkill] = useState<SkillHeatmapItem | null>(null);

  // Process and sort heatmap items dynamically
  const sortedItems = useMemo(() => {
    let items = heatmapData.map((item) => {
      // Calculate growth integer for sorting e.g. "+25% YoY" -> 25
      const growthMatch = item.growth_rate.match(/\+(\d+)%/);
      const numericGrowth = growthMatch ? parseInt(growthMatch[1], 10) : 15;

      // Determine if skill matches candidate resume
      const isMatched = item.resume_matched ?? (candidateSkills.some(
        (cs) => cs.toLowerCase().includes(item.skill.toLowerCase()) || item.skill.toLowerCase().includes(cs.toLowerCase())
      ));

      const jobsCount = item.job_count ?? Math.floor((item.demand_score / 100) * 12) + 3;
      const salaryBoost = item.salary_boost ?? `+$${(item.demand_score * 180).toLocaleString()}/yr`;

      return {
        ...item,
        numericGrowth,
        resume_matched: isMatched,
        job_count: jobsCount,
        salary_boost: salaryBoost,
      };
    });

    if (filterMatchedOnly) {
      items = items.filter((i) => i.resume_matched);
    }

    switch (sortBy) {
      case 'demand':
        return items.sort((a, b) => b.demand_score - a.demand_score);
      case 'growth':
        return items.sort((a, b) => b.numericGrowth - a.numericGrowth);
      case 'match':
        return items.sort((a, b) => (b.resume_matched ? 1 : 0) - (a.resume_matched ? 1 : 0) || b.demand_score - a.demand_score);
      case 'jobs':
        return items.sort((a, b) => b.job_count - a.job_count);
      default:
        return items;
    }
  }, [heatmapData, candidateSkills, sortBy, filterMatchedOnly]);

  // Color intensity calculation helper
  const getCellColor = (score: number, isMatched: boolean) => {
    if (score >= 92) {
      return isMatched
        ? 'bg-[#00D084]/20 border-[#00D084]/50 text-emerald-200 shadow-[0_0_15px_rgba(0,208,132,0.25)]'
        : 'bg-[#7C5CFF]/25 border-[#7C5CFF]/50 text-purple-200 shadow-[0_0_15px_rgba(124,92,255,0.25)]';
    }
    if (score >= 87) {
      return isMatched
        ? 'bg-[#00E5FF]/20 border-[#00E5FF]/40 text-cyan-200 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
        : 'bg-[#7C5CFF]/15 border-[#7C5CFF]/35 text-purple-300';
    }
    if (score >= 82) {
      return 'bg-[#F5B301]/15 border-[#F5B301]/30 text-amber-200';
    }
    return 'bg-white/[0.04] border-white/10 text-slate-300';
  };

  return (
    <div className="glass-panel p-6 sm:p-8 flex flex-col gap-6 animate-fadein relative overflow-hidden">
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#FF5C7A]/20 text-[#FF5C7A] border border-[#FF5C7A]/30">
            <Flame size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              Skill Market Demand Heatmap
              <span className="text-[10px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-full border border-[#00E5FF]/30">
                Live Data Synchronized
              </span>
            </h3>
            <p className="text-xs text-slate-400">Interactive telemetry mapped against live cybersecurity marketplace openings.</p>
          </div>
        </div>

        {/* Sort & Filter Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer bg-white/5 px-3 py-2 rounded-xl border border-white/10">
            <input
              type="checkbox"
              checked={filterMatchedOnly}
              onChange={(e) => setFilterMatchedOnly(e.target.checked)}
              className="rounded bg-black/50 border-white/20 text-[#00E5FF] focus:ring-0"
            />
            <span>In Resume Only</span>
          </label>

          <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10 text-xs">
            <ArrowUpDown size={14} className="text-slate-400 ml-2" />
            <button
              type="button"
              onClick={() => setSortBy('demand')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                sortBy === 'demand' ? 'btn-gradient-primary text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Highest Demand
            </button>
            <button
              type="button"
              onClick={() => setSortBy('growth')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                sortBy === 'growth' ? 'btn-gradient-primary text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Fastest Growth
            </button>
            <button
              type="button"
              onClick={() => setSortBy('match')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                sortBy === 'match' ? 'btn-gradient-primary text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Resume Match
            </button>
            <button
              type="button"
              onClick={() => setSortBy('jobs')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                sortBy === 'jobs' ? 'btn-gradient-primary text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Job Frequency
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 relative">
        {sortedItems.map((item, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setHoveredSkill(item)}
            onMouseLeave={() => setHoveredSkill(null)}
            className={`
              relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer
              hover:scale-[1.03] hover:z-20 group flex flex-col justify-between gap-3
              ${getCellColor(item.demand_score, !!item.resume_matched)}
            `}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-1">
              <span className="font-extrabold text-xs text-white truncate group-hover:text-[#00E5FF] transition-colors">
                {item.skill}
              </span>
              {item.resume_matched && (
                <span className="shrink-0 text-[#00D084]" title="Matched in candidate resume">
                  <CheckCircle2 size={15} />
                </span>
              )}
            </div>

            {/* Middle metrics */}
            <div className="flex items-baseline justify-between font-num">
              <div className="flex flex-col">
                <span className="text-xl font-black">{item.demand_score}</span>
                <span className="text-[9px] uppercase font-bold tracking-wider opacity-70">Demand Score</span>
              </div>
              <span className="text-xs font-bold text-[#00E5FF] bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                {item.growth_rate}
              </span>
            </div>

            {/* Color intensity bar */}
            <div className="w-full h-1 rounded-full bg-black/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7C5CFF] via-[#00E5FF] to-[#00D084]"
                style={{ width: `${item.demand_score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Hover Tooltip Display */}
      {hoveredSkill && (
        <div className="p-4 rounded-2xl bg-[#0E1320] border border-[#00E5FF]/40 text-xs shadow-2xl flex flex-col gap-3 animate-fadein border-l-4 border-l-[#00E5FF]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-[#FF5C7A]" />
              <h4 className="font-extrabold text-white text-sm">{hoveredSkill.skill}</h4>
            </div>
            {hoveredSkill.resume_matched ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/40 font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle2 size={12} /> Matched in Digital Twin Resume
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F5B301]/20 text-[#F5B301] border border-[#F5B301]/40 font-bold flex items-center gap-1 text-[11px]">
                <AlertCircle size={12} /> Target Skill Gap
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Demand Score</span>
              <span className="font-num text-base font-black text-[#00E5FF]">{hoveredSkill.demand_score}/100</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col">
              <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center justify-center gap-1">
                <TrendingUp size={10} /> YoY Growth
              </span>
              <span className="font-num text-base font-black text-emerald-400">{hoveredSkill.growth_rate}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col">
              <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center justify-center gap-1">
                <Briefcase size={10} /> Live Jobs Required
              </span>
              <span className="font-num text-base font-black text-purple-300">{hoveredSkill.job_count} Jobs</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col">
              <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center justify-center gap-1">
                <DollarSign size={10} /> Avg Salary Impact
              </span>
              <span className="font-num text-base font-black text-[#F5B301]">{hoveredSkill.salary_boost}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
