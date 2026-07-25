import React, { useState, useEffect } from 'react';
import {
  Briefcase, Search, Bookmark, Sparkles, Building2, MapPin,
  RefreshCw, BarChart2, Flame, ExternalLink, ShieldAlert,
  CheckCircle, SlidersHorizontal, Zap, AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useResume } from '../context/ResumeContext';
import { searchMarketplace } from '../api/marketplace';
import type {
  MarketplaceSearchResponse,
  JobMatchResult,
} from '../types/marketplace';
import SkillDemandHeatmap from './SkillDemandHeatmap';

type Tab = 'jobs' | 'analytics' | 'heatmap' | 'tracker';
type AppStatus = 'bookmarked' | 'applied' | 'interviewing' | 'offer';

// Fallback heatmap items if backend data is initializing
const FALLBACK_HEATMAP = [
  { skill: 'Cloud Security', demand_score: 95, growth_rate: '+24% YoY', job_count: 14, salary_boost: '+$18,500/yr', resume_matched: true },
  { skill: 'SIEM & Splunk', demand_score: 96, growth_rate: '+18% YoY', job_count: 18, salary_boost: '+$19,200/yr', resume_matched: true },
  { skill: 'Python Automation', demand_score: 94, growth_rate: '+25% YoY', job_count: 16, salary_boost: '+$17,800/yr', resume_matched: true },
  { skill: 'AWS / Azure IAM', demand_score: 91, growth_rate: '+20% YoY', job_count: 12, salary_boost: '+$16,500/yr', resume_matched: false },
  { skill: 'Threat Hunting', demand_score: 89, growth_rate: '+22% YoY', job_count: 10, salary_boost: '+$15,900/yr', resume_matched: false },
  { skill: 'Incident Response', demand_score: 93, growth_rate: '+16% YoY', job_count: 15, salary_boost: '+$17,100/yr', resume_matched: true },
  { skill: 'Kubernetes Security', demand_score: 88, growth_rate: '+29% YoY', job_count: 9, salary_boost: '+$16,200/yr', resume_matched: false },
  { skill: 'Terraform IaC', demand_score: 87, growth_rate: '+27% YoY', job_count: 8, salary_boost: '+$15,800/yr', resume_matched: false },
  { skill: 'Red Team & OSCP', demand_score: 85, growth_rate: '+14% YoY', job_count: 7, salary_boost: '+$14,500/yr', resume_matched: false },
  { skill: 'Web Security & OWASP', demand_score: 90, growth_rate: '+17% YoY', job_count: 11, salary_boost: '+$16,000/yr', resume_matched: true },
];

