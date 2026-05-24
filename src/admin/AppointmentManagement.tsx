import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useClinicAppointments, useClinicAppointmentAnalytics, useClinicUsers } from '../hooks/useClinic';
import { updateAppointmentStatus } from '../lib/storage';
import { chartLabel } from '../lib/chartHelpers';
import type { AppointmentStatus } from '../types';
import { Alert, Badge, Button, Card, Input, PageHeader, Select, StatCard } from '../components/ui';
import {
  AdminInsightsSection,
  ChartGrid,
  ChartSlot,
} from '../components/charts/AdminInsights';
import { GalaxyAreaChart, GalaxyBarChart, GalaxyPieChart } from '../components/charts/GalaxyCharts';
import { formatDate } from '../lib/utils';

export function AppointmentManagement() {
  const [params, setParams] = useSearchParams();
  const { refreshData } = useData();
  const [msg, setMsg] = useState('');
  const status = params.get('status') ?? '';
  const doctorId = params.get('doctor') ?? '';
  const date = params.get('date') ?? '';
  const search = params.get('search') ?? '';

  const appointments = useClinicAppointments({
    status: (status as AppointmentStatus) || undefined,
    doctorId: doctorId ? Number(doctorId) : undefined,
    date: date || undefined,
    search: search || undefined,
  });
  const all = useClinicAppointments();
  const analytics = useClinicAppointmentAnalytics();
  const doctors = useClinicUsers('doctor');
  const stats = {
    total: all.length,
    pending: all.filter((a) => a.status === 'pending').length,
    confirmed: all.filter((a) => a.status === 'confirmed').length,
    cancelled: all.filter((a) => a.status === 'cancelled').length,
  };

  const charts = useMemo(
    () => ({
      status: analytics.status_counts
        .filter((s) => s.count > 0)
        .map((s) => ({
          name: chartLabel(s.status),
          value: s.count,
        })),
      day: analytics.day_counts.map((d) => ({ day: d.day_name.slice(0, 3), count: d.count })),
      doctors: analytics.top_doctors.map((d) => ({
        name: d.doctor_name.replace(/^Dr\.\s*/i, '').slice(0, 12),
        count: d.appointment_count,
      })),
      monthly: analytics.monthly_counts.map((m) => ({
        month: m.label,
        count: m.count,
      })),
      statusBar: analytics.status_counts
        .filter((s) => s.count > 0)
        .map((s) => ({
          status: chartLabel(s.status),
          count: s.count,
        })),
    }),
    [analytics],
  );

  const confirmAppt = (id: number) => {
    if (window.confirm('Confirm this appointment?')) {
      updateAppointmentStatus(id, 'confirmed');
      refreshData();
      setMsg('Appointment confirmed successfully.');
    }
  };

  const cancelAppt = (id: number) => {
    if (window.confirm('Cancel this appointment?')) {
      updateAppointmentStatus(id, 'cancelled');
      refreshData();
      setMsg('Appointment cancelled successfully.');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Appointment Management" subtitle="Schedule the stars — confirm, filter & visualize" />
      {msg && <Alert type="success">{msg}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={stats.total} variant="galaxy" />
        <StatCard label="Pending" value={stats.pending} variant="stardust" />
        <StatCard label="Confirmed" value={stats.confirmed} variant="candy" />
        <StatCard label="Cancelled" value={stats.cancelled} variant="sunset" />
      </div>

      <AdminInsightsSection title="Appointment charts" subtitle="Status mix, weekly rhythm, and booking trends">
        <ChartGrid>
          <ChartSlot data={charts.status} emptyTitle="Status Mix">
            <GalaxyPieChart title="Status Mix" subtitle="All appointments" data={charts.status} height={280} />
          </ChartSlot>
          <ChartSlot data={charts.day} emptyTitle="By Weekday">
            <GalaxyBarChart
              title="By Weekday"
              subtitle="Booking heat map"
              data={charts.day}
              xKey="day"
              dataKey="count"
              height={280}
            />
          </ChartSlot>
          <ChartSlot data={charts.doctors} emptyTitle="Top Doctors">
            <GalaxyBarChart
              title="Top Doctors"
              subtitle="Appointment load"
              data={charts.doctors}
              xKey="name"
              dataKey="count"
              height={280}
            />
          </ChartSlot>
        </ChartGrid>
        <ChartGrid columns={2} className="mt-6">
          <ChartSlot data={charts.monthly} emptyTitle="Booking Trend">
            <GalaxyAreaChart
              title="Booking Trend"
              subtitle="Appointments per month"
              data={charts.monthly}
              xKey="month"
              dataKey="count"
              height={300}
            />
          </ChartSlot>
          <ChartSlot data={charts.statusBar} emptyTitle="Status Breakdown">
            <GalaxyBarChart
              title="Status Breakdown"
              subtitle="Count by appointment state"
              data={charts.statusBar}
              xKey="status"
              dataKey="count"
              height={300}
            />
          </ChartSlot>
        </ChartGrid>
      </AdminInsightsSection>

      <Card title="Filter Appointments">
        <form
          className="grid gap-4 sm:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const p = new URLSearchParams();
            ['status', 'doctor', 'date', 'search'].forEach((k) => {
              const v = fd.get(k)?.toString();
              if (v) p.set(k, v);
            });
            setParams(p);
          }}
        >
          <Select name="status" label="Status" defaultValue={status}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </Select>
          <Select name="doctor" label="Doctor" defaultValue={doctorId}>
            <option value="">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.name}
              </option>
            ))}
          </Select>
          <Input name="date" label="Date" type="date" defaultValue={date} />
          <Input name="search" label="Search" defaultValue={search} placeholder="Patient or doctor" />
          <div className="flex gap-2 sm:col-span-4">
            <Button type="submit" variant="candy">
              Apply Filters
            </Button>
            <Button type="button" variant="secondary" onClick={() => setParams(new URLSearchParams())}>
              Clear
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Appointments">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-violet-100">
                <th className="pb-2">Date</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-violet-100">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-violet-300/70">
                    No appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id} className="border-b border-white/10">
                    <td className="py-2">{formatDate(a.appointmentDate)}</td>
                    <td>{a.patientName}</td>
                    <td>
                      Dr. {a.doctorName}
                      <br />
                      <small className="text-violet-300/70">{a.doctorSpecialization}</small>
                    </td>
                    <td>{a.reason}</td>
                    <td>
                      <Badge status={a.status} />
                    </td>
                    <td className="space-x-1">
                      {a.status === 'pending' && (
                        <Button variant="success" size="xs" onClick={() => confirmAppt(a.id)}>
                          Confirm
                        </Button>
                      )}
                      {a.status !== 'cancelled' && a.status !== 'completed' && (
                        <Button variant="danger" size="xs" onClick={() => cancelAppt(a.id)}>
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
