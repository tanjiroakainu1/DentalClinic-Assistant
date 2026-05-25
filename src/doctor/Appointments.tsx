import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useClinicAppointments } from '../hooks/useClinic';
import { updateAppointmentStatus } from '../lib/storage';
import type { AppointmentStatus } from '../types';
import { Alert, Badge, Button, Card, Input, PageHeader, Select, StatCard } from '../components/ui';
import { formatDate, todayISO } from '../lib/utils';

export function DoctorAppointments() {
  const { user } = useAuth();
  const { refreshData } = useData();
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [msg, setMsg] = useState('');
  const today = todayISO();
  const all = useClinicAppointments({ doctorId: user!.id });
  const appointments = useClinicAppointments({
    doctorId: user!.id,
    status: (statusFilter as AppointmentStatus) || undefined,
    date: dateFilter || undefined,
  });

  const confirmAppt = (id: number) => {
    updateAppointmentStatus(id, 'confirmed');
    refreshData();
    setMsg('Appointment confirmed.');
  };

  const cancelAppt = (id: number) => {
    if (window.confirm('Cancel this appointment?')) {
      updateAppointmentStatus(id, 'cancelled');
      refreshData();
      setMsg('Appointment cancelled.');
    }
  };

  return (
    <div>
      <PageHeader title="Manage Appointments" />
      {msg && <Alert type="success">{msg}</Alert>}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Today" value={all.filter((a) => a.appointmentDate.startsWith(today) && a.status !== 'cancelled').length} variant="galaxy" />
        <StatCard label="Upcoming" value={all.filter((a) => a.appointmentDate > today).length} variant="candy" />
        <StatCard label="Pending" value={all.filter((a) => a.status === 'pending').length} variant="stardust" />
      </div>
      <Card title="Filters" className="mt-6">
        <div className="flex flex-wrap gap-4">
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Input label="Date" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>
      </Card>
      <Card title="Appointments" className="mt-6">
        <div className="table-scroll -mx-1 px-1">
        <table className="w-full min-w-[32rem] text-sm">
          <thead><tr className="border-b border-white/10"><th>Date</th><th>Patient</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-b border-white/10">
                <td className="py-2">{formatDate(a.appointmentDate)}</td>
                <td>{a.patientName}</td>
                <td>{a.reason}</td>
                <td><Badge status={a.status} /></td>
                <td className="space-x-1">
                  {a.status === 'pending' && <Button variant="success" size="xs" onClick={() => confirmAppt(a.id)}>Confirm</Button>}
                  {a.status !== 'cancelled' && <Button variant="danger" size="xs" onClick={() => cancelAppt(a.id)}>Cancel</Button>}
                  <Link to={`/doctor/patient-records?patient=${a.patientId}`}><Button variant="outline" size="xs">Records</Button></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