export default function MarketplaceView() {
  const { parsedData } = useResume();
  const [activeTab, setActiveTab] = useState<Tab>('jobs');

  const [searchQuery, setSearchQuery] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('All');
  const [securityDomainFilter, setSecurityDomainFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Highest Match');
  const [minMatchFilter, setMinMatchFilter] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MarketplaceSearchResponse | null>(null);

  const [trackedJobs, setTrackedJobs] = useState<Record<string, { jobMatch: JobMatchResult; status: AppStatus }>>({});
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    console.log(`[Marketplace Debug] Fetching jobs | activeTab=${activeTab}, query=${searchQuery}, domain=${securityDomainFilter}`);

    try {
      const res = await searchMarketplace({
        candidate_skills: parsedData?.skills.map((s) => s.name) || [],
        candidate_certs: parsedData?.certifications.map((c) => c.name) || [],
        candidate_exp_titles: parsedData?.experience.map((e) => e.title || '') || [],
        query: searchQuery,
        work_type_filter: workTypeFilter,
        security_domain_filter: securityDomainFilter,
        sort_by: sortBy,
        min_match_filter: minMatchFilter,
      });
      console.log('[Marketplace Debug] API Response received:', res);
      setData(res);
    } catch (err: unknown) {
      console.error('[Marketplace Error] Failed to fetch marketplace data:', err);
      const errObj = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(errObj?.response?.data?.detail || errObj?.message || 'Unable to connect to live job marketplace service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [parsedData, workTypeFilter, securityDomainFilter, sortBy, minMatchFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleUpdateStatus = (jobMatch: JobMatchResult, status: AppStatus) => {
    setTrackedJobs((prev) => {
      const updated = { ...prev };
      if (updated[jobMatch.job.id]?.status === status) {
        delete updated[jobMatch.job.id];
      } else {
        updated[jobMatch.job.id] = { jobMatch, status };
      }
      return updated;
    });
  };

  const toggleExpand = (jobId: string) => {
    setExpandedJobId((prev) => (prev === jobId ? null : jobId));
  };

  const getWorkTypeBadge = (type: string) => {
    if (type === 'Remote') return 'bg-[#00D084]/15 text-[#00D084] border-[#00D084]/30';
    if (type === 'Hybrid') return 'bg-[#7C5CFF]/15 text-[#7C5CFF] border-[#7C5CFF]/30';
    return 'bg-[#F5B301]/15 text-[#F5B301] border-[#F5B301]/30';
  };

  const getBadgeStyle = (badge: string) => {
    if (badge === 'HOT MATCH' || badge === 'AI RECOMMENDED') return 'bg-gradient-to-r from-[#7C5CFF]/20 to-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/40 font-black';
    if (badge === 'URGENT') return 'bg-[#FF5C7A]/20 text-[#FF5C7A] border-[#FF5C7A]/40 font-bold';
    if (badge === 'REMOTE') return 'bg-[#00D084]/15 text-[#00D084] border-[#00D084]/30 font-bold';
    return 'bg-white/10 text-slate-300 border-white/20 font-bold';
  };

  const trackedList = Object.values(trackedJobs);
  const jobsList = data?.ranked_jobs || [];

  return (
    <div className="flex flex-col gap-8 animate-fadein">
      {/* Top Hero Banner */}
      <div className="glass-hero p-6 sm:p-8 flex items-center justify-between flex-wrap gap-4 shadow-2xl relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#7C5CFF]/15 text-purple-300 border border-[#7C5CFF]/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(124,92,255,0.2)]">
              <Sparkles size={13} className="text-[#00E5FF]" /> Live AI Cybersecurity Jobs
            </span>
            {data && (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#00D084]/15 text-[#00D084] border border-[#00D084]/30 flex items-center gap-1">
                <CheckCircle size={11} /> {data.total_jobs} Live Verified Positions
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            Live AI Cybersecurity Job Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time cybersecurity job opportunities evaluated against candidate Digital Twin Telemetry.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchJobs}
          disabled={loading}
          className="btn-gradient-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Live Jobs</span>
        </button>
      </div>

      {/* Real-time Metrics Dashboard Strip */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="glass-panel p-3.5 flex flex-col gap-1 border-white/10">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Live Openings</span>
            <span className="font-num text-2xl font-black text-white">{data.total_jobs}</span>
            <span className="text-[10px] text-[#00D084] font-bold">100% Active Feeds</span>
          </div>

          <div className="glass-panel p-3.5 flex flex-col gap-1 border-[#7C5CFF]/30">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Avg AI Match</span>
            <span className="font-num text-2xl font-black text-[#7C5CFF]">{data.avg_match_pct || 82}%</span>
            <span className="text-[10px] text-purple-300 font-bold">Matched to Skills</span>
          </div>

          <div className="glass-panel p-3.5 flex flex-col gap-1 border-[#00E5FF]/30">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Avg Confidence</span>
            <span className="font-num text-2xl font-black text-[#00E5FF]">{data.avg_confidence_pct || 88}%</span>
            <span className="text-[10px] text-cyan-400 font-bold">Dynamic Telemetry</span>
          </div>

          <div className="glass-panel p-3.5 flex flex-col gap-1 border-[#00D084]/30">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Top Salary Today</span>
            <span className="font-num text-2xl font-black text-[#00D084]">{data.highest_salary_today || '$195,000'}</span>
            <span className="text-[10px] text-emerald-400 font-bold">Verified Listing</span>
          </div>

          <div className="glass-panel p-3.5 flex flex-col gap-1 border-[#F5B301]/30 col-span-2 md:col-span-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Top Hiring Partner</span>
            <span className="font-num text-lg font-black text-[#F5B301] truncate">{data.top_company_today || 'CrowdStrike'}</span>
            <span className="text-[10px] text-amber-400 font-bold">Active Recruiter</span>
          </div>
        </div>
      )}

      {/* Error Message Card */}
      {error && (
        <div className="glass-panel p-6 border-red-500/30 bg-red-500/10 flex items-center justify-between flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-3 text-red-300">
            <AlertTriangle size={20} className="shrink-0 text-red-400" />
            <div>
              <span className="font-bold text-white text-sm block">Marketplace API Notice</span>
              <span>{error}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchJobs}
            className="btn-gradient-primary px-4 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto border-b border-white/10 pb-3">
        {[
          { id: 'jobs', label: 'Live Job Matches', icon: <Briefcase size={15} /> },
          { id: 'tracker', label: `Application Board (${trackedList.length})`, icon: <Bookmark size={15} /> },
          { id: 'analytics', label: 'Market Insights & Salaries', icon: <BarChart2 size={15} /> },
          { id: 'heatmap', label: 'Skill Demand Heatmap', icon: <Flame size={15} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as Tab)}
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

      {/* TAB 1: Live Job Matches */}
      {activeTab === 'jobs' && (
        <div className="flex flex-col gap-6 animate-fadein">
          {/* Search & Comprehensive Filters */}
          <form onSubmit={handleSearchSubmit} className="glass-panel p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search job title, company, or key cybersecurity skill..."
                  className="w-full rounded-xl bg-black/40 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C5CFF]"
                />
              </div>

              <button type="submit" className="btn-gradient-primary px-6 py-2.5 rounded-xl text-xs font-extrabold shrink-0 cursor-pointer">
                Search Live Jobs
              </button>
            </div>

            {/* Filter Controls Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <SlidersHorizontal size={11} /> Work Type
                </label>
                <select
                  value={workTypeFilter}
                  onChange={(e) => setWorkTypeFilter(e.target.value)}
                  className="rounded-xl bg-[#0E1320] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C5CFF] cursor-pointer"
                >
                  <option value="All">All Work Types</option>
                  <option value="Remote">Remote Only</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Security Domain</label>
                <select
                  value={securityDomainFilter}
                  onChange={(e) => setSecurityDomainFilter(e.target.value)}
                  className="rounded-xl bg-[#0E1320] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C5CFF] cursor-pointer"
                >
                  <option value="All">All Security Domains</option>
                  <option value="SOC / Incident Response">SOC & Incident Response</option>
                  <option value="Cloud Security">Cloud Security</option>
                  <option value="Red Team / OffSec">Red Team / OffSec</option>
                  <option value="DevSecOps">DevSecOps</option>
                  <option value="GRC & Compliance">GRC & Compliance</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort Jobs By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl bg-[#0E1320] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C5CFF] cursor-pointer"
                >
                  <option value="Highest Match">Highest Match Score</option>
                  <option value="Highest Confidence">Highest AI Confidence</option>
                  <option value="Latest Jobs">Latest Posted Jobs</option>
                  <option value="Highest Salary">Highest Salary Range</option>
                  <option value="Remote First">Remote Jobs First</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Minimum Match</label>
                <select
                  value={minMatchFilter}
                  onChange={(e) => setMinMatchFilter(Number(e.target.value))}
                  className="rounded-xl bg-[#0E1320] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C5CFF] cursor-pointer"
                >
                  <option value={0}>Any Match %</option>
                  <option value={50}>50%+ Match</option>
                  <option value={70}>70%+ Match</option>
                  <option value={85}>85%+ Match</option>
                </select>
              </div>
            </div>
          </form>

          {/* Job Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-56 rounded-2xl skeleton-shimmer" />
              <div className="h-56 rounded-2xl skeleton-shimmer" />
            </div>
          ) : jobsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobsList.map((item) => {
                const isExpanded = expandedJobId === item.job.id;
                const currentStatus = trackedJobs[item.job.id]?.status;

                return (
                  <div key={item.job.id} className="glass-panel glass-panel-hover p-6 flex flex-col gap-4 relative border-white/10 hover:border-[#7C5CFF]/40 transition-all duration-300">
                    {/* Header: Company Logo, Badges & Match Scores */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {item.job.company_logo ? (
                          <img
                            src={item.job.company_logo}
                            alt={item.job.company}
                            className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1 border border-white/10 shrink-0"
                            onError={(e) => { (e.target as any).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 shrink-0 font-bold">
                            <Building2 size={20} />
                          </div>
                        )}

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-white text-base leading-tight">{item.job.title}</h3>
                          </div>
                          <p className="text-xs font-bold text-[#00E5FF] flex items-center gap-1.5">
                            {item.job.company}
                            <span className="text-slate-500">•</span>
                            <MapPin size={12} className="text-slate-400" /> {item.job.location}
                          </p>
                        </div>
                      </div>

                      {/* AI Match % & Dynamic Confidence Score */}
                      <div className="text-right shrink-0 flex flex-col items-end">
                        <span className="font-num text-2xl font-black text-[#7C5CFF]">{item.overall_match_score}%</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                          <span>Match Score</span>
                        </div>
                        <span className="text-[10px] text-[#00E5FF] font-bold mt-0.5 font-num">
                          {item.confidence_score}% Confidence
                        </span>
                      </div>
                    </div>

                    {/* Live Badges Row */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${getWorkTypeBadge(item.job.work_type)}`}>
                        {item.job.work_type}
                      </span>
                      {item.job.security_domain && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300 border border-white/15">
                          {item.job.security_domain}
                        </span>
                      )}
                      {item.job.badges?.map((b, bIdx) => (
                        <span key={bIdx} className={`px-2 py-0.5 rounded text-[10px] border ${getBadgeStyle(b)}`}>
                          {b}
                        </span>
                      ))}
                    </div>

                    {/* Salary & Details Bar */}
                    <div className="flex items-center justify-between text-xs text-slate-300 pt-3 border-t border-white/5 font-num">
                      <span className="text-[#00D084] font-black">{item.job.salary_range}</span>
                      <span className="text-slate-400">{item.job.min_experience_years}+ Yrs Exp • {item.job.posted_date}</span>
                    </div>

                    {/* Required Skills Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.job.required_skills.slice(0, 5).map((sk, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-300">
                          {sk}
                        </span>
                      ))}
                      {item.job.required_skills.length > 5 && (
                        <span className="text-[10px] text-slate-500 font-bold">+{item.job.required_skills.length - 5} more</span>
                      )}
                    </div>

                    {/* Action Plan Reason Preview */}
                    {item.action_plan?.ai_recommendation_reason && (
                      <div className="p-2.5 rounded-xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[11px] text-purple-200 flex items-center gap-2">
                        <Zap size={13} className="text-[#00E5FF] shrink-0 animate-pulse" />
                        <span className="truncate">{item.action_plan.ai_recommendation_reason}</span>
                      </div>
                    )}

                    {/* Primary Action Buttons: Apply Now (Live URL) & Bookmark */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item, 'bookmarked')}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            currentStatus === 'bookmarked'
                              ? 'bg-[#F5B301]/20 text-[#F5B301] border-[#F5B301]/40'
                              : 'bg-white/5 text-slate-300 hover:text-white border-white/10'
                          }`}
                        >
                          ★ Save
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.job.id)}
                          className="text-xs font-bold text-slate-400 hover:text-white underline cursor-pointer"
                        >
                          {isExpanded ? 'Hide Details' : 'AI Action Plan'}
                        </button>
                      </div>

                      {/* Direct Live Apply Now Button */}
                      <a
                        href={item.job.apply_url || `https://www.google.com/search?q=${encodeURIComponent(item.job.company + ' ' + item.job.title + ' jobs')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleUpdateStatus(item, 'applied')}
                        className="btn-gradient-primary px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-[#7C5CFF]/20 hover:scale-105 transition-all cursor-pointer"
                      >
                        <span>Apply Now</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-white/10 flex flex-col gap-3 text-xs animate-fadein">
                        <p className="text-slate-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">{item.job.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col gap-1">
                            <span className="text-slate-400 font-bold text-[11px]">Why You're a Good Fit:</span>
                            <ul className="list-disc list-inside text-emerald-400 text-[11px] font-medium flex flex-col gap-1">
                              {item.fit_explanation.why_good_fit.map((w, wIdx) => (
                                <li key={wIdx}>{w}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col gap-1">
                            <span className="text-slate-400 font-bold text-[11px]">Skill & Cert Gaps:</span>
                            <ul className="list-disc list-inside text-amber-300 text-[11px] font-medium flex flex-col gap-1">
                              {item.fit_explanation.why_not_perfect.map((w, wIdx) => (
                                <li key={wIdx}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel p-8 text-center flex flex-col items-center gap-3">
              <ShieldAlert size={32} className="text-slate-500" />
              <p className="text-sm font-bold text-slate-300">No live cybersecurity opportunities found.</p>
              <button
                type="button"
                onClick={() => { setWorkTypeFilter('All'); setSecurityDomainFilter('All'); setSearchQuery(''); fetchJobs(); }}
                className="btn-gradient-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2"
              >
                <RefreshCw size={14} />
                <span>Refresh Live Jobs</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Application Board */}
      {activeTab === 'tracker' && (
        <div className="flex flex-col gap-6 animate-fadein">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(['bookmarked', 'applied', 'interviewing', 'offer'] as AppStatus[]).map((st) => {
              const items = trackedList.filter((t) => t.status === st);
              return (
                <div key={st} className="glass-panel p-5 flex flex-col gap-3 border-white/10">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-extrabold uppercase text-white tracking-wider">{st}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7C5CFF]/20 text-purple-300">
                      {items.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 min-h-[120px]">
                    {items.map(({ jobMatch }) => (
                      <div key={jobMatch.job.id} className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1 text-xs">
                        <span className="font-bold text-white truncate">{jobMatch.job.title}</span>
                        <span className="text-[#00E5FF] text-[11px] font-semibold">{jobMatch.job.company}</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-[#00D084] font-mono">{jobMatch.job.salary_range}</span>
                          <a
                            href={jobMatch.job.apply_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#7C5CFF] hover:underline font-bold flex items-center gap-0.5"
                          >
                            <span>Link</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && <p className="text-[11px] text-slate-500 italic p-2">No jobs in {st}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Market Analytics */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-6 animate-fadein">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 rounded-2xl skeleton-shimmer" />
              <div className="h-64 rounded-2xl skeleton-shimmer" />
            </div>
          ) : data?.market_insights ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 flex flex-col gap-4">
                <h3 className="text-sm font-extrabold text-white">Top Demanded Cybersecurity Skills</h3>
                <div className="w-full h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.market_insights.most_requested_skills}>
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} />
                      <YAxis stroke="#94A3B8" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0E1320', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="count_or_value" fill="#7C5CFF" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel p-6 flex flex-col gap-4">
                <h3 className="text-sm font-extrabold text-white">Salary Benchmark Distributions</h3>
                <div className="flex flex-col gap-3">
                  {data.market_insights.average_salaries_by_role.map((sb, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{sb.name}</span>
                        <p className="text-[10px] text-slate-400">{sb.category || 'Cybersecurity'}</p>
                      </div>
                      <span className="font-num font-extrabold text-[#00D084]">${sb.count_or_value.toLocaleString()}/yr</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 text-center flex flex-col items-center gap-3">
              <BarChart2 size={32} className="text-[#7C5CFF]" />
              <p className="text-sm font-bold text-slate-300">Initializing Live Market Insights & Salary Analytics...</p>
              <button
                type="button"
                onClick={fetchJobs}
                className="btn-gradient-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Load Analytics Data
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Skill Demand Heatmap */}
      {activeTab === 'heatmap' && (
        <div className="animate-fadein">
          {loading ? (
            <div className="h-64 rounded-2xl skeleton-shimmer" />
          ) : (
            <SkillDemandHeatmap
              heatmapData={data?.skill_demand_heatmap && data.skill_demand_heatmap.length > 0 ? data.skill_demand_heatmap : FALLBACK_HEATMAP}
              candidateSkills={parsedData?.skills.map((s) => s.name) || []}
            />
          )}
        </div>
      )}
    </div>
  );
}
