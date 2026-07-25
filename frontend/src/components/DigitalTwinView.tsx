import { useState, useEffect } from 'react';
import {
  User, Sparkles, Network, TrendingUp, Award,
  AlertTriangle, Layers, Briefcase, RefreshCw, Cpu, CheckCircle2
} from 'lucide-react';

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

import { useResume } from '../context/ResumeContext';
import { generateDigitalTwin, analyzeGitHub, analyzeLinkedIn, validateCrossProfile } from '../api/digitalTwin';
import type {
  DigitalTwinProfileResponse,
  GitHubAnalysisResponse,
  LinkedInAnalysisResponse,
  CrossProfileValidationResponse,
} from '../types/digitalTwin';
import CareerDnaRadar from './CareerDnaRadar';
import SkillGraphVisualizer from './SkillGraphVisualizer';

type MainTab = 'twin' | 'compatibility' | 'portfolio';
type PortfolioSubTab = 'github' | 'linkedin' | 'validation';

export default function DigitalTwinView() {
  const { parsedData } = useResume();
  const [activeTab, setActiveTab] = useState<MainTab>('twin');
  const [portfolioTab, setPortfolioTab] = useState<PortfolioSubTab>('github');

  const [loading, setLoading] = useState(false);
  const [twinData, setTwinData] = useState<DigitalTwinProfileResponse | null>(null);

  const [ghUsername, setGhUsername] = useState('');
  const [ghLoading, setGhLoading] = useState(false);
  const [ghData, setGhData] = useState<GitHubAnalysisResponse | null>(null);

  const [liUrl, setLiUrl] = useState('');
  const [liText, setLiText] = useState('');
  const [liLoading, setLiLoading] = useState(false);
  const [liData, setLiData] = useState<LinkedInAnalysisResponse | null>(null);

  const [crossData, setCrossData] = useState<CrossProfileValidationResponse | null>(null);

  useEffect(() => {
    if (!parsedData) return;
    const fetchTwin = async () => {
      setLoading(true);
      try {
        const res = await generateDigitalTwin({
          name: parsedData.name || '',
          email: parsedData.email || '',
          phone: parsedData.phone || '',
          summary: parsedData.summary || '',
          skills: parsedData.skills.map((s) => s.name),
          exp_titles: parsedData.experience.map((e) => e.title || ''),
          exp_descriptions: parsedData.experience.map((e) => e.description || ''),
          exp_durations: parsedData.experience.map((e) => e.duration || ''),
          edu_degrees: parsedData.education.map((ed) => ed.degree || ''),
          cert_names: parsedData.certifications.map((c) => c.name || ''),
          github_username: ghUsername,
          linkedin_url: liUrl,
        });
        setTwinData(res);
        setCrossData(res.cross_profile || null);
      } catch (err) {
        console.error('Failed to generate Digital Twin:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTwin();
  }, [parsedData]);

  const handleAnalyzeGithub = async () => {
    if (!ghUsername.trim() || ghLoading) return;
    setGhLoading(true);
    try {
      const res = await analyzeGitHub({
        username: ghUsername.trim(),
        resume_skills: parsedData?.skills.map((s) => s.name) || [],
      });
      setGhData(res);
      const cross = await validateCrossProfile({
        resume_data: parsedData,
        github_username: ghUsername.trim(),
        linkedin_url: liUrl,
      });
      setCrossData(cross);
    } catch (err) {
      console.error('GitHub analysis failed:', err);
    } finally {
      setGhLoading(false);
    }
  };

  const handleAnalyzeLinkedin = async () => {
    if (!liUrl.trim() || liLoading) return;
    setLiLoading(true);
    try {
      const res = await analyzeLinkedIn({
        linkedin_url: liUrl.trim(),
        raw_profile_text: liText.trim(),
        resume_skills: parsedData?.skills.map((s) => s.name) || [],
      });
      setLiData(res);
      const cross = await validateCrossProfile({
        resume_data: parsedData,
        github_username: ghUsername,
        linkedin_url: liUrl.trim(),
      });
      setCrossData(cross);
    } catch (err) {
      console.error('LinkedIn analysis failed:', err);
    } finally {
      setLiLoading(false);
    }
  };

  if (!parsedData && !twinData) {
    return (
      <div className="glass-panel p-12 text-center flex flex-col items-center justify-center gap-4">
        <User size={40} className="text-[#7C5CFF] animate-pulse" />
        <h3 className="text-xl font-bold text-white">No Digital Twin Profile Loaded</h3>
        <p className="text-xs text-slate-400 max-w-md">Upload your resume first to activate your permanent AI Digital Twin Profile.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fadein">
      {/* Top Header Banner */}
      <div className="glass-hero p-6 sm:p-8 flex items-center justify-between flex-wrap gap-4 shadow-2xl relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#7C5CFF]/15 text-purple-300 border border-[#7C5CFF]/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(124,92,255,0.2)]">
              <Sparkles size={13} className="text-[#00E5FF]" /> AI Neural Identity
            </span>
            {twinData?.career_level && (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">
                {twinData.career_level}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            {twinData?.name || parsedData?.name || 'Candidate'} — Digital Twin Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Permanent, unified AI career persona combining Resume, GitHub, LinkedIn, and Career DNA analytics.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#00E5FF] font-bold bg-[#00E5FF]/10 px-4 py-2.5 rounded-xl border border-[#00E5FF]/20 shadow-[0_0_12px_rgba(0,229,255,0.15)]">
            <RefreshCw size={15} className="animate-spin" />
            <span>Updating Digital Twin…</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto border-b border-white/10 pb-3">
        {[
          { id: 'twin', label: 'Digital Twin Overview', icon: <User size={15} /> },
          { id: 'compatibility', label: 'Career Compatibility', icon: <Briefcase size={15} /> },
          { id: 'portfolio', label: 'Portfolio Intelligence & Validation', icon: <Layers size={15} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as MainTab)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
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

      {/* TAB 1: Digital Twin Overview */}
      {activeTab === 'twin' && twinData && (
        <div className="flex flex-col gap-6 animate-fadein">
          {/* Executive Persona Summary Banner */}
          <div className="glass-panel p-6 sm:p-8 flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#7C5CFF] flex items-center gap-1.5">
                <Sparkles size={15} className="text-[#00E5FF]" /> Executive AI Persona Summary
              </span>
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-[#00D084]/15 text-[#00D084] border border-[#00D084]/30 font-num">
                Readiness Score: {twinData.readiness_score}/100
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">{twinData.career_persona}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic border-l-2 border-[#7C5CFF] pl-4 py-1">
              "{twinData.personality_summary}"
            </p>
          </div>

          {/* Career DNA & Skill Graph Visualizers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <TrendingUp size={16} className="text-[#7C5CFF]" /> 10-Dimensional Career DNA
              </h3>
              <CareerDnaRadar dna={twinData.career_dna} />
            </div>

            <div className="glass-panel p-6 flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <Network size={16} className="text-[#00E5FF]" /> Skill Graph Architecture
              </h3>
              <SkillGraphVisualizer graph={twinData.skill_graph} />
            </div>
          </div>

          {/* Technical Stack & Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass-panel p-6 flex flex-col gap-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Cpu size={15} className="text-[#7C5CFF]" /> Technical Stack ({twinData.technical_stack.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {twinData.technical_stack.map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg text-xs font-bold bg-[#7C5CFF]/10 text-purple-300 border border-[#7C5CFF]/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Award size={15} className="text-[#F5B301]" /> Certifications ({twinData.certifications.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {twinData.certifications.map((c, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg text-xs font-bold bg-[#F5B301]/10 text-[#F5B301] border border-[#F5B301]/25">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Career Compatibility Rankings */}
      {activeTab === 'compatibility' && twinData && (
        <div className="flex flex-col gap-6 animate-fadein">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-2">
            <span>Ranked Compatibility across 14 Cybersecurity Paths</span>
            <span>Sorted by highest suitability</span>
          </div>

          <div className="flex flex-col gap-4">
            {twinData.career_rankings.map((role, idx) => (
              <div
                key={role.role_id}
                className="glass-panel glass-panel-hover p-6 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 text-[#00E5FF] font-num font-black text-sm flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-white">{role.role_name}</h3>
                      <p className="text-xs text-slate-400">Target Reach Time: {role.estimated_reach_time_weeks} Weeks</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-num text-xl font-black text-[#7C5CFF]">{role.compatibility_score}%</p>
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Match Score</p>
                    </div>
                    <div className="text-right pl-4 border-l border-white/10">
                      <p className="font-num text-base font-bold text-[#00D084]">{role.confidence_score}%</p>
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Confidence</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-black/40 p-3.5 rounded-xl border border-white/5">{role.roadmap_summary}</p>

                {role.missing_skills.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-[#F5B301] font-bold shrink-0">Missing Gaps:</span>
                    {role.missing_skills.slice(0, 5).map((ms, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded bg-[#F5B301]/10 text-[#F5B301] border border-[#F5B301]/20 font-mono text-[11px]">
                        {ms}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Portfolio & Intelligence Workspace */}
      {activeTab === 'portfolio' && (
        <div className="flex flex-col gap-6 animate-fadein">
          {/* Sub-tab bar */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0E1320] border border-white/10 self-start text-xs font-bold">
            <button
              type="button"
              onClick={() => setPortfolioTab('github')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                portfolioTab === 'github' ? 'btn-gradient-primary' : 'text-slate-400 hover:text-white'
              }`}
            >
              <GithubIcon size={14} />
              <span>GitHub Developer Intelligence</span>
            </button>

            <button
              type="button"
              onClick={() => setPortfolioTab('linkedin')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                portfolioTab === 'linkedin' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LinkedinIcon size={14} />
              <span>LinkedIn Recruiter Branding</span>
            </button>

            <button
              type="button"
              onClick={() => setPortfolioTab('validation')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                portfolioTab === 'validation' ? 'bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={14} />
              <span>Cross-Profile Audit</span>
            </button>
          </div>

          {/* Sub-Tab 1: GitHub Intelligence */}
          {portfolioTab === 'github' && (
            <div className="flex flex-col gap-6 animate-fadein">
              <div className="glass-panel p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#7C5CFF]/20 text-[#00E5FF]">
                    <GithubIcon size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">GitHub Public Repository Audit</h3>
                    <p className="text-xs text-slate-400">Analyze code repositories, security scripts, and language maturity.</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <input
                    type="text"
                    value={ghUsername}
                    onChange={(e) => setGhUsername(e.target.value)}
                    placeholder="Enter GitHub username (e.g. torvalds)..."
                    className="flex-1 min-w-[220px] rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#7C5CFF]"
                  />
                  <button
                    type="button"
                    onClick={handleAnalyzeGithub}
                    disabled={!ghUsername.trim() || ghLoading}
                    className="btn-gradient-primary px-6 py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {ghLoading ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
                    <span>Analyze GitHub</span>
                  </button>
                </div>
              </div>

              {ghData && (
                <div className="flex flex-col gap-6 animate-fadein">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-panel p-5 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase">Portfolio Score</p>
                      <p className="font-num text-2xl font-black text-[#7C5CFF] mt-1">{ghData.portfolio_score}/100</p>
                    </div>
                    <div className="glass-panel p-5 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase">Coding Maturity</p>
                      <p className="text-sm font-black text-[#00D084] mt-2">{ghData.coding_maturity}</p>
                    </div>
                    <div className="glass-panel p-5 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase">Public Repos</p>
                      <p className="font-num text-2xl font-black text-white mt-1">{ghData.public_repos_count}</p>
                    </div>
                    <div className="glass-panel p-5 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase">Stars Earned</p>
                      <p className="font-num text-2xl font-black text-[#F5B301] mt-1">{ghData.total_stars}</p>
                    </div>
                  </div>

                  <div className="glass-panel p-6 flex flex-col gap-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Top Repositories</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ghData.top_repositories.map((repo, i) => (
                        <a
                          key={i}
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-[#7C5CFF]/50 transition-all flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#00E5FF] text-xs sm:text-sm">{repo.name}</span>
                            {repo.is_security_related && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5B301]/20 text-[#F5B301]">Security</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-2">{repo.description || 'No description provided'}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{repo.language} • ⭐ {repo.stars}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 2: LinkedIn Intelligence */}
          {portfolioTab === 'linkedin' && (
            <div className="flex flex-col gap-6 animate-fadein">
              <div className="glass-panel p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF]">
                    <LinkedinIcon size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">LinkedIn Recruiter Branding Audit</h3>
                    <p className="text-xs text-slate-400">Evaluate recruiter attractiveness, keyword density, and headline optimization.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={liUrl}
                    onChange={(e) => setLiUrl(e.target.value)}
                    placeholder="LinkedIn Profile URL (e.g. linkedin.com/in/username)..."
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
                  />
                  <textarea
                    value={liText}
                    onChange={(e) => setLiText(e.target.value)}
                    placeholder="Optional: Paste profile headline or About section text..."
                    rows={3}
                    className="w-full rounded-xl bg-black/40 border border-white/10 p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
                  />
                  <button
                    type="button"
                    onClick={handleAnalyzeLinkedin}
                    disabled={!liUrl.trim() || liLoading}
                    className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#070B14] px-6 py-3 rounded-xl text-xs font-black transition-all disabled:opacity-50 flex items-center gap-2 self-start shadow-lg shadow-[#00E5FF]/20 font-bold"
                  >
                    {liLoading ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
                    <span>Analyze LinkedIn</span>
                  </button>
                </div>
              </div>

              {liData && (
                <div className="flex flex-col gap-6 animate-fadein">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-panel p-5 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase">Branding Score</p>
                      <p className="font-num text-2xl font-black text-[#00E5FF] mt-1">{liData.branding_score}/100</p>
                    </div>
                    <div className="glass-panel p-5 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase">Recruiter Match</p>
                      <p className="font-num text-2xl font-black text-[#00D084] mt-1">{liData.recruiter_attractiveness_score}/100</p>
                    </div>
                    <div className="glass-panel p-5 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase">Completeness</p>
                      <p className="font-num text-2xl font-black text-[#7C5CFF] mt-1">{liData.profile_completeness_score}%</p>
                    </div>
                    <div className="glass-panel p-5 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase">Keyword Density</p>
                      <p className="font-num text-2xl font-black text-[#F5B301] mt-1">{liData.keyword_optimization_score}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 3: Cross-Profile Validation */}
          {portfolioTab === 'validation' && crossData && (
            <div className="flex flex-col gap-6 animate-fadein">
              <div className="glass-panel p-6 flex items-center justify-between flex-wrap gap-4 border border-[#00D084]/30">
                <div>
                  <h3 className="text-base font-extrabold text-white">Cross-Profile Consistency Audit</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Verifies skill alignment across Resume, GitHub, and LinkedIn.</p>
                </div>
                <div className="text-center px-5 py-2.5 rounded-xl bg-black/40 border border-white/10">
                  <span className="font-num text-3xl font-black text-[#00D084]">{crossData.consistency_score}%</span>
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Consistency</p>
                </div>
              </div>

              {crossData.inconsistencies.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5B301] flex items-center gap-1.5">
                    <AlertTriangle size={15} /> Discrepancies Detected ({crossData.inconsistencies.length})
                  </h4>
                  {crossData.inconsistencies.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#F5B301]/5 border border-[#F5B301]/20 text-xs flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F5B301]">{item.source_a} vs {item.source_b}:</span>
                        <span className="text-slate-200">{item.issue}</span>
                      </div>
                      <p className="text-slate-400 italic">Recommendation: {item.recommendation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#00D084]/10 border border-[#00D084]/20 text-xs text-[#00D084] font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>All candidate profiles aligned with zero discrepancies.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
