import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useClinicUsers, useClinicUserAnalytics } from '../hooks/useClinic';
import { createUser, deleteUser } from '../lib/storage';
import { formatUserLocation, formatUserPhone } from '../lib/userProfile';
import type { UserRole } from '../types';
import {
  emptyUserProfileForm,
  profileFormToPayload,
  UserProfileFieldsForm,
} from '../components/UserProfileFieldsForm';
import { Alert, Button, Card, Input, PageHeader, Select, StatCard } from '../components/ui';
import { GalaxyBarChart, GalaxyPieChart, EmptyChart } from '../components/charts/GalaxyCharts';

export function UserManagement() {
  const [params] = useSearchParams();
  const roleFilter = (params.get('role') as UserRole) || undefined;
  const { refreshData } = useData();
  const { user: currentUser } = useAuth();
  const users = useClinicUsers(roleFilter);
  const userAnalytics = useClinicUserAnalytics();
  const [msg, setMsg] = useState({ type: '' as '' | 'success' | 'error', text: '' });
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient' as UserRole,
    profile: emptyUserProfileForm(),
  });

  const rolePie = useMemo(
    () => userAnalytics.role_counts.map((r) => ({ name: r.name, value: r.count })),
    [userAnalytics],
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const r = createUser({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      ...profileFormToPayload(form.profile),
    });
    if (r.success) {
      refreshData();
      setMsg({ type: 'success', text: 'User created successfully.' });
      setForm({ name: '', email: '', password: '', role: 'patient', profile: emptyUserProfileForm() });
    } else {
      setMsg({ type: 'error', text: r.error ?? 'Failed' });
    }
  };

  const handleDelete = (id: number) => {
    if (id === currentUser?.id) {
      setMsg({ type: 'error', text: 'You cannot delete your own account.' });
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(id);
      refreshData();
      setMsg({ type: 'success', text: 'User deleted successfully.' });
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title="User Management" subtitle="Full clinic profiles — patients, doctors, and admins" />
      {msg.text && <Alert type={msg.type === 'success' ? 'success' : 'error'}>{msg.text}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={userAnalytics.total_users} variant="galaxy" />
        <StatCard
          label="Patients"
          value={userAnalytics.role_counts.find((r) => r.role === 'patient')?.count ?? 0}
          variant="candy"
        />
        <StatCard
          label="Doctors"
          value={userAnalytics.role_counts.find((r) => r.role === 'doctor')?.count ?? 0}
          variant="cosmic"
        />
        <StatCard
          label="Admins"
          value={userAnalytics.role_counts.find((r) => r.role === 'admin')?.count ?? 0}
          variant="nebula"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {rolePie.some((r) => r.value > 0) ? (
          <GalaxyPieChart title="Users by Role" subtitle="Clinic population mix" data={rolePie} height={280} />
        ) : (
          <Card title="Users by Role">
            <EmptyChart />
          </Card>
        )}
        {userAnalytics.signups_by_month.length > 0 ? (
          <GalaxyBarChart
            title="New Signups"
            subtitle="Accounts created per month"
            data={userAnalytics.signups_by_month}
            xKey="month"
            dataKey="count"
            height={280}
          />
        ) : (
          <Card title="New Signups">
            <EmptyChart />
          </Card>
        )}
      </div>

      <div className="inline-flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-galaxy-950/50 p-1.5 backdrop-blur-md">
        {(['', 'patient', 'doctor', 'admin'] as const).map((r) => (
          <Link key={r || 'all'} to={r ? `/admin/users?role=${r}` : '/admin/users'}>
            <Button variant="tab" size="sm" active={roleFilter === r || (!roleFilter && !r)}>
              {r ? r.charAt(0).toUpperCase() + r.slice(1) + 's' : 'All'}
            </Button>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card title={`Users${roleFilter ? ` (${roleFilter}s)` : ''}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-violet-100">
                    <th className="pb-2">Name</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="text-violet-100">
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/10">
                      <td className="max-w-[160px] py-2">
                        <p className="font-medium">{u.name}</p>
                        <p className="truncate text-xs text-violet-300/70">{u.email}</p>
                      </td>
                      <td className="max-w-[180px] text-xs">
                        <p>{formatUserPhone(u.phone)}</p>
                        <p className="mt-0.5 truncate text-violet-300/70">{formatUserLocation(u)}</p>
                      </td>
                      <td>
                        <span className="capitalize">{u.role}</span>
                        {u.specialization && (
                          <span className="mt-0.5 block text-xs text-candy-300">{u.specialization}</span>
                        )}
                        {u.department && (
                          <span className="mt-0.5 block text-xs text-violet-300/70">{u.department}</span>
                        )}
                      </td>
                      <td className="space-x-2 whitespace-nowrap">
                        <Link to={`/admin/users/${u.id}/edit`}>
                          <Button variant="outline" size="xs">
                            Edit
                          </Button>
                        </Link>
                        {u.id !== currentUser?.id && (
                          <Button variant="danger" size="xs" onClick={() => handleDelete(u.id)}>
                            Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Card title="Add New User">
          <p className="mb-4 text-sm text-muted">
            Create staff or patient accounts with complete contact and emergency details.
          </p>
          <form onSubmit={handleAdd} className="space-y-4">
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
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <Select
              label="Role"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as UserRole, profile: emptyUserProfileForm() })
              }
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
            <Button type="submit" variant="candy" className="w-full" glow>
              Add User
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
