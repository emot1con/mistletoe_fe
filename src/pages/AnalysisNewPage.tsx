import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mistletoeApi } from '../api/endpoints';
import type { UserRepository } from '../types';
import { Loader } from '../components/ui/Loader';
import { Send, Sparkles } from 'lucide-react';

export const AnalysisNewPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialRepoId = searchParams.get('repo') || '';

    const [repos, setRepos] = useState<UserRepository[]>([]);
    const [selectedRepoId, setSelectedRepoId] = useState(initialRepoId);
    const [featureRequest, setFeatureRequest] = useState('');
    const [isLoadingRepos, setIsLoadingRepos] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
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

        try {
            const data = await mistletoeApi.createAnalysis(selectedRepoId, featureRequest);
            // Redirect to detail page
            navigate(`/analysis/${data.analysis_request_id}`);
        } catch (err: any) {
            setError(err.message || "An error occurred during analysis.");
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
                    {!isAnalyzing && !error && (
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
                </div>
            </div>
        </div>
    );
};
