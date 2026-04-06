import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mistletoeApi } from '../api/endpoints';
import type { UserRepository } from '../types';
import { PageLoader } from '../components/ui/Loader';
import { GitBranch, Activity, PlaySquare, ArrowRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
    const [repos, setRepos] = useState<UserRepository[]>([]);
    const [analysisCount, setAnalysisCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setIsLoading(true);
        setError(null);

        Promise.all([
            mistletoeApi.getSelectedRepos(),
            mistletoeApi.getAnalysisCount()
        ])
            .then(([reposData, countData]: [any, any]) => {
                if (controller.signal.aborted) return;
                setRepos(reposData || []);
                setAnalysisCount(countData);
            })
            .catch((err: any) => {
                if (controller.signal.aborted) return;
                console.error("Failed to load dashboard data", err);
                setError("Failed to load dashboard data. Please try again later.");
            })
            .finally(() => {
                if (controller.signal.aborted) return;
                setIsLoading(false);
            });

        return () => controller.abort();
    }, []);

    if (isLoading) return <PageLoader />;

    if (error) {
        return (
            <div className="glass-card p-12 text-center border-danger/20">
                <h3 className="text-danger font-bold text-lg mb-2">Error</h3>
                <p className="text-text-muted mb-6">{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="btn btn-ghost"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-heading font-bold mb-2">Welcome back!</h1>
                <p className="text-text-muted">Here is what is happening with your repositories today.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-primary/20 text-primary rounded-xl">
                            <GitBranch size={24} />
                        </div>
                    </div>
                    <h3 className="text-text-muted text-sm font-medium mb-1">Active Repositories</h3>
                    <p className="text-3xl font-heading font-bold">{repos.length}</p>
                </div>
                
                <div className="glass-card p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-accent/20 text-accent rounded-xl">
                            <Activity size={24} />
                        </div>
                    </div>
                    <h3 className="text-text-muted text-sm font-medium mb-1">Total Analyses</h3>
                    <p className="text-3xl font-heading font-bold">{analysisCount !== null ? analysisCount : '-'}</p>
                </div>
            </div>

            <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-heading font-bold">Your Repositories</h2>
                    <Link to="/repositories" className="text-primary hover:text-primary-hover flex items-center gap-2 text-sm font-medium transition-colors">
                        View all <ArrowRight size={16} />
                    </Link>
                </div>

                {repos.length === 0 ? (
                    <div className="glass-card p-12 text-center border-dashed border-2">
                        <GitBranch size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
                        <h3 className="text-lg font-bold mb-2">No repositories linked</h3>
                        <p className="text-text-muted mb-6">Connect your first GitHub repository to start analyzing feature requests.</p>
                        <Link to="/repositories" className="btn btn-primary">
                            Link Repository
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {repos.slice(0, 4).map(repo => (
                            <Link key={repo.id} to={`/analysis/new?repo=${repo.id}`} className="block">
                                <div className="glass-card p-5 hover:border-primary/50 transition-colors group cursor-pointer h-full flex flex-col">
                                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{repo.full_name}</h3>
                                    <p className="text-text-muted text-sm mb-4 flex-1 line-clamp-2">{repo.description || 'No description provided.'}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1.5 text-text-muted">
                                            <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
                                            {repo.language || 'Unknown'}
                                        </span>
                                        <div className="text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                                            <PlaySquare size={16} /> <span className="text-xs font-semibold">Analyze</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
