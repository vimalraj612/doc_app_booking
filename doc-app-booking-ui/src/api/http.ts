// src/api/http.ts
// Centralized HTTP client using fetch. You can swap to axios if preferred.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  // Prefix with base URL if not already absolute
  const fullUrl = url.startsWith('http') ? url : BASE_URL + url;
  console.log('API Fetch:', fullUrl);
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!response.ok) {
    // Optionally handle errors globally
    throw new Error(await response.text());
  }
  return response.json();
}
