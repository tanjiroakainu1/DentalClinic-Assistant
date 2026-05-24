import type {
  AppData,
  Appointment,
  AppointmentStatus,
  DoctorSchedule,
  MedicalHistory,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Prescription,
  SessionUser,
  TimeOff,
  Treatment,
  TreatmentTemplate,
  User,
  UserRole,
} from '../types';
import { DEMO_ACCOUNTS, demoAccountToProfile } from '../data/demoAccounts';
import { createSeedData } from '../data/seed';
import { generatePaymentReference } from './paymentRef';
import { normalizeProfileFields, type PatientRegistrationInput, type StaffUserInput } from './userProfile';
import { hashPassword, nowISO, verifyPassword } from './utils';
import type { UserProfileFields } from '../types';

export const STORAGE_KEY = 'clinic_dental_system_data';
const SESSION_KEY = 'clinic_dental_session';
export const DATA_CHANGE_EVENT = 'clinic-data-changed';

function notifyDataChange(): void {
  window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
}

function applyDemoProfile(user: User, demo: (typeof DEMO_ACCOUNTS)[number]): User {
  const profile = demoAccountToProfile(demo);
  return {
    ...user,
    name: demo.name,
    ...profile,
    updatedAt: nowISO(),
  };
}

function enrichDemoUserProfiles(data: AppData): AppData {
  let changed = false;
  data.users = data.users.map((user) => {
    const demo = DEMO_ACCOUNTS.find((d) => d.email.toLowerCase() === user.email.toLowerCase());
    if (!demo) return user;
    const enriched = applyDemoProfile(user, demo);
    if (JSON.stringify(enriched) !== JSON.stringify(user)) {
      changed = true;
      return enriched;
    }
    return user;
  });
  if (changed) saveData(data);
  return data;
}

function ensureDemoUsers(data: AppData): AppData {
  let changed = false;
  const now = nowISO();
  for (const demo of DEMO_ACCOUNTS) {
    const idx = data.users.findIndex((u) => u.email.toLowerCase() === demo.email.toLowerCase());
    if (idx === -1) {
      data.users.push({
        id: nextId(data),
        name: demo.name,
        email: demo.email,
        password: hashPassword(demo.password),
        role: demo.role,
        ...demoAccountToProfile(demo),
        createdAt: now,
        updatedAt: now,
      });
      changed = true;
    } else {
      const updated = applyDemoProfile(data.users[idx], demo);
      if (JSON.stringify(updated) !== JSON.stringify(data.users[idx])) {
        data.users[idx] = updated;
        changed = true;
      }
    }
  }
  if (changed) saveData(data);
  return enrichDemoUserProfiles(data);
}

function loadData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = createSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  const data = JSON.parse(raw) as AppData;
  return ensureDemoUsers(data);
}

function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  notifyDataChange();
}

function nextId(data: AppData): number {
  const id = data.nextId;
  data.nextId += 1;
  return id;
}

/** Ensure localStorage is initialized with seed data on first load. */
export function initStorage(): AppData {
  return loadData();
}

/** Read full app state from localStorage (single source of truth). */
export function getAppData(): AppData {
  return loadData();
}

export function getSession(): SessionUser | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as SessionUser) : null;
}

export function setSession(user: SessionUser | null): void {
  if (user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function login(email: string, password: string): SessionUser | null {
  const data = loadData();
  const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user.password)) return null;
  const session: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePhoto: user.profilePhoto,
  };
  setSession(session);
  return session;
}

export function logout(): void {
  setSession(null);
}

/** Public registration — patients only. Doctors/admins are created in User Management. */
export function register(input: PatientRegistrationInput): { success: boolean; error?: string } {
  const data = loadData();
  if (data.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    return { success: false, error: 'Email already exists' };
  }
  if (!input.phone?.trim()) {
    return { success: false, error: 'Mobile number is required.' };
  }
  const now = nowISO();
  const { password, name, email, ...profile } = input;
  const user: User = {
    id: nextId(data),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashPassword(password),
    role: 'patient',
    ...normalizeProfileFields(profile),
    createdAt: now,
    updatedAt: now,
  };
  data.users.push(user);
  saveData(data);
  return { success: true };
}

