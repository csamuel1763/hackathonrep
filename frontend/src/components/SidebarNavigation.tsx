import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Target,
  BookOpen,
  Bot,
  Menu,
  X,
  RefreshCw,
  Download,
  User as UserIcon,
  Briefcase,
  Settings,
  LogOut,
} from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { useAuth } from '../context/AuthContext';
import { downloadCareerReport } from '../api/resume';

interface SidebarProps {
  onToggleMentor: () => void;
  isMentorOpen: boolean;
}

export const SidebarNavigation: React.FC<SidebarProps> = ({ onToggleMentor, isMentorOpen }) => {
  const { parsedData, targetRole, resetAll } = useResume();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleReset = () => {
    resetAll();
    navigate('/upload');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDownloadPdf = async () => {
    if (downloadingPdf) return;
    try {
      setDownloadingPdf(true);
      const roleIdToUse = targetRole?.id || 'soc_analyst_l2';
      const skillNames = parsedData?.skills.map((s) => s.name) || ['Network Security', 'SIEM', 'Splunk', 'Python', 'Incident Response'];
      const expTitles = parsedData?.experience.map((e) => e.title || '') || ['Cybersecurity Specialist'];
      const expDescs = parsedData?.experience.map((e) => e.description || '') || ['SIEM log analysis and threat investigation'];
      const expDurs = parsedData?.experience.map((e) => e.duration || '') || ['2 Years'];
      const eduDegrees = parsedData?.education.map((ed) => ed.degree || '') || ['B.S. Computer Science'];
      const certNames = parsedData?.certifications.map((c) => c.name || '') || ['CompTIA Security+'];

      const blob = await downloadCareerReport(
        roleIdToUse,
        skillNames,
        parsedData?.name || user?.name || 'Samuel Godson',
        parsedData?.email || user?.email || 'samuel@example.com',
        parsedData?.phone || '555-0199',
        parsedData?.summary || 'Dedicated cybersecurity specialist with hands-on SIEM, Python, and incident response experience.',
        expTitles,
        expDescs,
        expDurs,
        eduDegrees,
        certNames,
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CareerPilot_Report_${roleIdToUse}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF report:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Digital Twin', path: '/digital-twin', icon: UserIcon },
    { name: 'Career Analysis', path: '/career-analysis', icon: Target },
    { name: 'Marketplace', path: '/marketplace', icon: Briefcase },
    { name: 'Learning', path: '/learning-roadmap', icon: BookOpen },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0A0F19]/90 border-b border-white/[0.08] sticky top-0 z-40 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#9B5DE5] shadow-lg shadow-[#7C5CFF]/30">
            <Shield size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-white text-base tracking-tight">CareerPilot</span>
          <span className="text-[#00E5FF] font-black text-base tracking-tight">AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Premium Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50
          w-64 bg-[#0A0F19] border-r border-white/[0.08] flex flex-col justify-between
          transition-transform duration-300 ease-in-out shrink-0 select-none
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col gap-5 p-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#7C5CFF] via-[#9B5DE5] to-[#00E5FF] shadow-xl shadow-[#7C5CFF]/25">
                <Shield size={22} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-black text-white text-lg tracking-tight">CareerPilot</span>
                  <span className="text-[#00E5FF] font-black text-lg tracking-tight">AI</span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Cyber Intelligence OS</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3 truncate">
              <div className="w-8 h-8 rounded-full bg-[#7C5CFF]/20 border border-[#7C5CFF] flex items-center justify-center text-purple-300 font-bold text-xs shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'C'}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-extrabold text-white truncate">{user?.name || parsedData?.name || 'Cyber Specialist'}</span>
                <span className="text-[10px] text-slate-400 truncate">{user?.email || parsedData?.email || 'samuel@example.com'}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-[#7C5CFF]/20 to-[#9B5DE5]/10 text-white border border-[#7C5CFF]/40 shadow-lg shadow-[#7C5CFF]/15'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-[#7C5CFF] to-[#00E5FF] shadow-[0_0_8px_#7C5CFF]" />
                      )}
                      <Icon size={17} className={`transition-transform group-hover:scale-110 ${isActive ? 'text-[#00E5FF]' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="border-t border-white/[0.08] pt-4 flex flex-col gap-2">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              AI Tools & Actions
            </div>

            {/* AI Mentor Button with Local AI indicator badge */}
            <button
              type="button"
              onClick={() => {
                onToggleMentor();
                setMobileOpen(false);
              }}
              className={`
                flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border group cursor-pointer
                ${
                  isMentorOpen
                    ? 'bg-[#7C5CFF]/30 text-white border-[#7C5CFF]/60 shadow-lg shadow-[#7C5CFF]/25'
                    : 'bg-white/[0.03] text-purple-300 hover:bg-[#7C5CFF]/15 border-white/[0.08] hover:border-[#7C5CFF]/40'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Bot size={17} className="text-[#00E5FF] group-hover:rotate-12 transition-transform" />
                <span>AI Mentor</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] text-[9px] font-extrabold uppercase border border-[#00E5FF]/30">Local AI</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse shadow-[0_0_6px_#00D084]" />
            </button>

            {/* Export PDF Report */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all disabled:opacity-40 disabled:cursor-not-allowed group cursor-pointer"
            >
              {downloadingPdf ? (
                <RefreshCw size={17} className="animate-spin text-[#7C5CFF]" />
              ) : (
                <Download size={17} className="text-[#7C5CFF] group-hover:translate-y-0.5 transition-transform" />
              )}
              <span>Export Report</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#FF5C7A] hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all group cursor-pointer"
            >
              <LogOut size={17} className="text-[#FF5C7A] group-hover:scale-110 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Bottom Target Role Info & Reset */}
        <div className="p-4 border-t border-white/[0.08] bg-[#070B14]/60 flex flex-col gap-3">
          {targetRole ? (
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#7C5CFF]/10 to-[#00E5FF]/5 border border-[#7C5CFF]/20 flex flex-col gap-0.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Target Role</div>
              <div className="font-extrabold text-xs text-[#00E5FF] truncate">{targetRole.name}</div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
              Target Role: <span className="text-[#00E5FF] font-bold">SOC Analyst L2</span>
            </div>
          )}

          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-[#FF5C7A] border border-red-500/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Upload New Resume</span>
          </button>
        </div>
      </aside>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadein">
          <div className="bg-[#0E1320] border border-white/10 rounded-2xl p-6 max-w-md w-full flex flex-col gap-5 shadow-2xl shadow-[#7C5CFF]/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Settings size={18} className="text-[#7C5CFF]" /> Platform Preferences
              </h3>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
                <span className="font-bold text-white">AI Neural Provider Engine</span>
                <p className="text-slate-400">Powered by Ollama • Local LLM Runtime (llama3.1:8b)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
                <span className="font-bold text-white">Target Career Path</span>
                <p className="text-[#00E5FF] font-bold">{targetRole?.name || 'SOC Analyst L2'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
                <span className="font-bold text-white">Candidate Account</span>
                <p className="text-slate-300">{user?.name || parsedData?.name || 'Candidate'} ({user?.email || parsedData?.email || 'N/A'})</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="w-full py-3 rounded-xl btn-gradient-primary font-bold text-xs transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
