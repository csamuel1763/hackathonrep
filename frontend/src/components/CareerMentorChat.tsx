import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, MessageSquare } from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { sendCareerMentorMessage } from '../api/resume';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isError?: boolean;
}

const STARTER_CHIPS = [
  'How can I improve my cybersecurity readiness score?',
  'What technical certifications will increase my salary?',
  'What are the key skill gaps in my resume for this role?',
  'How do I tailor my GitHub portfolio for recruiters?',
];

export const CareerMentorChat: React.FC = () => {
  const { parsedData, targetRole } = useResume();
  const name = parsedData?.name || '';
  const roleId = targetRole?.id || 'soc_analyst_l2';

  const skillNames = parsedData?.skills.map((s) => s.name) || [];
  const expTitles = parsedData?.experience.map((e) => e.title || '') || [];
  const expDescriptions = parsedData?.experience.map((e) => e.description || '') || [];
  const expDurations = parsedData?.experience.map((e) => e.duration || '') || [];
  const eduDegrees = parsedData?.education.map((ed) => ed.degree || '') || [];
  const certNames = parsedData?.certifications.map((c) => c.name || '') || [];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${name || 'there'}! I'm **CareerPilot AI**, your autonomous cybersecurity career mentor (powered by local Ollama Llama 3.1 8B).\n\nI've analyzed your resume telemetry against **${targetRole?.name || 'SOC Analyst L2'}**. How can I assist your career progression today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    let timer: any;
    if (retryCountdown !== null && retryCountdown > 0) {
      timer = setTimeout(() => setRetryCountdown(retryCountdown - 1), 1000);
    } else if (retryCountdown === 0) {
      setRetryCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [retryCountdown]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || inputValue;
    if (!textToSend.trim() || isTyping || retryCountdown !== null) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setInputValue('');
    setIsTyping(true);

    try {
      const response = await sendCareerMentorMessage(
        textToSend,
        roleId,
        skillNames,
        name,
        parsedData?.email || '',
        parsedData?.phone || '',
        parsedData?.summary || '',
        expTitles,
        expDescriptions,
        expDurations,
        eduDegrees,
        certNames,
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.answer || response.reply || 'Analysis complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Failed to get AI mentor response', err);
      const is429 = err.response?.status === 429;
      let errorText = 'Local AI engine is unavailable. Please start Ollama and try again.';

      if (is429) {
        errorText = 'Rate limit reached. Please wait 10 seconds before retrying.';
        setRetryCountdown(10);
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 animate-fadein flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 text-[#00E5FF]">
          <MessageSquare size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">💬 AI Career Mentor</span>
          <span className="px-1.5 py-0.5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] text-[9px] font-extrabold uppercase border border-[#00E5FF]/30">Local AI</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
          <Sparkles size={11} /> Powered by Ollama (llama3.1:8b)
        </span>
      </div>

      {/* Starter Question Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {STARTER_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(chip)}
            disabled={isTyping || retryCountdown !== null}
            className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-slate-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="max-h-96 min-h-[220px] overflow-y-auto pr-2 space-y-4 no-scrollbar flex flex-col">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}
              >
                {isUser ? <User size={15} /> : <Bot size={15} />}
              </div>

              <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                      : msg.isError
                      ? 'bg-red-500/10 border border-red-500/30 text-red-300 rounded-tl-none'
                      : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-xs font-bold shrink-0">
              <Bot size={15} />
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-xs flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin text-purple-400" />
              <span>Ollama is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-white/10"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            retryCountdown !== null
              ? `Rate limited. Please wait ${retryCountdown}s...`
              : 'Ask CareerPilot AI a question...'
          }
          disabled={isTyping || retryCountdown !== null}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping || retryCountdown !== null}
          className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default CareerMentorChat;