export function getUsers(role?: UserRole): User[] {
  const data = loadData();
  return role ? data.users.filter((u) => u.role === role) : [...data.users];
}

export function getUserById(id: number): User | undefined {
  return loadData().users.find((u) => u.id === id);
}

export function createUser(input: StaffUserInput): { success: boolean; error?: string } {
  const data = loadData();
  if (data.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    return { success: false, error: 'Email already exists.' };
  }
  const now = nowISO();
  const { password, name, email, role, ...profile } = input;
  data.users.push({
    id: nextId(data),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashPassword(password),
    role,
    ...normalizeProfileFields(profile),
    createdAt: now,
    updatedAt: now,
  });
  saveData(data);
  return { success: true };
}

type UserUpdateFields = Partial<Pick<User, 'name' | 'email' | 'role'>> &
  UserProfileFields & { password?: string };

export function updateUser(id: number, updates: UserUpdateFields): { success: boolean; error?: string } {
  const data = loadData();
  const idx = data.users.findIndex((u) => u.id === id);
  if (idx === -1) return { success: false, error: 'User not found' };
  if (updates.email && data.users.some((u) => u.email === updates.email && u.id !== id)) {
    return { success: false, error: 'Email already exists for another user.' };
  }
  const user = data.users[idx];
  const { password, name, email, role, ...profile } = updates;
  data.users[idx] = {
    ...user,
    ...(name !== undefined ? { name: name.trim() } : {}),
    ...(email !== undefined ? { email: email.trim().toLowerCase() } : {}),
    ...(role !== undefined ? { role } : {}),
    ...normalizeProfileFields(profile),
    password: password ? hashPassword(password) : user.password,
    updatedAt: nowISO(),
  };
  saveData(data);
  const session = getSession();
  if (session?.id === id) {
    setSession({
      id,
      name: data.users[idx].name,
      email: data.users[idx].email,
      role: data.users[idx].role,
      profilePhoto: data.users[idx].profilePhoto,
    });
  }
  return { success: true };
}

export function deleteUser(id: number): { success: boolean; error?: string } {
  const data = loadData();
  const treatmentIds = data.treatments.filter((t) => t.patientId === id).map((t) => t.id);

  data.users = data.users.filter((u) => u.id !== id);
  data.appointments = data.appointments.filter((a) => a.patientId !== id && a.doctorId !== id);
  data.medicalHistories = data.medicalHistories.filter((m) => m.patientId !== id);
  data.treatments = data.treatments.filter((t) => t.patientId !== id && t.doctorId !== id);
  data.payments = data.payments.filter((p) => !treatmentIds.includes(p.treatmentId));
  data.prescriptions = data.prescriptions.filter((p) => p.patientId !== id && p.doctorId !== id);
  data.treatmentTemplates = data.treatmentTemplates.filter((t) => t.doctorId !== id);
  data.doctorSchedules = data.doctorSchedules.filter((s) => s.doctorId !== id);
  data.timeOffs = data.timeOffs.filter((t) => t.doctorId !== id);
  saveData(data);
  return { success: true };
}

