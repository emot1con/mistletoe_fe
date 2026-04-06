import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

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
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-bg-dark text-white p-6 text-center">
                    <div className="glass-card p-12 max-w-lg border-danger/30">
                        <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </div>
                        <h1 className="text-3xl font-heading font-bold mb-4">Something went wrong</h1>
                        <p className="text-text-muted mb-8 leading-relaxed">
                            The application encountered an unexpected error. This usually happens during rapid navigation or network instability.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => window.location.reload()}
                                className="btn btn-primary w-full"
                            >
                                Reload Application
                            </button>
                            <button 
                                onClick={() => this.setState({ hasError: false })}
                                className="btn btn-ghost w-full"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
