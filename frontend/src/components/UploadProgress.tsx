import { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  sublabel: string;
}

const STEPS: Step[] = [
  { id: 1, label: 'Uploading file',     sublabel: 'Sending document to server…' },
  { id: 2, label: 'Extracting text',    sublabel: 'Reading PDF / DOCX content…'  },
  { id: 3, label: 'AI analysis',        sublabel: 'AI is parsing your skills…' },
  { id: 4, label: 'Building profile',   sublabel: 'Structuring your career data…' },
];

/** Milliseconds the UI spends on each intermediate step before advancing. */
const STEP_DURATION_MS = 2200;

interface UploadProgressProps {
  /** True once the real API call has resolved. */
  isDone: boolean;
}

export default function UploadProgress({ isDone }: UploadProgressProps) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (isDone) {
      setCurrentStep(STEPS.length);
      return;
    }

    // Advance through steps automatically while waiting for the API.
    const maxAutoStep = STEPS.length - 1; // hold on last "real" step until done
    if (currentStep >= maxAutoStep) return;

    const timer = setTimeout(() => {
      setCurrentStep((s) => Math.min(s + 1, maxAutoStep));
    }, STEP_DURATION_MS);

    return () => clearTimeout(timer);
  }, [currentStep, isDone]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <p className="text-lg font-semibold text-slate-200">
          {isDone ? 'Analysis complete!' : 'Analysing your resume…'}
        </p>
        <p className="text-sm text-slate-400 mt-1">
          {isDone ? 'Your career profile is ready.' : 'This usually takes 10 – 20 seconds.'}
        </p>
      </div>

      {/* Step list */}
      <ol className="flex flex-col gap-3">
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id || (isDone && step.id === STEPS.length);
          const isActive    = currentStep === step.id && !isCompleted;

          return (
            <li
              key={step.id}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-500
                ${isActive
                  ? 'border-indigo-500/50 bg-indigo-500/10'
                  : isCompleted
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-white/5 bg-white/[0.02] opacity-40'
                }
              `}
            >
              {/* Step indicator */}
              <div className={`
                shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                ${isCompleted ? 'bg-emerald-500/20' : isActive ? 'bg-indigo-500/20' : 'bg-white/5'}
              `}>
                {isCompleted ? (
                  <CheckCircle size={18} className="text-emerald-400" />
                ) : isActive ? (
                  <Loader2 size={18} className="text-indigo-400 animate-spin" />
                ) : (
                  <span className="text-xs font-bold text-slate-500">{step.id}</span>
                )}
              </div>

              {/* Labels */}
              <div>
                <p className={`text-sm font-medium ${
                  isCompleted ? 'text-emerald-300' : isActive ? 'text-slate-200' : 'text-slate-500'
                }`}>
                  {step.label}
                </p>
                {isActive && (
                  <p className="text-xs text-slate-400 mt-0.5">{step.sublabel}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
