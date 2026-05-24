import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClinicTreatments } from '../hooks/useClinic';
import { Badge, Button, Card, PageHeader } from '../components/ui';
import { formatCurrency, formatDateShort } from '../lib/utils';

export function Treatments() {
  const { user } = useAuth();
  const treatments = useClinicTreatments({ patientId: user!.id });

  return (
    <div className="space-y-6">
      <PageHeader title="My Treatment Plans" subtitle="Plans from your dentist and how each one is billed" />
      {treatments.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-muted">No treatments on record.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {treatments.map((t) => (
            <article
              key={t.id}
              className="glass-card overflow-hidden transition hover:border-candy-400/20 hover:shadow-glow"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
                <div>
                  <h3 className="font-semibold text-violet-50">{t.diagnosis}</h3>
                  <p className="mt-1 text-sm text-violet-200/80">{t.treatmentPlan}</p>
                  <p className="mt-2 text-xs text-soft">
                    Dr. {t.doctorName}
                    {t.doctorSpecialization ? ` · ${t.doctorSpecialization}` : ''} · {formatDateShort(t.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-candy-200">{formatCurrency(t.cost)}</p>
                  <div className="mt-2 flex justify-end">
                    <Badge status={t.paymentStatus} />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                {t.paymentReference ? (
                  <p className="text-xs text-soft">
                    Ref{' '}
                    <span className="font-mono font-semibold text-candy-100">{t.paymentReference}</span>
                  </p>
                ) : (
                  <span />
                )}
                {t.paymentStatus === 'unpaid' || t.paymentStatus === 'rejected' ? (
                  <Link to="/patient/payments">
                    <Button size="sm" variant="candy" glow>
                      Pay with reference
                    </Button>
                  </Link>
                ) : t.paymentStatus === 'pending' ? (
                  <span className="text-xs text-cyan-200/90">GCash verification in progress</span>
                ) : (
                  <span className="text-xs text-emerald-200/90">Paid in full</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
