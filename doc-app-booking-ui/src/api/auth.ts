// src/api/auth.ts
// Authentication API functions
import { apiFetch } from './http';

// Step 1: Send OTP to patient phone number
export async function sendPatientOtp(phoneNumber: string) {
  // Calls /api/v1/auth/patient/send-otp with phoneNumber as param
  const params = new URLSearchParams({ phoneNumber });
  return apiFetch<{ success: boolean }>(
    `/api/v1/auth/patient/send-otp?${params.toString()}`,
    {
      method: 'POST',
    }
  );
}

// Step 2: Verify OTP for patient
export async function verifyPatientOtp(phoneNumber: string, otp: string) {
  // Calls /api/v1/auth/patient/verify-otp with phoneNumber and otp as params
  const params = new URLSearchParams({ phoneNumber, otp });
  return apiFetch<{
    success: boolean;
    message: string;
    data: {
      token: string;
      role: string;
      userId: number;
      phoneNumber: string;
      message: string;
    };
    timestamp: string;
  }>(
    `/api/v1/auth/patient/verify-otp?${params.toString()}`,
    {
      method: 'POST',
    }
  );
}

export async function logout() {
  // Implement logout logic if needed
  return Promise.resolve();
}
