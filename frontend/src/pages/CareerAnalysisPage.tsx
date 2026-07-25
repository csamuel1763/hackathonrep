import { useState, useEffect } from 'react';
import { Target, Layers, Award, CheckCircle, Flame, FileText, Zap, Briefcase, Sparkles } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { useResume } from '../context/ResumeContext';
import type { SkillGapResponse, ReadinessScoreResponse, RadarChartResponse, CareerMatchRole, ParsedSkill } from '../types/resume';
import type { CybersecurityRole } from '../types/role';
import { getSkillGapAnalysis, getCareerReadinessScore, getRadarChartData, getCareerMatches } from '../api/resume';
import { fetchRoles } from '../api/role';
import JobDescriptionMatcher from '../components/JobDescriptionMatcher';

type AnalysisTab = 'matcher' | 'gap' | 'compatibility' | 'parsed_resume';

const CATEGORY_COLORS: Record<string, string> = {
  'Network Security': 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  'SIEM & Log Analysis': 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  'Threat Intelligence': 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  'Incident Response': 'bg-red-500/15 text-red-300 border-red-500/25',
  'Penetration Testing': 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  'Vulnerability Management': 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  'Cloud Security': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  'Identity & Access Management': 'bg-teal-500/15 text-teal-300 border-teal-500/25',
  'Cryptography': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  'Compliance & GRC': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  'Malware Analysis': 'bg-red-600/15 text-red-300 border-red-600/25',
  'Digital Forensics': 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  'Operating Systems': 'bg-slate-500/15 text-slate-300 border-slate-500/25',
  'Programming Languages': 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  'Scripting & Automation': 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  'Other': 'bg-white/5 text-slate-400 border-white/10',
};

function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Other'];
}

function groupSkills(skills: ParsedSkill[]): Record<string, ParsedSkill[]> {
  return skills.reduce<Record<string, ParsedSkill[]>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {});
}

