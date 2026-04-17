import React, { useState, useEffect } from 'react';
import { useOrg } from '../../auth/OrgProvider';
import { mistletoeApi } from '../../api/endpoints';
import type { AnalysisComment } from '../../types';
import { MessageSquare, Send, Trash2, Code2 } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';

interface AnalysisCommentsProps {
    resultId: string;
}

export const AnalysisComments: React.FC<AnalysisCommentsProps> = ({ resultId }) => {
    const { activeOrg } = useOrg();
    const { userId } = useAuth();
    const [comments, setComments] = useState<AnalysisComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    const loadComments = async () => {
        if (!activeOrg || !resultId) return;
        setLoading(true);
        try {
            const data = await mistletoeApi.getAnalysisComments(activeOrg.id, resultId);
            setComments(data || []);
        } catch (error) {
            console.error("Failed to load comments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadComments();
    }, [activeOrg?.id, resultId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeOrg || !newComment.trim()) return;
        try {
            await mistletoeApi.addAnalysisComment(activeOrg.id, resultId, newComment);
            setNewComment('');
            loadComments();
        } catch (error) {
            alert('Failed to post comment.');
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!activeOrg || !confirm('Delete comment?')) return;
        try {
            await mistletoeApi.deleteAnalysisComment(activeOrg.id, commentId);
            loadComments();
        } catch (error) {
            alert('Failed to delete comment.');
        }
    };

    if (!activeOrg) {
        return (
            <div className="glass-card p-6 text-center border-dashed border-2">
                <MessageSquare className="mx-auto text-text-muted mb-2" size={24} />
                <p className="text-white font-medium">Team Notes Unavailable</p>
                <p className="text-xs text-text-muted mt-1">Select an Organization in the sidebar to collaborate.</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 flex flex-col h-full max-h-[600px]">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-glass-border shrink-0">
                <MessageSquare className="text-primary" size={20} />
                <h3 className="text-lg font-heading font-bold text-white">Team Notes ({comments.length})</h3>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                {loading ? (
                    <div className="text-center text-text-muted text-sm py-4">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-text-muted text-sm py-8">No notes yet. Start the conversation!</div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="bg-bg-dark border border-glass-border rounded-xl p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    {comment.avatar_url ? (
                                        <img src={comment.avatar_url} className="w-6 h-6 rounded-full" />
                                    ) : (
                                        <Code2 size={16} className="text-text-muted" />
                                    )}
                                    <span className="text-sm font-medium text-white">{comment.display_name || comment.username}</span>
                                    <span className="text-xs text-text-muted">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {userId === comment.user_id && (
                                    <button onClick={() => handleDelete(comment.id)} className="text-text-muted hover:text-danger">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-white whitespace-pre-wrap">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="mt-auto shrink-0 relative">
                <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Add a note..."
                    className="w-full bg-bg-dark border border-glass-border rounded-xl p-3 pr-12 text-sm text-white resize-none focus:outline-none focus:border-primary transition-colors"
                    rows={3}
                />
                <button 
                    type="submit" 
                    disabled={!newComment.trim()}
                    className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
};
