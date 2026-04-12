import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mistletoeApi } from '../api/endpoints';
import type { AnalysisResult, AnalysisRequest } from '../types';
import { PageLoader } from '../components/ui/Loader';
import { ImpactScoreGauge, RiskBadge, EffortRange, ComponentsList, AlternativeApproaches, DecisionFactors } from '../components/analysis/Visualization';
import { ArrowLeft, Sparkles, History, ChevronLeft, ChevronRight } from 'lucide-react';

export const AnalysisResultPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [history, setHistory] = useState<AnalysisRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotalPages, setHistoryTotalPages] = useState(1);
    const historyLimit = 10;

    useEffect(() => {
        if (!id) return;
        const controller = new AbortController();
        setIsLoading(true);
        setError(null);

        mistletoeApi.getAnalysis(id)
            .then(data => {
                if (controller.signal.aborted) return;
                setResult(data);
            })
            .catch(err => {
                if (controller.signal.aborted) return;
                setError(err.message || "Failed to load analysis result");
            })
            .finally(() => {
                if (controller.signal.aborted) return;
                setIsLoading(false);
            });

        return () => controller.abort();
    }, [id]);

    useEffect(() => {
        if (!result?.repository_id) return;
        const controller = new AbortController();
        setIsLoadingHistory(true);
        
        mistletoeApi.getAnalysisHistory(result.repository_id, historyPage, historyLimit)
            .then(res => {
                if (controller.signal.aborted) return;
                setHistory(res?.data || []);
                setHistoryTotalPages(res?.total_pages ?? 1);
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
    }, [result?.repository_id, historyPage]);

    if (isLoading) return <PageLoader />;

    if (error) {
        return (
            <div className="max-w-4xl mx-auto mt-12 glass-card p-12 text-center border-danger/20">
                <h3 className="text-danger font-bold text-lg mb-2">Failed to Load Result</h3>
                <p className="text-text-muted mb-6">{error}</p>
                <Link to="/history" className="btn btn-ghost text-sm">
                    <ArrowLeft size={16} /> Back to History
                </Link>
            </div>
        );
    }

    if (!result) return null;

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 animate-fade">
            <header className="flex items-center justify-between mb-8 pb-4 border-b border-glass-border">
                <div className="flex items-center gap-4">
                    <Link to="/history" className="p-2 bg-glass rounded-lg text-text-muted hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
                            <Sparkles className="text-accent" /> Analysis Result
                        </h1>
                        <p className="text-text-muted text-sm my-1">ID: {result.id}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar for repo history */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <History size={20} className="text-text-muted" />
                        Repository History
                    </h3>
                    <div className="glass-card p-4 custom-scrollbar flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                        <div className="flex-1 overflow-y-auto">
                        {isLoadingHistory ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : history.length === 0 ? (
                            <p className="text-sm text-text-muted text-center pt-10">No other analysis history.</p>
                        ) : (
                            <div className="space-y-3">
                                {history.map(item => (
                                    <Link 
                                        key={item.id} 
                                        to={item.status === 'completed' ? `/analysis/${item.id}` : '#'} 
                                        className={`block p-3 rounded-xl border transition-colors ${
                                            item.id === result.analysis_request_id 
                                            ? 'bg-primary/20 border-primary/30 text-white shadow-[0_0_15px_rgba(var(--color-primary),0.3)]' 
                                            : item.status === 'completed' 
                                                ? 'bg-glass/20 border-glass-border hover:bg-glass/40 hover:border-primary/50 text-white/90' 
                                                : 'bg-glass/10 border-glass-border cursor-not-allowed opacity-70 text-text-muted'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-glass ${
                                                item.status === 'completed' ? 'text-success' : 
                                                item.status === 'processing' ? 'text-accent' : 
                                                item.status === 'failed' ? 'text-danger' : 'text-text-muted'
                                            }`}>
                                                {item.status}
                                            </span>
                                            <span className="text-[10px] opacity-70">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs line-clamp-2 mt-2">
                                            {item.feature_request_text}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                        </div>
                        {historyTotalPages > 1 && (
                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-glass-border">
                                <button
                                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                    disabled={historyPage <= 1}
                                    className="p-1.5 rounded-lg glass-card hover:bg-glass/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <span className="text-xs text-text-muted">{historyPage} / {historyTotalPages}</span>
                                <button
                                    onClick={() => setHistoryPage(p => Math.min(historyTotalPages, p + 1))}
                                    disabled={historyPage >= historyTotalPages}
                                    className="p-1.5 rounded-lg glass-card hover:bg-glass/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main area for analysis result */}
                <div className="lg:col-span-3 space-y-8">
                    {result.feature_request_text && (
                        <div className="glass-card p-6 border-l-4 border-l-accent">
                            <h3 className="text-sm font-bold text-text-muted uppercase mb-2">Original Request</h3>
                            <p className="text-white whitespace-pre-wrap leading-relaxed">{result.feature_request_text}</p>
                        </div>
                    )}

                    <div className="glass-card p-8 h-full">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-glass-border">
                            <div>
                                <h2 className="text-2xl font-heading font-bold mb-2">Findings</h2>
                                <p className="text-sm text-text-muted">Detected {result.feature_types.length} engineering patterns.</p>
                            </div>
                            <RiskBadge level={result.risk_level} />
                        </div>
                        
                        {/* Put decision factors right here below the summary findings header */}
                        <div className="mb-10">
                            <DecisionFactors result={result} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="flex justify-center border-r border-glass-border/50 pr-4">
                                <ImpactScoreGauge score={result.impact_score} />
                            </div>
                            <div className="flex flex-col justify-center space-y-4">
                                <EffortRange min={result.estimated_effort_min_hours} max={result.estimated_effort_max_hours} />
                            </div>
                        </div>

                        <AlternativeApproaches approaches={result.alternative_approaches} />

                        <div className="space-y-4 pt-8">
                            <div>
                                <h4 className="text-sm font-bold text-text-muted uppercase mb-2">Identified Patterns</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.feature_types.map(f => (
                                        <span key={f} className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <ComponentsList components={result.affected_components} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
