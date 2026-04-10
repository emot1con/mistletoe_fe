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

export interface AlternativeApproach {
  label: string;
  description: string;
  estimated_effort_min_hours: number;
  estimated_effort_max_hours: number;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  included_patterns: string[];
  cost_estimate_min_usd: number;
  cost_estimate_max_usd: number;
}

export interface AnalysisResult {
  id: string;
  analysis_request_id: string;
  repository_id: string;
  feature_request_text: string;
  feature_types: string[];
  impact_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  estimated_effort_min_hours: number;
  estimated_effort_max_hours: number;
  affected_components: string[];
  alternative_approaches: AlternativeApproach[];
  security_impact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  security_flags: string[];
  performance_impact: 'none' | 'low' | 'medium' | 'high';
  performance_description?: string;
  external_dependency_count: number;
  external_dependencies: string[];
  technical_debt_score: 'low' | 'medium' | 'high';
  cost_estimate_min_usd: number;
  cost_estimate_max_usd: number;
  created_at: string;
}
