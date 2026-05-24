/** Capitalize status/method labels for chart axes */
export function chartLabel(value: string): string {
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatChartMonth(monthKey: string): string {
  return new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export const WEEKDAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const;

export const PAYMENT_STATUSES = ['pending', 'completed', 'rejected', 'refunded'] as const;
