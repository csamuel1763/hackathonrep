import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, RefreshCw, Shield, ArrowRight } from 'lucide-react';
import { parseResume } from '../api/resume';
import { useResume } from '../context/ResumeContext';

export default function ResumeUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { setParsedData } = useResume();
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (fileToValidate: File) => {
    setUploadError(null);
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(fileToValidate.type)) {
      setUploadError('Please upload a PDF or DOCX file.');
      return;
    }
    if (fileToValidate.size > 10 * 1024 * 1024) {
      setUploadError('File size must be under 10MB.');
      return;
    }
    setFile(fileToValidate);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const data = await parseResume(file);
      setParsedData(data);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.response?.data?.detail || 'Failed to parse resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadError(null);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#7C5CFF]/15 to-[#00E5FF]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Branding */}
      <header className="flex flex-col items-center gap-3 mb-10 text-center z-10">
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 shadow-lg">
          <Shield size={18} className="text-[#00E5FF]" />
          <span className="text-xs font-extrabold tracking-wider text-slate-300 uppercase">CareerPilot AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D084]" />
          <span className="text-[10px] font-bold text-[#00E5FF] uppercase">Local Ollama LLM</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
          Upload Your Cybersecurity Resume
        </h1>
        <p className="text-slate-400 text-sm max-w-md">
          Neural parsing powered by local Ollama Llama 3.1 8B. Constructs your 10D Digital Twin in seconds.
        </p>
      </header>

      {/* Upload Container */}
      <main className="w-full max-w-xl z-10 flex flex-col gap-6">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center p-10 rounded-3xl border-2 border-dashed
            transition-all duration-300 backdrop-blur-xl bg-[#0C1222]/80 shadow-2xl
            ${
              dragActive
                ? 'border-[#00E5FF] bg-[#00E5FF]/5 scale-[1.01]'
                : 'border-white/15 hover:border-white/30 hover:bg-white/[0.02]'
            }
          `}
        >
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            disabled={isUploading}
          />

          {!file ? (
            <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#7C5CFF]/20 to-[#00E5FF]/20 border border-[#7C5CFF]/30 text-[#00E5FF] shadow-lg shadow-[#7C5CFF]/15">
                <Upload size={32} />
              </div>
              <div>
                <p className="font-extrabold text-base text-white">Drag & drop your resume file here</p>
                <p className="text-xs text-slate-400 mt-1">Supports PDF and DOCX files up to 10MB</p>
              </div>
              <span className="btn-gradient-primary px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#7C5CFF]/20 mt-2">
                Browse Files
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center z-30">
              <div className="p-4 rounded-2xl bg-[#00D084]/20 border border-[#00D084]/40 text-[#00D084] shadow-lg shadow-[#00D084]/15">
                <FileText size={32} />
              </div>
              <div>
                <p className="font-extrabold text-base text-white truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis</p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="btn-gradient-primary px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-lg shadow-[#7C5CFF]/30 flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Parsing Neural Data...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Resume</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {!isUploading && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    Change File
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {uploadError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-3 shadow-lg">
            <AlertCircle size={18} className="shrink-0 text-red-400" />
            <span className="flex-1">{uploadError}</span>
            <button
              type="button"
              onClick={handleReset}
              className="btn-gradient-primary px-3 py-1 rounded-lg text-[10px] font-bold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Footer info */}
        <p className="text-[11px] text-slate-400 text-center font-mono">
          Powered by Ollama Local LLM Runtime (llama3.1:8b) • Zero External Data Sharing
        </p>
      </main>
    </div>
  );
}
