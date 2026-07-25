import { useState, useEffect } from 'react';
import {
  Bot, Sparkles, X, Bell, Zap, Sliders, Calendar, FileText, CheckCircle2,
  RefreshCw, AlertTriangle, Info
} from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { getCopilotState, runWhatIfSimulation } from '../api/copilot';
import type {
  CopilotStateResponse,
  CopilotMission,
  WhatIfSimulationResponse,
} from '../types/copilot';

type DrawerTab = 'notifications' | 'whatif' | 'roadmap' | 'report';

export default function CareerCopilotDrawer() {
  const { parsedData, targetRole } = useResume();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DrawerTab>('notifications');
  const [copilotData, setCopilotData] = useState<CopilotStateResponse | null>(null);
  const [missions, setMissions] = useState<CopilotMission[]>([]);

  // What-If State
  const [whatIfInput, setWhatIfInput] = useState('CompTIA Security+');
  const [whatIfType, setWhatIfType] = useState<'earn_cert' | 'learn_skill' | 'build_projects'>('earn_cert');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<WhatIfSimulationResponse | null>(null);

  const fetchState = async () => {
    if (!parsedData) return;
    try {
      const res = await getCopilotState({
        candidate_name: parsedData.name || 'Candidate',
        skills: parsedData.skills.map((s) => s.name),
        certifications: parsedData.certifications.map((c) => c.name),
        exp_titles: parsedData.experience.map((e) => e.title || ''),
        target_role_id: targetRole?.id || 'soc-analyst',
      });
      setCopilotData(res);
      setMissions(res.daily_top_missions);
    } catch (err) {
      console.error('Failed to fetch copilot state:', err);
    }
  };

  useEffect(() => {
    fetchState();
  }, [parsedData, targetRole]);

  const handleSimulate = async () => {
    setSimLoading(true);
    try {
      const res = await runWhatIfSimulation({
        action_type: whatIfType,
        action_value: whatIfInput,
        current_health: 78,
        current_readiness: 75,
        current_salary: 95000,
        current_recruiter_vis: 72,
      });
      setSimResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimLoading(false);
    }
  };

  const toggleMission = (mId: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === mId ? { ...m, is_completed: !m.is_completed } : m))
    );
  };

  if (!parsedData) return null;

  const notifCount = copilotData?.notifications.length || 0;

  return (
    <>
      {/* Floating Copilot Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-bold text-xs shadow-2xl shadow-indigo-500/50 border border-indigo-400/30 hover:scale-105 transition-all cursor-pointer group"
      >
        <div className="relative">
          <Bot size={20} className="group-hover:rotate-12 transition-transform" />
          {notifCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
              {notifCount}
            </span>
          )}
        </div>
        <span className="hidden sm:inline">AI Career Copilot</span>
      </button>

      {/* Slide-over Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadein">
          <div className="w-full sm:w-[480px] bg-[#090d16] border-l border-indigo-500/20 h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 bg-gradient-to-br from-indigo-900/30 to-black flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">Autonomous Career Copilot</h2>
                  <p className="text-[11px] text-slate-400">Proactive Telemetry & Decision Agent</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center justify-around border-b border-white/10 bg-black/40 px-2 py-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'notifications' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bell size={13} />
                <span>Missions ({missions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('whatif');
                  if (!simResult) handleSimulate();
                }}
                className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'whatif' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders size={13} />
                <span>What-If</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('roadmap')}
                className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'roadmap' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar size={13} />
                <span>Roadmap</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('report')}
                className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'report' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText size={13} />
                <span>Report</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 text-xs">
              {/* TAB 1: Smart Notifications & Daily Missions */}
              {activeTab === 'notifications' && (
                <div className="flex flex-col gap-5 animate-fadein">
                  {/* Smart Alerts */}
                  <div className="flex flex-col gap-2.5">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Bell size={12} className="text-indigo-400" /> Smart Telemetry Notifications
                    </span>
                    {copilotData?.notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                          notif.category === 'warning'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                            : notif.category === 'opportunity'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200'
                        }`}
                      >
                        {notif.category === 'warning' ? (
                          <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-400" />
                        ) : notif.category === 'opportunity' ? (
                          <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-400" />
                        ) : (
                          <Info size={15} className="shrink-0 mt-0.5 text-indigo-400" />
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-white text-xs">{notif.title}</span>
                          <p className="text-[11px] text-slate-300 leading-normal">{notif.message}</p>
                          <span className="text-[10px] text-slate-500 font-mono mt-1">{notif.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Daily Top 5 ROI Missions */}
                  <div className="flex flex-col gap-2.5 border-t border-white/10 pt-4">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center justify-between">
                      <span className="flex items-center gap-1"><Zap size={12} className="text-amber-400" /> Today's Top 5 ROI Missions</span>
                      <span className="text-indigo-400 font-mono">Ranked by ROI</span>
                    </span>

                    {missions.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => toggleMission(m.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                          m.is_completed
                            ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60'
                            : 'bg-black/40 border-white/10 hover:border-indigo-500/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={m.is_completed}
                              onChange={() => {}}
                              className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                            />
                            <span className={`font-bold ${m.is_completed ? 'line-through text-slate-400' : 'text-white'}`}>
                              {m.title}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 shrink-0">
                            ROI: {m.roi_score}%
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 pl-6">{m.why_reason}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pl-6 pt-1">
                          <span>Impact: <b className="text-slate-300">{m.expected_impact}</b></span>
                          <span>Est: <b className="text-slate-300">{m.est_time_hours}h</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: What-If Career Simulator */}
              {activeTab === 'whatif' && (
                <div className="flex flex-col gap-5 animate-fadein">
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col gap-2">
                    <span className="font-bold text-indigo-300 flex items-center gap-1">
                      <Sliders size={14} /> What-If Career Decision Simulator
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Simulate how adding skills, certifications, or projects impacts your salary, hiring readiness, and job match score.
                    </p>
                  </div>

                  {/* Simulator Controls */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-400 font-semibold">Select Action Type:</label>
                      <select
                        value={whatIfType}
                        onChange={(e) => setWhatIfType(e.target.value as any)}
                        className="rounded-lg bg-black/50 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="earn_cert">Earn Certification</option>
                        <option value="learn_skill">Learn Technical Skill / Tool</option>
                        <option value="build_projects">Build & Deploy Lab Projects</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-400 font-semibold">Target Action / Credential Name:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={whatIfInput}
                          onChange={(e) => setWhatIfInput(e.target.value)}
                          placeholder="e.g., Kubernetes, CompTIA Security+, Azure Security"
                          className="flex-1 rounded-lg bg-black/50 border border-white/10 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleSimulate}
                          disabled={simLoading}
                          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-1.5"
                        >
                          <RefreshCw size={13} className={simLoading ? 'animate-spin' : ''} />
                          <span>Simulate</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Simulation Results Display */}
                  {simResult && (
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-4 animate-fadein">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="font-bold text-white text-xs">Simulated Impact: {simResult.action_value}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">+{simResult.projected_match_increase_pct}% Job Match</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                          <p className="text-base font-black text-emerald-400">+{simResult.readiness_delta}%</p>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">Readiness Boost</p>
                          <p className="text-[10px] text-slate-300 mt-0.5">Now: {simResult.projected_readiness}%</p>
                        </div>

                        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-center">
                          <p className="text-base font-black text-indigo-400">+${simResult.salary_delta.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">Salary Increase</p>
                          <p className="text-[10px] text-slate-300 mt-0.5">Proj: ${simResult.projected_salary.toLocaleString()}/yr</p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                        {simResult.forecast_summary}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: One-Click 30/60/90-Day Execution Roadmap */}
              {activeTab === 'roadmap' && copilotData?.roadmap_30_60_90 && (
                <div className="flex flex-col gap-4 animate-fadein">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs">
                    <p>{copilotData.roadmap_30_60_90.summary}</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col gap-2">
                      <span className="font-bold text-indigo-300 flex items-center justify-between">
                        <span>Month 1 (Days 1–30): Foundation</span>
                        <span className="text-[10px] font-mono bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-200">Phase 1</span>
                      </span>
                      <ul className="list-disc pl-4 text-slate-300 space-y-1">
                        {copilotData.roadmap_30_60_90.phase_30_day.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col gap-2">
                      <span className="font-bold text-purple-300 flex items-center justify-between">
                        <span>Month 2 (Days 31–60): Execution & Portfolio</span>
                        <span className="text-[10px] font-mono bg-purple-500/20 px-2 py-0.5 rounded text-purple-200">Phase 2</span>
                      </span>
                      <ul className="list-disc pl-4 text-slate-300 space-y-1">
                        {copilotData.roadmap_30_60_90.phase_60_day.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-2">
                      <span className="font-bold text-emerald-300 flex items-center justify-between">
                        <span>Month 3 (Days 61–90): Offer Acquisition</span>
                        <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-200">Phase 3</span>
                      </span>
                      <ul className="list-disc pl-4 text-slate-300 space-y-1">
                        {copilotData.roadmap_30_60_90.phase_90_day.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Automated Executive Weekly Report */}
              {activeTab === 'report' && copilotData?.weekly_report && (
                <div className="flex flex-col gap-4 animate-fadein">
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300">Executive Weekly Progress Report</span>
                      <span className="text-[10px] font-mono text-slate-400">{copilotData.weekly_report.report_date}</span>
                    </div>
                    <p className="text-slate-200 text-xs leading-relaxed">{copilotData.weekly_report.executive_summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Interview Rating</span>
                      <p className="text-lg font-black text-emerald-400">{copilotData.weekly_report.interview_performance_score}/100</p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Mission Completion</span>
                      <p className="text-lg font-black text-indigo-400">{copilotData.weekly_report.mission_completion_rate}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex flex-col gap-2">
                    <span className="font-bold text-slate-300">Telemetry Growth Breakdown:</span>
                    <ul className="list-disc pl-4 text-slate-400 space-y-1">
                      <li><b>Skills:</b> {copilotData.weekly_report.skill_growth_summary}</li>
                      <li><b>Portfolio:</b> {copilotData.weekly_report.portfolio_health_summary}</li>
                      <li><b>Salary:</b> {copilotData.weekly_report.salary_projection_change}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
