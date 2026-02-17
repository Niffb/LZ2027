/**
 * Base URL for API requests. Empty in development (uses Vite proxy).
 * Set VITE_API_URL in Vercel when backend is hosted separately (e.g. Render).
 */
export const API_BASE = import.meta.env.VITE_API_URL ?? '';
