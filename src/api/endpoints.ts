import { api } from './client';
import type { 
    UserRepository, 
    GithubRepo, 
    AnalysisRequest, 
    AnalysisResult,
    PaginatedResponse,
    ExportJob,
    UserSettings,
    DashboardAnalytics,
    Organization,
    OrganizationMember,
    AnalysisComment
} from '../types';

export const mistletoeApi = {
    // Repositories
    getGithubRepos: () => 
        api.get<GithubRepo[]>('/repositories/github'),
    
    getSelectedRepos: (page = 1, limit = 10) => 
        api.get<UserRepository[]>(`/repositories?page=${page}&limit=${limit}`),
    
    selectRepository: (repo: Partial<GithubRepo>) => 
        api.post<UserRepository>('/repositories', {
            github_repo_id: repo.id,
            full_name: repo.full_name,
            name: repo.name,
            owner: repo.owner?.login,
            description: repo.description,
            default_branch: repo.default_branch,
            is_private: repo.private,
            language: repo.language,
            html_url: repo.html_url
        }),
        
    removeRepository: (id: string) => 
        api.delete<{message: string}>(`/repositories/${id}`),

    // User settings
    getUserSettings: () =>
        api.get<UserSettings>('/user/settings'),
    
    updateUserSettings: (settings: Partial<UserSettings>) =>
        api.put<UserSettings>('/user/settings', settings),

    // Analysis
    createAnalysis: (repoId: string, featureRequest: string) => 
        api.post<AnalysisResult>('/analysis', {
            repository_id: repoId,
            feature_request: featureRequest
        }),
        
    getAnalysis: (id: string) => 
        api.get<AnalysisResult>(`/analysis/${id}`),
        
    getAnalysisHistory: (repoId: string, page = 1, limit = 10) => 
        api.get<PaginatedResponse<AnalysisRequest>>(`/repositories/${repoId}/analyses?page=${page}&limit=${limit}`),

    getAnalysisCount: () => 
        api.get<number>('/analysis/count'),

    getAnalysisRepoCount: (repoId: string) =>
        api.get<number>(`/repositories/${repoId}/analyses/count`),

    // Export
    exportToGithubIssue: (analysisId: string) =>
        api.post<ExportJob>(`/analysis/${analysisId}/export`, {}),

    getExportStatus: (jobId: string) =>
        api.get<ExportJob>(`/export/${jobId}/status`),

    // Analytics
    getDashboardAnalytics: (year?: number, month?: number) => {
        const now = new Date();
        const y = year ?? now.getFullYear();
        const m = month ?? now.getMonth() + 1;
        return api.get<DashboardAnalytics>(`/analytics/dashboard?year=${y}&month=${m}`);
    },

    // ===== Organizations API =====
    getOrganizations: () =>
        api.get<Organization[]>('/orgs'),

    createOrganization: (name: string, slug: string) =>
        api.post<Organization>('/orgs', { name, slug }),

    getOrganization: (orgId: string) =>
        api.get<Organization>(`/orgs/${orgId}`),

    updateOrganization: (orgId: string, name: string) =>
        api.put<Organization>(`/orgs/${orgId}`, { name }),

    deleteOrganization: (orgId: string) =>
        api.delete<{ message: string }>(`/orgs/${orgId}`),

    // Org Members
    getOrgMembers: (orgId: string) =>
        api.get<OrganizationMember[]>(`/orgs/${orgId}/members`),

    inviteOrgMember: (orgId: string, email: string, role: string) =>
        api.post<OrganizationMember>(`/orgs/${orgId}/members`, { email, role }),

    updateOrgMemberRole: (orgId: string, userId: string, role: string) =>
        api.put<OrganizationMember>(`/orgs/${orgId}/members/${userId}`, { role }),

    removeOrgMember: (orgId: string, userId: string) =>
        api.delete<{ message: string }>(`/orgs/${orgId}/members/${userId}`),

    // Org Repositories
    getOrgRepositories: (orgId: string, page = 1, limit = 10) =>
        api.get<UserRepository[]>(`/orgs/${orgId}/repositories?page=${page}&limit=${limit}`),

    shareRepoToOrg: (orgId: string, repositoryId: string) =>
        api.post<{ message: string }>(`/orgs/${orgId}/repositories`, { repository_id: repositoryId }),

    unshareRepoFromOrg: (orgId: string, repoId: string) =>
        api.delete<{ message: string }>(`/orgs/${orgId}/repositories/${repoId}`),

    // Org Analyses
    getOrgAnalysisHistory: (orgId: string, repoId: string, page = 1, limit = 10) =>
        api.get<PaginatedResponse<AnalysisRequest>>(`/orgs/${orgId}/repositories/${repoId}/analyses?page=${page}&limit=${limit}`),

    // Analysis Comments
    getAnalysisComments: (orgId: string, resultId: string) =>
        api.get<AnalysisComment[]>(`/orgs/${orgId}/analyses/${resultId}/comments`),

    addAnalysisComment: (orgId: string, resultId: string, content: string) =>
        api.post<AnalysisComment>(`/orgs/${orgId}/analyses/${resultId}/comments`, { content }),

    updateAnalysisComment: (orgId: string, commentId: string, content: string) =>
        api.put<AnalysisComment>(`/orgs/${orgId}/comments/${commentId}`, { content }),

    deleteAnalysisComment: (orgId: string, commentId: string) =>
        api.delete<{ message: string }>(`/orgs/${orgId}/comments/${commentId}`)
};
