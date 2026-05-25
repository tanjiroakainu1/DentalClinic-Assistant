import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import type { StatVariant } from '../../lib/theme';
import { STAT } from '../../lib/theme';
import { buttonClassName, type ButtonSize, type ButtonVariant } from './buttonStyles';

export function NavButtonLink({
  to,
  variant = 'outline',
  active,
  glow = false,
  className = '',
  children,
  onNavigate,
}: LinkProps & {
  variant?: ButtonVariant;
  active?: boolean;
  glow?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={to}
      className={`${buttonClassName(variant, 'sm', { active, className })} ${glow ? 'animate-pulse-glow' : ''}`}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
    >
      <span className="relative z-[1] inline-flex w-full items-center justify-center gap-2">{children}</span>
    </Link>
  );
}

export function Alert({ type, children, className = '' }: { type: 'success' | 'error' | 'info'; children: ReactNode; className?: string }) {
  const colors = {
    success: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100',
    error: 'border-pink-400/40 bg-pink-500/15 text-pink-100',
    info: 'border-candy-400/30 bg-candy-500/15 text-candy-100',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm backdrop-blur-sm ${colors[type]} ${className}`}>{children}</div>
  );
}

export function Card({ title, children, className = '', headerRight }: { title?: string; children: ReactNode; className?: string; headerRight?: ReactNode }) {
  return (
    <div className={`glass-card ${className}`}>
      {title && (
        <div className={`glass-card-header flex items-center justify-between ${headerRight ? '' : ''}`}>
          <h3 className="font-semibold text-violet-100/90">{title}</h3>
          {headerRight}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

export function StatCard({ label, value, variant = 'galaxy' }: { label: string; value: string | number; variant?: StatVariant; color?: string }) {
  return (
    <div className={`rounded-2xl p-5 text-white ${STAT[variant]}`}>
      <p className="text-sm font-medium text-white/85">{label}</p>
      <p className="mt-1 text-3xl font-bold drop-shadow-sm">{value}</p>
    </div>
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  active,
  glow = false,
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  glow?: boolean;
}) {
  const showShimmer = variant !== 'ghost' && variant !== 'tab';
  return (
    <button
      className={`${buttonClassName(variant, size, { active, className })} ${glow ? 'animate-pulse-glow' : ''}`}
      {...props}
    >
      {showShimmer && (
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-12deg] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:animate-shimmer group-hover:opacity-100"
          aria-hidden
        />
      )}
      <span className="relative z-[1] inline-flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

export function TabGroup({
  value,
  onChange,
  tabs,
  className = '',
}: {
  value: string;
  onChange: (id: string) => void;
  tabs: { id: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={`inline-flex w-full max-w-full flex-wrap gap-2 rounded-2xl border border-white/10 bg-galaxy-950/50 p-2 backdrop-blur-md sm:w-auto sm:p-1.5 ${className}`}>
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          type="button"
          variant="tab"
          size="sm"
          active={value === tab.id}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}

export function IconButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex h-11 w-11 min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-xl border border-white/15 bg-white/10 text-lg text-violet-200 transition-all hover:border-candy-400/50 hover:bg-candy-500/20 hover:text-candy-100 hover:shadow-glow active:scale-95 sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

const inputClass =
  'w-full min-h-11 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-base text-white placeholder:text-violet-300/60 focus:border-candy-400 focus:outline-none focus:ring-2 focus:ring-candy-500/30 backdrop-blur-sm sm:py-2 sm:text-sm';

export function Input({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div>
      {label && <label className="mb-1 block text-sm font-medium text-violet-100">{label}</label>}
      <input className={inputClass} {...props} />
    </div>
  );
}

export function Textarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div>
      {label && <label className="mb-1 block text-sm font-medium text-violet-100">{label}</label>}
      <textarea className={inputClass} {...props} />
    </div>
  );
}

export function Select({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div>
      {label && <label className="mb-1 block text-sm font-medium text-violet-100">{label}</label>}
      <select className={`${inputClass} [&>option]:bg-galaxy-950`} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: 'bg-emerald-500/25 text-emerald-100 border border-emerald-400/30',
    completed: 'bg-emerald-500/25 text-emerald-100 border border-emerald-400/30',
    active: 'bg-candy-500/25 text-candy-100 border border-candy-400/30',
    cancelled: 'bg-pink-500/25 text-pink-100 border border-pink-400/30',
    rejected: 'bg-rose-500/25 text-rose-100 border border-rose-400/30',
    pending: 'bg-amber-400/20 text-amber-100 border border-amber-300/30',
    planned: 'bg-violet-400/20 text-violet-100 border border-violet-300/30',
    unpaid: 'bg-fuchsia-500/25 text-fuchsia-100 border border-fuchsia-400/30',
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-white/10 text-violet-100 border-white/20'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-violet-100/90 md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-galaxy-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-candy-400/30 bg-galaxy-900/95 shadow-glow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="font-semibold text-violet-100/90">{title}</h3>
          <IconButton onClick={onClose} aria-label="Close">&times;</IconButton>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
