import { apiFetch } from './http';

export interface DoctorLeaveRequest {
  doctorId: number | string;
  date: string; // YYYY-MM-DD
  reason?: string;
}

export interface DoctorLeaveResponse {
  id: number;
  doctorId: number;
  date: string;
  reason?: string;
}

export async function createDoctorLeave(payload: DoctorLeaveRequest) {
  const token = window.localStorage.getItem('accessToken') || '';
  return apiFetch<DoctorLeaveResponse>('/api/v1/doctor-leaves', {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchDoctorLeavesForDoctor(doctorId: number | string) {
  const token = window.localStorage.getItem('accessToken') || '';
  return apiFetch<DoctorLeaveResponse[]>(`/api/v1/doctor-leaves/doctor/${doctorId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function deleteDoctorLeave(id: number | string) {
  const token = window.localStorage.getItem('accessToken') || '';
  const res = await fetch((import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + `/api/v1/doctor-leaves/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  // No content expected
  return;
}
