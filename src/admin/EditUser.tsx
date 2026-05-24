import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useClinicAppointments, useClinicUser } from '../hooks/useClinic';
import { updateUser } from '../lib/storage';
import { formatUserLocation, formatUserPhone } from '../lib/userProfile';
import type { UserRole } from '../types';
import {
  profileFormToPayload,
  UserProfileFieldsForm,
  userToProfileForm,
} from '../components/UserProfileFieldsForm';
import { Alert, Button, Card, Input, PageHeader, Select } from '../components/ui';
import { formatDate } from '../lib/utils';

export function EditUser() {
  const { id } = useParams();
  const userId = Number(id);
  const { refreshData } = useData();
  const user = useClinicUser(userId);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'patient' as UserRole,
    password: '',
    profile: userToProfileForm({}),
  });
  const [msg, setMsg] = useState({ type: '' as '' | 'success' | 'error', text: '' });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
        profile: userToProfileForm(user),
      });
    }
  }, [user]);

  const apptFilters =
    user?.role === 'patient' ? { patientId: userId } : user?.role === 'doctor' ? { doctorId: userId } : undefined;
  const apptCount = useClinicAppointments(apptFilters).length;

  if (!user) {
    return (
      <div>
        User not found.{' '}
        <Link to="/admin/users" className="text-candy-300">
          Back
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = updateUser(userId, {
      name: form.name,
      email: form.email,
      role: form.role,
      password: form.password || undefined,
      ...profileFormToPayload(form.profile),
    });
    if (r.success) refreshData();
    setMsg(r.success ? { type: 'success', text: 'User updated successfully.' } : { type: 'error', text: r.error ?? 'Failed' });
  };

  return (
    <div className="space-y-8">
      <PageHeader title={`Edit User: ${user.name}`} subtitle="Full clinic profile for this account" />
      {msg.text && <Alert type={msg.type === 'success' ? 'success' : 'error'}>{msg.text}</Alert>}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Account & profile" className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Leave blank to keep current"
            />
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </Select>

            <UserProfileFieldsForm
              role={form.role}
              form={form.profile}
              onChange={(profile) => setForm({ ...form, profile })}
            />

            <div className="flex gap-2">
              <Button type="submit" variant="candy" glow>
                Update User
              </Button>
              <Link to="/admin/users">
                <Button variant="secondary">Cancel</Button>
              </Link>
            </div>
          </form>
        </Card>

        <Card title="Profile summary">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-whisper">User ID</dt>
              <dd className="font-medium text-violet-100">{user.id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-whisper">Phone</dt>
              <dd className="text-violet-100">{formatUserPhone(user.phone)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-whisper">Location</dt>
              <dd className="text-violet-100">{formatUserLocation(user)}</dd>
            </div>
            {user.dateOfBirth && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-whisper">Date of birth</dt>
                <dd className="text-violet-100">{user.dateOfBirth}</dd>
              </div>
            )}
            {user.role === 'doctor' && user.licenseNumber && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-whisper">License</dt>
                <dd className="font-mono text-candy-100">{user.licenseNumber}</dd>
              </div>
            )}
            {user.role === 'admin' && user.employeeId && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-whisper">Employee ID</dt>
                <dd className="font-mono text-candy-100">{user.employeeId}</dd>
              </div>
            )}
            {user.emergencyContactName && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-whisper">Emergency</dt>
                <dd className="text-violet-100">
                  {user.emergencyContactName} ({user.emergencyContactRelation}) — {user.emergencyContactPhone}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-wide text-whisper">Member since</dt>
              <dd className="text-violet-100">{formatDate(user.createdAt)}</dd>
            </div>
            {(user.role === 'patient' || user.role === 'doctor') && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-whisper">Appointments</dt>
                <dd className="text-violet-100">{apptCount}</dd>
              </div>
            )}
          </dl>
          {user.bio && (
            <p className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-violet-200/90">
              {user.bio}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
