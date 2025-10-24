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
