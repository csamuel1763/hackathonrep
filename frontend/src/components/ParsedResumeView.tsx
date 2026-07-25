import { useState, useEffect } from 'react';
import {
  Mail, Phone, Award, Briefcase, GraduationCap,
  Zap, ChevronDown, ChevronUp, RotateCcw, Target, Shield, BookOpen, Layers, Download
} from 'lucide-react';
import type { ParsedResumeResponse, ParsedSkill, SkillGapResponse, ReadinessScoreResponse, LearningRoadmapResponse, RadarChartResponse, CareerMatchRole, ResumeImprovementResponse } from '../types/resume';
import type { CybersecurityRole } from '../types/role';
import { getSkillGapAnalysis, getCareerReadinessScore, getLearningRoadmap, getRadarChartData, downloadCareerReport, getCareerMatches, getResumeImprovements } from '../api/resume';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import CareerMentorChat from './CareerMentorChat';

/** Colour palette assigned per skill category */
const CATEGORY_COLORS: Record<string, string> = {
  'Network Security':              'bg-blue-500/15 text-blue-300 border-blue-500/25',
  'SIEM & Log Analysis':           'bg-violet-500/15 text-violet-300 border-violet-500/25',
  'Threat Intelligence':           'bg-orange-500/15 text-orange-300 border-orange-500/25',
  'Incident Response':             'bg-red-500/15 text-red-300 border-red-500/25',
  'Penetration Testing':           'bg-rose-500/15 text-rose-300 border-rose-500/25',
  'Vulnerability Management':      'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  'Cloud Security':                'bg-sky-500/15 text-sky-300 border-sky-500/25',
  'Identity & Access Management':  'bg-teal-500/15 text-teal-300 border-teal-500/25',
  'Cryptography':                  'bg-purple-500/15 text-purple-300 border-purple-500/25',
  'Compliance & GRC':              'bg-green-500/15 text-green-300 border-green-500/25',
  'Malware Analysis':              'bg-red-600/15 text-red-300 border-red-600/25',
  'Digital Forensics':             'bg-amber-500/15 text-amber-300 border-amber-500/25',
  'Operating Systems':             'bg-slate-500/15 text-slate-300 border-slate-500/25',
  'Programming Languages':         'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  'Scripting & Automation':        'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  'Other':                         'bg-white/5 text-slate-400 border-white/10',
};

function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Other'];
}

/** Group skills by category for the grid display */
function groupSkills(skills: ParsedSkill[]): Record<string, ParsedSkill[]> {
  return skills.reduce<Record<string, ParsedSkill[]>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {});
}

