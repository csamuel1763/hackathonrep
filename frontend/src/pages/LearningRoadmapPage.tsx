import { useState, useEffect } from 'react';
import { BookOpen, Sparkles, TrendingUp, Award, Clock, CheckCircle } from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import type { LearningRoadmapResponse, ResumeImprovementResponse } from '../types/resume';
import { getLearningRoadmap, getResumeImprovements } from '../api/resume';

type LearningTab = 'roadmap' | 'enhancements' | 'certs_projects';

export default function LearningRoadmapPage() {
  const { parsedData, targetRole } = useResume();
  const [activeTab, setActiveTab] = useState<LearningTab>('roadmap');

  if (!parsedData) return null;

  const { name, email, phone, summary, skills, experience, education, certifications } = parsedData;

  const [roadmap, setRoadmap] = useState<LearningRoadmapResponse | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  const [improvements, setImprovements] = useState<ResumeImprovementResponse | null>(null);
  const [impLoading, setImpLoading] = useState(false);
  const [impError, setImpError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetRole) return;

    const skillNames = skills.map((s) => s.name);
    const expTitles = experience.map((j) => j.title || '');
    const expDescs = experience.map((j) => j.description || '');
    const expDurs = experience.map((j) => j.duration || '');
    const eduDegrees = education.map((e) => e.degree || '');
    const certNames = certifications.map((c) => c.name || '');

    setRoadmapLoading(true);
    getLearningRoadmap(targetRole.id, skillNames)
      .then((res) => setRoadmap(res))
      .catch(() => setRoadmapError('Failed to calculate learning roadmap.'))
      .finally(() => setRoadmapLoading(false));

    setImpLoading(true);
    getResumeImprovements(
      targetRole.id,
      skillNames,
      name || '',
      email || '',
      phone || '',
      summary || '',
      expTitles,
      expDescs,
      expDurs,
      eduDegrees,
      certNames,
    )
      .then((res) => setImprovements(res))
      .catch(() => setImpError('Failed to load resume improvements.'))
      .finally(() => setImpLoading(false));
  }, [targetRole, skills, experience, education, certifications, name, email, phone, summary]);

  const difficultyBadge = (difficulty: string) => {
    const d = difficulty.toLowerCase();
    if (d === 'easy') return 'bg-[#00D084]/15 text-[#00D084] border-[#00D084]/30';
    if (d === 'medium') return 'bg-[#F5B301]/15 text-[#F5B301] border-[#F5B301]/30';
    return 'bg-[#FF5C7A]/15 text-[#FF5C7A] border-[#FF5C7A]/30';
  };

  return (
    <div className="flex flex-col gap-8 animate-fadein">
      {/* Top Banner Header */}
      <div className="glass-hero p-6 sm:p-8 flex items-center justify-between flex-wrap gap-4 shadow-2xl relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#7C5CFF]/15 text-purple-300 border border-[#7C5CFF]/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(124,92,255,0.2)]">
              <Sparkles size={13} className="text-[#00E5FF]" /> AI Development Matrix
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            Learning & Skill Development Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Structured week-by-week learning roadmap, recommended role certifications, and priority resume enhancements.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto border-b border-white/10 pb-3">
        {[
          { id: 'roadmap', label: 'Learning Roadmap Timeline', icon: <BookOpen size={15} /> },
          { id: 'enhancements', label: 'AI Resume & Skill Enhancements', icon: <Sparkles size={15} /> },
          { id: 'certs_projects', label: 'Certifications & Projects', icon: <Award size={15} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as LearningTab)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'btn-gradient-primary shadow-lg shadow-[#7C5CFF]/20'
                : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Personalized Learning Roadmap */}
      {activeTab === 'roadmap' && targetRole && (
        <div className="flex flex-col gap-6 animate-fadein">
          <div className="glass-panel p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2 text-[#7C5CFF]">
                <BookOpen size={20} />
                <span className="font-extrabold text-white text-base">Personalized Learning Roadmap — {targetRole.name}</span>
              </div>
              {roadmap && (
                <span className="px-3.5 py-1 rounded-full text-xs font-black bg-[#7C5CFF]/15 text-purple-300 border border-[#7C5CFF]/30 font-num">
                  {roadmap.estimated_duration_weeks} Weeks • {roadmap.total_steps} Topics
                </span>
              )}
            </div>

            {roadmapLoading ? (
              <div className="flex flex-col gap-4">
                <div className="h-20 rounded-xl skeleton-shimmer" />
                <div className="h-20 rounded-xl skeleton-shimmer" />
              </div>
            ) : roadmapError ? (
              <p className="text-xs text-[#FF5C7A]">{roadmapError}</p>
            ) : roadmap ? (
              <div className="flex flex-col gap-6">
                {roadmap.roadmap.map((step) => (
                  <div key={step.week} className="relative pl-6 border-l-2 border-[#7C5CFF]">
                    <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-[#7C5CFF] shadow-[0_0_10px_#7C5CFF]" />

                    <div className="flex flex-col gap-2 p-5 rounded-2xl bg-black/40 border border-white/10">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-white text-sm">Week {step.week}</h4>
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                          {step.topics.length} Modules
                        </span>
                      </div>
                      <ul className="flex flex-col gap-2 pt-2">
                        {step.topics.map((topic, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-[#7C5CFF] font-bold">•</span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 2: AI Resume & Skill Enhancements */}
      {activeTab === 'enhancements' && targetRole && (
        <div className="flex flex-col gap-6 animate-fadein">
          <div className="glass-panel p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#9B5DE5] text-white shadow-md">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">AI Resume Improvement Suggestions</h3>
                  <p className="text-xs text-slate-400">Actionable recommendations to boost your career readiness score</p>
                </div>
              </div>

              {improvements && (
                <div className="px-4 py-1.5 rounded-full bg-[#00D084]/15 border border-[#00D084]/30 text-[#00D084] text-xs font-black flex items-center gap-1.5 font-num">
                  <TrendingUp size={15} />
                  <span>Potential Gain: +{improvements.estimated_score_gain} Points</span>
                </div>
              )}
            </div>

            {impLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-32 rounded-xl skeleton-shimmer" />
                <div className="h-32 rounded-xl skeleton-shimmer" />
              </div>
            ) : impError ? (
              <p className="text-xs text-[#FF5C7A]">{impError}</p>
            ) : improvements ? (
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Priority Actions</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {improvements.priority.map((item, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-extrabold text-white text-sm">{item.title}</h4>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${difficultyBadge(item.difficulty)}`}>
                              {item.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{item.reason}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock size={13} className="text-[#7C5CFF]" /> {item.duration}
                          </span>
                          <span className="font-bold text-[#00E5FF]">Impact Score: {item.impact}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {improvements.resume_improvements.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Recommended Resume Edits</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {improvements.resume_improvements.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5">
                          <CheckCircle size={15} className="text-[#00D084] shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 3: Certifications & Projects */}
      {activeTab === 'certs_projects' && targetRole && (
        <div className="flex flex-col gap-6 animate-fadein">
          <div className="glass-panel p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#F5B301] border-b border-white/10 pb-4">
              <Award size={20} />
              <span className="font-extrabold text-white text-base">Recommended Role Certifications & Lab Projects</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Industry recognized credentials and practical hands-on projects for <strong className="text-white">{targetRole.name}</strong>:
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {targetRole.prerequisites.map((pre, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F5B301]/15 text-[#F5B301] border border-[#F5B301]/30 text-xs font-bold shadow-[0_0_10px_rgba(245,179,1,0.15)]"
                >
                  <Award size={15} />
                  <span>{pre}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
