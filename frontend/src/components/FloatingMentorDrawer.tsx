import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, User, RefreshCw } from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { sendCareerMentorMessage } from '../api/resume';

interface FloatingMentorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isError?: boolean;
}

export const FloatingMentorDrawer: React.FC<FloatingMentorDrawerProps> = ({ isOpen, onClose }) => {
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
      text: `Hello ${name || 'there'}! I'm **CareerPilot AI**, your dedicated cybersecurity mentor (powered by local Ollama Llama 3.1 8B).\n\nAsk me anything about your readiness score, target role, recommended certifications, or learning roadmap!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    let timer: any;
    if (retryCountdown !== null && retryCountdown > 0) {
      timer = setTimeout(() => {
        setRetryCountdown(retryCountdown - 1);
      }, 1000);
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
        text: response.answer || response.reply || 'I am analyzing your career profile to optimize your pathway.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Failed to get AI mentor response', err);
      const is429 = err.response?.status === 429;
      let errorText = 'Sorry, I am having trouble connecting to the local AI engine. Please ensure Ollama is running.';

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

  const starterChips = [
    'How do I improve my ATS score?',
    'Which certification should I get next?',
    'What skills am I missing for this role?',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadein">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0D121F] border-l border-white/10 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-purple-900/40 to-indigo-900/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-sm">CareerPilot AI</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30">
                    Local AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Cybersecurity Assistant • Powered by Ollama</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1 ${
                      isUser
                        ? 'bg-purple-600 text-white'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {isUser ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
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
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                  <Bot size={14} />
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-xs flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin text-purple-400" />
                  <span>Ollama is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Starter Chips */}
          <div className="px-4 py-2 border-t border-white/5 bg-white/[0.01]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Suggested Questions</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {starterChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  disabled={isTyping || retryCountdown !== null}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Input */}
          <div className="p-4 border-t border-white/10 bg-[#0A0E17]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  retryCountdown !== null
                    ? `Rate limited. Please wait ${retryCountdown}s...`
                    : 'Ask CareerPilot AI...'
                }
                disabled={isTyping || retryCountdown !== null}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping || retryCountdown !== null}
                className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
