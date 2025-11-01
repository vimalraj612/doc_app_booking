// Fetch slot templates for a doctor (with authorization)
export async function fetchSlotTemplatesByDoctorId(doctorId: string | number) {
  const token = window.localStorage.getItem('accessToken');
  return apiFetch<{ data: SlotTemplateDTO[] }>(
    `/api/v1/slot-templates/doctor/${doctorId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  ).then(res => res.data || []);
}

// SlotTemplateDTO type for slot template response
export type SlotTemplateDTO = {
  id: number;
  doctorId: number;
  dayOfWeek: string; // e.g., 'MONDAY'
  startTime: string; // e.g., '09:00'
  endTime: string;   // e.g., '17:00'
  slotDurationMinutes: number;
};
// Create or update a slot template for a doctor (authorization required)
export async function createOrUpdateSlotTemplate(doctorId: string | number, payload: Partial<SlotTemplateDTO>) {
  const token = window.localStorage.getItem('accessToken');
  // Return full response so callers can inspect message/data
  return apiFetch<{ data: SlotTemplateDTO; message?: string }>(
    `/api/v1/slot-templates/doctor/${doctorId}`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(payload),
    }
  );
}
// Add a new doctor (with authorization)
export async function addDoctor(doctor: Partial<DoctorDTO>) {
  const token = window.localStorage.getItem('accessToken');
  return apiFetch<{ data: DoctorDTO }>(
    '/api/v1/doctors',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(doctor),
    }
  ).then(res => res.data);
}

// Update an existing doctor by id
export async function updateDoctor(id: string | number, doctor: Partial<DoctorDTO>) {
  const token = window.localStorage.getItem('accessToken');
  return apiFetch<{ data: DoctorDTO }>(
    `/api/v1/doctors/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(doctor),
    }
  ).then(res => res.data);
}

import { apiFetch } from './http';
// DoctorDTO matches backend fields
export type DoctorDTO = {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  department: string;
  experienceYears: number;
  qualifications: string;
  profileImage?: string; // base64 or url
  imageContentType?: string;
  hospitalId: number;
  hospitalName: string;
};

// Fetch doctor by phone using new endpoint
export async function fetchDoctorByPhone(phoneNumber: string): Promise<DoctorDTO | null> {
  try {
    const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    const url = `/api/v1/doctors/phone/${encodeURIComponent(normalizedPhone)}`;
    const token = window.localStorage.getItem('accessToken') || '';
    console.log('Doctor API URL:', url, 'Bearer:', token ? '[present]' : '[missing]');
    const data = await apiFetch<{ data: DoctorDTO }>(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return data.data || null;
  } catch (e) {
    return null;
  }
}

// Search doctors by query (name, specialization, hospital, or mobile number)
export async function searchDoctors(query: string): Promise<DoctorDTO[]> {
  try {
    const url = `/api/v1/doctors/search?query=${encodeURIComponent(query)}`;
    const resp = await apiFetch<{ data: DoctorDTO[] }>(url);
    return resp.data || [];
  } catch (e) {
    return [];
  }
}

// Get today's appointment count for a doctor (authorization required)

export async function getTodayAppointmentCount(doctorId?: string) {
  const token = localStorage.getItem('accessToken');
  let id = doctorId;
  if (!id || id === 'd1') {
    id = localStorage.getItem('userId') || '';
  }
  return apiFetch<number>(
    `/api/v1/appointments/doctor/${id}/today/count`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

// Get today's free slots count for a doctor (authorization required)

export async function getTodayFreeSlotsCount(doctorId?: string) {
  const token = localStorage.getItem('accessToken');
  let id = doctorId;
  if (!id || id === 'd1') {
    id = localStorage.getItem('userId') || '';
  }
  return apiFetch<number>(
    `/api/v1/slots/doctor/${id}/today/free-count`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

// Fetch doctors by hospitalId (with authorization)
export async function fetchDoctorsByHospitalId(hospitalId: string | number) {
  const token = window.localStorage.getItem('accessToken');
  return apiFetch<{ data: DoctorDTO[] }>(
    `/api/v1/doctors/hospital/${hospitalId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  ).then(res => res.data || []);
}

// Delete a slot template by id (authorization required)
export async function deleteSlotTemplate(slotTemplateId: string | number) {
  const token = window.localStorage.getItem('accessToken');
  // Return full response so callers can show server-provided messages
  return apiFetch<{ message?: string }>(
    `/api/v1/slot-templates/${slotTemplateId}`,
    {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
}

// Delete a doctor by id
export async function deleteDoctor(doctorId: string | number) {
  const token = window.localStorage.getItem('accessToken');
  return apiFetch<void>(
    `/api/v1/doctors/${doctorId}`,
    {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
}
