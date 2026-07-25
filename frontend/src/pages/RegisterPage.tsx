import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await register(fullName.trim(), email.trim(), password.trim());
      setSuccessMsg('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string } } };
      const message = errorObj?.response?.data?.detail || 'Registration failed. Email may already be in use.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 selection:bg-[#7C5CFF]/30 selection:text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#7C5CFF]/20 via-[#9B5DE5]/10 to-[#00E5FF]/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Brand Header */}
      <div className="flex flex-col items-center gap-3 mb-8 text-center">
        <Link to="/" className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-[#7C5CFF]/15 to-[#00E5FF]/10 border border-[#7C5CFF]/30 shadow-lg">
          <Shield size={20} className="text-[#00E5FF]" />
          <span className="text-sm font-black text-white">CareerPilot <span className="text-[#00E5FF]">AI</span></span>
        </Link>
        <h1 className="text-3xl font-black text-white tracking-tight mt-2">Create Your AI Career OS Account</h1>
        <p className="text-xs text-slate-400">Join over 12,000+ cybersecurity specialists building their Digital Twin</p>
      </div>

      {/* Register Glass Panel Form */}
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#00D084]/10 border border-[#00D084]/20 text-xs text-[#00D084]">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Full Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Full Name</label>
            <div className="relative flex items-center">
              <UserIcon size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Samuel Godson"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#7C5CFF] transition-all"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="samuel@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#7C5CFF] transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Password</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#7C5CFF] transition-all"
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Confirm Password</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#7C5CFF] transition-all"
              />
            </div>
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 btn-gradient-primary py-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[#7C5CFF]/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Already have an account link */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#00E5FF] font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
