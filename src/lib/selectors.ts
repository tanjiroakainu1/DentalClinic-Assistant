import type { Appointment, Payment, Treatment, User } from '../types';
import { getAppData } from './storage';

export function getUserMap(): Map<number, User> {
  return new Map(getAppData().users.map((u) => [u.id, u]));
}

export function getUserName(id: number, users?: Map<number, User>): string {
  const map = users ?? getUserMap();
  return map.get(id)?.name ?? 'Unknown';
}

export interface AppointmentWithNames extends Appointment {
  patientName: string;
  doctorName: string;
  doctorSpecialization?: string;
}

export function enrichAppointments(appointments: Appointment[]): AppointmentWithNames[] {
  const users = getUserMap();
  return appointments.map((a) => ({
    ...a,
    patientName: getUserName(a.patientId, users),
    doctorName: getUserName(a.doctorId, users),
    doctorSpecialization: users.get(a.doctorId)?.specialization,
  }));
}

export interface PaymentWithDetails extends Payment {
  diagnosis: string;
  treatmentPlan: string;
  patientName: string;
  doctorName: string;
  treatmentCost: number;
}

export function enrichPayments(payments: Payment[]): PaymentWithDetails[] {
  const data = getAppData();
  const users = new Map(data.users.map((u) => [u.id, u]));
  return payments.map((p) => {
    const treatment = data.treatments.find((t) => t.id === p.treatmentId);
    const patient = treatment ? users.get(treatment.patientId) : undefined;
    const doctor = treatment ? users.get(treatment.doctorId) : undefined;
    return {
      ...p,
      diagnosis: treatment?.diagnosis ?? '',
      treatmentPlan: treatment?.treatmentPlan ?? '',
      patientName: patient?.name ?? 'Unknown',
      doctorName: doctor?.name ?? 'Unknown',
      treatmentCost: treatment?.cost ?? 0,
    };
  });
}

export interface TreatmentWithNames extends Treatment {
  doctorName: string;
  doctorSpecialization?: string;
  paymentStatus: string;
  paymentReference?: string;
}

export function enrichTreatments(treatments: Treatment[]): TreatmentWithNames[] {
  const data = getAppData();
  const users = new Map(data.users.map((u) => [u.id, u]));
  return treatments.map((t) => {
    const payment = data.payments.find((p) => p.treatmentId === t.id);
    const doctor = users.get(t.doctorId);
    return {
      ...t,
      doctorName: doctor?.name ?? 'Unknown',
      doctorSpecialization: doctor?.specialization,
      paymentStatus: !payment ? 'unpaid' : payment.status,
      paymentReference: payment?.referenceNumber,
    };
  });
}
