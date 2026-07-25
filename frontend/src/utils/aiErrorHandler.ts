/**
 * AIErrorHandler
 *
 * Centralised utility for classifying backend AI API errors and
 * turning them into professional, user-facing messages.
 */

export type AIErrorKind =
  | 'quota_exceeded'    // HTTP 429 — rate limit / quota exhausted
  | 'network_error'     // No connection / fetch failed
  | 'timeout'           // Request timed out
  | 'invalid_api_key'   // HTTP 401 / 403 — bad key / config
  | 'backend_error'     // Any other server error
  | 'unknown';          // Catch-all

export interface AIErrorInfo {
  kind: AIErrorKind;
  /** Short headline shown in the chat bubble */
  headline: string;
  /** Longer explanation shown below the headline */
  detail: string;
  /** Suggested retry delay in seconds; undefined if retry not applicable */
  retryAfterSeconds?: number;
  /** Whether a Retry button should be offered to the user */
  canRetry: boolean;
}

// ─── Internal helpers ───────────────────────────────────────────────────────

function extractRetryDelay(err: any): number | undefined {
  const headerVal = err?.response?.headers?.['retry-after'];
  if (headerVal) {
    const parsed = Number(headerVal);
    if (!Number.isNaN(parsed) && parsed > 0) return Math.ceil(parsed);
  }

  const details: any[] = err?.response?.data?.error?.details ?? [];
  for (const d of details) {
    if (d?.retryDelay) {
      const match = String(d.retryDelay).match(/^(\d+)/);
      if (match) return Number(match[1]);
    }
  }

  const backendRetry = err?.response?.data?.retry_after;
  if (typeof backendRetry === 'number' && backendRetry > 0) return Math.ceil(backendRetry);

  return undefined;
}

function isNetworkError(err: any): boolean {
  return !err?.response && (err?.code === 'ERR_NETWORK' || err?.message?.toLowerCase().includes('network') || err?.code === 'ECONNREFUSED');
}

function isTimeoutError(err: any): boolean {
  return err?.code === 'ECONNABORTED' || err?.message?.toLowerCase().includes('timeout');
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function classifyAIError(err: any, label = 'AI API error'): AIErrorInfo {
  console.error(`[CareerPilot] ${label}:`, err);

  if (isTimeoutError(err)) {
    return {
      kind: 'timeout',
      headline: 'AI is taking longer than expected.',
      detail: 'Request timed out. Please retry.',
      canRetry: true,
    };
  }

  if (isNetworkError(err)) {
    return {
      kind: 'network_error',
      headline: 'Unable to reach AI service.',
      detail: 'Please check your internet connection and try again.',
      canRetry: true,
    };
  }

  const status: number | undefined = err?.response?.status;
  const backendMessage: string | undefined = err?.response?.data?.error;

  if (status === 429) {
    const delay = extractRetryDelay(err);
    return {
      kind: 'quota_exceeded',
      headline: '⚠️ AI service is busy. Please try again.',
      detail: backendMessage || 'AI service rate limit reached. Please wait a few moments.',
      retryAfterSeconds: delay,
      canRetry: true,
    };
  }

  if (status === 401 || status === 403) {
    return {
      kind: 'invalid_api_key',
      headline: 'Invalid AI configuration.',
      detail: backendMessage || 'The AI service is not correctly configured. Please contact the administrator.',
      canRetry: false,
    };
  }

  if (status && status >= 500) {
    return {
      kind: 'backend_error',
      headline: 'AI service unavailable.',
      detail: backendMessage || 'The AI service returned an error. Please try again.',
      canRetry: true,
    };
  }

  if (status && status >= 400) {
    return {
      kind: 'backend_error',
      headline: 'Something went wrong processing your request.',
      detail: backendMessage || 'Please try again or upload a different file.',
      canRetry: true,
    };
  }

  return {
    kind: 'unknown',
    headline: 'Something went wrong.',
    detail: 'An unexpected error occurred. Please try again.',
    canRetry: true,
  };
}

// ─── Exponential-backoff retry wrapper ──────────────────────────────────────

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 5_000;

export async function withAIRetry<T>(
  fn: () => Promise<T>,
  onRetry?: (attempt: number, delaySeconds: number) => void,
): Promise<T> {
  let lastErr: any;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;

      const status: number | undefined = err?.response?.status;

      if (status !== 429 || attempt >= MAX_RETRIES) {
        throw err;
      }

      const serverDelay = extractRetryDelay(err);
      const backoffSeconds = serverDelay ?? Math.pow(2, attempt) * (BASE_DELAY_MS / 1000);
      const delayMs = Math.ceil(backoffSeconds) * 1000;

      console.warn(
        `[CareerPilot] AI 429 on attempt ${attempt + 1}/${MAX_RETRIES + 1}. ` +
        `Retrying in ${backoffSeconds}s…`,
      );

      if (onRetry) {
        onRetry(attempt + 1, Math.ceil(backoffSeconds));
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastErr;
}
