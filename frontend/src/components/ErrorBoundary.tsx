import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Shield, AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CareerPilot AI Render Error]', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-6 text-white text-center selection:bg-[#7C5CFF]/30">
          <div className="glass-panel p-8 sm:p-10 max-w-lg w-full rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-5">
            <div className="p-4 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle size={36} />
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C5CFF]/15 border border-[#7C5CFF]/30">
              <Shield size={16} className="text-[#00E5FF]" />
              <span className="text-xs font-bold text-purple-300">Cyber Intelligence OS Guard</span>
            </div>

            <h2 className="text-2xl font-black text-white">Application Exception Caught</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-black/50 p-3 rounded-xl border border-white/10 w-full text-left overflow-x-auto">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full btn-gradient-primary py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} />
                <span>Reload Application</span>
              </button>
              <a
                href="/dashboard"
                className="w-full btn-glass py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-slate-200"
              >
                <LayoutDashboard size={14} className="text-[#00E5FF]" />
                <span>Direct Workspace</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
