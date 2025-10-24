// src/api/user.ts
// User API functions
import { apiFetch } from './http';

export async function getUserProfile(userId: string) {
  // Replace with your backend endpoint
  return apiFetch<any>(`/api/users/${userId}`);
}

export async function updateUserProfile(userId: string, data: any) {
  // Replace with your backend endpoint
  return apiFetch<any>(
    `/api/users/${userId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}
