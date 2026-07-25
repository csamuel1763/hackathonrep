export interface CopilotNotification {
  id: string;
  title: string;
  message: string;
  category: 'warning' | 'opportunity' | 'insight';
  timestamp: string;
  action_url?: string;
}

export interface CopilotMission {
  id: string;
  title: string;
  description: string;
  why_reason: string;
  expected_impact: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  est_time_hours: number;
  roi_score: number;
  is_completed: boolean;
}

export interface TimelineRoadmap {
  phase_30_day: string[];
  phase_60_day: string[];
  phase_90_day: string[];
  summary: string;
}

export interface WeeklyProgressReport {
  report_date: string;
  skill_growth_summary: string;
  portfolio_health_summary: string;
  interview_performance_score: number;
  salary_projection_change: string;
  mission_completion_rate: string;
  executive_summary: string;
}

export interface WhatIfSimulationRequest {
  action_type: 'learn_skill' | 'earn_cert' | 'build_projects';
  action_value: string;
  current_health?: number;
  current_readiness?: number;
  current_salary?: number;
  current_recruiter_vis?: number;
}

export interface WhatIfSimulationResponse {
  action_value: string;
  projected_health: number;
  health_delta: number;
  projected_readiness: number;
  readiness_delta: number;
  projected_salary: number;
  salary_delta: number;
  projected_match_increase_pct: number;
  projected_recruiter_vis: number;
  recruiter_vis_delta: number;
  forecast_summary: string;
}

export interface CopilotStateRequest {
  candidate_name?: string;
  skills?: string[];
  certifications?: string[];
  exp_titles?: string[];
  github_username?: string;
  linkedin_url?: string;
  target_role_id?: string;
}

export interface CopilotStateResponse {
  notifications: CopilotNotification[];
  daily_top_missions: CopilotMission[];
  roadmap_30_60_90: TimelineRoadmap;
  weekly_report: WeeklyProgressReport;
}
