// Patient profile type for type safety
export type PatientProfile = {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  latitude?: string; // or number
  longitude?: string; // or number
  dateOfBirth?: string;
  gender?: string;
};

// Update patient profile (for patient or hospital admin)
export async function updatePatientProfile(id: number | string, data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
}) {
  const token = window.localStorage.getItem('accessToken');
  return apiFetch<any>(
    `/api/v1/patients/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    }
  );
}
// src/api/user.ts
// User API functions
import { apiFetch } from './http';

export async function getPatientUserProfile(userId: string): Promise<any> {
  const token = window.localStorage.getItem('accessToken');
  // Return the full API response (success, message, data, etc.)
  return apiFetch<any>(
    `/api/v1/patients/${userId}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json'
      }
    }
  );
}
