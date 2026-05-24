import type { MedicalHistoryCategory } from '../types';

export const MEDICAL_HISTORY_CATEGORIES: {
  value: MedicalHistoryCategory;
  label: string;
  icon: string;
  badge: string;
}[] = [
  { value: 'allergy', label: 'Allergy', icon: '⚠', badge: 'bg-rose-500/20 text-rose-200 border-rose-400/30' },
  { value: 'medication', label: 'Medication', icon: '💊', badge: 'bg-candy-500/20 text-candy-100 border-candy-400/30' },
  { value: 'condition', label: 'Condition', icon: '♡', badge: 'bg-violet-500/20 text-violet-100 border-violet-400/30' },
  { value: 'surgery', label: 'Surgery', icon: '⚕', badge: 'bg-indigo-500/20 text-indigo-100 border-indigo-400/30' },
  { value: 'other', label: 'Other', icon: '✦', badge: 'bg-white/10 text-violet-200 border-white/20' },
];

export function getCategoryMeta(category: MedicalHistoryCategory) {
  return MEDICAL_HISTORY_CATEGORIES.find((c) => c.value === category) ?? MEDICAL_HISTORY_CATEGORIES[4];
}
