import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AuthDivider,
  AuthLayout,
  AuthLinkRow,
  AuthSubmitButton,
} from '../components/auth/AuthLayout';
import { PortalAccessCards } from '../components/auth/PortalAccessCards';
import { useAuth, getDashboardPath } from '../contexts/AuthContext';
import { Alert, Input } from '../components/ui';

export function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate(getDashboardPath(user.role), { replace: true });
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      if (!login(email, password)) {
        setError('Invalid email or password. Check your details and try again.');
        setLoading(false);
        return;
      }
      setLoading(false);
    }, 400);
  };

  return (
    <AuthLayout
      mode="login"
      title="Sign in to your portal"
      subtitle="Use your clinic email, or jump in with one-tap demo access below."
      footer={
        <AuthLinkRow text="New patient?" linkText="Create a free account" to="/register" />
      }
    >
      <div className="auth-glass rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
        {error && <Alert type="error">{error}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <AuthSubmitButton loading={loading}>
            <span className="inline-flex items-center gap-2">
              Sign in <span aria-hidden>→</span>
            </span>
          </AuthSubmitButton>
        </form>
      </div>

      <AuthDivider label="Instant portal access" />

      <div>
        <p className="mb-4 text-center text-sm text-violet-200/75">
          Demo accounts — tap a card to enter as admin, doctor, or patient
        </p>
        <PortalAccessCards />
      </div>

      <p className="mt-6 text-center text-xs text-soft">
        Staff accounts are created by your clinic administrator.{' '}
        <Link to="/" className="link-candy">
          Back to home
        </Link>
      </p>
    </AuthLayout>
  );
}
