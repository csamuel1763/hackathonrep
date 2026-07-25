import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, ShieldCheck, LogOut, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col gap-8 animate-fadein">
      {/* Header Banner */}
      <div className="glass-hero p-6 sm:p-8 flex items-center justify-between flex-wrap gap-4 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#7C5CFF]/20 border-2 border-[#7C5CFF] flex items-center justify-center text-purple-300 font-bold text-xl">
            {user?.name?.[0]?.toUpperCase() || 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{user?.name || 'Cybersecurity Specialist'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00D084]/15 text-[#00D084] border border-[#00D084]/30 flex items-center gap-1">
                <ShieldCheck size={12} /> Verified JWT Session
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-2 mt-1">
              <Mail size={13} className="text-slate-400" />
              <span>{user?.email || 'samuel@example.com'}</span>
              <span className="text-slate-500">•</span>
              <Shield size={13} className="text-[#00E5FF]" />
              <span>{user?.role || 'SOC Analyst Candidate'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-glass px-5 py-2.5 rounded-xl text-xs font-bold text-[#FF5C7A] hover:bg-red-500/20 border-red-500/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* User Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 flex flex-col gap-4 border border-white/10">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <User size={16} className="text-[#00E5FF]" /> Account Profile Information
          </h3>
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400 font-bold">User ID</span>
              <span className="font-mono text-slate-200">{user?.id || 'usr_demo_01'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400 font-bold">Full Name</span>
              <span className="text-white font-bold">{user?.name || 'Samuel Godson'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400 font-bold">Email Address</span>
              <span className="text-slate-200">{user?.email || 'samuel@example.com'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400 font-bold">Authentication Provider</span>
              <span className="text-[#00E5FF] font-bold uppercase">{user?.provider || 'JWT Email'}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-4 border border-white/10">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Key size={16} className="text-[#7C5CFF]" /> Security & Session Telemetry
          </h3>
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400 font-bold">Password Hash</span>
              <span className="font-mono text-slate-400">bcrypt (256-bit salt)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400 font-bold">JWT Token Expiry</span>
              <span className="text-slate-200 font-mono">7 Days (HS256)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400 font-bold">Session Status</span>
              <span className="text-[#00D084] font-bold">Active & Authenticated</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400 font-bold">Data Privacy</span>
              <span className="text-slate-300">Encrypted Local Session</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