/* ─── Section wrapper ─────────────────────────────────────────────── */
function Section({
  icon, title, children, defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="text-indigo-400">{icon}</span>
          <span className="font-semibold text-slate-200 text-sm">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────── */
interface ParsedResumeViewProps {
  data: ParsedResumeResponse;
  targetRole: CybersecurityRole | null;
  onReset: () => void;
}

export default function ParsedResumeView({ data, targetRole, onReset }: ParsedResumeViewProps) {
  const { name, email, phone, summary, skills, experience, education, certifications } = data;
  const grouped = groupSkills(skills);

  const [gapAnalysis, setGapAnalysis] = useState<SkillGapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [gapError, setGapError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetRole) return;

    setLoading(true);
    setGapError(null);
    getSkillGapAnalysis(targetRole.id, skills.map(s => s.name))
      .then((res) => {
        setGapAnalysis(res);
      })
      .catch((err) => {
        console.error("Failed to load gap analysis", err);
        setGapError("Failed to calculate skill gap analysis.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [targetRole, skills]);

  const [readiness, setReadiness] = useState<ReadinessScoreResponse | null>(null);
  const [readinessLoading, setReadinessLoading] = useState(false);
  const [readinessError, setReadinessError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetRole) return;

    setReadinessLoading(true);
    setReadinessError(null);

    const skillNames = skills.map((s) => s.name);
    const expTitles = experience.map((j) => j.title || "");
    const expDescs = experience.map((j) => j.description || "");
    const expDurs = experience.map((j) => j.duration || "");
    const eduDegrees = education.map((e) => e.degree || "");
    const certNames = certifications.map((c) => c.name || "");

    getCareerReadinessScore(
      targetRole.id,
      skillNames,
      expTitles,
      expDescs,
      expDurs,
      eduDegrees,
      certNames
    )
      .then((res) => {
        setReadiness(res);
      })
      .catch((err) => {
        console.error("Failed to load career readiness score", err);
        setReadinessError("Failed to calculate career readiness score.");
      })
      .finally(() => {
        setReadinessLoading(false);
      });
  }, [targetRole, skills, experience, education, certifications]);

  const [roadmap, setRoadmap] = useState<LearningRoadmapResponse | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetRole) return;

    setRoadmapLoading(true);
    setRoadmapError(null);
    getLearningRoadmap(targetRole.id, skills.map((s) => s.name))
      .then((res) => {
        setRoadmap(res);
      })
      .catch((err) => {
        console.error("Failed to load learning roadmap", err);
        setRoadmapError("Failed to calculate learning roadmap.");
      })
      .finally(() => {
        setRoadmapLoading(false);
      });
  }, [targetRole, skills]);

  const [radar, setRadar] = useState<RadarChartResponse | null>(null);
  const [radarLoading, setRadarLoading] = useState(false);
  const [radarError, setRadarError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetRole) return;

    setRadarLoading(true);
    setRadarError(null);
    getRadarChartData(targetRole.id, skills.map((s) => s.name))
      .then((res) => {
        setRadar(res);
      })
      .catch((err) => {
        console.error("Failed to load skill radar chart", err);
        setRadarError("Failed to calculate skill radar analysis.");
      })
      .finally(() => {
        setRadarLoading(false);
      });
  }, [targetRole, skills]);

  const [careerMatches, setCareerMatches] = useState<CareerMatchRole[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'highest' | 'alpha'>('highest');
  const [filterThreshold, setFilterThreshold] = useState<number>(0);

  useEffect(() => {
    setMatchesLoading(true);
    setMatchesError(null);

    const skillNames = skills.map((s) => s.name);
    const expTitles = experience.map((j) => j.title || "");
    const expDescs = experience.map((j) => j.description || "");
    const expDurs = experience.map((j) => j.duration || "");
    const eduDegrees = education.map((e) => e.degree || "");
    const certNames = certifications.map((c) => c.name || "");

    getCareerMatches(
      skillNames,
      expTitles,
      expDescs,
      expDurs,
      eduDegrees,
      certNames
    )
      .then((res) => {
        setCareerMatches(res);
      })
      .catch((err) => {
        console.error("Failed to load career matches", err);
        setMatchesError("Failed to calculate career role matches.");
      })
      .finally(() => {
        setMatchesLoading(false);
      });
  }, [skills, experience, education, certifications]);

  const [improvements, setImprovements] = useState<ResumeImprovementResponse | null>(null);
  const [impLoading, setImpLoading] = useState(false);
  const [impError, setImpError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetRole) return;
    setImpLoading(true);
    setImpError(null);

    const skillNames = skills.map((s) => s.name);
    const expTitles = experience.map((j) => j.title || "");
    const expDescs = experience.map((j) => j.description || "");
    const expDurs = experience.map((j) => j.duration || "");
    const eduDegrees = education.map((e) => e.degree || "");
    const certNames = certifications.map((c) => c.name || "");

    getResumeImprovements(
      targetRole.id,
      skillNames,
      name || "",
      email || "",
      phone || "",
      summary || "",
      expTitles,
      expDescs,
      expDurs,
      eduDegrees,
      certNames
    )
      .then((res) => {
        setImprovements(res);
      })
      .catch((err) => {
        console.error("Failed to load resume improvements", err);
        setImpError("Failed to calculate resume improvement suggestions.");
      })
      .finally(() => {
        setImpLoading(false);
      });
  }, [targetRole, skills, experience, education, certifications]);

  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadReport = async () => {
    if (!targetRole) return;
    setDownloading(true);
    setDownloadSuccess(null);
    setDownloadError(null);

    try {
      const skillNames = skills.map((s) => s.name);
      const expTitles = experience.map((j) => j.title || "");
      const expDescs = experience.map((j) => j.description || "");
      const expDurs = experience.map((j) => j.duration || "");
      const eduDegrees = education.map((e) => e.degree || "");
      const certNames = certifications.map((c) => c.name || "");

      const blob = await downloadCareerReport(
        targetRole.id,
        skillNames,
        name || "",
        email || "",
        phone || "",
        summary || "",
        expTitles,
        expDescs,
        expDurs,
        eduDegrees,
        certNames
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'CareerPilot_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setDownloadSuccess("Your Career Report has been downloaded successfully!");
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error("Failed to download PDF report", err);
      setDownloadError("Failed to generate and download career report.");
      setTimeout(() => setDownloadError(null), 4000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 animate-fadein relative">
      
      {/* Floating Toast notifications */}
      {(downloadSuccess || downloadError) && (
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
          {downloadSuccess && (
            <div className="bg-emerald-500/95 border border-emerald-500 text-white px-4 py-3 rounded-xl text-sm font-medium shadow-2xl animate-fadein">
              {downloadSuccess}
            </div>
          )}
          {downloadError && (
            <div className="bg-red-500/95 border border-red-500 text-white px-4 py-3 rounded-xl text-sm font-medium shadow-2xl animate-fadein">
              {downloadError}
            </div>
          )}
        </div>
      )}

      {/* ── Header card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-violet-600/10 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            {/* Avatar placeholder */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-3">
              <span className="text-xl font-bold text-white">
                {name?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">{name || 'Unknown Candidate'}</h2>

            {/* Contact row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              {email && (
                <a href={`mailto:${email}`}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                  <Mail size={13} />{email}
                </a>
              )}
              {phone && (
                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Phone size={13} />{phone}
                </span>
              )}
            </div>
          </div>

          {/* Stats pill + reset */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2 flex-wrap justify-end">
              {[
                { label: 'Skills',    value: skills.length       },
                { label: 'Roles',     value: experience.length   },
                { label: 'Certs',     value: certifications.length },
              ].map(({ label, value }) => (
                <div key={label} className="text-center px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-lg font-bold text-white">{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleDownloadReport}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {downloading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                ) : (
                  <Download size={12} />
                )}
                {downloading ? "Generating PDF..." : "⬇ Download Career Report"}
              </button>
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
              >
                <RotateCcw size={12} /> Upload another resume
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <p className="mt-4 text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-4">
            {summary}
          </p>
        )}
      </div>

      {/* ── Target Role details ────────────────────────────────────── */}
      {targetRole && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Target size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Target Cybersecurity Career Role</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{targetRole.name}</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">{targetRole.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Layers size={12} className="text-indigo-400" /> Expected Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {targetRole.required_skills.map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <BookOpen size={12} className="text-indigo-400" /> Required Knowledge / Certs
              </p>
              <ul className="flex flex-col gap-1">
                {targetRole.prerequisites.map((pre, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-1">
                    <span className="text-indigo-400">•</span> {pre}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Skill Gap Analysis Card ───────────────────────────────── */}
      {targetRole && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 text-indigo-400 mb-4">
            <Shield size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Skill Gap Analysis</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          ) : gapError ? (
            <p className="text-sm text-red-400">{gapError}</p>
          ) : gapAnalysis ? (
            <div className="flex flex-col gap-6">
              {/* Coverage & progress bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-300">Coverage</span>
                  <span className="text-lg font-bold text-white">{gapAnalysis.coverage_percentage}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${gapAnalysis.coverage_percentage}%` }}
                  />
                </div>
                <div className="flex gap-4 mt-3 text-xs text-slate-400">
                  <span>Matched: <strong className="text-white">{gapAnalysis.matched_count}</strong></span>
                  <span>Missing: <strong className="text-white">{gapAnalysis.missing_count}</strong></span>
                  <span>Total Required: <strong className="text-white">{gapAnalysis.total_required}</strong></span>
                </div>
              </div>

              {/* Matched and Missing lists side-by-side or stacked */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                {/* Matched list */}
                <div>
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    ✔ Matched Skills ({gapAnalysis.matched_count})
                  </p>
                  {gapAnalysis.matched_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {gapAnalysis.matched_skills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No matched skills</p>
                  )}
                </div>

                {/* Missing list */}
                <div>
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    ✖ Missing Skills ({gapAnalysis.missing_count})
                  </p>
                  {gapAnalysis.missing_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {gapAnalysis.missing_skills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-300 border border-red-500/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No missing skills</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ── Career Readiness Score Card ────────────────────────────── */}
      {targetRole && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 animate-fadein">
          <div className="flex items-center gap-2 text-indigo-400 mb-4">
            <Award size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Career Readiness Score</span>
          </div>

          {readinessLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          ) : readinessError ? (
            <p className="text-sm text-red-400">{readinessError}</p>
          ) : readiness ? (
            <div className="flex flex-col md:flex-row items-center gap-8">
              
              {/* Circular Progress & Level Badge */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke="rgba(255, 255, 255, 0.05)"
                      fill="none"
                      strokeWidth="8"
                    />
                    {/* Scoring Circle */}
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke="#6366f1"
                      fill="none"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 - (readiness.overall_score / 100) * (2 * Math.PI * 48)}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s ease-out" }}
                    />
                  </svg>
                  {/* Inside Text */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-white">{readiness.overall_score}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Ready</span>
                  </div>
                </div>

                {/* Readiness Level Badge */}
                <span className={`
                  px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border
                  ${readiness.overall_score >= 90 ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' :
                    readiness.overall_score >= 70 ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                    readiness.overall_score >= 40 ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                    'bg-red-500/10 text-red-300 border-red-500/30'}
                `}>
                  {readiness.readiness_level}
                </span>
              </div>

              {/* Component breakdown */}
              <div className="flex-1 w-full grid grid-cols-2 gap-4">
                {[
                  { label: "Skills Matching (50%)", score: readiness.skills_score },
                  { label: "Work Experience (25%)", score: readiness.experience_score },
                  { label: "Education Relevance (15%)", score: readiness.education_score },
                  { label: "Certifications Obtained (10%)", score: readiness.certification_score }
                ].map((comp, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                    <span className="text-xs text-slate-400 font-medium">{comp.label}</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-xl font-bold text-white">{comp.score}</span>
                      <span className="text-xs text-slate-500">/ 100</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : null}
        </div>
      )}

      {/* ── Skill Radar Analysis Card ────────────────────────────── */}
      {targetRole && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 animate-fadein">
          <div className="flex items-center gap-2 text-indigo-400 mb-4">
            <Target size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">📊 Skill Radar Analysis</span>
          </div>

          {radarLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          ) : radarError ? (
            <p className="text-sm text-red-400">{radarError}</p>
          ) : radar ? (
            <div className="w-full flex justify-center">
              <ResponsiveContainer width="100%" height={360}>
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
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "#475569", fontSize: 9 }}
                  />
                  <Radar
                    name="Candidate Skills"
                    dataKey="candidate"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Target Role Skills"
                    dataKey="required"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.15}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "12px",
                      color: "#94a3b8",
                      paddingTop: "15px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No radar data generated.</p>
          )}
        </div>
      )}

      {/* ── Career Match Dashboard ─────────────────────────────────── */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 animate-fadein">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-indigo-400">
            <Target size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">🎯 Career Match Dashboard</span>
          </div>

          {/* Filtering and Sorting controls */}
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <span className="text-slate-400 px-2 font-medium">Filter:</span>
              {[
                { label: 'All', value: 0 },
                { label: '30%+', value: 30 },
                { label: '50%+', value: 50 },
                { label: '70%+', value: 70 },
              ].map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilterThreshold(f.value)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filterThreshold === f.value
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <span className="text-slate-400 px-2 font-medium">Sort:</span>
              <button
                type="button"
                onClick={() => setSortBy('highest')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  sortBy === 'highest'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Highest Match
              </button>
              <button
                type="button"
                onClick={() => setSortBy('alpha')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  sortBy === 'alpha'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Alphabetical
              </button>
            </div>
          </div>
        </div>

        {matchesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-500"></div>
          </div>
        ) : matchesError ? (
          <p className="text-sm text-red-400">{matchesError}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careerMatches
              .filter((m) => m.score >= filterThreshold)
              .sort((a, b) => {
                if (sortBy === 'highest') return b.score - a.score;
                return a.name.localeCompare(b.name);
              })
              .map((roleMatch) => {
                // Find top match ID from descending order of scores
                const sortedMatches = [...careerMatches].sort((x, y) => y.score - x.score);
                const isTopMatch = sortedMatches.length > 0 && roleMatch.id === sortedMatches[0].id;

                return (
                  <div
                    key={roleMatch.id}
                    className={`relative p-5 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between ${
                      isTopMatch
                        ? 'bg-indigo-500/10 border-indigo-500/40 shadow-indigo-500/10'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      {isTopMatch && (
                        <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500 text-white shadow-md">
                          ⭐ Top Match
                        </span>
                      )}

                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-white text-base leading-snug">{roleMatch.name}</h4>
                        <span className={`text-sm font-extrabold px-2 py-0.5 rounded-md ${
                          roleMatch.score >= 70 ? 'text-emerald-400 bg-emerald-500/10' :
                          roleMatch.score >= 50 ? 'text-indigo-400 bg-indigo-500/10' :
                          'text-amber-400 bg-amber-500/10'
                        }`}>
                          {roleMatch.score}%
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                        {roleMatch.description}
                      </p>

                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10 mb-3">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-700"
                          style={{ width: `${roleMatch.score}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
                      <span>Matched: <strong className="text-emerald-400">{roleMatch.matched_skills}</strong> / {roleMatch.required_skills}</span>
                      <span>Missing: <strong className="text-red-400">{roleMatch.missing_skills}</strong></span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── Resume Improvement Suggestions Card ────────────────────── */}
      {targetRole && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 animate-fadein">
          <div className="flex items-center gap-2 text-indigo-400 mb-6">
            <Zap size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">🚀 Resume Improvement Suggestions</span>
          </div>

          {impLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-500"></div>
            </div>
          ) : impError ? (
            <p className="text-sm text-red-400">{impError}</p>
          ) : improvements ? (
            <div className="flex flex-col gap-6">
              {/* Estimated Readiness Score Gain Banner */}
              {readiness && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 border border-indigo-500/30 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Estimated Readiness Improvement</h4>
                    <p className="text-xs text-slate-400">
                      Completing these high-impact priorities can boost your readiness score by <strong>+{improvements.estimated_score_gain}%</strong>.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-xl font-extrabold text-slate-400">{readiness.overall_score}</span>
                    <span className="text-indigo-400 font-bold text-lg">➔</span>
                    <span className="text-2xl font-extrabold text-emerald-400">
                      {Math.min(100, readiness.overall_score + improvements.estimated_score_gain)}
                    </span>
                  </div>
                </div>
              )}

              {/* Priority Action Cards */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority Learning & Certification Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {improvements.priority.map((action, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h5 className="font-bold text-white text-sm">{action.title}</h5>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            action.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                            action.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                            'bg-red-500/10 text-red-300 border border-red-500/20'
                          }`}>
                            {action.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-3">{action.reason}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5 text-slate-400">
                        <span>Duration: <strong className="text-white">{action.duration}</strong></span>
                        <span>Impact: <strong className="text-indigo-400">{action.impact}/10</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resume Tips Section */}
              <div className="pt-4 border-t border-white/5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Resume Formatting & Content Tips</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {improvements.resume_improvements.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-emerald-400 font-bold text-sm">✓</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : null}
        </div>
      )}

      {/* ── AI Career Mentor ───────────────────────────────────────── */}
      <CareerMentorChat />

      {/* ── Personalized Learning Roadmap Card ────────────────────── */}
      {targetRole && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 animate-fadein">
          <div className="flex items-center gap-2 text-indigo-400 mb-4">
            <BookOpen size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">📚 Personalized Learning Roadmap</span>
          </div>

          {roadmapLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          ) : roadmapError ? (
            <p className="text-sm text-red-400">{roadmapError}</p>
          ) : roadmap ? (
            <div className="flex flex-col gap-6">
              {/* Header metrics */}
              <div className="flex gap-4">
                <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 flex-1">
                  <p className="text-2xl font-bold text-white">{roadmap.estimated_duration_weeks}</p>
                  <p className="text-xs text-slate-400">Estimated Duration (Weeks)</p>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 flex-1">
                  <p className="text-2xl font-bold text-white">{roadmap.total_steps}</p>
                  <p className="text-xs text-slate-400">Total Learning Steps</p>
                </div>
              </div>

              {/* Timeline Steps */}
              <div className="flex flex-col gap-4 mt-2">
                {roadmap.roadmap.map((step) => (
                  <div key={step.week} className="relative pl-6 border-l-2 border-indigo-500/30">
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    
                    <div className="flex flex-col gap-2">
                      <h4 className="font-bold text-white text-sm">Week {step.week}</h4>
                      <ul className="flex flex-col gap-1.5 pl-1">
                        {step.topics.map((topic, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                            <span className="text-indigo-400 font-semibold">•</span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No learning roadmap generated.</p>
          )}
        </div>
      )}

      {/* ── Skills ──────────────────────────────────────────────────── */}
      {skills.length > 0 && (
        <Section icon={<Zap size={16} />} title={`Skills Detected (${skills.length})`}>
          <div className="flex flex-col gap-4">
            {Object.entries(grouped).map(([cat, catSkills]) => (
              <div key={cat}>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {catSkills.map((s) => (
                    <span
                      key={s.name}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryColor(s.category)}`}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Experience ──────────────────────────────────────────────── */}
      {experience.length > 0 && (
        <Section icon={<Briefcase size={16} />} title="Work Experience">
          <div className="flex flex-col gap-4">
            {experience.map((job, i) => (
              <div key={i} className="relative pl-4 border-l-2 border-indigo-500/30">
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-indigo-500" />
                <div className="flex items-start justify-between flex-wrap gap-1">
                  <div>
                    <p className="font-semibold text-slate-200 text-sm">{job.title}</p>
                    <p className="text-indigo-400 text-sm">{job.company}</p>
                  </div>
                  {job.duration && (
                    <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-lg">{job.duration}</span>
                  )}
                </div>
                {job.description && (
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {job.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Education ───────────────────────────────────────────────── */}
      {education.length > 0 && (
        <Section icon={<GraduationCap size={16} />} title="Education" defaultOpen={false}>
          <div className="flex flex-col gap-3">
            {education.map((edu, i) => (
              <div key={i} className="flex items-start justify-between flex-wrap gap-1">
                <div>
                  <p className="font-semibold text-slate-200 text-sm">{edu.degree}</p>
                  <p className="text-slate-400 text-sm">{edu.institution}</p>
                </div>
                {edu.year && (
                  <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-lg">{edu.year}</span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Certifications ──────────────────────────────────────────── */}
      {certifications.length > 0 && (
        <Section icon={<Award size={16} />} title="Certifications" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert, i) => (
              <span key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25">
                <Award size={11} />
                <span className="font-bold">{cert.name}</span>
                {cert.issuer && <span className="opacity-60">({cert.issuer})</span>}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
