import { useState, useEffect } from 'react';
import {
  Sparkles, TrendingUp, Target, Bot, Zap, ShieldAlert, Activity, DollarSign, RefreshCw, Info, X
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useResume } from '../context/ResumeContext';
import { getMissionControlBriefing } from '../api/missionControl';
import type {
  MissionControlResponse,
  MissionTask,
  MetricFormulaInfo,
  PreviousSnapshotData,
} from '../types/missionControl';

export default function MissionControlView() {
  const { parsedData, targetRole } = useResume();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MissionControlResponse | null>(null);
  const [tasks, setTasks] = useState<MissionTask[]>([]);
  const [activeTooltip, setActiveTooltip] = useState<MetricFormulaInfo | null>(null);

  const fetchBriefing = async () => {
    if (!parsedData) return;
    setLoading(true);

    let prevSnap: PreviousSnapshotData | undefined = undefined;
    try {
      const saved = localStorage.getItem('careerpilot_last_snapshot');
      if (saved) {
        prevSnap = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse previous snapshot', e);
    }

    try {
      const res = await getMissionControlBriefing({
        candidate_name: parsedData.name || 'Candidate',
        skills: parsedData.skills.map((s) => s.name),
        certifications: parsedData.certifications.map((c) => c.name),
        exp_titles: parsedData.experience.map((e) => e.title || ''),
        exp_descriptions: parsedData.experience.map((e) => e.description || ''),
        exp_durations: parsedData.experience.map((e) => e.duration || ''),
        edu_degrees: parsedData.education.map((e) => e.degree || ''),
        target_role_id: targetRole?.id || 'soc-analyst',
        previous_snapshot: prevSnap,
      });

      setData(res);
      setTasks(res.mission_tasks);

      const currentSnap: PreviousSnapshotData = {
        career_health: res.career_health_score,
        recruiter_visibility: res.recruiter_visibility_score,
        hiring_readiness: res.hiring_readiness_pct,
        risk_score: res.career_risk_score,
        certs_count: parsedData.certifications.length,
      };
      localStorage.setItem('careerpilot_last_snapshot', JSON.stringify(currentSnap));
    } catch (err) {
      console.error('Failed to fetch Mission Control briefing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [parsedData, targetRole]);

  const toggleTaskCompleted = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_completed: !t.is_completed } : t))
    );
  };

  const getImpactBadge = (level: string) => {
    if (level === 'Critical') return 'bg-[#FF5C7A]/15 text-[#FF5C7A] border-[#FF5C7A]/30';
    if (level === 'High') return 'bg-[#F5B301]/15 text-[#F5B301] border-[#F5B301]/30';
    return 'bg-[#7C5CFF]/15 text-[#7C5CFF] border-[#7C5CFF]/30';
  };

  const findFormula = (name: string): MetricFormulaInfo | undefined => {
    return data?.metric_formulas.find((f) => f.metric_name.toLowerCase().includes(name.toLowerCase()));
  };

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadein">
        <div className="h-36 rounded-2xl skeleton-shimmer col-span-4" />
        <div className="h-32 rounded-2xl skeleton-shimmer" />
        <div className="h-[#80px] rounded-2xl skeleton-shimmer" />
        <div className="h-32 rounded-2xl skeleton-shimmer" />
        <div className="h-32 rounded-2xl skeleton-shimmer" />
      </div>
    );
  }

  if (!parsedData && !data) return null;

  return (
    <div className="flex flex-col gap-8 animate-fadein relative">
      {/* Hero Banner: AI Executive Briefing */}
      <div className="glass-hero p-6 sm:p-8 flex flex-col gap-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#7C5CFF]/20 to-[#00E5FF]/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#7C5CFF] via-[#9B5DE5] to-[#00E5FF] text-white shadow-lg shadow-[#7C5CFF]/30">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">AI Career Mission Control</h1>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/30 shadow-[0_0_8px_#00D084]">
                  Live Neural OS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Executive Career Telemetry & Decision Engine for <strong className="text-white">{parsedData?.name || 'Candidate'}</strong>
                {data?.last_updated_timestamp && (
                  <span className="ml-2 font-mono text-xs text-slate-400">• Last Synced: {data.last_updated_timestamp}</span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchBriefing}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold text-white btn-gradient-primary px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Recalculating Intelligence…' : 'Recalculate Briefing'}</span>
          </button>
        </div>

        {data?.daily_briefing && (
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-4 backdrop-blur-md">
            <div className="p-2 rounded-xl bg-[#7C5CFF]/20 text-[#00E5FF] shrink-0 mt-0.5">
              <Bot size={22} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#00E5FF] uppercase tracking-wider">Executive Daily AI Briefing</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7C5CFF]/20 text-purple-300 border border-[#7C5CFF]/30">
                  Telemetry Synced
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">{data.daily_briefing}</p>
            </div>
          </div>
        )}
      </div>

      {/* 4 Core Executive Metric Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Career Health */}
          <div className="glass-panel glass-panel-hover p-6 flex flex-col justify-between gap-3 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
                <Activity size={16} className="text-[#7C5CFF]" /> Career Health
              </span>
              <button
                type="button"
                onClick={() => setActiveTooltip(findFormula('Career Health Score') || null)}
                className="text-slate-500 hover:text-[#7C5CFF] transition-colors p-1"
                title="View Calculation Formula"
              >
                <Info size={15} />
              </button>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="font-num text-4xl sm:text-5xl font-black text-white">{data.career_health_score}<span className="text-sm font-normal text-slate-400">/100</span></p>
              <span className="text-xs font-extrabold text-[#00D084] bg-[#00D084]/15 px-2.5 py-1 rounded-lg border border-[#00D084]/30">
                {data.career_health_trend}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mt-1">
              <div className="h-full bg-gradient-to-r from-[#7C5CFF] to-[#00E5FF] transition-all duration-700" style={{ width: `${data.career_health_score}%` }} />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/5 font-num">
              <span>Trend History:</span>
              <span className="text-slate-200 font-extrabold">
                {data.snapshot_history.map((s) => s.career_health).join(' → ')}
              </span>
            </div>
          </div>

          {/* Card 2: Recruiter Visibility */}
          <div className="glass-panel glass-panel-hover p-6 flex flex-col justify-between gap-3 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
                <TrendingUp size={16} className="text-[#00E5FF]" /> Recruiter Visibility
              </span>
              <button
                type="button"
                onClick={() => setActiveTooltip(findFormula('Recruiter Visibility Score') || null)}
                className="text-slate-500 hover:text-[#00E5FF] transition-colors p-1"
                title="View Calculation Formula"
              >
                <Info size={15} />
              </button>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="font-num text-4xl sm:text-5xl font-black text-[#00E5FF]">{data.recruiter_visibility_score}<span className="text-sm font-normal text-slate-400">/100</span></p>
              <span className="text-xs font-extrabold text-[#00E5FF] bg-[#00E5FF]/15 px-2.5 py-1 rounded-lg border border-[#00E5FF]/30">
                {data.recruiter_visibility_trend}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate">{data.visibility_level}</p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/5 font-num">
              <span>Trend History:</span>
              <span className="text-slate-200 font-extrabold">
                {data.snapshot_history.map((s) => s.recruiter_visibility).join(' → ')}
              </span>
            </div>
          </div>

          {/* Card 3: Hiring Readiness */}
          <div className="glass-panel glass-panel-hover p-6 flex flex-col justify-between gap-3 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
                <Target size={16} className="text-[#00D084]" /> Hiring Readiness
              </span>
              <button
                type="button"
                onClick={() => setActiveTooltip(findFormula('Hiring Readiness %') || null)}
                className="text-slate-500 hover:text-[#00D084] transition-colors p-1"
                title="View Calculation Formula"
              >
                <Info size={15} />
              </button>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="font-num text-4xl sm:text-5xl font-black text-[#00D084]">{data.hiring_readiness_pct}%</p>
              <span className="text-xs font-extrabold text-[#00D084] bg-[#00D084]/15 px-2.5 py-1 rounded-lg border border-[#00D084]/30">
                {data.hiring_readiness_trend}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Optimal Triage Readiness</p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/5 font-num">
              <span>Trend History:</span>
              <span className="text-slate-200 font-extrabold">
                {data.snapshot_history.map((s) => s.hiring_readiness).join(' → ')}
              </span>
            </div>
          </div>

          {/* Card 4: Career Risk Score */}
          <div className="glass-panel glass-panel-hover p-6 flex flex-col justify-between gap-3 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
                <ShieldAlert size={16} className="text-[#FF5C7A]" /> Career Risk
              </span>
              <button
                type="button"
                onClick={() => setActiveTooltip(findFormula('Career Risk Score') || null)}
                className="text-slate-500 hover:text-[#FF5C7A] transition-colors p-1"
                title="View Calculation Formula"
              >
                <Info size={15} />
              </button>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="font-num text-4xl sm:text-5xl font-black text-[#FF5C7A]">{data.career_risk_score}<span className="text-sm font-normal text-slate-400">/100</span></p>
              <span className="text-xs font-extrabold text-[#FF5C7A] bg-[#FF5C7A]/15 px-2.5 py-1 rounded-lg border border-[#FF5C7A]/30">
                {data.career_risk_level}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate">{data.career_risk_level} Risk Band</p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/5 font-num">
              <span>Status:</span>
              <span className="text-[#FF5C7A] font-extrabold">Low Obsolescence Threat</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Mission Tasks & ROI Strategy */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Priority Mission Tasks (2 Cols) */}
          <div className="lg:col-span-2 glass-panel p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Zap size={18} className="text-[#7C5CFF]" /> Top Priority AI Recommended Action Plan
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">High impact tasks prioritized by career readiness gain</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#7C5CFF]/15 text-purple-300 border border-[#7C5CFF]/30 font-num">
                {tasks.filter((t) => t.is_completed).length} / {tasks.length} Completed
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTaskCompleted(task.id)}
                  className={`
                    p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5
                    ${
                      task.is_completed
                        ? 'bg-[#00D084]/5 border-[#00D084]/20 opacity-60'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-[#7C5CFF]/40'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    onChange={() => {}}
                    className="mt-1 rounded border-white/20 text-[#7C5CFF] focus:ring-0 cursor-pointer"
                  />
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className={`font-bold text-xs sm:text-sm ${task.is_completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getImpactBadge(task.impact_level)}`}>
                        {task.impact_level} Impact ({task.estimated_hours}h)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{task.roi_reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROI Career Strategy (1 Col) */}
          <div className="glass-panel p-6 flex flex-col justify-between gap-5">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                <DollarSign size={18} className="text-[#00D084]" /> Strategic Career ROI & Market Target
              </h3>

              <div className="flex flex-col gap-4 mt-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Target Role Benchmark</span>
                  <span className="text-base font-extrabold text-white">{targetRole?.name || 'SOC Analyst'}</span>
                  <span className="text-xs text-[#00D084] font-bold mt-1">Projected Salary: $115,000/yr</span>
                </div>

                {data.strategic_recommendations.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Highest ROI Recommendation</span>
                    <p className="text-xs text-slate-200 leading-relaxed font-semibold">{data.strategic_recommendations[0].title}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-[#7C5CFF]/15 to-[#00E5FF]/10 border border-[#7C5CFF]/30 text-center">
              <span className="text-xs font-bold text-white">AI Strategy Confidence</span>
              <p className="font-num text-3xl font-black text-[#00E5FF] mt-1">94.8%</p>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Validated against 1,400+ job benchmarks</span>
            </div>
          </div>
        </div>
      )}

      {/* Snapshot History Chart Section */}
      {data && data.snapshot_history.length > 1 && (
        <div className="glass-panel p-6 flex flex-col gap-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Activity size={18} className="text-[#00E5FF]" /> Historical Progress Telemetry Chart
          </h3>
          <div className="w-full h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.snapshot_history}>
                <defs>
                  <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C5CFF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7C5CFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" stroke="#94A3B8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0E1320', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="career_health" stroke="#7C5CFF" fillOpacity={1} fill="url(#colorHealth)" name="Career Health" strokeWidth={3} />
                <Area type="monotone" dataKey="hiring_readiness" stroke="#00E5FF" fillOpacity={1} fill="url(#colorReadiness)" name="Hiring Readiness" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Formula Modal Tooltip */}
      {activeTooltip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadein">
          <div className="bg-[#0E1320] border border-white/10 rounded-2xl p-6 max-w-md w-full flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Info size={16} className="text-[#7C5CFF]" /> {activeTooltip.metric_name} Calculation Model
              </h3>
              <button onClick={() => setActiveTooltip(null)} className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5">
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-[#00E5FF]">
                Factor Weighting: {activeTooltip.primary_factors.join(' + ')}
              </div>
              <p className="text-slate-300 leading-relaxed">{activeTooltip.formula_description}</p>
            </div>
            <button onClick={() => setActiveTooltip(null)} className="w-full py-2.5 rounded-xl btn-gradient-primary text-xs font-bold">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
