// Update appointment status (PATCH)
export async function updateAppointmentStatusApi(id: number | string, status: string, notes?: string) {
  const token = window.localStorage.getItem('accessToken') || '';
  return apiFetch(`/api/v1/appointments/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status, notes }),
  });
}
// Fetch doctor appointments by date range
export async function fetchDoctorAppointmentsByDateRange({
  doctorId,
  start,
  end,
}: {
  doctorId: string | number;
  start: string; // ISO string
  end: string;   // ISO string
}) {
  const token = window.localStorage.getItem('accessToken') || '';
  const url = `/api/v1/appointments/doctor/${doctorId}/date-range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
  return apiFetch<any[]>(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
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

export interface Slot {
  slotId: string | number;
  start: string;
  end: string;
  available: boolean;
}

export async function fetchSlotsByDoctorIdAndDate(doctorId: string | number, date: string) {
  const token = window.localStorage.getItem('accessToken') || '';
  // Use the passed doctorId directly (for AvailableSlots)
  return apiFetch<{ data: Slot[] }>(`/api/v1/slots/doctor/${doctorId}?date=${date}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}


export async function getAppointments() {
  // Replace with your backend endpoint
  return apiFetch<any[]>('/api/appointments');
}


// Book an appointment (matches PatientDashboard payload)
export async function bookAppointment(payload: {
  doctorId: string | number;
  patientPhone: string;
  patientName: string;
  appointmentDateTime: string;
  slotId: string | number;
  reserved?: boolean; // optional flag to mark reservations created by hospital/admin
}) {
  const token = window.localStorage.getItem('accessToken') || '';
  return apiFetch('/api/v1/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
}

// Reserve an appointment (matches PatientDashboard payload)
export async function reserveAppointment(payload: {
  doctorId: string | number;
  appointmentDateTime: string;
  slotId: string | number;
  reserved?: boolean; // optional flag to mark reservations created by hospital/admin
}) {
  const token = window.localStorage.getItem('accessToken') || '';
  return apiFetch('/api/v1/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
}
