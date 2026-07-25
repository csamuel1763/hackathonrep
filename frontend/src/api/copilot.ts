/**
 * Frontend API client for AI Career Copilot & What-If Simulator.
 */

import type {
  CopilotStateRequest,
  CopilotStateResponse,
  WhatIfSimulationRequest,
  WhatIfSimulationResponse,
} from '../types/copilot';
import client from './client';

export async function getCopilotState(
  payload: CopilotStateRequest,
): Promise<CopilotStateResponse> {
  const response = await client.post<CopilotStateResponse>(
    '/api/v1/copilot/state',
    payload,
  );
  return response.data;
}

export async function runWhatIfSimulation(
  payload: WhatIfSimulationRequest,
): Promise<WhatIfSimulationResponse> {
  const response = await client.post<WhatIfSimulationResponse>(
    '/api/v1/copilot/what-if',
    payload,
  );
  return response.data;
}
