import type { ReactNode } from 'react';
import { Card } from '../ui';
import { EmptyChart } from './GalaxyCharts';

export function AdminInsightsSection({
  title = 'Galaxy insights',
  subtitle = 'Live charts from your clinic data',
  children,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-candy-200/90">✦ Analytics</p>
          <h2 className="section-title mt-1">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function ChartGrid({
  children,
  columns = 3,
  className = '',
}: {
  children: ReactNode;
  columns?: 2 | 3;
  className?: string;
}) {
  const colClass = columns === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3';
  return <div className={`grid gap-6 ${colClass} ${className}`}>{children}</div>;
}

export function ChartSlot({
  data,
  emptyTitle,
  emptyMessage,
  children,
  className = '',
}: {
  data: unknown[];
  emptyTitle: string;
  emptyMessage?: string;
  children: ReactNode;
  className?: string;
}) {
  if (!data.length) {
    return (
      <Card title={emptyTitle} className={className}>
        <EmptyChart message={emptyMessage} />
      </Card>
    );
  }
  return <div className={className}>{children}</div>;
}
