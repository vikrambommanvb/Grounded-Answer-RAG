import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F8F5] text-[#171A21] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E5E5E0] shadow-sm p-6 space-y-4">
            <div className="w-8 h-8 bg-[#171A21] text-white flex items-center justify-center font-serif text-base font-bold">
              §
            </div>
            <div className="space-y-1">
              <h1 className="font-serif text-lg font-semibold text-[#171A21]">
                Application Notice
              </h1>
              <p className="text-xs text-[#555C68] leading-relaxed">
                A transient rendering error occurred while mounting the view. The policy intelligence engine remains fully operational.
              </p>
              {this.state.error?.message && (
                <div className="mt-2 p-2 bg-[#F8F8F5] border border-[#E5E5E0] font-mono text-[11px] text-[#8C1D18] break-all">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 bg-[#171A21] hover:bg-[#252A32] text-white text-xs font-semibold tracking-wide transition-colors"
              >
                Reload Application
              </button>
              <a
                href="/"
                className="px-4 py-2 bg-white border border-[#E5E5E0] text-[#171A21] text-xs font-medium hover:bg-[#F8F8F5] transition-colors"
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
