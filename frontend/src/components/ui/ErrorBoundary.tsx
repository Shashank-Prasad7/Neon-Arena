import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
          <span className="material-symbols-outlined text-6xl text-primary mb-4 block">error_outline</span>
          <h2 className="font-headline text-2xl font-black uppercase italic text-white mb-2">Something went wrong</h2>
          <p className="text-zinc-500 text-sm mb-8 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="px-8 py-3 bg-primary text-on-primary-container font-headline font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_25px_rgba(114,220,255,0.4)] transition-all"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
