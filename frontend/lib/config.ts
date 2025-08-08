/**
 * Resolve the backend base URL.
 * Falls back to local FastAPI default when env var is undefined.
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";