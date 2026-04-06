import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mistletoeApi } from '../api/endpoints';
import type { AnalysisResult } from '../types';
import { PageLoader } from '../components/ui/Loader';
import { ImpactScoreGauge, RiskBadge, EffortRange, ComponentsList, AlternativeApproaches } from '../components/analysis/Visualization';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const AnalysisResultPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        <div className="max-w-4xl mx-auto space-y-8 animate-fade">
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
    );
};
