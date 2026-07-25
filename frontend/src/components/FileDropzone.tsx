import { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];
const MAX_SIZE_MB = 10;

function validateFile(file: File): string | null {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(ext) && !ACCEPTED_TYPES.includes(file.type)) {
    return `Unsupported file type "${ext}". Only PDF and DOCX are accepted.`;
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `File is too large. Maximum size is ${MAX_SIZE_MB} MB.`;
  }
  return null;
}

export default function FileDropzone({ onFileSelected, disabled = false }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    onFileSelected(file);
  }, [onFileSelected]);

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [disabled, handleFile]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="w-full">
      <div
        className={`
          relative flex flex-col items-center justify-center
          w-full min-h-[280px] rounded-2xl border-2 border-dashed
          transition-all duration-300 cursor-pointer select-none
          ${isDragging
            ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
            : 'border-indigo-500/40 bg-white/[0.03] hover:border-indigo-400/70 hover:bg-white/[0.05]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        aria-label="Upload resume file"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
      >
        {/* Animated background glow on drag */}
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl bg-violet-500/5 animate-pulse" />
        )}

        <div className="relative flex flex-col items-center gap-4 p-8 text-center">
          {/* Icon */}
          <div className={`
            p-4 rounded-full transition-all duration-300
            ${isDragging ? 'bg-violet-500/20' : 'bg-indigo-500/10'}
          `}>
            <UploadCloud
              size={40}
              className={`transition-colors duration-300 ${isDragging ? 'text-violet-400' : 'text-indigo-400'}`}
            />
          </div>

          {/* Text */}
          <div>
            <p className="text-lg font-semibold text-slate-200">
              {isDragging ? 'Drop your resume here' : 'Drag & drop your resume'}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              or{' '}
              <span className="text-indigo-400 underline underline-offset-2">
                click to browse
              </span>
            </p>
          </div>

          {/* File specs */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <FileText size={13} className="text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">PDF</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <FileText size={13} className="text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">DOCX</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Max {MAX_SIZE_MB} MB</span>
            </div>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={onInputChange}
          disabled={disabled}
          aria-hidden="true"
        />
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="mt-3 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{validationError}</p>
        </div>
      )}
    </div>
  );
}
