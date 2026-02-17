/**
 * Base URL for API requests. Empty in development (uses Vite proxy).
 * Set VITE_API_URL in Vercel when backend is hosted separately (e.g. Render).
 */
export const API_BASE = import.meta.env.VITE_API_URL ?? '';

const TOKEN_KEY = 'vaycay_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Build headers with Authorization if a token exists */
export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/** Convenience wrapper for authenticated fetch */
export function apiFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const headers = authHeaders(
    opts.headers ? Object.fromEntries(new Headers(opts.headers as HeadersInit).entries()) : {},
  );
  return fetch(url, { ...opts, headers });
}
