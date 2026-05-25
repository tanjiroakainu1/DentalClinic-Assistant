import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClinicAppointments } from '../hooks/useClinic';
import { Badge, Button, Card, PageHeader, StatCard } from '../components/ui';
import { formatDate, formatTime, todayISO } from '../lib/utils';

export function DoctorDashboard() {
  const { user } = useAuth();
  const doctorId = user!.id;
  const today = todayISO();
  const all = useClinicAppointments({ doctorId });
  const todayAppts = all.filter((a) => a.appointmentDate.startsWith(today) && a.status !== 'cancelled');
  const upcoming = all.filter((a) => a.appointmentDate > today + 'T23:59:59' && a.status !== 'cancelled').slice(0, 5);
  const patientIds = new Set(all.map((a) => a.patientId));

  return (
    <div>
      <PageHeader title="Doctor Dashboard" subtitle={`Welcome, Dr. ${user?.name}!`} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Today's Appointments" value={todayAppts.length} variant="galaxy" />
        <StatCard label="Total Patients" value={patientIds.size} variant="candy" />
        <StatCard label="Total Appointments" value={all.filter((a) => a.status !== 'cancelled').length} variant="stardust" />
        <StatCard label="Upcoming" value={upcoming.length} variant="nebula" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card title="Today's Appointments" className="lg:col-span-2">
          {todayAppts.length === 0 ? (
            <p className="text-violet-300/70">No appointments scheduled for today.</p>
          ) : (
            <div className="table-scroll -mx-1 px-1">
            <table className="w-full min-w-[28rem] text-sm">
              <thead><tr className="border-b border-white/10"><th>Time</th><th>Patient</th><th>Reason</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {todayAppts.map((a) => (
                  <tr key={a.id} className="border-b border-white/10">
                    <td className="py-2">{formatTime(a.appointmentDate)}</td>
                    <td>{a.patientName}</td>
                    <td>{a.reason}</td>
                    <td><Badge status={a.status} /></td>
                    <td>
                      <Link to={`/doctor/patient-records?patient=${a.patientId}`}>
                        <Button variant="outline" size="xs">Records</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </Card>
        <div className="space-y-4">
          <Card title="Quick Actions">
            <div className="space-y-2">
              <Link to="/doctor/appointments"><Button variant="cosmic" className="w-full">Manage Appointments</Button></Link>
              <Link to="/doctor/patient-records"><Button variant="nebula" className="w-full">Patient Records</Button></Link>
              <Link to="/doctor/treatment-plans"><Button variant="warning" className="w-full">Treatment Plans</Button></Link>
              <Link to="/doctor/prescriptions"><Button variant="success" className="w-full">Prescriptions</Button></Link>
              <Link to="/doctor/schedule"><Button variant="candy" className="w-full" glow>My Schedule</Button></Link>
            </div>
          </Card>
          <Card title="Upcoming Appointments">
            {upcoming.length === 0 ? <p className="text-sm text-violet-300/70">No upcoming appointments.</p> : (
              <ul className="space-y-2 text-sm">
                {upcoming.map((a) => (
                  <li key={a.id} className="rounded border p-2">
                    <div className="flex justify-between font-medium">{a.patientName}<span className="text-xs text-violet-300/70">{formatDate(a.appointmentDate)}</span></div>
                    <p className="text-muted">{a.reason}</p>
                    <Badge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
