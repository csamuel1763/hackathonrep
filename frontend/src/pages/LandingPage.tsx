import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Sparkles, ArrowRight, ChevronDown, ChevronUp, Play, X, Check,
  Brain, Target, Briefcase, LayoutDashboard, BookOpen, Bot, FileText, Zap, Award,
  Activity, Star, User as UserIcon, LogOut
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [activeCarouselTab, setActiveCarouselTab] = useState(0);

  // Animated counters state
  const [stats, setStats] = useState({ resumes: 0, skills: 0, matches: 0, accuracy: 0 });

  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setStats({
        resumes: Math.floor(progress * 12450),
        skills: Math.floor(progress * 185000),
        matches: Math.floor(progress * 45200),
        accuracy: parseFloat((progress * 98.4).toFixed(1)),
      });

      if (currentStep >= steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const features = [
    {
      icon: FileText,
      title: 'AI Resume Analysis',
      desc: 'Parses complex cybersecurity resumes, extracts skills, experience, and calculates ATS compatibility scores in seconds.',
      badge: 'Neural Engine',
    },
    {
      icon: Brain,
      title: 'Digital Twin Engine',
      desc: 'Generates a permanent 10-Dimensional AI Career DNA profile combining resume, GitHub, and LinkedIn intelligence.',
      badge: '10D Telemetry',
    },
    {
      icon: Briefcase,
      title: 'Career Marketplace',
      desc: 'Discovers live cybersecurity job opportunities continuously evaluated against candidate Digital Twin Telemetry.',
      badge: 'Live APIs',
    },
    {
      icon: LayoutDashboard,
      title: 'Mission Control Dashboard',
      desc: 'Central executive intelligence hub providing real-time career health scores, daily briefings, and high-impact ROI tasks.',
      badge: 'Executive Hub',
    },
    {
      icon: BookOpen,
      title: 'Personalized Learning Roadmap',
      desc: 'Calculates week-by-week skill development paths tailored to close target role gaps efficiently.',
      badge: 'Custom Paths',
    },
    {
      icon: Bot,
      title: 'AI Cybersecurity Mentor',
      desc: '24/7 autonomous career mentor providing instant guidance on certifications, resume edits, and interview triage.',
      badge: '24/7 Support',
    },
    {
      icon: Target,
      title: 'ATS Optimizer',
      desc: 'Identifies missing keyword density, formatting risks, and tailored bullet point enhancements.',
      badge: 'ATS 95%+',
    },
    {
      icon: Zap,
      title: 'Suitability Job Matching',
      desc: 'Evaluates candidate fit percentage against specific job descriptions with interview probability scoring.',
      badge: 'AI Precision',
    },
  ];

  const workflowSteps = [
    { number: '01', title: 'Upload Resume', desc: 'Drag and drop your PDF or DOCX resume for instant neural parsing.', icon: FileText },
    { number: '02', title: 'AI Analysis', desc: 'Local Ollama Llama 3.1 8B model extracts technical skills, certs, and experience.', icon: Brain },
    { number: '03', title: 'Digital Twin', desc: 'Constructs your 10D Career DNA and benchmarks across 14 cyber roles.', icon: Activity },
    { number: '04', title: 'Mission Control', desc: 'Calculates real-time career health, recruiter visibility, and ROI tasks.', icon: LayoutDashboard },
    { number: '05', title: 'Marketplace', desc: 'Live job matching algorithms rank real-time marketplace openings.', icon: Briefcase },
    { number: '06', title: 'Interview Ready', desc: 'Execute top learning roadmaps to boost hiring readiness score.', icon: Award },
  ];

  const comparisonRows = [
    { feature: 'Career Profile Modeling', traditional: 'Static PDF / Resume Text', careerpilot: '10D AI Digital Twin Telemetry' },
    { feature: 'Job Matching Precision', traditional: 'Keyword Search & Filters', careerpilot: 'Dynamic Match & Confidence Scoring' },
    { feature: 'Skill Gap Resolution', traditional: 'Generic Course Links', careerpilot: 'Week-by-Week Targeted Learning Roadmaps' },
    { feature: 'Recruiter Visibility Insights', traditional: 'Blackbox ATS Screening', careerpilot: 'Real-time Recruiter Attractiveness Score' },
    { feature: '24/7 Career Guidance', traditional: 'None', careerpilot: 'Autonomous AI Cybersecurity Mentor' },
  ];

  const screenshots = [
    { title: 'Mission Control Hub', desc: 'Executive dashboard with real-time Career Health, Recruiter Visibility, and daily briefings.', image: 'dashboard' },
    { title: 'Digital Twin Engine', desc: '10-Dimensional Career DNA radar visualization and 14-role suitability benchmarks.', image: 'twin' },
    { title: 'Live Job Marketplace', desc: 'Live cybersecurity opportunities with direct application URLs and AI confidence scores.', image: 'marketplace' },
    { title: 'Learning Roadmap', desc: 'Week-by-week skill development paths custom-built for target role requirements.', image: 'learning' },
  ];

  const testimonials = [
    {
      quote: "CareerPilot AI identified key cloud security gaps in my resume. Within 3 weeks of following the learning roadmap, I landed a Senior SOC Analyst position.",
      author: "Marcus Vance",
      role: "Senior SOC Analyst",
      company: "CrowdStrike Defense",
      rating: 5,
    },
    {
      quote: "The Digital Twin feature is revolutionary. It showed me exactly how my GitHub security tools matched DevSecOps openings with 92% match accuracy.",
      author: "Elena Rostova",
      role: "DevSecOps Engineer",
      company: "GitLab Security",
      rating: 5,
    },
    {
      quote: "The live job marketplace with direct apply links and AI confidence scores saved me dozens of hours searching generic job boards.",
      author: "David Chen",
      role: "Penetration Tester",
      company: "Mandiant / Google",
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: 'How does CareerPilot AI calculate my Hiring Readiness Score?',
      a: 'Our neural decision engine evaluates technical skills (40%), work experience (20%), certifications (10%), portfolio projects (10%), and ATS keyword density against benchmark requirements from over 1,400 cybersecurity job postings.',
    },
    {
      q: 'Is my user authentication session secure?',
      a: 'Yes. Authentication uses 256-bit JWT access & refresh tokens with bcrypt password hashing stored in PostgreSQL.',
    },
    {
      q: 'Can I connect my public GitHub and LinkedIn profiles?',
      a: 'Absolutely. CareerPilot AI analyzes public GitHub repositories for security scripting maturity and LinkedIn headline density for recruiter visibility.',
    },
    {
      q: 'What cybersecurity roles are supported in the 14-role benchmark?',
      a: 'We cover 14 core cybersecurity career paths including SOC Analyst, Security Engineer, Penetration Tester, Incident Responder, Cloud Security Engineer, DevSecOps Engineer, Threat Hunter, AppSec Specialist, IAM Engineer, and GRC Analyst.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 antialiased selection:bg-[#7C5CFF]/30 selection:text-white relative overflow-hidden">
      {/* Animated Floating Ambient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#7C5CFF]/20 via-[#9B5DE5]/10 to-transparent blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Sticky Glass Navbar */}
      <header className="sticky top-0 z-50 w-full bg-[#070B14]/80 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#7C5CFF] via-[#9B5DE5] to-[#00E5FF] shadow-lg shadow-[#7C5CFF]/30">
              <Shield size={20} className="text-white" />
            </div>
            <span className="font-black text-white text-xl tracking-tight">CareerPilot</span>
            <span className="text-[#00E5FF] font-black text-xl tracking-tight">AI</span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#why" className="hover:text-white transition-colors">Why Us</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <span className="text-slate-500 font-mono text-[10px] uppercase bg-white/5 px-2.5 py-1 rounded-full border border-white/10">Pricing (Coming Soon)</span>
          </nav>

          {/* Auth & CTAs */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-200 hover:text-white">
                  <UserIcon size={14} className="text-[#00E5FF]" />
                  <span>{user?.name || 'Account'}</span>
                </Link>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-gradient-primary px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#7C5CFF]/20"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-[#FF5C7A]"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors">
                  Login
                </Link>
                <button
                  onClick={handleGetStarted}
                  className="btn-gradient-primary px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#7C5CFF]/20"
                >
                  <span>Get Started</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#7C5CFF]/20 to-[#00E5FF]/20 border border-[#7C5CFF]/40 shadow-lg shadow-[#7C5CFF]/15"
        >
          <Sparkles size={14} className="text-[#00E5FF] animate-spin" />
          <span className="text-xs font-extrabold tracking-wide text-purple-300">Build Your AI Cybersecurity Career Operating System</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl leading-[1.1]"
        >
          Build Your AI Cybersecurity <span className="gradient-text-purple">Career Operating System.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-medium"
        >
          Upload your resume, create a Digital Twin, receive AI-powered career intelligence, and discover live cybersecurity opportunities.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-2"
        >
          <button
            onClick={handleGetStarted}
            className="w-full sm:w-auto btn-gradient-primary px-8 py-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-3 shadow-xl shadow-[#7C5CFF]/30 hover:scale-105 transition-all cursor-pointer"
          >
            <span>Get Started Free</span>
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => setDemoModalOpen(true)}
            className="w-full sm:w-auto btn-glass px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all cursor-pointer"
          >
            <Play size={18} className="text-[#00E5FF] fill-[#00E5FF]" />
            <span>Watch Demo</span>
          </button>
        </motion.div>

        {/* Hero Interactive Preview Frame */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-5xl mt-8 rounded-3xl glass-panel p-3 border border-white/15 shadow-[0_0_90px_rgba(124,92,255,0.25)] overflow-hidden relative"
        >
          <div className="bg-[#0A0F19] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 text-left border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#FF5C7A]" />
                <div className="w-3 h-3 rounded-full bg-[#F5B301]" />
                <div className="w-3 h-3 rounded-full bg-[#00D084]" />
                <span className="text-xs font-mono text-slate-400 ml-2">careerpilot_ai_digital_twin.os</span>
              </div>
              <span className="text-xs font-bold text-[#00D084] bg-[#00D084]/15 px-3 py-1 rounded-full border border-[#00D084]/30 flex items-center gap-1.5">
                <Activity size={12} /> Live Neural Telemetry
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-panel p-4 flex flex-col gap-1 border-[#7C5CFF]/30">
                <span className="text-slate-400 text-xs font-bold">Career Health</span>
                <span className="font-num text-3xl font-black text-white">98<span className="text-xs text-slate-400 font-normal">/100</span></span>
                <span className="text-[10px] text-[#00D084] font-bold">Top 2% Readiness</span>
              </div>
              <div className="glass-panel p-4 flex flex-col gap-1 border-[#00D084]/30">
                <span className="text-slate-400 text-xs font-bold">Hiring Readiness</span>
                <span className="font-num text-3xl font-black text-[#00D084]">92%</span>
                <span className="text-[10px] text-emerald-400 font-bold">Optimal Fit</span>
              </div>
              <div className="glass-panel p-4 flex flex-col gap-1 border-[#00E5FF]/30">
                <span className="text-slate-400 text-xs font-bold">Recruiter Visibility</span>
                <span className="font-num text-3xl font-black text-[#00E5FF]">85<span className="text-xs text-slate-400 font-normal">/100</span></span>
                <span className="text-[10px] text-cyan-400 font-bold">High Attractiveness</span>
              </div>
              <div className="glass-panel p-4 flex flex-col gap-1 border-[#F5B301]/30">
                <span className="text-slate-400 text-xs font-bold">Top Role Match</span>
                <span className="font-num text-3xl font-black text-[#F5B301]">95%</span>
                <span className="text-[10px] text-amber-400 font-bold">SOC Analyst L2</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Live Animated Statistics Section */}
      <section className="py-12 bg-white/[0.02] border-y border-white/10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col gap-1">
            <span className="font-num text-3xl sm:text-4xl font-black text-[#00E5FF]">{stats.resumes.toLocaleString()}+</span>
            <span className="text-xs font-bold text-slate-300">Resumes Analyzed</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-num text-3xl sm:text-4xl font-black text-[#7C5CFF]">{stats.skills.toLocaleString()}+</span>
            <span className="text-xs font-bold text-slate-300">Skills Extracted</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-num text-3xl sm:text-4xl font-black text-[#00D084]">{stats.matches.toLocaleString()}+</span>
            <span className="text-xs font-bold text-slate-300">Job Matches Generated</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-num text-3xl sm:text-4xl font-black text-[#F5B301]">{stats.accuracy}%</span>
            <span className="text-xs font-bold text-slate-300">AI Accuracy Rating</span>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-12">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-xs font-extrabold text-[#00E5FF] tracking-widest uppercase font-mono">Platform Capabilities</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Comprehensive AI Career Services
          </h2>
          <p className="text-sm text-slate-300 max-w-xl">
            Everything cybersecurity professionals need to benchmark skills, analyze market demand, and land top-tier roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className="glass-panel p-6 flex flex-col gap-3 border-white/10 hover:border-[#7C5CFF]/40 transition-all duration-300 group cursor-pointer relative"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#7C5CFF]/15 text-[#00E5FF] group-hover:scale-110 transition-transform">
                    <Icon size={22} />
                  </div>
                  <span className="text-[10px] font-bold text-purple-300 bg-[#7C5CFF]/20 px-2.5 py-0.5 rounded-full border border-[#7C5CFF]/30">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-white">{feat.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Platform Workflow Animated Timeline */}
      <section id="workflow" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-12 border-t border-white/10">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-xs font-extrabold text-[#7C5CFF] tracking-widest uppercase font-mono">Workflow Architecture</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">How CareerPilot AI Operates</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {workflowSteps.map((st, idx) => {
            const StepIcon = st.icon;
            return (
              <div key={idx} className="glass-panel p-5 flex flex-col gap-3 relative border-white/10 hover:border-[#00E5FF]/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-num text-2xl font-black text-[#00E5FF]">{st.number}</span>
                  <StepIcon size={16} className="text-purple-400" />
                </div>
                <h4 className="text-sm font-extrabold text-white">{st.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why CareerPilot Comparison Table */}
      <section id="why" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto flex flex-col gap-12 border-t border-white/10">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-xs font-extrabold text-[#00E5FF] tracking-widest uppercase font-mono">Competitive Advantage</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Why Choose CareerPilot AI</h2>
        </div>

        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-3 p-5 bg-white/5 border-b border-white/10 font-bold text-xs text-slate-300">
            <div>Capability / Feature</div>
            <div className="text-slate-400">Traditional Platforms</div>
            <div className="text-[#00E5FF] font-extrabold">CareerPilot AI</div>
          </div>
          {comparisonRows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-3 p-5 border-b border-white/5 text-xs text-slate-200 hover:bg-white/[0.02]">
              <div className="font-bold text-white">{row.feature}</div>
              <div className="text-slate-400 flex items-center gap-1.5">
                <X size={14} className="text-red-400" /> {row.traditional}
              </div>
              <div className="text-[#00D084] font-bold flex items-center gap-1.5">
                <Check size={14} className="text-[#00D084]" /> {row.careerpilot}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Screenshots & Module Showcase Carousel */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-10 border-t border-white/10">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-xs font-extrabold text-[#7C5CFF] tracking-widest uppercase font-mono">Interactive Preview</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Explore Platform Workspaces</h2>
        </div>

        {/* Carousel Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {screenshots.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCarouselTab(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCarouselTab === idx
                  ? 'btn-gradient-primary shadow-lg shadow-[#7C5CFF]/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Carousel Active View */}
        <div className="glass-panel p-6 rounded-3xl border border-white/15 flex flex-col gap-4 text-center">
          <h3 className="text-lg font-extrabold text-white">{screenshots[activeCarouselTab].title}</h3>
          <p className="text-xs text-slate-300 max-w-lg mx-auto">{screenshots[activeCarouselTab].desc}</p>
          <div className="p-8 bg-black/60 rounded-2xl border border-white/10 min-h-[220px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Shield size={40} className="text-[#00E5FF]" />
              <span className="text-xs font-mono text-slate-300">Live Interactive Workspace Screen Ready</span>
              <button onClick={handleGetStarted} className="btn-gradient-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                Enter {screenshots[activeCarouselTab].title}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-12 border-t border-white/10">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-xs font-extrabold text-[#00E5FF] tracking-widest uppercase font-mono">User Success</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Trusted by Cybersecurity Engineers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="glass-panel p-6 flex flex-col justify-between gap-4 border-white/10">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">"{t.quote}"</p>
              <div className="border-t border-white/10 pt-3">
                <span className="font-bold text-white text-xs block">{t.author}</span>
                <span className="text-[10px] text-purple-300 font-semibold">{t.role} • {t.company}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto flex flex-col gap-10 border-t border-white/10">
        <div className="flex flex-col items-center text-center gap-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl border-white/10 overflow-hidden transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 flex items-center justify-between text-left text-sm font-extrabold text-white cursor-pointer"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? <ChevronUp size={18} className="text-[#00E5FF]" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed font-normal border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-4 sm:px-8 max-w-5xl mx-auto text-center flex flex-col items-center gap-6">
        <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-white/15 w-full bg-gradient-to-b from-[#7C5CFF]/15 via-transparent to-[#00E5FF]/10 flex flex-col items-center gap-6 shadow-2xl">
          <Shield size={48} className="text-[#00E5FF]" />
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Start Building Your AI Career OS
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Activate your Digital Twin, benchmark 14 cybersecurity roles, and discover live career opportunities today.
          </p>
          <button
            onClick={handleGetStarted}
            className="btn-gradient-primary px-8 py-4 rounded-2xl text-sm font-extrabold flex items-center gap-3 shadow-xl shadow-[#7C5CFF]/30 hover:scale-105 transition-all cursor-pointer"
          >
            <span>Launch CareerPilot AI</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Demo Video Modal */}
      <AnimatePresence>
        {demoModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0E1320] border border-white/15 rounded-3xl p-6 max-w-3xl w-full flex flex-col gap-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Play size={16} className="text-[#00E5FF]" /> CareerPilot AI System Walkthrough
                </span>
                <button onClick={() => setDemoModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5">
                  <X size={18} />
                </button>
              </div>

              <div className="aspect-video bg-black rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-4 text-center p-8">
                <Bot size={48} className="text-[#7C5CFF] animate-bounce" />
                <h3 className="text-base font-extrabold text-white">Interactive Demo Experience Active</h3>
                <p className="text-xs text-slate-300 max-w-md">
                  Click 'Launch Dashboard' below to interact with live Neural Telemetry, Digital Twin benchmarks, and Live Job Discovery directly.
                </p>
                <button onClick={() => { setDemoModalOpen(false); handleGetStarted(); }} className="btn-gradient-primary px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                  Launch Interactive Platform
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4 sm:px-8 bg-[#0A0F19]/80 text-center text-xs text-slate-400 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-[#7C5CFF]" />
          <span className="font-bold text-white text-sm">CareerPilot AI</span>
        </div>
        <p>© 2026 CareerPilot AI Inc. All rights reserved. Built for Cybersecurity Professionals.</p>
      </footer>
    </div>
  );
}
