export interface MissionTask {
  id: string;
  title: string;
  category: string;
  impact_level: string;
  estimated_hours: number;
  roi_reason: string;
  is_completed: boolean;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  target_count: number;
  current_count: number;
  reward_xp: number;
  is_completed: boolean;
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_date?: string;
}

export interface StrategicRecommendation {
  category: string;
  title: string;
  roi_score: number;
  rationale: string;
}

export interface PortfolioHealthItem {
  component: string;
  health_score: number;
  status: string;
  missing_evidence: string[];
  recommendations: string[];
}

export interface CareerTimelineItem {
  phase: string;
  title: string;
  description: string;
  date_label: string;
  status: string;
}

export interface SnapshotHistoryPoint {
  timestamp: string;
  career_health: number;
  recruiter_visibility: number;
  hiring_readiness: number;
  risk_score: number;
}

export interface MetricFormulaInfo {
  metric_name: string;
  current_value: number;
  formula_description: string;
  primary_factors: string[];
}

export interface ExecutiveAnalyticsData {
  salary_projections: Array<{ month: string; salary: number }>;
  learning_velocity: Array<{ week: string; skills_acquired: number; hours_spent: number }>;
  job_match_trend: Array<{ month: string; avg_match: number }>;
  skill_growth: Array<{ domain: string; score: number }>;
}

export interface PreviousSnapshotData {
  career_health?: number;
  recruiter_visibility?: number;
  hiring_readiness?: number;
  risk_score?: number;
  certs_count?: number;
}

export interface MissionControlRequest {
  candidate_name?: string;
  skills?: string[];
  certifications?: string[];
  exp_titles?: string[];
  exp_descriptions?: string[];
  exp_durations?: string[];
  edu_degrees?: string[];
  github_username?: string;
  linkedin_url?: string;
  target_role_id?: string;
  completed_milestones_count?: number;
  completed_interviews_count?: number;
  previous_snapshot?: PreviousSnapshotData;
}

export interface MissionControlResponse {
  last_updated_timestamp: string;
  daily_briefing: string;
  delta_briefing: string;
  career_health_score: number;
  career_health_trend: string;
  recruiter_visibility_score: number;
  recruiter_visibility_trend: string;
  visibility_level: string;
  hiring_readiness_pct: number;
  hiring_readiness_trend: string;
  career_risk_score: number;
  career_risk_level: string;
  metric_formulas: MetricFormulaInfo[];
  snapshot_history: SnapshotHistoryPoint[];
  mission_tasks: MissionTask[];
  weekly_goals: WeeklyGoal[];
  achievements: AchievementBadge[];
  strategic_recommendations: StrategicRecommendation[];
  portfolio_health: PortfolioHealthItem[];
  timeline: CareerTimelineItem[];
  analytics: ExecutiveAnalyticsData;
}
