export interface JobListing {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  salary_range: string;
  work_type: string;
  employment_type?: string;
  min_experience_years: number;
  security_domain?: string;
  required_skills: string[];
  required_certs: string[];
  education_req: string;
  posted_date: string;
  apply_url: string;
  badges?: string[];
  description: string;
}

export interface JobMatchExplanation {
  why_good_fit: string[];
  why_not_perfect: string[];
  interview_probability_pct: number;
}

export interface JobActionPlan {
  missing_skills: string[];
  recommended_certs: string[];
  recommended_projects: string[];
  learning_roadmap_summary: string;
  ai_recommendation_reason?: string;
  estimated_readiness_weeks: number;
}

export interface JobMatchResult {
  job: JobListing;
  overall_match_score: number;
  technical_match_score: number;
  experience_match_score: number;
  certification_match_score: number;
  education_match_score: number;
  soft_skill_match_score: number;
  ats_match_score: number;
  confidence_score: number;
  recruiter_visibility_score?: number;
  opportunity_score: number;
  fit_explanation: JobMatchExplanation;
  action_plan: JobActionPlan;
}

export interface MarketInsightItem {
  name: string;
  count_or_value: number;
  category?: string;
}

export interface SkillHeatmapItem {
  skill: string;
  demand_score: number;
  growth_rate: string;
  job_count?: number;
  salary_boost?: string;
  resume_matched?: boolean;
}

export interface MarketInsightsData {
  most_requested_skills: MarketInsightItem[];
  fastest_growing_tech: MarketInsightItem[];
  most_requested_certs: MarketInsightItem[];
  average_salaries_by_role: MarketInsightItem[];
  top_hiring_companies: MarketInsightItem[];
  top_locations: MarketInsightItem[];
  trending_roles: MarketInsightItem[];
}

export interface MarketplaceSearchRequest {
  candidate_skills?: string[];
  candidate_certs?: string[];
  candidate_exp_titles?: string[];
  candidate_exp_descriptions?: string[];
  query?: string;
  work_type_filter?: string;
  security_domain_filter?: string;
  sort_by?: string;
  min_match_filter?: number;
}

export interface MarketplaceSearchResponse {
  total_jobs: number;
  avg_match_pct?: number;
  avg_confidence_pct?: number;
  highest_salary_today?: string;
  top_company_today?: string;
  ranked_jobs: JobMatchResult[];
  top_matches: JobMatchResult[];
  market_insights: MarketInsightsData;
  skill_demand_heatmap: SkillHeatmapItem[];
}
