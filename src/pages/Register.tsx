import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AuthFormSection,
} from '../components/auth/AuthFormSection';
import {
  AuthLayout,
  AuthLinkRow,
  AuthSubmitButton,
} from '../components/auth/AuthLayout';
import { AuthStepIndicator, REGISTER_STEP_COUNT } from '../components/auth/AuthStepIndicator';
import { useData } from '../contexts/DataContext';
import { register } from '../lib/storage';
import {
  emptyPatientRegistration,
  GENDER_OPTIONS,
  PH_PROVINCES,
} from '../lib/userProfile';
import { Alert, Button, Input, Select, Textarea } from '../components/ui';

export function Register() {
  const { refreshData } = useData();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyPatientRegistration);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError('');
  };

  const validateStep = (s: number): string | null => {
    if (s === 0) {
      if (!form.name.trim()) return 'Please enter your full name.';
      if (!form.email.trim()) return 'Please enter your email.';
      if (form.password.length < 6) return 'Password must be at least 6 characters.';
      if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    }
    if (s === 1) {
      if (!form.phone?.trim()) return 'Mobile number is required.';
    }
    if (s === 2) {
      if (!form.address?.trim() || !form.city?.trim()) return 'Street address and city are required.';
    }
    if (s === 3) {
      if (!form.emergencyContactName?.trim() || !form.emergencyContactPhone?.trim()) {
        return 'Emergency contact name and phone are required.';
      }
    }
    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep((s) => Math.min(s + 1, REGISTER_STEP_COUNT - 1));
  };

  const back = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep(3);
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    const { confirmPassword: _, ...payload } = form;
    const result = register(payload);

    if (result.success) {
      refreshData();
      setSuccess('Welcome to the galaxy! Your account is ready — redirecting to sign in…');
      setError('');
      setTimeout(() => navigate('/login'), 2800);
    } else {
      setError(result.error ?? 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      mode="register"
      title="Create your patient account"
      subtitle="Four quick steps — then book appointments, pay online, and manage your dental health."
      footer={<AuthLinkRow text="Already registered?" linkText="Sign in instead" to="/login" />}
    >
      <AuthStepIndicator current={step} />

      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <form onSubmit={step === REGISTER_STEP_COUNT - 1 ? handleSubmit : (e) => e.preventDefault()}>
        <div className="auth-glass rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
          {step === 0 && (
            <AuthFormSection icon="◎" title="Account credentials" description="Your login for the patient portal">
              <Input
                label="Full Name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Maria Jane Dela Cruz"
                required
              />
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@email.com"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  required
                  minLength={6}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </AuthFormSection>
          )}

          {step === 1 && (
            <AuthFormSection icon="♡" title="About you" description="Helps your dentist personalize care">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => set('dateOfBirth', e.target.value)}
                />
                <Select
                  label="Gender"
                  value={form.gender ?? ''}
                  onChange={(e) => set('gender', (e.target.value || undefined) as typeof form.gender)}
                >
                  <option value="">Select…</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value ?? ''}>
                      {g.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Input
                label="Mobile Number"
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="09XX XXX XXXX"
                required
              />
            </AuthFormSection>
          )}

          {step === 2 && (
            <AuthFormSection icon="⌁" title="Home address" description="For records and appointment reminders">
              <Textarea
                label="Street / Building"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                rows={2}
                placeholder="House no., street, barangay"
                required
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="City"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="Quezon City"
                  required
                />
                <Select label="Province" value={form.province} onChange={(e) => set('province', e.target.value)}>
                  {PH_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
                <Input
                  label="ZIP Code"
                  value={form.zipCode}
                  onChange={(e) => set('zipCode', e.target.value)}
                  placeholder="1100"
                />
              </div>
            </AuthFormSection>
          )}

          {step === 3 && (
            <AuthFormSection icon="⚠" title="Emergency contact" description="Someone we can reach if needed">
              <Input
                label="Contact Name"
                value={form.emergencyContactName}
                onChange={(e) => set('emergencyContactName', e.target.value)}
                placeholder="Parent, spouse, or guardian"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Contact Phone"
                  type="tel"
                  value={form.emergencyContactPhone}
                  onChange={(e) => set('emergencyContactPhone', e.target.value)}
                  required
                />
                <Input
                  label="Relationship"
                  value={form.emergencyContactRelation}
                  onChange={(e) => set('emergencyContactRelation', e.target.value)}
                  placeholder="e.g. Mother, Spouse"
                />
              </div>
              <div className="rounded-xl border border-candy-400/20 bg-candy-500/10 p-4 text-sm text-violet-100/90">
                <p className="font-medium text-candy-100">Ready to launch?</p>
                <p className="mt-1 text-xs text-soft">
                  By creating an account you can book visits, upload medical history, and pay with GCash using
                  auto-generated clinic references.
                </p>
              </div>
            </AuthFormSection>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {step > 0 && (
            <Button type="button" variant="outline" size="lg" className="min-w-[120px] flex-1 sm:flex-none" onClick={back}>
              ← Back
            </Button>
          )}
          {step < REGISTER_STEP_COUNT - 1 ? (
            <Button
              type="button"
              variant="candy"
              size="lg"
              className="min-w-[140px] flex-1 sm:ml-auto"
              glow
              onClick={next}
            >
              Continue →
            </Button>
          ) : (
            <div className="w-full sm:ml-auto sm:max-w-md sm:flex-1">
              <AuthSubmitButton loading={loading}>Create my patient account ✦</AuthSubmitButton>
            </div>
          )}
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-soft">
        Doctor and admin accounts are created by clinic staff.{' '}
        <Link to="/" className="link-candy">
          Return home
        </Link>
      </p>
    </AuthLayout>
  );
}
