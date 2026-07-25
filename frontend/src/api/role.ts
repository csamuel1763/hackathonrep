import type { CybersecurityRole } from '../types/role';
import client from './client';

/**
 * Fetch all available cybersecurity roles from the local taxonomy.
 */
export async function fetchRoles(): Promise<CybersecurityRole[]> {
  const response = await client.get<CybersecurityRole[]>('/api/v1/roles');
  return response.data;
}

/**
 * Fetch details of a specific cybersecurity role by ID.
 */
export async function fetchRoleById(roleId: string): Promise<CybersecurityRole> {
  const response = await client.get<CybersecurityRole>(`/api/v1/roles/${roleId}`);
  return response.data;
}
