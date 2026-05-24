import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_COLORS } from '../../lib/theme';
import { formatCurrency } from '../../lib/utils';

export const CHART_TICK = { fill: '#c4b5fd', fontSize: 11 };
export const CHART_TOOLTIP_STYLE = {
  background: 'rgba(30, 11, 61, 0.95)',
  border: '1px solid rgba(217, 70, 239, 0.45)',
  borderRadius: '14px',
  boxShadow: '0 0 24px rgba(192, 38, 211, 0.35)',
  padding: '10px 14px',
};
export const CHART_LABEL_STYLE = { color: '#f0abfc', fontWeight: 600 };

export function ChartShell({
  title,
  subtitle,
  children,
  height = 280,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-candy-400/20 bg-gradient-to-br from-galaxy-900/80 via-galaxy-950/90 to-galaxy-950 p-4 shadow-glow backdrop-blur-sm ${className}`}
    >
      <div className="mb-3">
        <h4 className="bg-gradient-to-r from-candy-200 to-galaxy-200 bg-clip-text text-sm font-bold text-transparent">
          {title}
        </h4>
        {subtitle && <p className="mt-0.5 text-xs text-violet-300/80">{subtitle}</p>}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

export function GradientDefs() {
  return (
    <defs>
      <linearGradient id="gradCandy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f0abfc" stopOpacity={0.95} />
        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.85} />
      </linearGradient>
      <linearGradient id="gradGalaxy" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e879f9" />
        <stop offset="50%" stopColor="#c026d3" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
      <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#d946ef" stopOpacity={0.55} />
        <stop offset="100%" stopColor="#4c1d95" stopOpacity={0.05} />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

function GalaxyTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
  valueFormatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={CHART_TOOLTIP_STYLE}>
      {label && <p style={CHART_LABEL_STYLE}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm text-violet-100">
          <span style={{ color: p.color ?? CHART_COLORS.primary }}>● </span>
          {p.name}: <strong>{valueFormatter ? valueFormatter(p.value ?? 0) : p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export function GalaxyBarChart({
  data,
  dataKey,
  xKey,
  currency = false,
  horizontal = false,
  height = 280,
  title,
  subtitle,
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  xKey: string;
  currency?: boolean;
  horizontal?: boolean;
  height?: number;
  title: string;
  subtitle?: string;
}) {
  const fmt = currency ? formatCurrency : (v: number) => String(v);
  return (
    <ChartShell title={title} subtitle={subtitle} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 8, left: horizontal ? 8 : 0, bottom: 0 }}>
          <GradientDefs />
          <CartesianGrid strokeDasharray="3 6" stroke={CHART_COLORS.grid} vertical={!horizontal} horizontal={horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" tick={CHART_TICK} tickFormatter={currency ? (v) => `₱${(v / 1000).toFixed(0)}k` : undefined} />
              <YAxis type="category" dataKey={xKey} tick={CHART_TICK} width={90} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={CHART_TICK} />
              <YAxis tick={CHART_TICK} tickFormatter={currency ? (v) => `₱${(v / 1000).toFixed(0)}k` : undefined} />
            </>
          )}
          <Tooltip content={<GalaxyTooltip valueFormatter={currency ? fmt : undefined} />} />
          <Bar dataKey={dataKey} fill="url(#gradCandy)" radius={horizontal ? [0, 10, 10, 0] : [10, 10, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function GalaxyAreaChart({
  data,
  dataKey,
  xKey,
  currency = false,
  height = 280,
  title,
  subtitle,
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  xKey: string;
  currency?: boolean;
  height?: number;
  title: string;
  subtitle?: string;
}) {
  return (
    <ChartShell title={title} subtitle={subtitle} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <GradientDefs />
          <CartesianGrid strokeDasharray="3 6" stroke={CHART_COLORS.grid} />
          <XAxis dataKey={xKey} tick={CHART_TICK} />
          <YAxis tick={CHART_TICK} tickFormatter={currency ? (v) => `₱${(v / 1000).toFixed(0)}k` : undefined} />
          <Tooltip content={<GalaxyTooltip valueFormatter={currency ? formatCurrency : undefined} />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={CHART_COLORS.primary}
            strokeWidth={3}
            fill="url(#gradArea)"
            dot={{ fill: CHART_COLORS.tertiary, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 7, fill: '#f0abfc', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function GalaxyPieChart({
  data,
  nameKey = 'name',
  valueKey = 'value',
  currency = false,
  height = 280,
  title,
  subtitle,
  donut = true,
}: {
  data: { name: string; value: number }[];
  nameKey?: string;
  valueKey?: string;
  currency?: boolean;
  height?: number;
  title: string;
  subtitle?: string;
  donut?: boolean;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ChartShell title={title} subtitle={subtitle} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <GradientDefs />
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={donut ? 55 : 0}
            outerRadius={donut ? 88 : 95}
            paddingAngle={3}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={{ stroke: '#c4b5fd', strokeWidth: 1 }}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS.pie[i % CHART_COLORS.pie.length]} stroke="rgba(255,255,255,0.15)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<GalaxyTooltip valueFormatter={currency ? formatCurrency : undefined} />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#c4b5fd' }}
            formatter={(value) => <span className="text-violet-200">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      {total > 0 && currency && (
        <p className="-mt-2 text-center text-xs text-candy-300">Total {formatCurrency(total)}</p>
      )}
    </ChartShell>
  );
}

export function EmptyChart({ message = 'No data yet' }: { message?: string }) {
  return (
    <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-candy-400/30 bg-white/5 text-center">
      <span className="text-3xl opacity-60">✦</span>
      <p className="mt-2 text-sm text-violet-300/80">{message}</p>
    </div>
  );
}
