export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

export interface UserRepository {
  id: string;
  user_id: string;
  github_repo_id: number;
  full_name: string;
  owner: string;
  repo_name: string;
  description: string;
  default_branch: string;
  is_private: boolean;
  language: string;
  github_url: string;
  selected_at: string;
}

export interface GithubRepo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  description: string;
  default_branch: string;
  private: boolean;
  language: string;
  html_url: string;
}

export interface AnalysisRequest {
  id: string;
  repository_id: string;
  feature_request_text: string;
  status: string;
  created_at: string;
}

export interface AnalysisResult {
  id: string;
  analysis_request_id: string;
  feature_types: string[];
  impact_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  estimated_effort_hours: [number, number];
  affected_components: string[];
  created_at: string;
}
