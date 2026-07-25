/**
 * Frontend API client for AI Career Mission Control Dashboard.
 */

import type { MissionControlRequest, MissionControlResponse } from '../types/missionControl';
import client from './client';

export async function getMissionControlBriefing(
  payload: MissionControlRequest,
): Promise<MissionControlResponse> {
  const response = await client.post<MissionControlResponse>(
    '/api/v1/mission-control/briefing',
    payload,
  );
  return response.data;
}
