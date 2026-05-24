import { APPOINTMENT_STATUSES, formatChartMonth, PAYMENT_STATUSES, WEEKDAY_ORDER } from './chartHelpers';
import { getAppData } from './storage';

export function getAppointmentAnalytics() {
  const data = getAppData();
  const statusMap: Record<string, number> = {};
  data.appointments.forEach((a) => {
    statusMap[a.status] = (statusMap[a.status] || 0) + 1;
  });
  const status_counts = APPOINTMENT_STATUSES.map((status) => ({
    status,
    count: statusMap[status] || 0,
  }));

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayMap: Record<string, number> = {};
  data.appointments.forEach((a) => {
    const day = dayNames[new Date(a.appointmentDate).getDay()];
    dayMap[day] = (dayMap[day] || 0) + 1;
  });
  const day_counts = WEEKDAY_ORDER.map((day_name) => ({
    day_name,
    count: dayMap[day_name] || 0,
  }));
  const doctorMap: Record<number, number> = {};
  data.appointments.forEach((a) => {
    doctorMap[a.doctorId] = (doctorMap[a.doctorId] || 0) + 1;
  });
  const top_doctors = Object.entries(doctorMap)
    .map(([doctorId, appointment_count]) => {
      const doctor = data.users.find((u) => u.id === Number(doctorId));
      return { doctor_name: doctor?.name ?? 'Unknown', appointment_count };
    })
    .sort((a, b) => b.appointment_count - a.appointment_count)
    .slice(0, 5);

  const monthMap: Record<string, number> = {};
  data.appointments.forEach((a) => {
    const month = a.appointmentDate.slice(0, 7);
    monthMap[month] = (monthMap[month] || 0) + 1;
  });
  const monthly_counts = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([month, count]) => ({ month, count, label: formatChartMonth(month) }));

  const total_appointments = data.appointments.length;
  return {
    total_appointments,
    status_counts,
    day_counts,
    top_doctors,
    monthly_counts,
    summary: {
      pending: statusMap.pending || 0,
      confirmed: statusMap.confirmed || 0,
      cancelled: statusMap.cancelled || 0,
    },
  };
}
export function getPaymentAnalytics() {
  const data = getAppData();
  const methodMap: Record<string, { count: number; total: number }> = {};
  const statusMap: Record<string, { count: number; total: number }> = {};
  const monthMap: Record<string, number> = {};

  let total_revenue = 0;
  const currentMonth = new Date().toISOString().slice(0, 7);
  let month_revenue = 0;

  data.payments.forEach((p) => {
    if (!methodMap[p.paymentMethod]) methodMap[p.paymentMethod] = { count: 0, total: 0 };
    methodMap[p.paymentMethod].count += 1;
    methodMap[p.paymentMethod].total += p.amount;

    if (!statusMap[p.status]) statusMap[p.status] = { count: 0, total: 0 };
    statusMap[p.status].count += 1;
    statusMap[p.status].total += p.amount;

    if (p.status === 'completed') {
      total_revenue += p.amount;
      const month = p.paymentDate.slice(0, 7);
      monthMap[month] = (monthMap[month] || 0) + p.amount;
      if (month === currentMonth) month_revenue += p.amount;
    }
  });

  const method_stats = Object.entries(methodMap).map(([payment_method, v]) => ({
    payment_method,
    count: v.count,
    total: v.total,
  }));
  const status_stats = PAYMENT_STATUSES.map((status) => ({
    status,
    count: statusMap[status]?.count ?? 0,
    total: statusMap[status]?.total ?? 0,
  })).filter((s) => s.count > 0);

  const status_stats_all = PAYMENT_STATUSES.map((status) => ({
    status,
    count: statusMap[status]?.count ?? 0,
    total: statusMap[status]?.total ?? 0,
  }));

  const monthly_revenue = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([month, revenue]) => ({ month, revenue, label: formatChartMonth(month) }));

  return {
    total_revenue,
    month_revenue,
    method_stats,
    status_stats,
    status_stats_all,
    monthly_revenue,
  };
}
export function getUserAnalytics() {
  const data = getAppData();
  const role_counts = (['patient', 'doctor', 'admin'] as const).map((role) => ({
    role,
    name: role.charAt(0).toUpperCase() + role.slice(1) + 's',
    count: data.users.filter((u) => u.role === role).length,
  }));

  const monthMap: Record<string, number> = {};
  data.users.forEach((u) => {
    const m = u.createdAt.slice(0, 7);
    monthMap[m] = (monthMap[m] || 0) + 1;
  });
  const signups_by_month = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      count,
    }));

  return {
    total_users: data.users.length,
    role_counts,
    signups_by_month,
  };
}

export function getAppointmentStats() {
  return getAppointmentAnalytics();
}

export function getPaymentStats() {
  return getPaymentAnalytics();
}
