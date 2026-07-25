/**
 * Frontend API client for Digital Twin, GitHub & LinkedIn Intelligence.
 */

import type {
  DigitalTwinRequest,
  DigitalTwinProfileResponse,
  GitHubAnalysisRequest,
  GitHubAnalysisResponse,
  LinkedInAnalysisRequest,
  LinkedInAnalysisResponse,
  CrossProfileValidationRequest,
  CrossProfileValidationResponse,
} from '../types/digitalTwin';
import client from './client';

export async function generateDigitalTwin(
  payload: DigitalTwinRequest,
): Promise<DigitalTwinProfileResponse> {
  const response = await client.post<DigitalTwinProfileResponse>(
    '/api/v1/digital-twin/generate',
    payload,
  );
  return response.data;
}

export async function analyzeGitHub(
  payload: GitHubAnalysisRequest,
): Promise<GitHubAnalysisResponse> {
  const response = await client.post<GitHubAnalysisResponse>(
    '/api/v1/github/analyze',
    payload,
  );
  return response.data;
}

export async function analyzeLinkedIn(
  payload: LinkedInAnalysisRequest,
): Promise<LinkedInAnalysisResponse> {
  const response = await client.post<LinkedInAnalysisResponse>(
    '/api/v1/linkedin/analyze',
    payload,
  );
  return response.data;
}

export async function validateCrossProfile(
  payload: CrossProfileValidationRequest,
): Promise<CrossProfileValidationResponse> {
  const response = await client.post<CrossProfileValidationResponse>(
    '/api/v1/cross-profile/validate',
    payload,
  );
  return response.data;
}
