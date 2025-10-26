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
