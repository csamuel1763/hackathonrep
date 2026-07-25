import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSent(true);
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
        <h1 className="text-3xl font-black text-white tracking-tight mt-2">Reset Password</h1>
        <p className="text-xs text-slate-400">Enter your registered email address to receive password reset instructions</p>
      </div>

      {/* Forgot Password Glass Form */}
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
        {sent ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3.5 rounded-full bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/30">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-extrabold text-white">Reset Link Sent</h3>
            <p className="text-xs text-slate-300">
              We have sent password recovery instructions to <span className="text-[#00E5FF] font-bold">{email}</span>.
            </p>
            <Link
              to="/login"
              className="mt-4 btn-gradient-primary px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

            <button
              type="submit"
              className="w-full mt-2 btn-gradient-primary py-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[#7C5CFF]/20 transition-all cursor-pointer"
            >
              <span>Send Reset Instructions</span>
              <ArrowRight size={16} />
            </button>

            <div className="mt-4 text-center text-xs text-slate-400">
              Remembered your password?{' '}
              <Link to="/login" className="text-[#00E5FF] font-bold hover:underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
