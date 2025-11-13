import { apiFetch } from './http';

export interface PatientRelation {
  id: string;
  fullName: string;
  age: number; // Read-only, calculated from dateOfBirth
  dateOfBirth: string;
  phoneNumber: string;
  gender: string;
  relationship: string;
}

export interface CreatePatientRelationRequest {
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  gender: string;
  relationship: string;
}

export function getPatientRelations(patientId: string): Promise<PatientRelation[]> {
  const token = window.localStorage.getItem('accessToken');
  return apiFetch(`/api/v1/patients/${patientId}/relations`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json'
    }
  });
}

export function createPatientRelation(patientId: string, data: CreatePatientRelationRequest): Promise<PatientRelation> {
  const token = window.localStorage.getItem('accessToken');
  return apiFetch(`/api/v1/patients/${patientId}/relations`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json'
    },
  });
}

export function updatePatientRelation(relationId: string, data: CreatePatientRelationRequest): Promise<PatientRelation> {
  const token = window.localStorage.getItem('accessToken');
  return apiFetch(`/api/v1/patient-relations/${relationId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json'
    },
  });
}

export function deletePatientRelation(relationId: string): Promise<void> {
  const token = window.localStorage.getItem('accessToken');
  return apiFetch(`/api/v1/patient-relations/${relationId}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json'
    }
  });
}
