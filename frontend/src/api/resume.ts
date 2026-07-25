import client from './client';
import type {
  ParsedResumeResponse,
  SkillGapResponse,
  ReadinessScoreResponse,
  LearningRoadmapResponse,
  RadarChartResponse,
  CareerMatchRole,
  ResumeImprovementResponse,
  CareerMentorRequest,
  CareerMentorResponse,
  JobMatchRequest,
  JobMatchResponse,
} from '../types/resume';

/**
 * Upload and parse resume PDF/DOCX file.
 * Sends POST /api/v1/resume/parse with multipart/form-data.
 */
export async function parseResume(file: File): Promise<ParsedResumeResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await client.post<ParsedResumeResponse>(
    '/api/v1/resume/parse',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
}

/**
 * Fetch Skill Gap Analysis for a target role.
 * Sends GET /api/v1/gap-analysis/{role_id}?skills=...
 */
export async function getSkillGapAnalysis(
  roleId: string,
  skills: string[],
): Promise<SkillGapResponse> {
  const params = new URLSearchParams();
  skills.forEach((s) => params.append('skills', s));

  const response = await client.get<SkillGapResponse>(
    `/api/v1/gap-analysis/${roleId}`,
    { params },
  );
  return response.data;
}

/**
 * Fetch Readiness Score for a target role.
 * Sends GET /api/v1/readiness-score/{role_id}?skills=...
 */
export async function getCareerReadinessScore(
  roleId: string,
  skills: string[],
  expTitles: string[],
  expDescriptions: string[],
  expDurations: string[],
  eduDegrees: string[],
  certNames: string[],
): Promise<ReadinessScoreResponse> {
  const params = new URLSearchParams();
  skills.forEach((s) => params.append('skills', s));
  expTitles.forEach((t) => params.append('exp_title', t));
  expDescriptions.forEach((d) => params.append('exp_desc', d));
  expDurations.forEach((du) => params.append('exp_duration', du));
  eduDegrees.forEach((deg) => params.append('edu_degree', deg));
  certNames.forEach((c) => params.append('cert_name', c));

  const response = await client.get<ReadinessScoreResponse>(
    `/api/v1/readiness-score/${roleId}`,
    { params },
  );
  return response.data;
}

/**
 * Fetch Personalized Learning Roadmap for a target role.
 * Sends GET /api/v1/learning-roadmap/{role_id}?skills=...
 */
export async function getLearningRoadmap(
  roleId: string,
  skills: string[],
): Promise<LearningRoadmapResponse> {
  const params = new URLSearchParams();
  skills.forEach((s) => params.append('skills', s));

  const response = await client.get<LearningRoadmapResponse>(
    `/api/v1/learning-roadmap/${roleId}`,
    { params },
  );
  return response.data;
}

/**
 * Fetch Skill Radar Chart Data for a target role.
 * Sends GET /api/v1/radar-chart/{role_id}?skills=...
 */
export async function getRadarChartData(
  roleId: string,
  skills: string[],
): Promise<RadarChartResponse> {
  const params = new URLSearchParams();
  skills.forEach((s) => params.append('skills', s));

  const response = await client.get<RadarChartResponse>(
    `/api/v1/radar-chart/${roleId}`,
    { params },
  );
  return response.data;
}

/**
 * Download compiled PDF career report for a target role.
 * Sends GET /api/v1/report/download?skills=...
 */
export async function downloadCareerReport(
  roleId: string,
  skills: string[],
  name: string,
  email: string,
  phone: string,
  summary: string,
  expTitles: string[],
  expDescriptions: string[],
  expDurations: string[],
  eduDegrees: string[],
  certNames: string[],
): Promise<Blob> {
  const params = new URLSearchParams();
  params.append('role_id', roleId);
  skills.forEach((s) => params.append('skills', s));
  params.append('name', name);
  params.append('email', email);
  params.append('phone', phone);
  params.append('summary', summary);
  expTitles.forEach((t) => params.append('exp_title', t));
  expDescriptions.forEach((d) => params.append('exp_desc', d));
  expDurations.forEach((du) => params.append('exp_duration', du));
  eduDegrees.forEach((deg) => params.append('edu_degree', deg));
  certNames.forEach((c) => params.append('cert_name', c));

  const response = await client.get(
    '/api/v1/report/download',
    { params, responseType: 'blob' },
  );
  return response.data;
}

