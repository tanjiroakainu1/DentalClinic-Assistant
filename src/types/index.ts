export type UserRole = 'patient' | 'doctor' | 'admin';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export type PaymentStatus = 'pending' | 'completed' | 'rejected' | 'refunded';

export type PaymentMethod = 'cash' | 'card' | 'gcash' | 'bank_transfer' | 'insurance';

export type TreatmentStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export type PrescriptionStatus = 'active' | 'completed' | 'cancelled';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type UserGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

/** Profile fields shared by registration, admin create, and demo seed data */
export interface UserProfileFields {
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  dateOfBirth?: string;
  gender?: UserGender;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  specialization?: string;
  licenseNumber?: string;
  yearsExperience?: number;
  department?: string;
  employeeId?: string;
  bio?: string;
  profilePhoto?: string;
}

export interface User extends UserProfileFields {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MedicalHistoryCategory = 'allergy' | 'medication' | 'condition' | 'surgery' | 'other';

export interface MedicalHistory {
  id: number;
  patientId: number;
  category: MedicalHistoryCategory;
  title: string;
  details: string;
  /** Legacy single-form fields (migrated on read when category is missing) */
  allergies?: string;
  medications?: string;
  medicalConditions?: string;
  previousSurgeries?: string;
  bloodType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Treatment {
  id: number;
  patientId: number;
  doctorId: number;
  diagnosis: string;
  treatmentPlan: string;
  treatmentType?: string;
  teethInvolved?: string;
  notes?: string;
  status: TreatmentStatus;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  treatmentId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  /** Auto-generated clinic reference (e.g. GAL-20250524-K7M3P9) */
  referenceNumber?: string;
  status: PaymentStatus;
  paymentDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: number;
  patientId: number;
  doctorId: number;
  treatmentId?: number;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  notes?: string;
  status: PrescriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentTemplate {
  id: number;
  doctorId: number;
  title: string;
  category: string;
  description: string;
  procedureSteps: string;
  estimatedCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorSchedule {
  id: number;
  doctorId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeOff {
  id: number;
  doctorId: number;
  startDate: string;
  endDate: string;
  reason?: string;
  createdAt: string;
}

export interface AppData {
  users: User[];
  appointments: Appointment[];
  medicalHistories: MedicalHistory[];
  treatments: Treatment[];
  payments: Payment[];
  prescriptions: Prescription[];
  treatmentTemplates: TreatmentTemplate[];
  doctorSchedules: DoctorSchedule[];
  timeOffs: TimeOff[];
  nextId: number;
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  profilePhoto?: string;
}
