// src/api/http.ts
// Centralized HTTP client using fetch. You can swap to axios if preferred.
import { apiRequest } from '../utils/api-handler';

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  return apiRequest<T>(url, options);
}
