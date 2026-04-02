import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Loader } from '../ui/Loader';
import { mistletoeApi } from '../../api/endpoints';
import type { GithubRepo } from '../../types';
import { Search, Plus, Check } from 'lucide-react';

interface GithubRepoSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onRepoSelected: () => void;
    linkedRepoIds: number[];
}

export const GithubRepoSelector: React.FC<GithubRepoSelectorProps> = ({ 
    isOpen, onClose, onRepoSelected, linkedRepoIds 
}) => {
    const [repos, setRepos] = useState<GithubRepo[]>([]);
    const [filteredRepos, setFilteredRepos] = useState<GithubRepo[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && repos.length === 0) {
            setIsLoading(true);
            mistletoeApi.getGithubRepos()
                .then((data: any) => {
                    setRepos(data || []);
                    setFilteredRepos(data || []);
                })
                .catch((err: any) => setError(err.message))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen]);

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        setFilteredRepos(repos.filter(repo => 
            repo.full_name.toLowerCase().includes(query) || 
            (repo.description && repo.description.toLowerCase().includes(query))
        ));
    }, [searchQuery, repos]);

    const handleSelect = async (repo: GithubRepo) => {
        if (linkedRepoIds.includes(repo.id)) return;
        
        setIsSaving(true);
        setError(null);
        try {
            await mistletoeApi.selectRepository(repo);
            onRepoSelected();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to link repository");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Connect GitHub Repository">
            <div className="space-y-4">
                {error && (
                    <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-lg text-sm">
                        {error}
                    </div>
                )}
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search your repositories..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        autoFocus
                    />
                </div>

                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center py-8"><Loader /></div>
                    ) : filteredRepos.length === 0 ? (
                        <p className="text-center text-text-muted py-8">No repositories found.</p>
                    ) : (
                        filteredRepos.map(repo => {
                            const isLinked = linkedRepoIds.includes(repo.id);
                            
                            return (
                                <div 
                                    key={repo.id} 
                                    className={`
                                        flex items-center justify-between p-4 rounded-xl border
                                        ${isLinked ? 'border-glass-border bg-glass/50 opacity-60' : 'border-glass-border hover:border-primary/50 bg-bg-dark hover:bg-glass cursor-pointer transition-colors'}
                                    `}
                                    onClick={() => !isLinked && !isSaving && handleSelect(repo)}
                                >
                                    <div>
                                        <h4 className="font-bold flex items-center gap-2">
                                            {repo.full_name}
                                            {repo.private && <span className="text-[10px] uppercase bg-glass px-2 py-0.5 rounded text-text-muted font-bold">Private</span>}
                                        </h4>
                                        {repo.description && (
                                            <p className="text-sm text-text-muted mt-1 line-clamp-1">{repo.description}</p>
                                        )}
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        {isLinked ? (
                                            <div className="flex items-center gap-1.5 text-success text-sm font-medium">
                                                <Check size={16} /> Linked
                                            </div>
                                        ) : (
                                            <button 
                                                className="btn btn-ghost !p-2 rounded-lg text-primary hover:bg-primary/10 border-none"
                                                disabled={isSaving}
                                            >
                                                <Plus size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </Modal>
    );
};
