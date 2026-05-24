import type { User, UserProfileFields, UserRole } from '../types';

export type PatientRegistrationInput = {
  name: string;
  email: string;
  password: string;
} & UserProfileFields;

export type StaffUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
} & UserProfileFields;

export const GENDER_OPTIONS: { value: User['gender']; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const PH_PROVINCES = [
  'Metro Manila',
  'Cavite',
  'Laguna',
  'Bulacan',
  'Cebu',
  'Davao del Sur',
  'Pampanga',
  'Rizal',
] as const;

export function formatUserLocation(user: Pick<User, 'address' | 'city' | 'province' | 'zipCode'>): string {
  const parts = [user.address, user.city, user.province, user.zipCode].filter(Boolean);
  return parts.join(', ') || '—';
}

export function formatUserPhone(phone?: string): string {
  return phone?.trim() || '—';
}

/** Strip empty strings so storage stays clean */
export function normalizeProfileFields(fields: UserProfileFields): UserProfileFields {
  const out: UserProfileFields = {};
  (Object.keys(fields) as (keyof UserProfileFields)[]).forEach((key) => {
    const val = fields[key];
    if (val === undefined || val === null) return;
    if (typeof val === 'string' && !val.trim()) return;
    if (key === 'yearsExperience') {
      const n = typeof val === 'number' ? val : Number(val);
      if (!n || Number.isNaN(n)) return;
      out.yearsExperience = n;
      return;
    }
    (out as Record<string, unknown>)[key] = typeof val === 'string' ? val.trim() : val;
  });
  return out;
}

export const emptyPatientRegistration = (): Omit<PatientRegistrationInput, 'password'> & {
  password: string;
  confirmPassword: string;
} => ({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  address: '',
  city: '',
  province: 'Metro Manila',
  zipCode: '',
  dateOfBirth: '',
  gender: undefined,
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
});
