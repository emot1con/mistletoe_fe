import React, { useEffect, useState } from 'react';
import { mistletoeApi } from '../api/endpoints';
import type { UserRepository, AnalysisRequest } from '../types';
import { PageLoader } from '../components/ui/Loader';
import { History, GitBranch, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnalysisHistoryPage: React.FC = () => {
    const [repos, setRepos] = useState<UserRepository[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<string>('');
    const [history, setHistory] = useState<AnalysisRequest[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [isLoadingRepos, setIsLoadingRepos] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

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
        
        mistletoeApi.getAnalysisHistory(selectedRepo, page, limit)
            .then(res => {
                if (controller.signal.aborted) return;
                setHistory(res?.data || []);
                setTotal(res?.total ?? 0);
                setTotalPages(res?.total_pages ?? 1);
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
    }, [selectedRepo, page]);

    const handleRepoSelect = (repoId: string) => {
        setSelectedRepo(repoId);
        setPage(1);
    };

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
                                    onClick={() => handleRepoSelect(repo.id)}
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
                    <div className="glass-card p-6 min-h-[400px] flex flex-col">
                        {!selectedRepo ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-text-muted py-20">
                                <Search size={48} className="opacity-20 mb-4" />
                                <p>Select a repository to view its analysis history.</p>
                            </div>
                        ) : isLoadingHistory ? (
                            <div className="flex-1 flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-text-muted py-20">
                                <History size={48} className="opacity-20 mb-4" />
                                <p>No analysis history found for this repository.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-text-muted">{total} total analyses</span>
                                    <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
                                </div>
                                <div className="space-y-4 flex-1">
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
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-glass-border">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                            className="p-2 rounded-lg glass-card hover:bg-glass/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                            aria-label="Previous page"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                                                    acc.push(p);
                                                    return acc;
                                                }, [])
                                                .map((p, idx) =>
                                                    p === '...' ? (
                                                        <span key={`ellipsis-${idx}`} className="px-2 text-text-muted">…</span>
                                                    ) : (
                                                        <button
                                                            key={p}
                                                            onClick={() => setPage(p as number)}
                                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                                                page === p
                                                                    ? 'bg-primary text-white'
                                                                    : 'glass-card hover:bg-glass/80 text-text-muted hover:text-white'
                                                            }`}
                                                        >
                                                            {p}
                                                        </button>
                                                    )
                                                )
                                            }
                                        </div>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page >= totalPages}
                                            className="p-2 rounded-lg glass-card hover:bg-glass/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                            aria-label="Next page"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
