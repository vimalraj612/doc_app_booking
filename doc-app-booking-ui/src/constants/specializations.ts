// Reusable list of doctor specializations (key/value pairs)
// Keep this small and canonical so other components can reuse it.
export const SPECIALIZATION_OPTIONS: { value: string; label: string }[] = [
  { value: 'GENERALPRACTITIONER', label: 'General Practitioner' },
  { value: 'CARDIOLOGY', label: 'Cardiology' },
  { value: 'DERMATOLOGY', label: 'Dermatology' },
  { value: 'PEDIATRICS', label: 'Pediatrics' },
  { value: 'ORTHOPEDICS', label: 'Orthopedics' },
  { value: 'GYNECOLOGY', label: 'Gynecology' },
  { value: 'ENT', label: 'ENT' },
  { value: 'NEUROLOGY', label: 'Neurology' },
  { value: 'PSYCHIATRY', label: 'Psychiatry' },
  { value: 'RADIOLOGY', label: 'Radiology' },
  { value: 'ONCOLOGY', label: 'Oncology' },
  { value: 'ENDOCRINOLOGY', label: 'Endocrinology' },
];

export default SPECIALIZATION_OPTIONS;
