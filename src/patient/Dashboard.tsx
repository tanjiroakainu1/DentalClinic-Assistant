import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClinicAppointments } from '../hooks/useClinic';
import { Badge, Button, Card, PageHeader } from '../components/ui';
import { formatDate } from '../lib/utils';

export function PatientDashboard() {
  const { user } = useAuth();
  const today = new Date().toISOString();
  const appointments = useClinicAppointments({ patientId: user!.id })
    .filter((a) => a.appointmentDate >= today)
    .slice(0, 5);

  return (
    <div>
      <PageHeader title="Patient Dashboard" subtitle={`Welcome, ${user?.name}!`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Upcoming Appointments">
          {appointments.length === 0 ? (
            <p className="text-violet-300/70">No upcoming appointments.</p>
          ) : (
            <div className="table-scroll -mx-1 px-1">
            <table className="w-full min-w-[20rem] text-sm">
              <thead><tr className="border-b border-white/10"><th>Date</th><th>Doctor</th><th>Status</th></tr></thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} className="border-b border-white/10">
                    <td className="py-2">{formatDate(a.appointmentDate)}</td>
                    <td>{a.doctorName}</td>
                    <td><Badge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          <Link to="/patient/appointments" className="mt-4 block"><Button variant="cosmic" className="w-full">Manage Appointments</Button></Link>
        </Card>
        <Card title="Quick Actions">
          <div className="space-y-2">
            <Link to="/patient/appointments?action=new"><Button variant="candy" className="w-full" glow>Book New Appointment</Button></Link>
            <Link to="/patient/medical-history"><Button variant="nebula" className="w-full">Update Medical History</Button></Link>
            <Link to="/patient/treatments"><Button variant="outline" className="w-full">View Treatment Plans</Button></Link>
            <Link to="/patient/payments"><Button variant="warning" className="w-full">View Payments</Button></Link>
            <Link to="/patient/profile"><Button variant="secondary" className="w-full">Manage Profile</Button></Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
