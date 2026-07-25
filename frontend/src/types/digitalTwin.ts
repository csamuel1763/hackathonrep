export interface CareerDNAScores {
  cybersecurity: number;
  programming: number;
  networking: number;
  cloud: number;
  devops: number;
  leadership: number;
  communication: number;
  problem_solving: number;
  threat_hunting: number;
  incident_response: number;
}

export interface SkillGraphNode {
  id: string;
  name: string;
  type: string;
  weight: number;
}

export interface SkillGraphEdge {
  source: string;
  target: string;
  relation: string;
}

export interface SkillGraphData {
  nodes: SkillGraphNode[];
  edges: SkillGraphEdge[];
}

export interface CareerForecastMilestone {
  timeline: string;
  predicted_role: string;
  expected_salary_range: string;
  key_achievements: string[];
  recommended_focus_areas: string[];
}

export interface DetailedSkillGapItem {
  skill_name: string;
  importance: string;
  difficulty: string;
  estimated_learning_hours: number;
  recommended_resources: string[];
  priority: number;
}

export interface CareerCompatibilityRole {
  role_id: string;
  role_name: string;
  compatibility_score: number;
  confidence_score: number;
  strength_match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  missing_certifications: string[];
  estimated_reach_time_weeks: number;
  roadmap_summary: string;
  detailed_gaps: DetailedSkillGapItem[];
}

export interface RepositorySummary {
  name: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  url: string;
  is_security_related: boolean;
}

export interface GitHubAnalysisRequest {
  username: string;
  resume_skills?: string[];
}

export interface GitHubAnalysisResponse {
  username: string;
  developer_profile: string;
  portfolio_score: number;
  coding_maturity: string;
  project_quality_score: number;
  contribution_score: number;
  open_source_readiness: string;
  public_repos_count: number;
  total_stars: number;
  primary_languages: string[];
  security_tools_detected: string[];
  strengths: string[];
  weaknesses: string[];
  top_repositories: RepositorySummary[];
  repo_recommendations: string[];
}

export interface LinkedInAnalysisRequest {
  linkedin_url: string;
  raw_profile_text?: string;
  resume_skills?: string[];
}

export interface LinkedInAnalysisResponse {
  linkedin_url: string;
  headline: string;
  branding_score: number;
  recruiter_attractiveness_score: number;
  profile_completeness_score: number;
  keyword_optimization_score: number;
  headline_quality: string;
  experience_quality: string;
  achievement_quality: string;
  strengths: string[];
  improvement_areas: string[];
  networking_suggestions: string[];
}

export interface ProfileInconsistencyItem {
  source_a: string;
  source_b: string;
  issue: string;
  recommendation: string;
}

export interface CrossProfileValidationRequest {
  resume_data?: any;
  github_username?: string;
  linkedin_url?: string;
}

export interface CrossProfileValidationResponse {
  consistency_score: number;
  inconsistencies: ProfileInconsistencyItem[];
  missing_resume_skills: string[];
  missing_github_projects: string[];
  missing_linkedin_skills: string[];
  resume_improvements: string[];
  github_improvements: string[];
  linkedin_improvements: string[];
}

export interface DigitalTwinRequest {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills?: string[];
  exp_titles?: string[];
  exp_descriptions?: string[];
  exp_durations?: string[];
  edu_degrees?: string[];
  cert_names?: string[];
  github_username?: string;
  linkedin_url?: string;
  target_role_id?: string;
}

export interface DigitalTwinProfileResponse {
  name: string;
  email: string;
  phone: string;
  summary: string;
  career_persona: string;
  personality_summary: string;
  readiness_score: number;
  career_level: string;
  technical_stack: string[];
  soft_skills: string[];
  certifications: string[];
  career_interests: string[];
  strengths: string[];
  weaknesses: string[];
  growth_opportunities: string[];
  career_dna: CareerDNAScores;
  skill_graph: SkillGraphData;
  career_rankings: CareerCompatibilityRole[];
  future_forecast: CareerForecastMilestone[];
  github_analysis?: GitHubAnalysisResponse;
  linkedin_analysis?: LinkedInAnalysisResponse;
  cross_profile?: CrossProfileValidationResponse;
}
