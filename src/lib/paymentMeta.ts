import type { PaymentMethod, PaymentStatus } from '../types';

export const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  icon: string;
  description: string;
  badge: string;
  instant: boolean;
}[] = [
  {
    value: 'cash',
    label: 'Cash',
    icon: '₱',
    description: 'Pay at the clinic front desk',
    badge: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/35',
    instant: true,
  },
  {
    value: 'card',
    label: 'Card',
    icon: '◈',
    description: 'Debit or credit at reception',
    badge: 'bg-violet-500/20 text-violet-100 border-violet-400/35',
    instant: true,
  },
  {
    value: 'gcash',
    label: 'GCash',
    icon: '◎',
    description: 'Mobile wallet — verified by admin',
    badge: 'bg-cyan-500/20 text-cyan-100 border-cyan-400/35',
    instant: false,
  },
  {
    value: 'bank_transfer',
    label: 'Bank transfer',
    icon: '⌁',
    description: 'Direct transfer to clinic account',
    badge: 'bg-indigo-500/20 text-indigo-100 border-indigo-400/35',
    instant: true,
  },
];

export function getPaymentMethodMeta(method: PaymentMethod) {
  return PAYMENT_METHODS.find((m) => m.value === method) ?? PAYMENT_METHODS[0];
}

export function paymentStatusHint(status: PaymentStatus): string {
  switch (status) {
    case 'pending':
      return 'Awaiting clinic verification';
    case 'completed':
      return 'Payment confirmed';
    case 'rejected':
      return 'Not accepted — contact the clinic';
    case 'refunded':
      return 'Amount returned to patient';
    default:
      return '';
  }
}
