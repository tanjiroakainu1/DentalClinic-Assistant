import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../../lib/siteMeta';
import { Button } from '../ui';

export function AuthLayout({
  mode,
  title,
  subtitle,
  children,
  footer,
}: {
  mode: 'login' | 'register';
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="auth-page mx-auto w-full max-w-6xl">
      <div className="auth-split overflow-hidden rounded-[2rem] border border-candy-400/25 shadow-glow-lg">
        <aside className="auth-hero relative hidden min-h-[32rem] flex-col justify-between p-8 md:p-10 lg:flex lg:w-[42%]">
          <div className="auth-hero-orb auth-hero-orb-a" aria-hidden />
          <div className="auth-hero-orb auth-hero-orb-b" aria-hidden />
          <div className="auth-hero-orb auth-hero-orb-c" aria-hidden />
          <div className="relative z-10">
            <Link to="/" className="auth-brand inline-flex items-center gap-2 text-white/90 transition hover:text-white">
              <span className="auth-brand-icon">✦</span>
              <span className="font-semibold">{SITE.name}</span>
            </Link>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-candy-200/90">
              {SITE.tagline}
            </p>
            <h1 className="auth-hero-title mt-4 text-3xl font-bold leading-tight text-white xl:text-4xl">
              {mode === 'login' ? 'Welcome back to your cosmic clinic' : 'Join the galaxy of smiles'}
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-violet-100/90">
              {mode === 'login'
                ? 'Book visits, pay with GCash, and manage your dental records — all in one candy-purple universe.'
                : 'Create your patient portal in minutes. Full profile, emergency contacts, and online payments included.'}
            </p>
          </div>
          <ul className="relative z-10 mt-8 space-y-3 text-sm text-violet-100/85">
            {(
              mode === 'login'
                ? ['Secure patient & staff portals', 'GCash payments with clinic refs', 'Galaxy AI assistant on every page']
                : ['Complete medical history online', 'Appointment booking 24/7', 'Philippine Peso billing & GCash']
            ).map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="auth-check">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="relative z-10 mt-8 text-xs text-violet-300/60">Developed by Raminder Jangao</p>
        </aside>

        <div className="auth-panel relative flex flex-1 flex-col bg-galaxy-950/60 p-6 backdrop-blur-xl md:p-8 lg:p-10">
          <div className="mb-6 lg:hidden">
            <Link to="/" className="text-sm font-semibold text-candy-200">
              ✦ {SITE.name}
            </Link>
          </div>
          <header className="auth-panel-header mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-candy-200/90">
              {mode === 'login' ? 'Sign in' : 'Patient registration'}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">{title}</h2>
            <p className="mt-2 text-sm text-violet-200/80">{subtitle}</p>
          </header>
          <div className="flex-1">{children}</div>
          {footer && <div className="auth-panel-footer mt-8 border-t border-white/10 pt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="auth-divider my-8 flex items-center gap-4">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-candy-400/40 to-transparent" />
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/70">{label}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-candy-400/40 to-transparent" />
    </div>
  );
}

export function AuthLinkRow({
  text,
  linkText,
  to,
}: {
  text: string;
  linkText: string;
  to: string;
}) {
  return (
    <p className="text-center text-sm text-violet-200/75">
      {text}{' '}
      <Link to={to} className="link-candy font-semibold">
        {linkText}
      </Link>
    </p>
  );
}

export function AuthSubmitButton({
  children,
  loading,
  type = 'submit',
}: {
  children: ReactNode;
  loading?: boolean;
  type?: 'submit' | 'button';
}) {
  return (
    <Button type={type} variant="candy" size="lg" className="auth-submit-btn w-full" glow disabled={loading}>
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="auth-spinner" aria-hidden />
          Please wait…
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
