import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useClinicAppointments, useClinicUsers } from '../hooks/useClinic';
import { createAppointment, updateAppointmentStatus } from '../lib/storage';
import { Alert, Badge, Button, Card, Input, PageHeader, Select, Textarea } from '../components/ui';
import { formatDate } from '../lib/utils';

export function PatientAppointments() {
  const { user } = useAuth();
  const { refreshData } = useData();
  const [params] = useSearchParams();
  const showNew = params.get('action') === 'new';
  const [msg, setMsg] = useState({ type: '' as '' | 'success' | 'error', text: '' });
  const [form, setForm] = useState({ doctorId: '', date: '', time: '', reason: '' });
  const doctors = useClinicUsers('doctor');
  const appointments = useClinicAppointments({ patientId: user!.id });

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const datetime = `${form.date}T${form.time}:00`;
    const r = createAppointment({
      patientId: user!.id,
      doctorId: Number(form.doctorId),
      appointmentDate: datetime,
      reason: form.reason,
    });
    if (r.success) {
      refreshData();
      setMsg({ type: 'success', text: 'Appointment booked successfully! Waiting for confirmation.' });
      setForm({ doctorId: '', date: '', time: '', reason: '' });
    } else {
      setMsg({ type: 'error', text: r.error ?? 'Failed to book' });
    }
  };

  const handleCancel = (id: number) => {
    if (window.confirm('Cancel this appointment?')) {
      updateAppointmentStatus(id, 'cancelled');
      refreshData();
      setMsg({ type: 'success', text: 'Appointment cancelled successfully.' });
    }
  };

  return (
    <div>
      <PageHeader title="Manage Appointments" />
      {msg.text && <Alert type={msg.type === 'success' ? 'success' : 'error'}>{msg.text}</Alert>}
      {(showNew || appointments.length === 0) && (
        <Card title="Book New Appointment" className="mb-6">
          <form onSubmit={handleBook} className="max-w-lg space-y-4">
            <Select label="Select Doctor" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} required>
              <option value="">-- Select Doctor --</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialization})</option>
              ))}
            </Select>
            <Input label="Date" type="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <Input label="Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
            <Textarea label="Reason for Visit" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required rows={3} />
            <div className="flex gap-2">
              <Button type="submit" variant="candy">Book Appointment</Button>
              <Link to="/patient/appointments"><Button variant="secondary">Cancel</Button></Link>
            </div>
          </form>
        </Card>
      )}
      {!showNew && (
        <Link to="/patient/appointments?action=new" className="mb-4 inline-block">
          <Button variant="candy" glow>Book New Appointment</Button>
        </Link>
      )}
      <Card title="Your Appointments">
        <div className="table-scroll -mx-1 px-1">
        <table className="w-full min-w-[28rem] text-sm">
          <thead><tr className="border-b border-white/10"><th>Date</th><th>Doctor</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-b border-white/10">
                <td className="py-2">{formatDate(a.appointmentDate)}</td>
                <td>Dr. {a.doctorName}</td>
                <td>{a.reason}</td>
                <td><Badge status={a.status} /></td>
                <td>
                  {a.status !== 'cancelled' && a.status !== 'completed' && (
                    <Button variant="danger" size="xs" onClick={() => handleCancel(a.id)}>Cancel</Button>
                  )}
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
