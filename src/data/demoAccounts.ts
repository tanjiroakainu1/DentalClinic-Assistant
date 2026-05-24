import type { UserProfileFields, UserRole } from '../types';

export interface DemoAccount extends UserProfileFields {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  label: string;
  subtitle: string;
}

/** Internal clinic accounts — seed data and quick-login (credentials not shown on login UI). */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'admin',
    name: 'Maria Elena Santos',
    email: 'admin@gmail.com',
    password: 'admin123',
    label: 'Admin Portal',
    subtitle: 'Clinic operations & reports',
    phone: '09171230001',
    address: 'Unit 804, Galaxy Dental Tower, Ortigas Center',
    city: 'Pasig',
    province: 'Metro Manila',
    zipCode: '1605',
    dateOfBirth: '1988-03-14',
    gender: 'female',
    department: 'Clinic Administration',
    employeeId: 'ADM-2024-001',
    bio: 'Lead clinic administrator overseeing scheduling, billing, GCash verification, and staff accounts at Dental Clinic Galaxy.',
    emergencyContactName: 'Roberto Santos',
    emergencyContactPhone: '09189876543',
    emergencyContactRelation: 'Spouse',
  },
  {
    role: 'doctor',
    name: 'Dr. Juan Miguel Reyes',
    email: 'doctor@example.com',
    password: 'doctor123',
    label: 'Doctor Portal',
    subtitle: 'General & cosmetic dentistry',
    phone: '09171230002',
    address: '12 Sampaguita St., Brgy. San Antonio',
    city: 'Quezon City',
    province: 'Metro Manila',
    zipCode: '1105',
    dateOfBirth: '1985-07-22',
    gender: 'male',
    specialization: 'General & Cosmetic Dentistry',
    licenseNumber: 'DPH-PRC-284719',
    yearsExperience: 12,
    bio: 'Board-certified dentist focused on preventive care, restorative treatments, and patient education. Available Mon–Sat at Galaxy Dental.',
    emergencyContactName: 'Ana Reyes',
    emergencyContactPhone: '09191234567',
    emergencyContactRelation: 'Spouse',
  },
  {
    role: 'patient',
    name: 'Maria Jane Dela Cruz',
    email: 'patient@example.com',
    password: 'patient123',
    label: 'Patient Portal',
    subtitle: 'Book visits & pay bills',
    phone: '09171234567',
    address: '123 Mango St., Brgy. Maligaya',
    city: 'Quezon City',
    province: 'Metro Manila',
    zipCode: '1103',
    dateOfBirth: '1996-11-08',
    gender: 'female',
    bio: 'Regular patient since 2024. Prefers morning appointments and GCash for payments.',
    emergencyContactName: 'Jose Dela Cruz',
    emergencyContactPhone: '09187654321',
    emergencyContactRelation: 'Father',
  },
];

export function getDemoAccount(role: UserRole): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find((a) => a.role === role);
}

export function demoAccountToProfile(demo: DemoAccount): UserProfileFields {
  const { role, name, email, password, label, subtitle, ...profile } = demo;
  void role;
  void name;
  void email;
  void password;
  void label;
  void subtitle;
  return profile;
}
