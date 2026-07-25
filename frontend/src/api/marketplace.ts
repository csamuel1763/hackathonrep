/**
 * Frontend API client for Cyber Career Marketplace & Live Job Discovery.
 */

import type { MarketplaceSearchRequest, MarketplaceSearchResponse } from '../types/marketplace';
import client from './client';

export async function searchMarketplace(
  payload: MarketplaceSearchRequest,
): Promise<MarketplaceSearchResponse> {
  const response = await client.post<MarketplaceSearchResponse>(
    '/api/v1/marketplace/search',
    payload,
  );
  return response.data;
}
