/**
 * Axios HTTP client instance with JWT token injection and diagnostic logging.
 */

import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const BASE_URL = rawBaseUrl.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

// Diagnostic request interceptor with JWT Bearer Token attachment
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
  console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`, config.data || '');
  return config;
});

// Diagnostic response interceptor
client.interceptors.response.use(
  (response) => {
    console.log(`[API Response ${response.status}] ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    const status = error.response?.status ?? 0;
    const url = error.config?.url ?? '';
    const detail = error.response?.data ?? error.message;

    // Handle 401 Unauthorized (Expired or invalid token)
    if (status === 401 && !url.includes('/auth/login')) {
      console.warn('[Session Expired] Invalid JWT token. Clearing session.');
      localStorage.removeItem('token');
    }

    console.error(`[API Error ${status}] ${url}:`, detail);
    return Promise.reject(error);
  },
);

export default client;
