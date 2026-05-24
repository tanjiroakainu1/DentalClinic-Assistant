import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { getAppointmentAnalytics, getPaymentAnalytics, getUserAnalytics } from '../lib/analytics';
import { enrichAppointments, enrichPayments, enrichTreatments } from '../lib/selectors';
import {
  getAppointments,
  getDoctorPatients,
  getDoctorSchedule,
  getMedicalHistories,
  getPaymentStatusForTreatment,
  getPayments,
  getPrescriptions,
  getTimeOffs,
  getTreatmentTemplates,
  getTreatments,
  getUnpaidTreatments,
  getUserById,
  getUsers,
} from '../lib/storage';
import type { AppointmentStatus, UserRole } from '../types';

export function useClinicUsers(role?: UserRole) {
  const { version } = useData();
  return useMemo(() => getUsers(role), [version, role]);
}

export function useClinicUserMap() {
  const { appData } = useData();
  return useMemo(() => new Map(appData.users.map((u) => [u.id, u])), [appData.users]);
}

export function useClinicUser(id: number) {
  const { version } = useData();
  return useMemo(() => getUserById(id), [version, id]);
}

export function useClinicAppointments(filters?: {
  patientId?: number;
  doctorId?: number;
  status?: AppointmentStatus;
  date?: string;
  search?: string;
}) {
  const { version } = useData();
  const filterKey = JSON.stringify(filters ?? {});
  return useMemo(() => enrichAppointments(getAppointments(filters)), [version, filterKey]);
}

export function useClinicTreatments(filters?: { patientId?: number; doctorId?: number }) {
  const { version } = useData();
  const filterKey = JSON.stringify(filters ?? {});
  return useMemo(() => enrichTreatments(getTreatments(filters)), [version, filterKey]);
}

export function useClinicPayments(filters?: { patientId?: number }) {
  const { version } = useData();
  const filterKey = JSON.stringify(filters ?? {});
  return useMemo(() => enrichPayments(getPayments(filters)), [version, filterKey]);
}

export function useClinicUnpaidTreatments(patientId: number) {
  const { version } = useData();
  return useMemo(() => enrichTreatments(getUnpaidTreatments(patientId)), [version, patientId]);
}

export function useClinicMedicalHistory(patientId: number) {
  const { version } = useData();
  return useMemo(() => getMedicalHistories(patientId), [version, patientId]);
}

export function useClinicPrescriptions(filters?: { doctorId?: number; patientId?: number }) {
  const { version } = useData();
  const filterKey = JSON.stringify(filters ?? {});
  return useMemo(() => getPrescriptions(filters), [version, filterKey]);
}

export function useClinicTreatmentTemplates(doctorId: number) {
  const { version } = useData();
  return useMemo(() => getTreatmentTemplates(doctorId), [version, doctorId]);
}

export function useClinicDoctorSchedule(doctorId: number) {
  const { version } = useData();
  return useMemo(() => getDoctorSchedule(doctorId), [version, doctorId]);
}

export function useClinicTimeOffs(doctorId: number) {
  const { version } = useData();
  return useMemo(() => getTimeOffs(doctorId), [version, doctorId]);
}

export function useClinicDoctorPatients(doctorId: number) {
  const { version } = useData();
  return useMemo(() => getDoctorPatients(doctorId), [version, doctorId]);
}

export function useClinicAppointmentAnalytics() {
  const { version } = useData();
  return useMemo(() => getAppointmentAnalytics(), [version]);
}

export function useClinicPaymentAnalytics() {
  const { version } = useData();
  return useMemo(() => getPaymentAnalytics(), [version]);
}

export function useClinicUserAnalytics() {
  const { version } = useData();
  return useMemo(() => getUserAnalytics(), [version]);
}

export function usePaymentStatus(treatmentId: number) {
  const { version } = useData();
  return useMemo(() => getPaymentStatusForTreatment(treatmentId), [version, treatmentId]);
}
