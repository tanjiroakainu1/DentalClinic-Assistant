import { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useClinicPayments } from '../hooks/useClinic';
import { enrichTreatments } from '../lib/selectors';
import { getTreatments } from '../lib/storage';
import { chartLabel } from '../lib/chartHelpers';
import { Badge, Card, Input, PageHeader, StatCard } from '../components/ui';
import {
  AdminInsightsSection,
  ChartGrid,
  ChartSlot,
} from '../components/charts/AdminInsights';
import { GalaxyAreaChart, GalaxyBarChart, GalaxyPieChart } from '../components/charts/GalaxyCharts';
import { formatCurrency, formatDateShort } from '../lib/utils';

export function FinancialReports() {
  const { version } = useData();
  const now = new Date();
  const [startDate, setStartDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10));

  const allPayments = useClinicPayments();
  const recentPayments = allPayments.slice(0, 10);

  const { treatments, totalRevenue, patientIds, avgCost, doctorRevenue, treatmentByDiag, chartData, pieData, periodRevenue, periodTreatments } =
    useMemo(() => {
      const t = enrichTreatments(getTreatments()).filter(
        (x) => x.createdAt >= startDate && x.createdAt <= endDate + 'T23:59:59',
      );
      const p = allPayments.filter(
        (x) => x.paymentDate >= startDate && x.paymentDate <= endDate + 'T23:59:59' && x.status === 'completed',
      );
      const total = t.reduce((s, x) => s + x.cost, 0);
      const pIds = new Set(t.map((x) => x.patientId));

      const docRev: Record<number, { count: number; revenue: number; name: string }> = {};
      t.forEach((x) => {
        if (!docRev[x.doctorId]) docRev[x.doctorId] = { count: 0, revenue: 0, name: x.doctorName };
        docRev[x.doctorId].count += 1;
        docRev[x.doctorId].revenue += x.cost;
      });

      const byDiag: Record<string, { count: number; revenue: number }> = {};
      t.forEach((x) => {
        if (!byDiag[x.diagnosis]) byDiag[x.diagnosis] = { count: 0, revenue: 0 };
        byDiag[x.diagnosis].count += 1;
        byDiag[x.diagnosis].revenue += x.cost;
      });

      const monthlyMap: Record<string, { revenue: number; treatments: number }> = {};
      enrichTreatments(getTreatments()).forEach((x) => {
        const m = x.createdAt.slice(0, 7);
        if (!monthlyMap[m]) monthlyMap[m] = { revenue: 0, treatments: 0 };
        monthlyMap[m].revenue += x.cost;
        monthlyMap[m].treatments += 1;
      });
      const chart = Object.entries(monthlyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([month, d]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          revenue: d.revenue,
          treatments: d.treatments,
        }));

      const methodMap: Record<string, number> = {};
      p.forEach((x) => {
        methodMap[x.paymentMethod] = (methodMap[x.paymentMethod] || 0) + x.amount;
      });
      const pie = Object.entries(methodMap).map(([name, value]) => ({
        name: chartLabel(name),
        value,
      }));

      const weekMap: Record<string, number> = {};
      p.forEach((x) => {
        const d = new Date(x.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        weekMap[d] = (weekMap[d] || 0) + x.amount;
      });
      const periodRevenue = Object.entries(weekMap)
        .slice(-14)
        .map(([day, revenue]) => ({ day, revenue }));

      const typeMap: Record<string, number> = {};
      t.forEach((x) => {
        const type = x.treatmentType || 'General';
        typeMap[type] = (typeMap[type] || 0) + 1;
      });
      const periodTreatments = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

      return {
        treatments: t,
        totalRevenue: total,
        patientIds: pIds,
        avgCost: t.length ? total / t.length : 0,
        doctorRevenue: docRev,
        treatmentByDiag: byDiag,
        chartData: chart,
        pieData: pie,
        periodRevenue,
        periodTreatments,
      };
    }, [version, startDate, endDate, allPayments]);

  const doctorChart = Object.values(doctorRevenue).map((d) => ({
    name: d.name.replace(/^Dr\.\s*/i, '').slice(0, 14),
    revenue: d.revenue,
  }));

  const diagChart = Object.entries(treatmentByDiag)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 8)
    .map(([diag, d]) => ({
      name: diag.length > 18 ? diag.slice(0, 16) + '…' : diag,
      revenue: d.revenue,
    }));

  return (
    <div className="space-y-8">
      <PageHeader title="Financial Reports" subtitle="Revenue nebula — treatments, doctors & payment methods" />

      <Card title="Date Range">
        <div className="flex flex-wrap gap-4">
          <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} variant="galaxy" />
        <StatCard label="Treatments" value={treatments.length} variant="candy" />
        <StatCard label="Patients Treated" value={patientIds.size} variant="nebula" />
        <StatCard label="Avg. Cost" value={formatCurrency(avgCost)} variant="stardust" />
      </div>

      <AdminInsightsSection title="Revenue charts" subtitle="Trends, methods, and period breakdown">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartSlot data={chartData} emptyTitle="12-Month Revenue Wave">
              <GalaxyAreaChart
                title="12-Month Revenue Wave"
                subtitle="All-time treatment income trend"
                data={chartData}
                xKey="month"
                dataKey="revenue"
                currency
                height={320}
              />
            </ChartSlot>
          </div>
          <ChartSlot data={pieData} emptyTitle="Payment Methods" emptyMessage="No completed payments in range">
            <GalaxyPieChart
              title="Payment Methods"
              subtitle="In selected date range"
              data={pieData}
              currency
              height={320}
            />
          </ChartSlot>
        </div>

        <ChartGrid columns={2} className="mt-6">
          <ChartSlot data={periodRevenue} emptyTitle="Period Cash Flow">
            <GalaxyBarChart
              title="Period Cash Flow"
              subtitle="Completed payments in range"
              data={periodRevenue}
              xKey="day"
              dataKey="revenue"
              currency
              height={300}
            />
          </ChartSlot>
          <ChartSlot data={periodTreatments} emptyTitle="Treatments by Type">
            <GalaxyPieChart
              title="Treatments by Type"
              subtitle="Selected period"
              data={periodTreatments}
              height={300}
            />
          </ChartSlot>
        </ChartGrid>

        <ChartGrid columns={2} className="mt-6">
          <ChartSlot data={doctorChart} emptyTitle="Revenue by Doctor">
            <GalaxyBarChart
              title="Revenue by Doctor"
              subtitle="Selected period"
              data={doctorChart}
              xKey="name"
              dataKey="revenue"
              currency
              horizontal
              height={300}
            />
          </ChartSlot>
          <ChartSlot data={diagChart} emptyTitle="Top Diagnoses">
            <GalaxyBarChart
              title="Top Diagnoses"
              subtitle="By revenue"
              data={diagChart}
              xKey="name"
              dataKey="revenue"
              currency
              horizontal
              height={300}
            />
          </ChartSlot>
        </ChartGrid>
      </AdminInsightsSection>

      <Card title="Recent Payments">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-violet-100">
                <th className="pb-2">Date</th>
                <th>Patient</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="text-violet-100">
              {recentPayments.map((p) => (
                <tr key={p.id} className="border-b border-white/10">
                  <td className="py-2">{formatDateShort(p.paymentDate)}</td>
                  <td>{p.patientName}</td>
                  <td>{formatCurrency(p.amount)}</td>
                  <td className="capitalize">{chartLabel(p.paymentMethod)}</td>
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
