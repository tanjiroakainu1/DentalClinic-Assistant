import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useClinicAppointments, useClinicAppointmentAnalytics, useClinicPaymentAnalytics, useClinicUsers } from '../hooks/useClinic';
import { getTreatments } from '../lib/storage';
import { useData } from '../contexts/DataContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { GalaxyAreaChart, GalaxyBarChart, GalaxyPieChart, EmptyChart } from '../components/charts/GalaxyCharts';
import { Badge, Card, PageHeader, StatCard, Button } from '../components/ui';

export function AdminDashboard() {
  const { user } = useAuth();
  const { version } = useData();
  const patients = useClinicUsers('patient');
  const doctors = useClinicUsers('doctor');
  const appointments = useClinicAppointments();
  const apptAnalytics = useClinicAppointmentAnalytics();
  const payAnalytics = useClinicPaymentAnalytics();
  const pending = appointments.filter((a) => a.status === 'pending').length;

  const { totalRevenue, avgCost, revenueChart, statusPie, dayChart } = useMemo(() => {
    const treatments = getTreatments();
    const total = treatments.reduce((s, t) => s + t.cost, 0);
    const monthlyMap: Record<string, number> = {};
    treatments.forEach((t) => {
      const month = t.createdAt.slice(0, 7);
      monthlyMap[month] = (monthlyMap[month] || 0) + t.cost;
    });
    const chart = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue,
      }));

    const statusPie = apptAnalytics.status_counts.map((s) => ({
      name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
      value: s.count,
    }));

    const dayChart = apptAnalytics.day_counts.map((d) => ({
      day: d.day_name.slice(0, 3),
      count: d.count,
    }));

    return {
      totalRevenue: total,
      avgCost: treatments.length ? total / treatments.length : 0,
      revenueChart: chart,
      statusPie,
      dayChart,
    };
  }, [version, apptAnalytics]);

  const paymentTrend = payAnalytics.monthly_revenue
    .slice()
    .reverse()
    .map((m) => ({
      month: new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: m.revenue,
    }));

  const recent = appointments.slice(0, 8);

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle={`Welcome back, ${user?.name}! ✦ Galaxy command center`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Patients" value={patients.length} variant="galaxy" />
        <StatCard label="Total Doctors" value={doctors.length} variant="candy" />
        <StatCard label="Appointments" value={appointments.length} variant="stardust" />
        <StatCard label="Pending" value={pending} variant="sunset" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {revenueChart.length > 0 ? (
          <GalaxyAreaChart
            title="Treatment Revenue Trend"
            subtitle="Cosmic cash flow from treatments"
            data={revenueChart}
            xKey="month"
            dataKey="revenue"
            currency
            height={300}
          />
        ) : (
          <Card title="Treatment Revenue Trend"><EmptyChart /></Card>
        )}
        {statusPie.length > 0 ? (
          <GalaxyPieChart
            title="Appointment Status"
            subtitle="Live clinic pipeline"
            data={statusPie}
            height={300}
          />
        ) : (
          <Card title="Appointment Status"><EmptyChart /></Card>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {dayChart.length > 0 ? (
          <GalaxyBarChart
            title="Busiest Days"
            subtitle="Appointments by weekday"
            data={dayChart}
            xKey="day"
            dataKey="count"
            height={260}
          />
        ) : (
          <Card title="Busiest Days"><EmptyChart /></Card>
        )}
        {paymentTrend.length > 0 ? (
          <GalaxyBarChart
            title="Payment Revenue"
            subtitle="Completed payments per month"
            data={paymentTrend}
            xKey="month"
            dataKey="revenue"
            currency
            height={260}
          />
        ) : (
          <Card title="Payment Revenue"><EmptyChart /></Card>
        )}
        <Card title="Financial Pulse">
          <div className="grid h-full gap-3">
            <div className="rounded-xl bg-gradient-to-br from-candy-500 to-galaxy-700 p-4 text-center text-white shadow-glow">
              <p className="text-xs uppercase tracking-wider text-white/80">Treatment revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-galaxy-600 to-galaxy-950 p-4 text-center text-white shadow-glow-lg">
              <p className="text-xs uppercase tracking-wider text-white/80">Avg. treatment</p>
              <p className="text-2xl font-bold">{formatCurrency(avgCost)}</p>
            </div>
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 p-3 text-center">
              <p className="text-xs text-emerald-200">Payments this month</p>
              <p className="text-lg font-bold text-emerald-100">{formatCurrency(payAnalytics.month_revenue)}</p>
            </div>
            <Link to="/admin/reports" className="block">
              <Button variant="nebula" className="w-full" glow>
                Full Reports
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <Card title="Recent Appointments" className="mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-violet-100">
                <th className="pb-2">Date</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="text-violet-100">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-violet-300/70">
                    No appointments found
                  </td>
                </tr>
              ) : (
                recent.map((a) => (
                  <tr key={a.id} className="border-b border-white/10">
                    <td className="py-2">{formatDate(a.appointmentDate)}</td>
                    <td>{a.patientName}</td>
                    <td>Dr. {a.doctorName}</td>
                    <td>
                      <Badge status={a.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/users">
          <Button variant="cosmic" className="w-full">
            User Management
          </Button>
        </Link>
        <Link to="/admin/payments">
          <Button variant="success" className="w-full">
            Payment Verification
          </Button>
        </Link>
        <Link to="/admin/appointments">
          <Button variant="warning" className="w-full">
            Appointments
          </Button>
        </Link>
        <Link to="/admin/analytics">
          <Button variant="candy" className="w-full" glow>
            Analytics
          </Button>
        </Link>
      </div>
    </div>
  );
}
