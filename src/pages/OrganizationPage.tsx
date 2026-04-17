import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { mistletoeApi } from '../api/endpoints';
import { useOrg } from '../auth/OrgProvider';
import type { Organization, OrganizationMember, UserRepository } from '../types';
import { Users, Mail, UserPlus, Shield, X, Code2, Link2, Unlink } from 'lucide-react';

export const OrganizationPage: React.FC = () => {
    const { orgId } = useParams<{ orgId: string }>();
    const { activeOrg, setActiveOrg } = useOrg();
    
    const [org, setOrg] = useState<Organization | null>(null);
    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [repos, setRepos] = useState<UserRepository[]>([]);
    const [loading, setLoading] = useState(true);

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    
    // Quick simplistic check for permission. Ideally done via current user context
    const canManage = true; // In full impl, check if current user is owner/admin

    const loadData = async () => {
        if (!orgId) return;
        setLoading(true);
        try {
            const [orgData, membersData, reposData] = await Promise.all([
                mistletoeApi.getOrganization(orgId),
                mistletoeApi.getOrgMembers(orgId),
                mistletoeApi.getOrgRepositories(orgId)
            ]);
            setOrg(orgData);
            setMembers(membersData || []);
            setRepos(reposData || []);
            // If active org isn't this one, we could set it
            if (activeOrg?.id !== orgId) setActiveOrg(orgData);
        } catch (error) {
            console.error("Failed to load org data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [orgId]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgId || !inviteEmail) return;
        try {
            await mistletoeApi.inviteOrgMember(orgId, inviteEmail, inviteRole);
            setInviteEmail('');
            loadData();
        } catch (error) {
            alert('Failed to invite member. Make sure they have an account.');
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!orgId || !confirm("Are you sure?")) return;
        try {
            await mistletoeApi.removeOrgMember(orgId, userId);
            loadData();
        } catch (error) {
            alert('Failed to remove member.');
        }
    };

    const handleUnshareRepo = async (repoId: string) => {
        if (!orgId || !confirm("Unshare this repository?")) return;
        try {
            // we assume param is userRepoID. In API, we called it orgs/:orgId/repositories/:repoId
            await mistletoeApi.unshareRepoFromOrg(orgId, repoId);
            loadData();
        } catch (error) {
            alert('Failed to unshare repository.');
        }
    };

    if (loading) return <div className="p-8 text-center text-text-muted">Loading...</div>;
    if (!org) return <div className="p-8 text-center text-danger">Organization not found</div>;

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-white mb-2">{org.name}</h1>
                <p className="text-text-muted">Organization / {org.slug}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Members Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card">
                        <div className="p-6 border-b border-glass-border flex justify-between items-center">
                            <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
                                <Users size={20} className="text-primary" />
                                Members
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-4 rounded-xl bg-bg-dark border border-glass-border">
                                        <div className="flex items-center gap-4">
                                            {member.avatar_url ? (
                                                <img src={member.avatar_url} className="w-10 h-10 rounded-full" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-glass flex items-center justify-center">
                                                    <Users size={16} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-white font-medium">{member.display_name || member.username}</p>
                                                <p className="text-sm text-text-muted">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="px-3 py-1 bg-glass rounded-full text-xs font-medium capitalize flex items-center gap-1">
                                                <Shield size={12} /> {member.role}
                                            </span>
                                            {canManage && member.role !== 'owner' && (
                                                <button onClick={() => handleRemoveMember(member.user_id)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Section */}
                <div className="space-y-6">
                    {/* Invite Card */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                            <UserPlus size={18} className="text-primary" />
                            Invite Member
                        </h3>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                    <input 
                                        type="email" 
                                        required
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-bg-dark border border-glass-border rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                                        placeholder="user@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Role</label>
                                <select 
                                    value={inviteRole}
                                    onChange={e => setInviteRole(e.target.value)}
                                    className="w-full px-4 py-2 bg-bg-dark border border-glass-border rounded-lg text-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                                    style={{ backgroundImage: 'none' }} // remove default arrow
                                >
                                    <option value="admin">Admin</option>
                                    <option value="member">Member</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full btn-primary py-2">
                                Send Invite
                            </button>
                        </form>
                    </div>

                    {/* Shared Repos Card */}
                    <div className="glass-card p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
                                <Link2 size={18} className="text-primary" />
                                Shared Repos
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {repos.length === 0 ? (
                                <p className="text-sm text-text-muted text-center py-4">No repositories shared yet.</p>
                            ) : (
                                repos.map(repo => (
                                    <div key={repo.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-dark border border-glass-border">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Code2 size={16} className="text-text-muted shrink-0" />
                                            <span className="text-sm text-white truncate">{repo.full_name}</span>
                                        </div>
                                        <button onClick={() => handleUnshareRepo(repo.id)} className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors" title="Unshare">
                                            <Unlink size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                            <div className="pt-2 text-xs text-text-muted">
                                * To share a new repository, go to your Repositories page.
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
