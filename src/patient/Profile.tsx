import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useClinicUser } from '../hooks/useClinic';
import { updateUser } from '../lib/storage';
import { formatUserLocation, formatUserPhone } from '../lib/userProfile';
import {
  profileFormToPayload,
  UserProfileFieldsForm,
  userToProfileForm,
} from '../components/UserProfileFieldsForm';
import { ProfilePhotoPicker } from '../components/ProfilePhotoPicker';
import { formatDate, verifyPassword } from '../lib/utils';
import { Alert, Button, Card, Input, PageHeader } from '../components/ui';

export function Profile() {
  const { user, refreshSession } = useAuth();
  const { refreshData } = useData();
  const patient = useClinicUser(user!.id);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [extended, setExtended] = useState(userToProfileForm({}));
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>();
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [msg, setMsg] = useState({ type: '' as '' | 'success' | 'error', text: '' });

  useEffect(() => {
    if (patient) {
      setProfileForm({ name: patient.name, email: patient.email });
      setExtended(userToProfileForm(patient));
      setProfilePhoto(patient.profilePhoto);
    }
  }, [patient]);

  if (!patient) return null;

  const handleProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const r = updateUser(user!.id, {
      ...profileForm,
      ...profileFormToPayload(extended),
      profilePhoto,
    });
    if (r.success) {
      refreshData();
      refreshSession();
    }
    setMsg(
      r.success
        ? { type: 'success', text: 'Profile and photo saved to your galaxy account.' }
        : { type: 'error', text: r.error ?? 'Failed' },
    );
  };

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyPassword(pwdForm.current, patient.password)) {
      setMsg({ type: 'error', text: 'Current password is incorrect.' });
      return;
    }
    if (pwdForm.newPwd !== pwdForm.confirm) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (pwdForm.newPwd.length < 6) {
      setMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    updateUser(user!.id, { password: pwdForm.newPwd });
    refreshData();
    setMsg({ type: 'success', text: 'Password changed successfully.' });
    setPwdForm({ current: '', newPwd: '', confirm: '' });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Profile"
        subtitle="Your candy cosmos identity — photo, contact, emergency info, and security"
      />

      {msg.text && <Alert type={msg.type === 'success' ? 'success' : 'error'}>{msg.text}</Alert>}

      <section className="profile-hero-card relative overflow-hidden rounded-[1.75rem] border border-candy-400/30 bg-gradient-to-br from-galaxy-900 via-galaxy-950 to-galaxy-950 p-6 shadow-glow-lg md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-candy-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-galaxy-600/20 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[auto_1fr] lg:items-center">
          <ProfilePhotoPicker
            name={profileForm.name || patient.name}
            photoUrl={profilePhoto}
            onPhotoChange={setProfilePhoto}
            onError={(text) => setMsg({ type: 'error', text })}
          />
          <div className="text-center lg:text-left">
            <span className="inline-block rounded-full border border-candy-400/30 bg-candy-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-candy-200">
              Patient account
            </span>
            <h2 className="mt-4 text-2xl font-bold text-white md:text-3xl">{profileForm.name || patient.name}</h2>
            <p className="mt-2 text-sm text-violet-200">{profileForm.email}</p>
            <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-whisper">Phone</dt>
                <dd className="mt-1 text-sm font-medium text-violet-100">{formatUserPhone(patient.phone)}</dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-whisper">Member since</dt>
                <dd className="mt-1 text-sm font-medium text-violet-100">{formatDate(patient.createdAt)}</dd>
              </div>
              {patient.dateOfBirth && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-whisper">Birthdate</dt>
                  <dd className="mt-1 text-sm font-medium text-violet-100">{patient.dateOfBirth}</dd>
                </div>
              )}
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 sm:col-span-2 lg:col-span-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-whisper">Address</dt>
                <dd className="mt-1 text-sm font-medium text-violet-100">{formatUserLocation(patient)}</dd>
              </div>
              {patient.emergencyContactName && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 sm:col-span-2 lg:col-span-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-whisper">Emergency contact</dt>
                  <dd className="mt-1 text-sm font-medium text-violet-100">
                    {patient.emergencyContactName}
                    {patient.emergencyContactRelation ? ` (${patient.emergencyContactRelation})` : ''} —{' '}
                    {patient.emergencyContactPhone}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Profile details">
          <form onSubmit={handleProfile} className="space-y-4">
            <Input
              label="Full Name"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              required
            />
            <UserProfileFieldsForm role="patient" form={extended} onChange={setExtended} />
            <Button type="submit" variant="candy" className="w-full" glow>
              Save profile & photo
            </Button>
          </form>
        </Card>

        <Card title="Security">
          <p className="mb-4 text-sm text-soft">Update your password to keep your account safe in the galaxy.</p>
          <form onSubmit={handlePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={pwdForm.current}
              onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
              required
            />
            <Input
              label="New Password"
              type="password"
              value={pwdForm.newPwd}
              onChange={(e) => setPwdForm({ ...pwdForm, newPwd: e.target.value })}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={pwdForm.confirm}
              onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
              required
            />
            <Button type="submit" variant="cosmic" className="w-full">
              Change password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
