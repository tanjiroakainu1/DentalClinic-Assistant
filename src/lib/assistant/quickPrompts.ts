import type { UserRole } from '../../types';

export type AssistantAudience = UserRole | 'guest';

export const QUICK_PROMPTS: Record<AssistantAudience, string[]> = {
  guest: [
    'How do I register as a patient?',
    'What can patients, doctors, and admins do?',
    'How do I log in?',
    'Tips for healthy teeth',
  ],
  patient: [
    'How do I book an appointment?',
    'How do GCash payments work?',
    'How do I update my medical history?',
    'What does my payment reference mean?',
  ],
  doctor: [
    'How do I add a treatment plan?',
    'Where do I view patient medical history?',
    'How do prescriptions work in this app?',
    'Tips for explaining fluoride to patients',
  ],
  admin: [
    'How do I verify a GCash payment?',
    'What can I see on analytics?',
    'How do I manage users?',
    'Summarize admin dashboard features',
  ],
};

export const WELCOME_MESSAGES: Record<AssistantAudience, string> = {
  guest:
    "Hi! I'm **Nova**, Galaxy AI for **Dental Clinic Galaxy**. Not signed in yet? I can explain registration, the patient/doctor/admin portals, payments, and general dental tips — ask me anything!",
  patient:
    "Hi! I'm **Nova**, your Galaxy AI guide. Ask me how to book visits, pay with GCash, or manage your health records — or anything else!",
  doctor:
    "Hi! I'm **Nova**. I can walk you through patient records, treatments, prescriptions, and your schedule — plus general dental guidance.",
  admin:
    "Hi! I'm **Nova**. Ask about verifying payments, users, reports, analytics — or how anything in the admin portal works.",
};

export function getAssistantAudience(
  user: { role: UserRole; name: string } | null,
): AssistantAudience {
  return user?.role ?? 'guest';
}

export function getAssistantDisplayName(
  user: { role: UserRole; name: string } | null,
): string {
  return user?.name ?? 'Visitor';
}
