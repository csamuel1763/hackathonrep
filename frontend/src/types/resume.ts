/**
 * TypeScript types mirroring the backend Pydantic schemas.
 * Keep in sync with backend/app/schemas/resume.py
 */

export interface PersonalInfo {
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
}

export interface ParsedSkill {
  name: string;
  category: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  duration: string | null;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string | null;
}

export interface Certification {
  name: string;
  issuer: string | null;
}

export interface ParsedResumeResponse {
  name?: string;
  email?: string | null;
  phone?: string | null;
  personal_info?: PersonalInfo;
  summary: string | null;
  skills: ParsedSkill[];
  experience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  raw_text_preview: string;
  char_count: number;
}

export type UploadState = 'idle' | 'uploading' | 'role-selection' | 'success' | 'error';

export interface SkillGapResponse {
  matched_skills: string[];
  missing_skills: string[];
  coverage_percentage: number;
  matched_count: number;
  missing_count: number;
  total_required: number;
}

export interface ReadinessScoreResponse {
  overall_score: number;
  skills_score: number;
  experience_score: number;
  education_score: number;
  certification_score: number;
  readiness_level: string;
}

export interface RoadmapStep {
  week: number;
  topics: string[];
}

export interface LearningRoadmapResponse {
  estimated_duration_weeks: number;
  total_steps: number;
  roadmap: RoadmapStep[];
}

export interface RadarChartResponse {
  labels: string[];
  candidate: number[];
  required: number[];
}

export interface CareerMatchRole {
  id: string;
  name: string;
  description: string;
  score: number;
  matched_skills: number;
  required_skills: number;
  missing_skills: number;
}

export interface PriorityRecommendation {
  title: string;
  reason: string;
  difficulty: string;
  duration: string;
  impact: number;
}

export interface ResumeImprovementResponse {
  estimated_score_gain: number;
  priority: PriorityRecommendation[];
  resume_improvements: string[];
}

export interface CareerMentorRequest {
  message?: string;
  question?: string;
  role_id?: string;
  target_role?: any;
  resume_data?: any;
  skills?: string[];
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  exp_titles?: string[];
  exp_descriptions?: string[];
  exp_durations?: string[];
  edu_degrees?: string[];
  cert_names?: string[];
}

export interface CareerMentorResponse {
  answer: string;
  reply?: string;
}

export interface JobMatchRequest {
  job_description: string;
  skills?: string[];
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  exp_titles?: string[];
  exp_descriptions?: string[];
  exp_durations?: string[];
  edu_degrees?: string[];
  cert_names?: string[];
}

export interface JobMatchResponse {
  overall_score: number;
  match_level: string;
  technical_skills_score: number;
  certifications_score: number;
  experience_score: number;
  ats_keyword_score: number;
  matched_skills: string[];
  missing_skills: string[];
  missing_technologies: string[];
  missing_certifications: string[];
  missing_soft_skills: string[];
  strengths: string[];
  weaknesses: string[];
  ats_keywords: string[];
  bullet_improvements: string[];
  keywords_to_include: string[];
  suggested_projects: string[];
  wording_improvements: string[];
}
