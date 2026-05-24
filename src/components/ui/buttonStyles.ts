export type ButtonVariant =
  | 'primary'
  | 'candy'
  | 'cosmic'
  | 'nebula'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'outline'
  | 'ghost'
  | 'tab';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold tracking-wide transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candy-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0a1e] disabled:pointer-events-none disabled:opacity-45 disabled:saturate-50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]';

const sizes: Record<ButtonSize, string> = {
  xs: 'rounded-xl px-2.5 py-1 text-xs',
  sm: 'rounded-xl px-3.5 py-1.5 text-xs',
  md: 'rounded-2xl px-5 py-2.5 text-sm',
  lg: 'rounded-2xl px-8 py-3.5 text-base',
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'btn-sparkle border border-galaxy-400/40 bg-gradient-to-br from-galaxy-500 via-galaxy-700 to-galaxy-900 text-white shadow-glow hover:shadow-glow-lg hover:from-galaxy-400 hover:via-galaxy-600',
  candy:
    'btn-sparkle border border-candy-300/50 bg-gradient-to-br from-candy-400 via-fuchsia-500 to-galaxy-700 text-white shadow-glow hover:from-candy-300 hover:via-fuchsia-400 hover:shadow-glow-lg',
  cosmic:
    'btn-sparkle border border-indigo-400/40 bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-700 text-white shadow-glow-lg hover:from-indigo-400 hover:via-purple-500',
  nebula:
    'btn-sparkle border border-violet-400/35 bg-gradient-to-br from-violet-500 via-purple-700 to-galaxy-950 text-white shadow-glow hover:from-violet-400',
  secondary:
    'border border-white/15 bg-gradient-to-br from-galaxy-800/90 to-galaxy-950 text-violet-100 shadow-glass hover:border-candy-400/30 hover:text-white hover:shadow-glow',
  success:
    'border border-emerald-400/35 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-800 text-white shadow-[0_0_20px_rgba(52,211,153,0.35)] hover:from-emerald-300 hover:via-teal-400',
  danger:
    'border border-rose-400/40 bg-gradient-to-br from-rose-500 via-pink-600 to-rose-900 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)] hover:from-rose-400 hover:via-pink-500',
  warning:
    'border border-amber-300/35 bg-gradient-to-br from-amber-400 via-fuchsia-500 to-candy-700 text-white shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:from-amber-300',
  outline:
    'btn-cosmic-ring border border-candy-400/45 bg-white/5 text-candy-100 backdrop-blur-md hover:bg-white/12 hover:text-white hover:shadow-glow',
  ghost:
    'border border-transparent bg-transparent text-violet-200 hover:border-white/15 hover:bg-white/10 hover:text-candy-100',
  tab: '',
};

const tabActive =
  'border border-candy-300/50 bg-gradient-to-r from-candy-500 via-fuchsia-500 to-galaxy-600 text-white shadow-glow scale-[1.02]';
const tabInactive =
  'border border-white/15 bg-white/5 text-violet-200 hover:border-candy-400/40 hover:bg-white/10 hover:text-candy-100';

export function buttonClassName(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  options?: { active?: boolean; className?: string },
): string {
  const tab = variant === 'tab' ? (options?.active ? tabActive : tabInactive) : variants[variant];
  return [base, sizes[size], tab, options?.className ?? ''].filter(Boolean).join(' ');
}