/**
 * Fetch Career Matches Dashboard data.
 * Sends GET /api/v1/career-matches?skills=...
 */
export async function getCareerMatches(
  skills: string[],
  expTitles: string[],
  expDescriptions: string[],
  expDurations: string[],
  eduDegrees: string[],
  certNames: string[],
): Promise<CareerMatchRole[]> {
  const params = new URLSearchParams();
  skills.forEach((s) => params.append('skills', s));
  expTitles.forEach((t) => params.append('exp_title', t));
  expDescriptions.forEach((d) => params.append('exp_desc', d));
  expDurations.forEach((du) => params.append('exp_duration', du));
  eduDegrees.forEach((deg) => params.append('edu_degree', deg));
  certNames.forEach((c) => params.append('cert_name', c));

  const response = await client.get<CareerMatchRole[]>(
    '/api/v1/career-matches',
    { params },
  );
  return response.data;
}

/**
 * Fetch AI Resume Improvement Suggestions for a target role.
 * Sends GET /api/v1/resume-improvements/{role_id}?skills=...
 */
export async function getResumeImprovements(
  roleId: string,
  skills: string[],
  name: string,
  email: string,
  phone: string,
  summary: string,
  expTitles: string[],
  expDescriptions: string[],
  expDurations: string[],
  eduDegrees: string[],
  certNames: string[],
): Promise<ResumeImprovementResponse> {
  const params = new URLSearchParams();
  skills.forEach((s) => params.append('skills', s));
  params.append('name', name);
  params.append('email', email);
  params.append('phone', phone);
  params.append('summary', summary);
  expTitles.forEach((t) => params.append('exp_title', t));
  expDescriptions.forEach((d) => params.append('exp_desc', d));
  expDurations.forEach((du) => params.append('exp_duration', du));
  eduDegrees.forEach((deg) => params.append('edu_degree', deg));
  certNames.forEach((c) => params.append('cert_name', c));

  const response = await client.get<ResumeImprovementResponse>(
    `/api/v1/resume-improvements/${roleId}`,
    { params },
  );
  return response.data;
}

/**
 * Post a user question to AI Career Mentor.
 * Sends POST /api/v1/mentor/chat
 */
export async function askCareerMentor(
  payload: CareerMentorRequest,
): Promise<CareerMentorResponse> {
  const response = await client.post<CareerMentorResponse>(
    '/api/v1/mentor/chat',
    payload,
  );
  return response.data;
}

export async function sendCareerMentorMessage(
  message: string,
  roleId: string,
  skills: string[],
  name: string,
  email: string,
  phone: string,
  summary: string,
  expTitles: string[],
  expDescriptions: string[],
  expDurations: string[],
  eduDegrees: string[],
  certNames: string[],
): Promise<CareerMentorResponse> {
  return askCareerMentor({
    message,
    role_id: roleId,
    skills,
    name,
    email,
    phone,
    summary,
    exp_titles: expTitles,
    exp_descriptions: expDescriptions,
    exp_durations: expDurations,
    edu_degrees: eduDegrees,
    cert_names: certNames,
  });
}

/**
  * Analyze candidate resume against a target Job Description.
  * Sends POST /api/v1/job-match/analyze
  */
export async function analyzeJobMatch(
  payload: JobMatchRequest,
): Promise<JobMatchResponse> {
  const response = await client.post<JobMatchResponse>(
    '/api/v1/job-match/analyze',
    payload,
  );
  return response.data;
}

/**
  * Download compiled PDF report for Job Description Match Analysis.
  * Sends POST /api/v1/job-match/report
  */
export async function downloadJobMatchReport(
  payload: JobMatchRequest,
): Promise<Blob> {
  const response = await client.post(
    '/api/v1/job-match/report',
    payload,
    { responseType: 'blob' },
  );
  return response.data;
}
