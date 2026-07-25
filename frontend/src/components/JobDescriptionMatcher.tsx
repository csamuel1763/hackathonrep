import { useState } from 'react';
import { Sparkles, FileText, CheckCircle2, XCircle, Download, Trash2, ArrowRight, AlertTriangle, ShieldCheck, Cpu, Award, Briefcase, Tag } from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { analyzeJobMatch, downloadJobMatchReport } from '../api/resume';
import type { JobMatchResponse, JobMatchRequest } from '../types/resume';

export default function JobDescriptionMatcher() {
  const { parsedData } = useResume();
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobMatchResponse | null>(null);
  const [dismissedMissingSkills, setDismissedMissingSkills] = useState<Set<string>>(new Set());

  if (!parsedData) return null;

  const { name, email, phone, summary, skills, experience, education, certifications } = parsedData;

  const buildPayload = (jdText: string): JobMatchRequest => ({
    job_description: jdText,
    skills: skills.map((s) => s.name),
    name: name || '',
    email: email || '',
    phone: phone || '',
    summary: summary || '',
    exp_titles: experience.map((e) => e.title || ''),
    exp_descriptions: experience.map((e) => e.description || ''),
    exp_durations: experience.map((e) => e.duration || ''),
    edu_degrees: education.map((ed) => ed.degree || ''),
    cert_names: certifications.map((c) => c.name || ''),
  });

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || loading) return;
    setLoading(true);
    setError(null);
    setDismissedMissingSkills(new Set());

    try {
      const payload = buildPayload(jobDescription.trim());
      const res = await analyzeJobMatch(payload);
      setResult(res);
    } catch (err: any) {
      console.error('Job match analysis failed:', err);
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to analyze Job Description. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setJobDescription('');
    setResult(null);
    setError(null);
    setDismissedMissingSkills(new Set());
  };

  const handleDownloadPdf = async () => {
    if (!jobDescription.trim() || pdfLoading) return;
    setPdfLoading(true);
    try {
      const payload = buildPayload(jobDescription.trim());
      const blob = await downloadJobMatchReport(payload);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CareerPilot_Job_Match_Report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('PDF report download failed:', err);
      alert('Failed to download PDF report. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDismissSkill = (skill: string) => {
    setDismissedMissingSkills((prev) => {
      const next = new Set(prev);
      next.add(skill);
      return next;
    });
  };

  const scoreBadgeColor = (score: number) => {
    if (score >= 90) return { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', label: 'Excellent Match' };
    if (score >= 75) return { bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400', label: 'Good Match' };
    if (score >= 60) return { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', label: 'Moderate Match' };
    return { bg: 'bg-red-500/10 border-red-500/30 text-red-400', label: 'Weak Match' };
  };

  const activeMissingSkills = result?.missing_skills.filter((s) => !dismissedMissingSkills.has(s)) ?? [];

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 flex flex-col gap-6 animate-fadein">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Resume vs Job Description Matcher</h2>
            <p className="text-xs text-slate-400">Paste a target job description to get instant ATS keyword compatibility & gap analysis.</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1.5">
          <Sparkles size={13} /> Powered by AI
        </span>
      </div>

      {/* Input Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <label htmlFor="jd-textarea" className="font-semibold text-slate-300">Target Job Description</label>
          <span>{jobDescription.length.toLocaleString()} characters</span>
        </div>

        <textarea
          id="jd-textarea"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste full job description here (responsibilities, requirements, technical qualifications)..."
          rows={6}
          disabled={loading}
          className="w-full rounded-xl bg-black/40 border border-white/10 p-4 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all resize-y disabled:opacity-50"
        />

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!jobDescription.trim() || loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Match…</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Analyze Match</span>
                </>
              )}
            </button>

            {jobDescription && (
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Clear</span>
              </button>
            )}
          </div>

          {result && (
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-2"
            >
              {pdfLoading ? (
                <div className="w-4 h-4 border-2 border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin" />
              ) : (
                <Download size={14} />
              )}
              <span>Export PDF Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm flex items-center gap-3">
          <AlertTriangle size={18} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="flex flex-col gap-6 animate-fadein pt-2">
          {/* Top Score Banner */}
          <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-6 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex flex-col items-center justify-center shrink-0 shadow-inner">
                <span className="text-3xl font-extrabold text-white">{result.overall_score}%</span>
                <span className="text-[10px] uppercase font-bold text-indigo-400">Match</span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${scoreBadgeColor(result.overall_score).bg}`}>
                    {result.match_level} ({scoreBadgeColor(result.overall_score).label})
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Resume Compatibility Assessment</h3>
                <p className="text-xs text-slate-400 mt-0.5">Evaluated against candidate profile skills, experience, and ATS keyword relevance.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-slate-400">Matched Skills</p>
                <p className="text-lg font-bold text-emerald-400">{result.matched_skills.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-slate-400">Missing Gaps</p>
                <p className="text-lg font-bold text-amber-400">{result.missing_skills.length + result.missing_technologies.length}</p>
              </div>
            </div>
          </div>

          {/* Breakdown Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Technical Skills Overlap', value: result.technical_skills_score, icon: <Cpu size={14} className="text-indigo-400" /> },
              { label: 'Certifications Alignment', value: result.certifications_score, icon: <Award size={14} className="text-amber-400" /> },
              { label: 'Experience Relevance', value: result.experience_score, icon: <Briefcase size={14} className="text-sky-400" /> },
              { label: 'ATS Keyword Density', value: result.ats_keyword_score, icon: <Tag size={14} className="text-emerald-400" /> },
            ].map((bar) => (
              <div key={bar.label} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    {bar.icon}
                    {bar.label}
                  </span>
                  <span className="font-bold text-white">{bar.value}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                    style={{ width: `${bar.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Removable Missing Skills Chips */}
          {activeMissingSkills.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Missing Required Skills ({activeMissingSkills.length})
                </h4>
                <span className="text-[11px] text-slate-400">Click x to dismiss</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeMissingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-200 border border-amber-500/30 group transition-all"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleDismissSkill(skill)}
                      className="hover:text-white transition-colors"
                      title="Dismiss missing skill"
                    >
                      <XCircle size={13} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={15} /> Resume Strengths
              </h4>
              <ul className="flex flex-col gap-2">
                {result.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <XCircle size={15} /> Areas for Improvement
              </h4>
              <ul className="flex flex-col gap-2">
                {result.weaknesses.map((weak, idx) => (
                  <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                    <span className="text-red-400 font-bold shrink-0">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Resume Improvement Action Items */}
          <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-400" /> Actionable Resume & ATS Optimizations
            </h4>

            {result.bullet_improvements.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-indigo-300 mb-1.5">Bullet-Point Improvements:</p>
                <div className="flex flex-col gap-1.5">
                  {result.bullet_improvements.map((bullet, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-xs text-slate-200 flex items-start gap-2">
                      <ArrowRight size={13} className="text-indigo-400 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.keywords_to_include.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-indigo-300 mb-1.5">ATS Keywords to Insert:</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywords_to_include.map((kw, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-mono bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                      +{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.suggested_projects.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-indigo-300 mb-1.5">Suggested Hands-On Projects:</p>
                <ul className="list-disc pl-4 text-xs text-slate-300 flex flex-col gap-1">
                  {result.suggested_projects.map((proj, idx) => (
                    <li key={idx}>{proj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
