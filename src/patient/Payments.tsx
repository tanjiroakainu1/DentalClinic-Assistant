import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useClinicPayments, useClinicUnpaidTreatments } from '../hooks/useClinic';
import { createPayment } from '../lib/storage';
import { getPaymentMethodMeta, PAYMENT_METHODS, paymentStatusHint } from '../lib/paymentMeta';
import type { PaymentMethod, PaymentStatus } from '../types';
import { Alert, Badge, Button, Card, Modal, TabGroup } from '../components/ui';
import { formatCurrency, formatDate, formatDateShort } from '../lib/utils';

type HistoryFilter = 'all' | 'pending' | 'completed';

function copyText(text: string, onDone: () => void) {
  void navigator.clipboard.writeText(text).then(onDone).catch(() => {
    window.prompt('Copy reference:', text);
    onDone();
  });
}

export function Payments() {
  const { user } = useAuth();
  const { refreshData } = useData();
  const [msg, setMsg] = useState({ type: '' as '' | 'success' | 'error', text: '' });
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [modalTreatment, setModalTreatment] = useState<number | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('gcash');
  const [submitting, setSubmitting] = useState(false);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    ref: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    diagnosis: string;
  } | null>(null);

  const unpaid = useClinicUnpaidTreatments(user!.id);
  const history = useClinicPayments({ patientId: user!.id });
  const treatment = unpaid.find((t) => t.id === modalTreatment);
  const methodMeta = getPaymentMethodMeta(method);

  const stats = useMemo(() => {
    const completed = history.filter((p) => p.status === 'completed');
    const pending = history.filter((p) => p.status === 'pending');
    return {
      paidTotal: completed.reduce((s, p) => s + p.amount, 0),
      pendingTotal: pending.reduce((s, p) => s + p.amount, 0),
      dueTotal: unpaid.reduce((s, t) => s + t.cost, 0),
      txCount: history.length,
    };
  }, [history, unpaid]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') return history;
    if (historyFilter === 'pending') return history.filter((p) => p.status === 'pending');
    return history.filter((p) => p.status === 'completed');
  }, [history, historyFilter]);

  const openPay = (treatmentId: number) => {
    setMethod('gcash');
    setModalTreatment(treatmentId);
    setMsg({ type: '', text: '' });
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatment || submitting) return;
    setSubmitting(true);
    const r = createPayment({
      treatmentId: treatment.id,
      amount: treatment.cost,
      paymentMethod: method,
    });
    setSubmitting(false);

    if (r.success && r.referenceNumber) {
      refreshData();
      setModalTreatment(null);
      setReceipt({
        ref: r.referenceNumber,
        amount: treatment.cost,
        method,
        status: method === 'gcash' ? 'pending' : 'completed',
        diagnosis: treatment.diagnosis,
      });
      setMsg({
        type: 'success',
        text:
          method === 'gcash'
            ? 'GCash payment submitted with your clinic reference.'
            : 'Payment recorded — reference generated.',
      });
    } else {
      setMsg({ type: 'error', text: r.error ?? 'Payment failed.' });
    }
  };

  const handleCopy = (ref: string) => {
    copyText(ref, () => {
      setCopiedRef(ref);
      window.setTimeout(() => setCopiedRef((c) => (c === ref ? null : c)), 2000);
    });
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-candy-400/30 bg-gradient-to-br from-galaxy-900 via-galaxy-950 to-indigo-950 p-6 shadow-glow-lg md:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-candy-500/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-candy-200/90">Billing cosmos</p>
            <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Payments</h1>
            <p className="mt-2 max-w-xl text-sm text-violet-200/85">
              Every payment gets a unique clinic reference — quote it for GCash, card, or bank transfers so we can
              match your transaction instantly.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/patient/treatments">
              <Button type="button" variant="outline" size="sm">
                Treatment plans
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Amount due', value: formatCurrency(stats.dueTotal), accent: 'text-amber-200' },
            { label: 'Total paid', value: formatCurrency(stats.paidTotal), accent: 'text-emerald-200' },
            { label: 'Pending verify', value: formatCurrency(stats.pendingTotal), accent: 'text-cyan-200' },
            { label: 'Transactions', value: stats.txCount, accent: 'text-candy-200' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-md"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-violet-300/80">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold ${s.accent}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {msg.text && <Alert type={msg.type === 'success' ? 'success' : 'error'}>{msg.text}</Alert>}

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-violet-50">Outstanding balances</h2>
          {unpaid.length > 0 && (
            <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-100">
              {unpaid.length} due
            </span>
          )}
        </div>
        {unpaid.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <p className="text-5xl opacity-70">✓</p>
              <p className="mt-3 text-lg font-medium text-violet-100">You&apos;re all caught up</p>
              <p className="mt-1 text-sm text-muted">No pending treatment payments right now.</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {unpaid.map((t) => (
              <article
                key={t.id}
                className="glass-card group overflow-hidden transition hover:border-amber-400/35 hover:shadow-glow"
              >
                <div className="border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-galaxy-900/80 to-galaxy-950/90 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">Treatment due</p>
                      <h3 className="mt-1 truncate text-lg font-semibold text-white">{t.diagnosis}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-violet-200/80">{t.treatmentPlan}</p>
                    </div>
                    <p className="shrink-0 text-2xl font-bold text-candy-200">{formatCurrency(t.cost)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <p className="text-xs text-soft">
                    Dr. {t.doctorName} · {formatDateShort(t.createdAt)}
                  </p>
                  <Button type="button" variant="candy" glow onClick={() => openPay(t.id)}>
                    Pay now
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-violet-50">Payment history</h2>
          <TabGroup
            value={historyFilter}
            onChange={(id) => setHistoryFilter(id as HistoryFilter)}
            tabs={[
              { id: 'all', label: `All (${history.length})` },
              { id: 'pending', label: `Pending (${history.filter((p) => p.status === 'pending').length})` },
              { id: 'completed', label: `Paid (${history.filter((p) => p.status === 'completed').length})` },
            ]}
          />
        </div>

        {filteredHistory.length === 0 ? (
          <Card>
            <p className="py-8 text-center text-muted">No payments in this view yet.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredHistory.map((p) => {
              const meta = getPaymentMethodMeta(p.paymentMethod);
              const ref = p.referenceNumber ?? '—';
              return (
                <article
                  key={p.id}
                  className="glass-card overflow-hidden transition hover:border-candy-400/25 hover:shadow-glow"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-galaxy-900/90 to-galaxy-950/90 px-5 py-4">
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}
                      >
                        <span>{meta.icon}</span> {meta.label}
                      </span>
                      <h3 className="mt-2 font-semibold text-violet-50">{p.diagnosis || 'Treatment payment'}</h3>
                      <p className="mt-1 text-xs text-soft">{formatDate(p.paymentDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-candy-200">{formatCurrency(p.amount)}</p>
                      <div className="mt-2 flex justify-end">
                        <Badge status={p.status} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/70">
                        Clinic reference
                      </p>
                      <p className="mt-1 font-mono text-sm font-semibold tracking-wide text-candy-100 sm:text-base">
                        {ref}
                      </p>
                      <p className="mt-1 text-xs text-soft">{paymentStatusHint(p.status)}</p>
                    </div>
                    {ref !== '—' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(ref)}
                      >
                        {copiedRef === ref ? 'Copied!' : 'Copy ref'}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Modal open={!!treatment} onClose={() => setModalTreatment(null)} title="Complete payment">
        {treatment && (
          <form onSubmit={handlePay} className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-galaxy-900/80 to-galaxy-950/90 p-4">
              <p className="text-xs uppercase tracking-wide text-violet-300/70">You are paying for</p>
              <p className="mt-1 font-semibold text-white">{treatment.diagnosis}</p>
              <p className="mt-2 text-3xl font-bold text-candy-200">{formatCurrency(treatment.cost)}</p>
              <p className="mt-1 text-xs text-soft">Dr. {treatment.doctorName}</p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-violet-100">Payment method</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value)}
                    className={`rounded-xl border p-3 text-left transition ${
                      method === m.value
                        ? 'border-candy-400/60 bg-candy-500/15 shadow-glow ring-1 ring-candy-400/40'
                        : 'border-white/10 bg-white/5 hover:border-white/25'
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <p className="mt-1 font-semibold text-violet-50">{m.label}</p>
                    <p className="text-xs text-soft">{m.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-50/95">
              <p className="font-medium">Reference generated on submit</p>
              <p className="mt-1 text-cyan-100/80">
                {method === 'gcash'
                  ? 'After you pay, you will receive a unique GAL reference — include it in your GCash message so admin can verify quickly.'
                  : methodMeta.instant
                    ? 'A unique GAL reference will appear on your receipt for clinic records.'
                    : 'Your clinic reference will be shown on the confirmation screen.'}
              </p>
            </div>

            <Button type="submit" variant="candy" className="w-full" glow disabled={submitting}>
              {submitting ? 'Processing…' : `Submit ${formatCurrency(treatment.cost)} payment`}
            </Button>
          </form>
        )}
      </Modal>

      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Payment receipt">
        {receipt && (
          <div className="space-y-5">
            <div className="relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 via-galaxy-900 to-galaxy-950 p-6 text-center shadow-glow">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(244,114,182,0.15),transparent_55%)]" />
              <p className="relative text-4xl">{receipt.status === 'completed' ? '✓' : '◎'}</p>
              <p className="relative mt-2 text-lg font-semibold text-white">
                {receipt.status === 'completed' ? 'Payment recorded' : 'Submitted for verification'}
              </p>
              <p className="relative mt-1 text-3xl font-bold text-candy-200">{formatCurrency(receipt.amount)}</p>
              <p className="relative mt-1 text-sm text-violet-200/80">{receipt.diagnosis}</p>
            </div>

            <div className="rounded-2xl border border-candy-400/35 bg-galaxy-950/80 p-4">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-candy-200/90">
                Clinic reference
              </p>
              <p className="mt-3 break-all text-center font-mono text-xl font-bold tracking-wider text-white sm:text-2xl">
                {receipt.ref}
              </p>
              <p className="mt-3 text-center text-xs text-soft">
                {getPaymentMethodMeta(receipt.method).label} · {paymentStatusHint(receipt.status)}
              </p>
              <div className="mt-4 flex justify-center">
                <Button type="button" variant="nebula" glow onClick={() => handleCopy(receipt.ref)}>
                  {copiedRef === receipt.ref ? 'Copied to clipboard!' : 'Copy reference'}
                </Button>
              </div>
            </div>

            {receipt.method === 'gcash' && receipt.status === 'pending' && (
              <Alert type="info">
                Send exactly {formatCurrency(receipt.amount)} via GCash and paste reference{' '}
                <strong className="font-mono">{receipt.ref}</strong> in the payment notes. Admin will verify shortly.
              </Alert>
            )}

            <Button type="button" variant="secondary" className="w-full" onClick={() => setReceipt(null)}>
              Done
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
