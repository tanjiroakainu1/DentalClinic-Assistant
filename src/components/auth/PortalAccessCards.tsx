import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_ACCOUNTS, type DemoAccount } from '../../data/demoAccounts';
import { getDashboardPath, useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';
import { Alert } from '../ui';

const ROLE_THEME: Record<
  UserRole,
  { gradient: string; ring: string; icon: string; glow: string }
> = {
  admin: {
    gradient: 'from-violet-600/40 via-purple-900/50 to-galaxy-950',
    ring: 'hover:ring-violet-400/50',
    icon: '✦',
    glow: 'shadow-[0_0_32px_rgba(139,92,246,0.35)]',
  },
  doctor: {
    gradient: 'from-indigo-600/40 via-blue-900/40 to-galaxy-950',
    ring: 'hover:ring-indigo-400/50',
    icon: '⚕',
    glow: 'shadow-[0_0_32px_rgba(99,102,241,0.35)]',
  },
  patient: {
    gradient: 'from-fuchsia-600/40 via-candy-900/40 to-galaxy-950',
    ring: 'hover:ring-candy-400/55',
    icon: '♡',
    glow: 'shadow-[0_0_36px_rgba(217,70,239,0.4)]',
  },
};

export function PortalAccessCards({ compact = false }: { compact?: boolean }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

  const handlePortal = (account: DemoAccount) => {
    setError('');
    setLoadingRole(account.role);
    window.setTimeout(() => {
      if (login(account.email, account.password)) {
        navigate(getDashboardPath(account.role), { replace: true });
      } else {
        setError(`Could not open ${account.label}. Refresh the page or use email sign-in.`);
        setLoadingRole(null);
      }
    }, 280);
  };

  return (
    <div>
      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}
      <div className={compact ? 'grid gap-3 sm:grid-cols-3' : 'grid gap-4 sm:grid-cols-3'}>
        {DEMO_ACCOUNTS.map((account) => {
          const theme = ROLE_THEME[account.role];
          const loading = loadingRole === account.role;
          return (
            <button
              key={account.role}
              type="button"
              disabled={!!loadingRole}
              onClick={() => handlePortal(account)}
              className={`auth-portal-card group relative min-h-[8.5rem] touch-manipulation overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-5 text-left transition-all duration-300 active:scale-[0.99] max-md:hover:translate-y-0 md:hover:-translate-y-1 ${theme.gradient} ${theme.ring} hover:border-white/25 ${loading ? 'opacity-70' : ''}`}
            >
              <span
                className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${theme.glow}`}
                aria-hidden
              />
              <span className="auth-portal-icon relative text-2xl">{theme.icon}</span>
              <p className="relative mt-3 text-sm font-bold text-white">{account.label}</p>
              <p className="relative mt-1 text-xs font-medium text-candy-100/90">{account.name}</p>
              <p className="relative mt-1 text-[10px] leading-snug text-violet-200/70">{account.subtitle}</p>
              <span className="auth-portal-cta relative mt-4 inline-flex items-center gap-1 text-xs font-semibold text-candy-200">
                {loading ? (
                  <>
                    <span className="auth-spinner-sm" /> Opening…
                  </>
                ) : (
                  <>Enter portal →</>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
