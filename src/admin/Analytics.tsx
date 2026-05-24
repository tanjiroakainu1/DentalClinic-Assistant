import { useMemo, useState } from 'react';
import {
  useClinicAppointmentAnalytics,
  useClinicPaymentAnalytics,
  useClinicUserAnalytics,
} from '../hooks/useClinic';
import { chartLabel } from '../lib/chartHelpers';
import { PageHeader, StatCard, TabGroup } from '../components/ui';
import {
  AdminInsightsSection,
  ChartGrid,
  ChartSlot,
} from '../components/charts/AdminInsights';
import { GalaxyAreaChart, GalaxyBarChart, GalaxyPieChart } from '../components/charts/GalaxyCharts';
import { formatCurrency } from '../lib/utils';

type AnalyticsTab = 'appointments' | 'payments' | 'users';

export function Analytics() {
  const [type, setType] = useState<AnalyticsTab>('appointments');
  const apptData = useClinicAppointmentAnalytics();
  const payData = useClinicPaymentAnalytics();
  const userData = useClinicUserAnalytics();

  const apptCharts = useMemo(
    () => ({
      day: apptData.day_counts.map((d) => ({ day: d.day_name.slice(0, 3), count: d.count })),
      status: apptData.status_counts
        .filter((s) => s.count > 0)
        .map((s) => ({
          name: chartLabel(s.status),
          value: s.count,
        })),
      doctors: apptData.top_doctors.map((d) => ({
        name: d.doctor_name.replace(/^Dr\.\s*/i, '').slice(0, 12),
        count: d.appointment_count,
      })),
      monthly: apptData.monthly_counts.map((m) => ({
        month: m.label,
        count: m.count,
      })),
      statusBar: apptData.status_counts
        .filter((s) => s.count > 0)
        .map((s) => ({
          status: chartLabel(s.status),
          count: s.count,
        })),
    }),
    [apptData],
  );

  const payCharts = useMemo(
    () => ({
      methods: payData.method_stats.map((m) => ({
        name: chartLabel(m.payment_method),
        value: m.total,
      })),
      status: payData.status_stats.map((s) => ({
        name: chartLabel(s.status),
        value: s.count,
      })),
      monthly: payData.monthly_revenue.map((m) => ({
        month: m.label ?? m.month,
        revenue: m.revenue,
      })),
      statusRevenue: payData.status_stats_all
        .filter((s) => s.total > 0)
        .map((s) => ({
          status: chartLabel(s.status),
          revenue: s.total,
        })),
    }),
    [payData],
  );

  const userCharts = useMemo(
    () => ({
      roles: userData.role_counts.map((r) => ({
        name: r.name,
        value: r.count,
      })),
      signups: userData.signups_by_month,
    }),
    [userData],
  );

  return (
    <div className="space-y-8">
      <PageHeader title="Analytics Dashboard" subtitle="Candy-purple insights across your galaxy clinic" />

      <TabGroup
        value={type}
        onChange={(id) => setType(id as AnalyticsTab)}
        tabs={[
          { id: 'appointments', label: 'Appointments' },
          { id: 'payments', label: 'Payments' },
          { id: 'users', label: 'Users' },
        ]}
      />

      {type === 'appointments' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Appointments" value={apptData.total_appointments} variant="galaxy" />
            <StatCard label="Confirmed" value={apptData.summary.confirmed} variant="candy" />
            <StatCard label="Pending" value={apptData.summary.pending} variant="stardust" />
            <StatCard label="Cancelled" value={apptData.summary.cancelled} variant="sunset" />
          </div>

          <AdminInsightsSection title="Appointment analytics" subtitle="Weekly rhythm and booking pipeline">
            <ChartGrid>
              <ChartSlot data={apptCharts.day} emptyTitle="Appointments by Day">
                <GalaxyBarChart
                  title="Appointments by Day"
                  subtitle="Weekly rhythm of visits"
                  data={apptCharts.day}
                  xKey="day"
                  dataKey="count"
                  height={300}
                />
              </ChartSlot>
              <ChartSlot data={apptCharts.status} emptyTitle="Status Distribution">
                <GalaxyPieChart
                  title="Status Distribution"
                  subtitle="Pending vs confirmed vs cancelled"
                  data={apptCharts.status}
                  height={300}
                />
              </ChartSlot>
              <ChartSlot data={apptCharts.monthly} emptyTitle="Monthly Bookings">
                <GalaxyAreaChart
                  title="Monthly Bookings"
                  subtitle="Appointment volume over time"
                  data={apptCharts.monthly}
                  xKey="month"
                  dataKey="count"
                  height={300}
                />
              </ChartSlot>
            </ChartGrid>
            <ChartGrid columns={2} className="mt-6">
              <ChartSlot data={apptCharts.doctors} emptyTitle="Top Doctors">
                <GalaxyBarChart
                  title="Top Doctors"
                  subtitle="Most booked clinicians"
                  data={apptCharts.doctors}
                  xKey="name"
                  dataKey="count"
                  horizontal
                  height={280}
                />
              </ChartSlot>
              <ChartSlot data={apptCharts.statusBar} emptyTitle="Status Breakdown">
                <GalaxyBarChart
                  title="Status Breakdown"
                  subtitle="Count by state"
                  data={apptCharts.statusBar}
                  xKey="status"
                  dataKey="count"
                  height={280}
                />
              </ChartSlot>
            </ChartGrid>
          </AdminInsightsSection>
        </>
      )}

      {type === 'payments' && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Revenue" value={formatCurrency(payData.total_revenue)} variant="candy" />
            <StatCard label="This Month" value={formatCurrency(payData.month_revenue)} variant="galaxy" />
            <StatCard
              label="Completed Payments"
              value={payData.status_stats.find((s) => s.status === 'completed')?.count ?? 0}
              variant="nebula"
            />
          </div>

          <AdminInsightsSection title="Payment analytics" subtitle="Revenue waves and verification mix">
            <ChartGrid>
              <ChartSlot data={payCharts.monthly} emptyTitle="Monthly Revenue">
                <GalaxyAreaChart
                  title="Monthly Revenue Wave"
                  subtitle="Completed payment income"
                  data={payCharts.monthly}
                  xKey="month"
                  dataKey="revenue"
                  currency
                  height={300}
                />
              </ChartSlot>
              <ChartSlot data={payCharts.methods} emptyTitle="Payment Methods">
                <GalaxyPieChart
                  title="Payment Methods"
                  subtitle="Cash vs GCash vs others (₱)"
                  data={payCharts.methods}
                  currency
                  height={300}
                />
              </ChartSlot>
              <ChartSlot data={payCharts.status} emptyTitle="Payment Status">
                <GalaxyPieChart
                  title="Payment Status"
                  subtitle="Verification pipeline"
                  data={payCharts.status}
                  height={300}
                />
              </ChartSlot>
            </ChartGrid>
            <ChartGrid columns={2} className="mt-6">
              <ChartSlot data={payCharts.status} emptyTitle="Payments by Status">
                <GalaxyBarChart
                  title="Payments by Status"
                  subtitle="Count per verification state"
                  data={payCharts.status.map((s) => ({ status: s.name, count: s.value }))}
                  xKey="status"
                  dataKey="count"
                  height={280}
                />
              </ChartSlot>
              <ChartSlot data={payCharts.statusRevenue} emptyTitle="Revenue by Status">
                <GalaxyBarChart
                  title="Revenue by Status"
                  subtitle="₱ totals per state"
                  data={payCharts.statusRevenue}
                  xKey="status"
                  dataKey="revenue"
                  currency
                  height={280}
                />
              </ChartSlot>
            </ChartGrid>
          </AdminInsightsSection>
        </>
      )}

      {type === 'users' && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Users" value={userData.total_users} variant="galaxy" />
            <StatCard
              label="Patients"
              value={userData.role_counts.find((r) => r.role === 'patient')?.count ?? 0}
              variant="candy"
            />
            <StatCard
              label="Doctors"
              value={userData.role_counts.find((r) => r.role === 'doctor')?.count ?? 0}
              variant="nebula"
            />
          </div>

          <AdminInsightsSection title="User analytics" subtitle="Portal population and growth">
            <ChartGrid columns={2}>
              <ChartSlot data={userCharts.roles} emptyTitle="Users by Role">
                <GalaxyPieChart
                  title="Users by Role"
                  subtitle="Patients, doctors, admins"
                  data={userCharts.roles}
                  height={320}
                />
              </ChartSlot>
              <ChartSlot data={userCharts.signups} emptyTitle="Signup Trend">
                <GalaxyAreaChart
                  title="Signup Trend"
                  subtitle="New accounts per month"
                  data={userCharts.signups}
                  xKey="month"
                  dataKey="count"
                  height={320}
                />
              </ChartSlot>
            </ChartGrid>
            <div className="mt-6">
              <ChartSlot data={userCharts.roles} emptyTitle="Role Counts">
                <GalaxyBarChart
                  title="Role Counts"
                  subtitle="Headcount by portal type"
                  data={userCharts.roles.map((r) => ({ role: r.name, count: r.value }))}
                  xKey="role"
                  dataKey="count"
                  height={260}
                />
              </ChartSlot>
            </div>
          </AdminInsightsSection>
        </>
      )}
    </div>
  );
}
