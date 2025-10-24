// Cancel appointment API
export async function cancelAppointmentApi(id: number | string) {
  const token = window.localStorage.getItem('accessToken') || '';
  return apiFetch(`/api/v1/appointments/${id}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// Fetch patient appointments by date range
export async function fetchPatientAppointmentsByDateRange({
  patientId,
  start,
  end,
}: {
  patientId: string | number;
  start: string; // ISO string
  end: string;   // ISO string
}) {
  const token = window.localStorage.getItem('accessToken') || '';
  const url = `/api/v1/appointments/patient/${patientId}/date-range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
  return apiFetch<{ data: any[] }>(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
import { apiFetch } from './http';
// Appointment API functions

export async function fetchSlotsByDoctorId(doctorId: string | number) {
  const token = window.localStorage.getItem('accessToken') || '';
  return apiFetch<{ data: any[] }>(`/api/v1/slots/doctor/${doctorId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
}

export async function getAppointments() {
  // Replace with your backend endpoint
  return apiFetch<any[]>('/api/appointments');
}

export async function bookAppointment(data: {
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
}) {
  // Replace with your backend endpoint
  return apiFetch<any>(
    '/api/appointments',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}