export default function CareerAnalysisPage() {
  const { parsedData, targetRole, setTargetRole } = useResume();
  const [activeTab, setActiveTab] = useState<AnalysisTab>('matcher');

  if (!parsedData) return null;

  const { skills, experience, education, certifications } = parsedData;
  const groupedSkills = groupSkills(skills);

  const [gapAnalysis, setGapAnalysis] = useState<SkillGapResponse | null>(null);
  const [gapLoading, setGapLoading] = useState(false);
  const [gapError, setGapError] = useState<string | null>(null);

  const [readiness, setReadiness] = useState<ReadinessScoreResponse | null>(null);
  const [readinessLoading, setReadinessLoading] = useState(false);
  const [readinessError, setReadinessError] = useState<string | null>(null);

  const [radar, setRadar] = useState<RadarChartResponse | null>(null);
  const [careerMatches, setCareerMatches] = useState<CareerMatchRole[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  const [allTaxonomyRoles, setAllTaxonomyRoles] = useState<CybersecurityRole[]>([]);
  const [sortBy, setSortBy] = useState<'highest' | 'alpha'>('highest');
  const [filterThreshold, setFilterThreshold] = useState<number>(0);

  useEffect(() => {
    fetchRoles()
      .then((res: CybersecurityRole[]) => setAllTaxonomyRoles(res))
      .catch((err: any) => console.error('Failed to load taxonomy roles', err));
  }, []);

  useEffect(() => {
    setMatchesLoading(true);

    const skillNames = skills.map((s) => s.name);
    const expTitles = experience.map((j) => j.title || '');
    const expDescs = experience.map((j) => j.description || '');
    const expDurs = experience.map((j) => j.duration || '');
    const eduDegrees = education.map((e) => e.degree || '');
    const certNames = certifications.map((c) => c.name || '');

    getCareerMatches(skillNames, expTitles, expDescs, expDurs, eduDegrees, certNames)
      .then((res) => setCareerMatches(res))
      .catch((err) => console.error('Failed to load career matches', err))
      .finally(() => setMatchesLoading(false));
  }, [skills, experience, education, certifications]);

  useEffect(() => {
    if (!targetRole) return;

    const skillNames = skills.map((s) => s.name);
    const expTitles = experience.map((j) => j.title || '');
    const expDescs = experience.map((j) => j.description || '');
    const expDurs = experience.map((j) => j.duration || '');
    const eduDegrees = education.map((e) => e.degree || '');
    const certNames = certifications.map((c) => c.name || '');

    setGapLoading(true);
    getSkillGapAnalysis(targetRole.id, skillNames)
      .then((res) => setGapAnalysis(res))
      .catch(() => setGapError('Failed to calculate skill gap analysis.'))
      .finally(() => setGapLoading(false));

    setReadinessLoading(true);
    getCareerReadinessScore(targetRole.id, skillNames, expTitles, expDescs, expDurs, eduDegrees, certNames)
      .then((res) => setReadiness(res))
      .catch(() => setReadinessError('Failed to calculate career readiness score.'))
      .finally(() => setReadinessLoading(false));

    getRadarChartData(targetRole.id, skillNames)
      .then((res) => setRadar(res))
      .catch((err) => console.error('Failed to calculate radar data', err));
  }, [targetRole, skills, experience, education, certifications]);

  const handleSelectRoleFromMatches = (roleId: string) => {
    const found = allTaxonomyRoles.find((r) => r.id === roleId);
    if (found) {
      setTargetRole(found);
    }
  };

  const filteredMatches = careerMatches
    .filter((m) => m.score >= filterThreshold)
    .sort((a, b) => (sortBy === 'highest' ? b.score - a.score : a.name.localeCompare(b.name)));

  const highestScore = Math.max(...careerMatches.map((m) => m.score), 0);

  return (
    <div className="flex flex-col gap-8 animate-fadein">
      {/* Top Banner Header */}
      <div className="glass-hero p-6 sm:p-8 flex items-center justify-between flex-wrap gap-4 shadow-2xl relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#7C5CFF]/15 text-purple-300 border border-[#7C5CFF]/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(124,92,255,0.2)]">
              <Sparkles size={13} className="text-[#00E5FF]" /> Neural Analysis Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            Career Analysis Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Unified intelligence workspace combining Job Description Matcher, ATS Score, Skill Gap Analysis, and Suitability Rankings.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto border-b border-white/10 pb-3">
        {[
          { id: 'matcher', label: 'Job Description & ATS Match', icon: <FileText size={15} /> },
          { id: 'gap', label: 'Skill Gap & Readiness', icon: <Layers size={15} /> },
          { id: 'compatibility', label: 'Role Compatibility & Rankings', icon: <Flame size={15} /> },
          { id: 'parsed_resume', label: 'Extracted Resume Data', icon: <Zap size={15} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as AnalysisTab)}
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

      {/* TAB 1: Job Description Matcher & ATS */}
      {activeTab === 'matcher' && (
        <div className="animate-fadein">
          <JobDescriptionMatcher />
        </div>
      )}

      {/* TAB 2: Skill Gap & Readiness Score & Radar */}
      {activeTab === 'gap' && targetRole && (
        <div className="flex flex-col gap-6 animate-fadein">
          {/* Target Role Overview */}
          <div className="glass-panel p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#00E5FF]">
              <Target size={16} />
              <span className="text-xs font-extrabold uppercase tracking-wider">Active Target Role Benchmark</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">{targetRole.name}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{targetRole.description}</p>
          </div>

          {/* Readiness Score */}
          <div className="glass-panel p-6 sm:p-8 flex flex-col gap-5">
            <div className="flex items-center gap-2 text-[#7C5CFF]">
              <Award size={18} />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Career Readiness Assessment</span>
            </div>

            {readinessLoading ? (
              <div className="h-32 rounded-xl skeleton-shimmer" />
            ) : readinessError ? (
              <p className="text-xs text-[#FF5C7A]">{readinessError}</p>
            ) : readiness ? (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="54" stroke="rgba(255, 255, 255, 0.05)" fill="none" strokeWidth="10" />
                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        stroke="#7C5CFF"
                        fill="none"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 54}
                        strokeDashoffset={2 * Math.PI * 54 - (readiness.overall_score / 100) * (2 * Math.PI * 54)}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center font-num">
                      <span className="text-4xl font-black text-white">{readiness.overall_score}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Score</span>
                    </div>
                  </div>

                  <span className="px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider border bg-[#00D084]/15 text-[#00D084] border-[#00D084]/30">
                    {readiness.readiness_level}
                  </span>
                </div>

                <div className="flex-1 w-full grid grid-cols-2 gap-4">
                  {[
                    { label: 'Skills Matching (50%)', score: readiness.skills_score },
                    { label: 'Work Experience (25%)', score: readiness.experience_score },
                    { label: 'Education Relevance (15%)', score: readiness.education_score },
                    { label: 'Certifications Obtained (10%)', score: readiness.certification_score },
                  ].map((comp, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between">
                      <span className="text-xs text-slate-400 font-bold">{comp.label}</span>
                      <div className="flex items-baseline gap-2 mt-2 font-num">
                        <span className="text-2xl font-black text-white">{comp.score}</span>
                        <span className="text-xs text-slate-500">/ 100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Skill Gap Analysis */}
          <div className="glass-panel p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-[#00E5FF]">
              <Layers size={18} />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Skill Gap Breakdown</span>
            </div>

            {gapLoading ? (
              <div className="h-32 rounded-xl skeleton-shimmer" />
            ) : gapError ? (
              <p className="text-xs text-[#FF5C7A]">{gapError}</p>
            ) : gapAnalysis ? (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="glass-panel p-4 text-center">
                    <p className="font-num text-3xl font-black text-[#7C5CFF]">{gapAnalysis.coverage_percentage}%</p>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">Coverage</p>
                  </div>
                  <div className="glass-panel p-4 text-center">
                    <p className="font-num text-3xl font-black text-[#F5B301]">{100 - gapAnalysis.coverage_percentage}%</p>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">Gap</p>
                  </div>
                  <div className="glass-panel p-4 text-center">
                    <p className="font-num text-3xl font-black text-[#00D084]">{gapAnalysis.matched_count}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">Matched</p>
                  </div>
                  <div className="glass-panel p-4 text-center">
                    <p className="font-num text-3xl font-black text-[#FF5C7A]">{gapAnalysis.missing_count}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">Missing</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-xs font-extrabold text-[#00D084] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <CheckCircle size={15} /> Matched Skills ({gapAnalysis.matched_count})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {gapAnalysis.matched_skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg text-xs font-bold bg-[#00D084]/15 text-[#00D084] border border-[#00D084]/30">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-extrabold text-[#FF5C7A] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      ✖ Missing Skills ({gapAnalysis.missing_count})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {gapAnalysis.missing_skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg text-xs font-bold bg-[#FF5C7A]/15 text-[#FF5C7A] border border-[#FF5C7A]/30">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Skill Radar Chart */}
          <div className="glass-panel p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#7C5CFF]">
              <Target size={18} />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Skill Radar Visualization</span>
            </div>

            {radar ? (
              <div className="w-full flex justify-center">
                <ResponsiveContainer width="100%" height={380}>
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="75%"
                    data={radar.labels.map((label, i) => ({
                      subject: label,
                      candidate: radar.candidate[i],
                      required: radar.required[i],
                    }))}
                  >
                    <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} />
                    <Radar name="Candidate Skills" dataKey="candidate" stroke="#7C5CFF" fill="#7C5CFF" fillOpacity={0.4} strokeWidth={2} />
                    <Radar name="Role Requirement" dataKey="required" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.15} strokeWidth={2} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0E1320', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#F8FAFC', fontSize: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 3: Role Compatibility & Rankings */}
      {activeTab === 'compatibility' && (
        <div className="flex flex-col gap-6 animate-fadein">
          <div className="glass-panel p-6 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-[#FF5C7A]">
                <Flame size={20} />
                <span className="font-extrabold text-white text-base">Career Match Rankings</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'highest' | 'alpha')}
                    className="bg-[#0E1320] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#7C5CFF]"
                  >
                    <option value="highest">Highest Match</option>
                    <option value="alpha">Alphabetical</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Min Score:</span>
                  <select
                    value={filterThreshold}
                    onChange={(e) => setFilterThreshold(Number(e.target.value))}
                    className="bg-[#0E1320] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#7C5CFF]"
                  >
                    <option value={0}>All Scores</option>
                    <option value={30}>30% +</option>
                    <option value={50}>50% +</option>
                    <option value={70}>70% +</option>
                  </select>
                </div>
              </div>
            </div>

            {matchesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-40 rounded-2xl skeleton-shimmer" />
                <div className="h-40 rounded-2xl skeleton-shimmer" />
                <div className="h-40 rounded-2xl skeleton-shimmer" />
              </div>
            ) : filteredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((role) => {
                  const isTopMatch = role.score === highestScore && highestScore > 0;
                  const isSelected = targetRole?.id === role.id;

                  return (
                    <div
                      key={role.id}
                      onClick={() => handleSelectRoleFromMatches(role.id)}
                      className={`
                        relative p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between glass-panel-hover
                        ${
                          isSelected
                            ? 'bg-[#7C5CFF]/15 border-[#7C5CFF] shadow-lg shadow-[#7C5CFF]/20 ring-1 ring-[#7C5CFF]'
                            : 'glass-panel'
                        }
                      `}
                    >
                      {isTopMatch && (
                        <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#F5B301]/20 text-[#F5B301] border border-[#F5B301]/30">
                          ★ Top Match
                        </span>
                      )}

                      <div>
                        <h4 className="font-extrabold text-white text-base pr-16">{role.name}</h4>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{role.description}</p>

                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-slate-400 font-bold">Match Suitability</span>
                            <span className="font-num font-black text-[#7C5CFF]">{role.score}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#7C5CFF] to-[#00E5FF] rounded-full transition-all duration-500"
                              style={{ width: `${role.score}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5 text-xs font-bold">
                        <span className="text-[#00D084]">{role.matched_skills} Matched</span>
                        <span className="text-[#FF5C7A]">{role.missing_skills} Missing</span>
                        <span className="text-slate-400">{role.required_skills} Total</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 4: Extracted Resume Data */}
      {activeTab === 'parsed_resume' && (
        <div className="flex flex-col gap-6 animate-fadein">
          {skills.length > 0 && (
            <div className="glass-panel p-6 flex flex-col gap-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#7C5CFF] flex items-center gap-2">
                <Zap size={16} /> Extracted Technical Skills ({skills.length})
              </span>
              <div className="flex flex-col gap-4">
                {Object.entries(groupedSkills).map(([cat, catSkills]) => (
                  <div key={cat}>
                    <p className="text-[11px] font-extrabold uppercase text-slate-400 mb-2">{cat}</p>
                    <div className="flex flex-wrap gap-2">
                      {catSkills.map((s) => (
                        <span key={s.name} className={`px-3 py-1 rounded-lg text-xs font-bold border ${categoryColor(s.category)}`}>
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {experience.length > 0 && (
            <div className="glass-panel p-6 flex flex-col gap-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#00E5FF] flex items-center gap-2">
                <Briefcase size={16} /> Work Experience ({experience.length})
              </span>
              <div className="flex flex-col gap-4">
                {experience.map((job, i) => (
                  <div key={i} className="relative pl-4 border-l-2 border-[#7C5CFF]">
                    <div className="flex items-start justify-between flex-wrap gap-1">
                      <div>
                        <p className="font-extrabold text-white text-sm">{job.title}</p>
                        <p className="text-[#00E5FF] text-xs font-bold">{job.company}</p>
                      </div>
                      {job.duration && <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">{job.duration}</span>}
                    </div>
                    {job.description && <p className="text-xs text-slate-300 mt-2 leading-relaxed">{job.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {certifications.length > 0 && (
            <div className="glass-panel p-6 flex flex-col gap-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#F5B301] flex items-center gap-2">
                <Award size={16} /> Active Certifications ({certifications.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert, i) => (
                  <span key={i} className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#F5B301]/15 text-[#F5B301] border border-[#F5B301]/30">
                    {cert.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
