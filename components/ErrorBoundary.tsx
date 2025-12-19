import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-cyber-text p-8 bg-cyber-dark border border-cyber-accent/20 rounded-xl m-4 animate-fade-in">
          <AlertTriangle className="w-16 h-16 text-cyber-accent mb-4 animate-pulse" />
          <h2 className="text-xl font-bold font-mono text-cyber-accent mb-2">SYSTEM FAILURE</h2>
          <p className="text-cyber-dim text-center max-w-md mb-6 font-mono text-sm">
            Critical rendering error detected. The uploaded dataset might contain corrupted sectors or unexpected data types.
          </p>
          <div className="bg-black/50 p-4 rounded border border-cyber-border w-full max-w-lg overflow-auto mb-6 shadow-inner">
            <code className="text-xs text-red-400 font-mono break-all">
              {this.state.error?.message}
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-2 bg-cyber-accent/20 border border-cyber-accent text-cyber-accent hover:bg-cyber-accent/10 rounded font-mono text-sm transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]"
          >
            <RefreshCw className="w-4 h-4" />
            REBOOT SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}