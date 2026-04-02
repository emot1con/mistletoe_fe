import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mistletoeApi } from '../api/endpoints';
import type { UserRepository, AnalysisResult } from '../types';
import { Loader } from '../components/ui/Loader';
import { ImpactScoreGauge, RiskBadge, EffortRange, ComponentsList } from '../components/analysis/Visualization';
import { Send, Sparkles } from 'lucide-react';

export const AnalysisNewPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const initialRepoId = searchParams.get('repo') || '';

    const [repos, setRepos] = useState<UserRepository[]>([]);
    const [selectedRepoId, setSelectedRepoId] = useState(initialRepoId);
    const [featureRequest, setFeatureRequest] = useState('');
    const [isLoadingRepos, setIsLoadingRepos] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        mistletoeApi.getSelectedRepos(1, 100)
            .then((data: any) => {
                setRepos(data || []);
                if (!initialRepoId && data?.length > 0) {
                    setSelectedRepoId(data[0].id);
                }
            })
            .catch((err: any) => console.error("Failed to load repos", err))
            .finally(() => setIsLoadingRepos(false));
    }, [initialRepoId]);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRepoId || !featureRequest.trim()) return;

        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const data = await mistletoeApi.createAnalysis(selectedRepoId, featureRequest);
            setResult(data);
        } catch (err: any) {
            setError(err.message || "An error occurred during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-3">
                    <Sparkles className="text-accent" /> Feature Impact Analysis
                </h1>
                <p className="text-text-muted">Describe the feature you want to build and our AI will predict the engineering impact.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-card p-6 border-t-2 border-t-primary">
                        <form onSubmit={handleAnalyze} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Target Repository</label>
                                {isLoadingRepos ? (
                                    <div className="h-10 bg-glass animate-pulse rounded-lg w-full"></div>
                                ) : (
                                    <select 
                                        value={selectedRepoId}
                                        onChange={e => setSelectedRepoId(e.target.value)}
                                        required
                                        className="w-full bg-bg-dark border border-glass-border rounded-lg text-white"
                                    >
                                        <option value="" disabled>Select a repository...</option>
                                        {repos.map(r => (
                                            <option key={r.id} value={r.id}>{r.full_name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Feature Request Requirements</label>
                                <textarea 
                                    value={featureRequest}
                                    onChange={e => setFeatureRequest(e.target.value)}
                                    placeholder="e.g., We need to add an export to PDF feature on the user dashboard..."
                                    rows={6}
                                    required
                                    className="w-full bg-bg-dark border border-glass-border rounded-lg text-white resize-y"
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isAnalyzing || !selectedRepoId || !featureRequest.trim()}
                                className="btn btn-primary w-full shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                {isAnalyzing ? <><Loader size={18} /> Analyzing...</> : <><Send size={18} /> Run AI Analysis</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-7">
                    {/* Placeholder State */}
                    {!isAnalyzing && !result && !error && (
                        <div className="h-full min-h-[400px] glass-card flex flex-col items-center justify-center p-8 text-center text-text-muted border-dashed border-2">
                            <Sparkles size={48} className="mb-4 opacity-50" />
                            <h3 className="text-xl font-bold mb-2">Awaiting Request</h3>
                            <p className="max-w-sm mx-auto">Submit a feature request on the left to see the AI-predicted engineering impact.</p>
                        </div>
                    )}

                    {/* Loading State */}
                    {isAnalyzing && (
                        <div className="h-full min-h-[400px] glass-card flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                            <div className="shimmer absolute inset-0 z-0"></div>
                            <div className="relative z-10">
                                <Loader size={48} className="mx-auto mb-6 text-accent" />
                                <h3 className="text-xl font-heading font-bold mb-2">Analyzing Architecture...</h3>
                                <p className="text-text-muted">Extracting patterns and calculating impact score.</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="glass-card p-6 bg-danger/5 border-danger/20 text-center">
                            <h3 className="text-danger font-bold text-lg mb-2">Analysis Failed</h3>
                            <p className="text-text-muted">{error}</p>
                        </div>
                    )}

                    {/* Result State */}
                    {result && !isAnalyzing && (
                        <div className="glass-card p-8 animate-fade h-full">
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-glass-border">
                                <div>
                                    <h2 className="text-2xl font-heading font-bold mb-2">Analysis Result</h2>
                                    <p className="text-sm text-text-muted">Detected {result.feature_types.length} engineering patterns.</p>
                                </div>
                                <RiskBadge level={result.risk_level} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="flex justify-center border-r border-glass-border/50 pr-4">
                                    <ImpactScoreGauge score={result.impact_score} />
                                </div>
                                <div className="flex flex-col justify-center space-y-4">
                                    <EffortRange min={result.estimated_effort_hours[0]} max={result.estimated_effort_hours[1]} />
                                </div>
                            </div>

                            <div className="space-y-4">
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
                    )}
                </div>
            </div>
        </div>
    );
};
