import { api } from './client';
import type { 
    UserRepository, 
    GithubRepo, 
    AnalysisRequest, 
    AnalysisResult 
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

    // Analysis
    createAnalysis: (repoId: string, featureRequest: string) => 
        api.post<AnalysisResult>('/analysis', {
            repository_id: repoId,
            feature_request: featureRequest
        }),
        
    getAnalysis: (id: string) => 
        api.get<AnalysisResult>(`/analysis/${id}`),
        
    getAnalysisHistory: (repoId: string, page = 1, limit = 10) => 
        api.get<AnalysisRequest[]>(`/repositories/${repoId}/analyses?page=${page}&limit=${limit}`),

    getAnalysisCount: () => 
        api.get<number>('/analysis/count'),

    getAnalysisRepoCount: (repoId: string) =>
        api.get<number>(`/repositories/${repoId}/analyses/count`)
};
