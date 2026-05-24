import { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useClinicPayments, useClinicPaymentAnalytics } from '../hooks/useClinic';
import { updatePaymentStatus } from '../lib/storage';
import { chartLabel } from '../lib/chartHelpers';
import { getPaymentMethodMeta } from '../lib/paymentMeta';
import { Alert, Badge, Button, Card, PageHeader, StatCard } from '../components/ui';
import {
  AdminInsightsSection,
  ChartGrid,
  ChartSlot,
} from '../components/charts/AdminInsights';
import { GalaxyAreaChart, GalaxyBarChart, GalaxyPieChart } from '../components/charts/GalaxyCharts';
import { formatCurrency, formatDate } from '../lib/utils';

export function PaymentVerification() {
  const { refreshData } = useData();
  const allPayments = useClinicPayments();
  const payAnalytics = useClinicPaymentAnalytics();
  const [msg, setMsg] = useState('');

  const pending = allPayments.filter((p) => p.status === 'pending');
  const history = allPayments.slice(0, 50);
  const completed = allPayments.filter((p) => p.status === 'completed');
  const stats = {
    revenue: completed.reduce((s, p) => s + p.amount, 0),
    completed: completed.length,
    pending: pending.length,
    gcash: allPayments.filter((p) => p.paymentMethod === 'gcash').length,
  };

  const charts = useMemo(
    () => ({
      status: payAnalytics.status_stats.map((s) => ({
        name: chartLabel(s.status),
        value: s.count,
      })),
      statusBar: payAnalytics.status_stats_all
        .filter((s) => s.count > 0)
        .map((s) => ({
          status: chartLabel(s.status),
          count: s.count,
          revenue: s.total,
        })),
      methods: payAnalytics.method_stats.map((m) => ({
        name: chartLabel(m.payment_method),
        value: m.total,
      })),
      monthly: payAnalytics.monthly_revenue.map((m) => ({
        month: m.label ?? m.month,
        revenue: m.revenue,
      })),
      methodCount: payAnalytics.method_stats.map((m) => ({
        method: chartLabel(m.payment_method),
        count: m.count,
      })),
    }),
    [payAnalytics],
  );

  const verify = (id: number) => {
    if (window.confirm('Verify this payment?')) {
      updatePaymentStatus(id, 'completed');
      refreshData();
      setMsg('Payment verified successfully.');
    }
  };

  const reject = (id: number) => {
    if (window.confirm('Reject this payment?')) {
      updatePaymentStatus(id, 'rejected');
      refreshData();
      setMsg('Payment rejected successfully.');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Payment Verification" subtitle="Verify GCash & cash — watch the revenue cosmos" />
      {msg && <Alert type="success">{msg}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(stats.revenue)} variant="galaxy" />
        <StatCard label="Completed" value={stats.completed} variant="candy" />
        <StatCard label="Pending" value={stats.pending} variant="stardust" />
        <StatCard label="GCash Payments" value={stats.gcash} variant="nebula" />
      </div>

      <AdminInsightsSection title="Payment charts" subtitle="Status, methods, and monthly income">
        <ChartGrid>
          <ChartSlot data={charts.status} emptyTitle="Payment Status">
            <GalaxyPieChart title="Payment Status" subtitle="All transactions" data={charts.status} height={280} />
          </ChartSlot>
          <ChartSlot data={charts.methods} emptyTitle="Revenue by Method">
            <GalaxyPieChart
              title="Revenue by Method"
              subtitle="Completed totals (₱)"
              data={charts.methods}
              currency
              height={280}
            />
          </ChartSlot>
          <ChartSlot data={charts.monthly} emptyTitle="Monthly Income">
            <GalaxyAreaChart
              title="Monthly Income"
              subtitle="Completed payments"
              data={charts.monthly}
              xKey="month"
              dataKey="revenue"
              currency
              height={280}
            />
          </ChartSlot>
        </ChartGrid>
        <ChartGrid columns={2} className="mt-6">
          <ChartSlot data={charts.statusBar} emptyTitle="Payments by Status">
            <GalaxyBarChart
              title="Payments by Status"
              subtitle="Count per verification state"
              data={charts.statusBar}
              xKey="status"
              dataKey="count"
              height={280}
            />
          </ChartSlot>
          <ChartSlot data={charts.methodCount} emptyTitle="Transactions by Method">
            <GalaxyBarChart
              title="Transactions by Method"
              subtitle="Number of payments"
              data={charts.methodCount}
              xKey="method"
              dataKey="count"
              height={280}
            />
          </ChartSlot>
        </ChartGrid>
      </AdminInsightsSection>

      <Card title="Pending Payments">
        {pending.length === 0 ? (
          <p className="text-violet-300/70">No pending payments to verify.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-violet-100">
                  <th className="pb-2">Date</th>
                  <th>Patient</th>
                  <th>Treatment</th>
                  <th>Amount</th>
                  <th>Clinic ref</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="text-violet-100">
                {pending.map((p) => (
                  <tr key={p.id} className="border-b border-white/10">
                    <td className="py-2">{formatDate(p.paymentDate)}</td>
                    <td>{p.patientName}</td>
                    <td>{p.diagnosis}</td>
                    <td>{formatCurrency(p.amount)}</td>
                    <td>
                      <span className="font-mono text-xs font-semibold tracking-wide text-candy-100">
                        {p.referenceNumber || '—'}
                      </span>
                      <span className="mt-0.5 block text-xs text-violet-300/70">
                        {getPaymentMethodMeta(p.paymentMethod).label}
                      </span>
                    </td>
                    <td className="space-x-1">
                      <Button variant="success" size="xs" onClick={() => verify(p.id)}>
                        Verify
                      </Button>
                      <Button variant="danger" size="xs" onClick={() => reject(p.id)}>
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Payment History">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-violet-100">
                <th className="pb-2">Date</th>
                <th>Patient</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Clinic ref</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="text-violet-100">
              {history.map((p) => (
                <tr key={p.id} className="border-b border-white/10">
                  <td className="py-2">{formatDate(p.paymentDate)}</td>
                  <td>{p.patientName}</td>
                  <td>{formatCurrency(p.amount)}</td>
                  <td>{getPaymentMethodMeta(p.paymentMethod).label}</td>
                  <td className="font-mono text-xs text-candy-100">{p.referenceNumber || '—'}</td>
                  <td>
                    <Badge status={p.status} />
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
