export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Philippine Peso — used across the clinic system */
export const CURRENCY_CODE = 'PHP' as const;

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function statusBadgeColor(status: string): string {
  switch (status) {
    case 'confirmed':
    case 'completed':
    case 'active':
      return 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30';
    case 'cancelled':
    case 'rejected':
      return 'bg-rose-500/20 text-rose-200 border border-rose-400/30';
    case 'pending':
    case 'planned':
    case 'in_progress':
      return 'bg-amber-500/20 text-amber-200 border border-amber-400/30';
    default:
      return 'bg-white/10 text-violet-200 border border-white/15';
  }
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h${Math.abs(hash).toString(36)}`;
}

export function verifyPassword(password: string, hashed: string): boolean {
  return hashPassword(password) === hashed;
}
