import React, { useEffect, useState } from 'react';
import { mistletoeApi } from '../api/endpoints';
import type { UserRepository } from '../types';
import { PageLoader } from '../components/ui/Loader';
import { GithubRepoSelector } from '../components/repositories/GithubRepoSelector';
import { GitBranch, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RepositoriesPage: React.FC = () => {
    const [repos, setRepos] = useState<UserRepository[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadRepos = async () => {
        setIsLoading(true);
        try {
            const data = await mistletoeApi.getSelectedRepos();
            setRepos(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRepos();
    }, []);

    const handleRemove = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to remove ${name} from your linked repositories?`)) {
            return;
        }
        try {
            await mistletoeApi.removeRepository(id);
            setRepos(repos.filter(r => r.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to remove repository.");
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold mb-2">Repositories</h1>
                    <p className="text-text-muted">Manage your GitHub repositories connected to Mistletoe.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                >
                    <Plus size={18} /> Connect Repository
                </button>
            </div>

            {isLoading ? <PageLoader /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {repos.length === 0 ? (
                        <div className="col-span-full glass-card p-12 text-center">
                            <GitBranch size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
                            <h3 className="text-xl font-bold mb-2">No Repositories Linked</h3>
                            <p className="text-text-muted mb-6">Connect a repository from GitHub to start analyzing feature requests.</p>
                            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                                Connect from GitHub
                            </button>
                        </div>
                    ) : (
                        repos.map(repo => (
                            <div key={repo.id} className="glass-card flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl">
                                <div className="p-6 border-b border-glass-border flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                                            <GitBranch size={20} />
                                        </div>
                                        {repo.is_private && (
                                            <span className="text-xs font-bold uppercase tracking-wider text-text-muted bg-glass px-2 py-1 rounded">Private</span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold font-heading mb-2">{repo.full_name}</h3>
                                    <p className="text-text-muted text-sm line-clamp-2">{repo.description || 'No description'}</p>
                                </div>
                                <div className="p-4 bg-glass/30 flex items-center justify-between text-sm rounded-b-xl border-t border-glass-border/50">
                                    <a 
                                        href={repo.github_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-text-muted hover:text-white flex items-center gap-1.5 transition-colors"
                                    >
                                        <ExternalLink size={16} /> GitHub
                                    </a>
                                    
                                    <div className="flex items-center gap-2">
                                        <Link to={`/analysis/new?repo=${repo.id}`} className="btn btn-ghost !py-1.5 !px-3 text-sm text-primary hover:bg-primary/10">
                                            Analyze
                                        </Link>
                                        <button 
                                            onClick={() => handleRemove(repo.id, repo.full_name)}
                                            className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                            title="Remove Repository"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {isModalOpen && (
                <GithubRepoSelector 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onRepoSelected={loadRepos}
                    linkedRepoIds={repos.map(r => r.github_repo_id)}
                />
            )}
        </div>
    );
};