export function getAppointments(filters?: {
  patientId?: number;
  doctorId?: number;
  status?: AppointmentStatus;
  date?: string;
  search?: string;
}): Appointment[] {
  const data = loadData();
  let list = [...data.appointments];
  if (filters?.patientId !== undefined) list = list.filter((a) => a.patientId === filters.patientId);
  if (filters?.doctorId !== undefined) list = list.filter((a) => a.doctorId === filters.doctorId);
  if (filters?.status) list = list.filter((a) => a.status === filters.status);
  if (filters?.date) {
    list = list.filter((a) => a.appointmentDate.startsWith(filters.date!));
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter((a) => {
      const patient = data.users.find((u) => u.id === a.patientId);
      const doctor = data.users.find((u) => u.id === a.doctorId);
      return (
        patient?.name.toLowerCase().includes(q) || doctor?.name.toLowerCase().includes(q)
      );
    });
  }
  return list.sort(
    (a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
  );
}

export function createAppointment(input: {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  reason: string;
}): { success: boolean; error?: string } {
  const data = loadData();
  const conflict = data.appointments.find(
    (a) =>
      a.doctorId === input.doctorId &&
      a.appointmentDate === input.appointmentDate &&
      a.status !== 'cancelled'
  );
  if (conflict) {
    return { success: false, error: 'The selected time is not available. Please choose another time.' };
  }
  const now = nowISO();
  data.appointments.push({
    id: nextId(data),
    patientId: input.patientId,
    doctorId: input.doctorId,
    appointmentDate: input.appointmentDate,
    reason: input.reason,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  });
  saveData(data);
  return { success: true };
}

export function updateAppointmentStatus(
  id: number,
  status: AppointmentStatus
): { success: boolean; error?: string } {
  const data = loadData();
  const appt = data.appointments.find((a) => a.id === id);
  if (!appt) return { success: false, error: 'Appointment not found' };
  appt.status = status;
  appt.updatedAt = nowISO();
  saveData(data);
  return { success: true };
}

function normalizeMedicalHistory(entry: MedicalHistory): MedicalHistory {
  if (entry.category && entry.title) return entry;
  const details = [
    entry.allergies && `Allergies: ${entry.allergies}`,
    entry.medications && `Medications: ${entry.medications}`,
    entry.medicalConditions && `Conditions: ${entry.medicalConditions}`,
    entry.previousSurgeries && `Surgeries: ${entry.previousSurgeries}`,
    entry.bloodType && `Blood type: ${entry.bloodType}`,
  ]
    .filter(Boolean)
    .join('\n');
  return {
    ...entry,
    category: entry.category ?? 'other',
    title: entry.title || 'General medical history',
    details: entry.details || details || 'No details recorded.',
  };
}

export function getMedicalHistories(patientId: number): MedicalHistory[] {
  return loadData()
    .medicalHistories.filter((m) => m.patientId === patientId)
    .map(normalizeMedicalHistory)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/** @deprecated Use getMedicalHistories — returns first entry if any */
export function getMedicalHistory(patientId: number): MedicalHistory | undefined {
  return getMedicalHistories(patientId)[0];
}

export function createMedicalHistoryEntry(
  patientId: number,
  input: { category: MedicalHistory['category']; title: string; details: string }
): { success: boolean; id?: number } {
  const data = loadData();
  const now = nowISO();
  const id = nextId(data);
  data.medicalHistories.push({
    id,
    patientId,
    category: input.category,
    title: input.title.trim(),
    details: input.details.trim(),
    createdAt: now,
    updatedAt: now,
  });
  saveData(data);
  return { success: true, id };
}

export function updateMedicalHistoryEntry(
  id: number,
  patientId: number,
  input: { category: MedicalHistory['category']; title: string; details: string }
): { success: boolean; error?: string } {
  const data = loadData();
  const idx = data.medicalHistories.findIndex((m) => m.id === id && m.patientId === patientId);
  if (idx === -1) return { success: false, error: 'Record not found.' };
  data.medicalHistories[idx] = {
    ...normalizeMedicalHistory(data.medicalHistories[idx]),
    category: input.category,
    title: input.title.trim(),
    details: input.details.trim(),
    updatedAt: nowISO(),
  };
  saveData(data);
  return { success: true };
}

export function deleteMedicalHistoryEntry(
  id: number,
  patientId: number
): { success: boolean; error?: string } {
  const data = loadData();
  const before = data.medicalHistories.length;
  data.medicalHistories = data.medicalHistories.filter((m) => !(m.id === id && m.patientId === patientId));
  if (data.medicalHistories.length === before) return { success: false, error: 'Record not found.' };
  saveData(data);
  return { success: true };
}

export function getTreatments(filters?: { patientId?: number; doctorId?: number }): Treatment[] {
  const data = loadData();
  let list = [...data.treatments];
  if (filters?.patientId !== undefined) list = list.filter((t) => t.patientId === filters.patientId);
  if (filters?.doctorId !== undefined) list = list.filter((t) => t.doctorId === filters.doctorId);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createTreatment(input: {
  patientId: number;
  doctorId: number;
  diagnosis: string;
  treatmentPlan: string;
  notes?: string;
  cost: number;
}): void {
  const data = loadData();
  const now = nowISO();
  data.treatments.push({
    id: nextId(data),
    patientId: input.patientId,
    doctorId: input.doctorId,
    diagnosis: input.diagnosis,
    treatmentPlan: input.treatmentPlan,
    notes: input.notes,
    status: 'planned',
    cost: input.cost,
    createdAt: now,
    updatedAt: now,
  });
  saveData(data);
}

function normalizePaymentReference(payment: Payment): Payment {
  if (payment.referenceNumber?.trim()) return payment;
  return {
    ...payment,
    referenceNumber: `GAL-LEGACY-${payment.id.toString().padStart(6, '0')}`,
  };
}

export function getPayments(filters?: { patientId?: number }): Payment[] {
  const data = loadData();
  let list = [...data.payments].map(normalizePaymentReference);
  if (filters?.patientId) {
    const treatmentIds = data.treatments
      .filter((t) => t.patientId === filters.patientId)
      .map((t) => t.id);
    list = list.filter((p) => treatmentIds.includes(p.treatmentId));
  }
  return list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
}

export function getUnpaidTreatments(patientId: number): Treatment[] {
  const data = loadData();
  return data.treatments.filter((t) => {
    if (t.patientId !== patientId) return false;
    const payment = data.payments.find((p) => p.treatmentId === t.id);
    return !payment || payment.status !== 'completed';
  });
}

export function createPayment(input: {
  treatmentId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
}): { success: boolean; error?: string; referenceNumber?: string; id?: number } {
  const data = loadData();
  const treatment = data.treatments.find((t) => t.id === input.treatmentId);
  if (!treatment) return { success: false, error: 'Invalid treatment selected.' };
  if (input.amount !== treatment.cost) {
    return { success: false, error: 'Payment amount must match the treatment cost.' };
  }
  const existing = data.payments.find((p) => p.treatmentId === input.treatmentId);
  if (existing && (existing.status === 'completed' || existing.status === 'pending')) {
    return { success: false, error: 'This treatment already has an active payment on file.' };
  }
  const now = nowISO();
  const status: PaymentStatus = input.paymentMethod === 'gcash' ? 'pending' : 'completed';
  const existingRefs = data.payments.map((p) => p.referenceNumber).filter(Boolean) as string[];
  const referenceNumber =
    input.referenceNumber?.trim() || generatePaymentReference(existingRefs);
  const id = nextId(data);
  data.payments.push({
    id,
    treatmentId: input.treatmentId,
    amount: input.amount,
    paymentMethod: input.paymentMethod,
    referenceNumber,
    status,
    paymentDate: now,
    createdAt: now,
    updatedAt: now,
  });
  saveData(data);
  return { success: true, referenceNumber, id };
}

export function updatePaymentStatus(id: number, status: PaymentStatus): void {
  const data = loadData();
  const payment = data.payments.find((p) => p.id === id);
  if (payment) {
    payment.status = status;
    payment.updatedAt = nowISO();
    saveData(data);
  }
}

export function getPrescriptions(filters?: {
  doctorId?: number;
  patientId?: number;
}): Prescription[] {
  const data = loadData();
  let list = [...data.prescriptions];
  if (filters?.doctorId) list = list.filter((p) => p.doctorId === filters.doctorId);
  if (filters?.patientId) list = list.filter((p) => p.patientId === filters.patientId);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createPrescription(input: Omit<Prescription, 'id' | 'status' | 'createdAt' | 'updatedAt'>): {
  success: boolean;
  error?: string;
} {
  const data = loadData();
  const hasAccess = data.appointments.some(
    (a) => a.doctorId === input.doctorId && a.patientId === input.patientId
  );
  if (!hasAccess) {
    return { success: false, error: "You don't have access to prescribe medication for this patient." };
  }
  const now = nowISO();
  data.prescriptions.push({
    ...input,
    id: nextId(data),
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });
  saveData(data);
  return { success: true };
}

export function updatePrescriptionStatus(id: number, status: Prescription['status']): void {
  const data = loadData();
  const rx = data.prescriptions.find((p) => p.id === id);
  if (rx) {
    rx.status = status;
    rx.updatedAt = nowISO();
    saveData(data);
  }
}

export function getTreatmentTemplates(doctorId: number): TreatmentTemplate[] {
  return loadData().treatmentTemplates.filter((t) => t.doctorId === doctorId);
}

export function createTreatmentTemplate(
  input: Omit<TreatmentTemplate, 'id' | 'createdAt' | 'updatedAt'>
): void {
  const data = loadData();
  const now = nowISO();
  data.treatmentTemplates.push({ ...input, id: nextId(data), createdAt: now, updatedAt: now });
  saveData(data);
}

export function deleteTreatmentTemplate(id: number, doctorId: number): void {
  const data = loadData();
  data.treatmentTemplates = data.treatmentTemplates.filter(
    (t) => !(t.id === id && t.doctorId === doctorId)
  );
  saveData(data);
}

export function getDoctorSchedule(doctorId: number): DoctorSchedule[] {
  return loadData().doctorSchedules.filter((s) => s.doctorId === doctorId);
}

export function saveDoctorSchedule(
  doctorId: number,
  schedules: Omit<DoctorSchedule, 'id' | 'doctorId' | 'createdAt' | 'updatedAt'>[]
): void {
  const data = loadData();
  data.doctorSchedules = data.doctorSchedules.filter((s) => s.doctorId !== doctorId);
  const now = nowISO();
  schedules.forEach((s) => {
    data.doctorSchedules.push({
      ...s,
      id: nextId(data),
      doctorId,
      createdAt: now,
      updatedAt: now,
    });
  });
  saveData(data);
}

export function getTimeOffs(doctorId: number): TimeOff[] {
  return loadData().timeOffs.filter((t) => t.doctorId === doctorId);
}

export function addTimeOff(input: Omit<TimeOff, 'id' | 'createdAt'>): void {
  const data = loadData();
  data.timeOffs.push({ ...input, id: nextId(data), createdAt: nowISO() });
  saveData(data);
}

export function deleteTimeOff(id: number, doctorId: number): void {
  const data = loadData();
  data.timeOffs = data.timeOffs.filter((t) => !(t.id === id && t.doctorId === doctorId));
  saveData(data);
}

export function doctorHasPatientAccess(doctorId: number, patientId: number): boolean {
  return loadData().appointments.some(
    (a) => a.doctorId === doctorId && a.patientId === patientId
  );
}

export function getDoctorPatients(doctorId: number): User[] {
  const data = loadData();
  const patientIds = new Set(
    data.appointments.filter((a) => a.doctorId === doctorId).map((a) => a.patientId)
  );
  return data.users.filter((u) => u.role === 'patient' && patientIds.has(u.id));
}

export function getPaymentStatusForTreatment(treatmentId: number): string {
  const payment = loadData().payments.find((p) => p.treatmentId === treatmentId);
  if (!payment) return 'unpaid';
  return payment.status;
}

export function resetData(): AppData {
  const seed = createSeedData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  notifyDataChange();
  return seed;
}
