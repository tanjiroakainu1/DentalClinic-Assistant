import type { UserRole } from '../types';

export const roleNavLinks: Record<UserRole, { to: string; label: string; icon: string }[]> = {
  patient: [
    { to: '/patient/dashboard', label: 'Dashboard', icon: '◆' },
    { to: '/patient/appointments', label: 'Appointments', icon: '◷' },
    { to: '/patient/medical-history', label: 'Medical History', icon: '▤' },
    { to: '/patient/treatments', label: 'Treatments', icon: '✚' },
    { to: '/patient/payments', label: 'Payments', icon: '₱' },
    { to: '/patient/profile', label: 'Profile', icon: '◎' },
  ],
  doctor: [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: '◆' },
    { to: '/doctor/appointments', label: 'Appointments', icon: '◷' },
    { to: '/doctor/patient-records', label: 'Patient Records', icon: '▤' },
    { to: '/doctor/treatment-plans', label: 'Treatment Plans', icon: '✚' },
    { to: '/doctor/prescriptions', label: 'Prescriptions', icon: '⚕' },
    { to: '/doctor/schedule', label: 'Schedule', icon: '◐' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '◆' },
    { to: '/admin/users', label: 'Users', icon: '◎' },
    { to: '/admin/payments', label: 'Payments', icon: '₱' },
    { to: '/admin/appointments', label: 'Appointments', icon: '◷' },
    { to: '/admin/reports', label: 'Reports', icon: '▥' },
    { to: '/admin/analytics', label: 'Analytics', icon: '✦' },
  ],
};

export const rolePortalTitle: Record<UserRole, string> = {
  admin: 'Admin Portal',
  doctor: 'Doctor Portal',
  patient: 'Patient Portal',
};
