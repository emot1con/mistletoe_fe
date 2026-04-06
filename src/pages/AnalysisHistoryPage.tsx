import React, { useEffect, useState } from 'react';
import { mistletoeApi } from '../api/endpoints';
import type { UserRepository, AnalysisRequest } from '../types';
import { PageLoader } from '../components/ui/Loader';
import { History, GitBranch, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnalysisHistoryPage: React.FC = () => {
    const [repos, setRepos] = useState<UserRepository[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<string>('');
    const [history, setHistory] = useState<AnalysisRequest[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [isLoadingRepos, setIsLoadingRepos] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setIsLoadingRepos(true);
        setError(null);

        mistletoeApi.getSelectedRepos()
            .then(data => {
                if (controller.signal.aborted) return;
                const reposData = data || [];
                setRepos(reposData);
                if (reposData.length > 0 && !selectedRepo) {
                    setSelectedRepo(reposData[0].id);
                }
                
                // Fetch analysis counts for each repo
                const countsObj: Record<string, number> = {};
                return Promise.all(
                    reposData.map(repo => 
                        mistletoeApi.getAnalysisRepoCount(repo.id)
                            .then(count => {
                                if (!controller.signal.aborted) {
                                    countsObj[repo.id] = count;
                                }
                            })
                            .catch(err => console.error(`Failed to load count for repo ${repo.id}`, err))
                    )
                ).then(() => {
                    if (!controller.signal.aborted) {
                        setCounts(countsObj);
                    }
                });
            })
            .catch(err => {
                if (controller.signal.aborted) return;
                console.error("Failed to load repos", err);
                setError("Failed to load repositories.");
            })
            .finally(() => {
                if (controller.signal.aborted) return;
                setIsLoadingRepos(false);
            });

        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!selectedRepo) return;
        const controller = new AbortController();
        setIsLoadingHistory(true);
        
        mistletoeApi.getAnalysisHistory(selectedRepo)
            .then(data => {
                if (controller.signal.aborted) return;
                setHistory(data || []);
            })
            .catch(err => {
                if (controller.signal.aborted) return;
                console.error("Failed to load history", err);
            })
            .finally(() => {
                if (controller.signal.aborted) return;
                setIsLoadingHistory(false);
            });
            
        return () => controller.abort();
    }, [selectedRepo]);

    if (isLoadingRepos) return <PageLoader />;

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
                <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-3">
                    <History className="text-primary" size={32} />
                    Analysis History
                </h1>
                <p className="text-text-muted">Review past analysis requests for your repositories.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar for repo selection */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <GitBranch size={20} className="text-text-muted" />
                        Repositories
                    </h3>
                    {repos.length === 0 ? (
                        <div className="glass-card p-4 text-center text-text-muted text-sm border-dashed">
                            No repositories connected.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {repos.map(repo => (
                                <button
                                    key={repo.id}
                                    onClick={() => setSelectedRepo(repo.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
                                        selectedRepo === repo.id 
                                        ? 'bg-primary/20 border border-primary/30 text-white' 
                                        : 'glass-card hover:bg-glass/80 text-text-muted hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="truncate">{repo.repo_name || repo.full_name.split('/')[1]}</span>
                                        {counts[repo.id] !== undefined && (
                                            <span className="text-[10px] bg-black/40 text-text-muted px-2 py-0.5 rounded-full font-medium">
                                                {counts[repo.id]}
                                            </span>
                                        )}
                                    </div>
                                    {selectedRepo === repo.id && <ChevronRight size={16} className="text-primary flex-shrink-0" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main area for history */}
                <div className="lg:col-span-3">
                    <div className="glass-card p-6 min-h-[400px]">
                        {!selectedRepo ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-text-muted py-20">
                                <Search size={48} className="opacity-20 mb-4" />
                                <p>Select a repository to view its analysis history.</p>
                            </div>
                        ) : isLoadingHistory ? (
                            <div className="w-full h-full flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-text-muted py-20">
                                <History size={48} className="opacity-20 mb-4" />
                                <p>No analysis history found for this repository.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {history.map(item => (
                                    <Link key={item.id} to={item.status === 'completed' ? `/analysis/${item.id}` : '#'} className={`block p-4 rounded-xl border border-glass-border transition-colors ${item.status === 'completed' ? 'bg-glass/20 hover:bg-glass/40' : 'bg-glass/10 cursor-not-allowed opacity-70'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-glass ${
                                                item.status === 'completed' ? 'text-success' : 
                                                item.status === 'processing' ? 'text-accent' : 
                                                item.status === 'failed' ? 'text-danger' : 'text-text-muted'
                                            }`}>
                                                {item.status}
                                            </span>
                                            <span className="text-xs text-text-muted">
                                                {new Date(item.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm line-clamp-3 text-white/90">
                                            {item.feature_request_text}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
