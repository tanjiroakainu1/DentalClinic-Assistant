import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
  useClinicDoctorPatients,
  useClinicMedicalHistory,
  useClinicTreatments,
  useClinicUser,
} from '../hooks/useClinic';
import { getCategoryMeta } from '../lib/medicalHistoryMeta';
import { createTreatment, doctorHasPatientAccess } from '../lib/storage';
import { Alert, Button, Card, Input, PageHeader, Textarea } from '../components/ui';
import { formatCurrency, formatDate } from '../lib/utils';

export function PatientRecords() {
  const { user } = useAuth();
  const { refreshData } = useData();
  const [params] = useSearchParams();
  const patientId = Number(params.get('patient')) || 0;
  const [msg, setMsg] = useState({ type: '' as '' | 'success' | 'error', text: '' });
  const [form, setForm] = useState({ diagnosis: '', treatmentPlan: '', notes: '', cost: '' });
  const patients = useClinicDoctorPatients(user!.id);
  const patient = useClinicUser(patientId);
  const hasAccess = patientId ? doctorHasPatientAccess(user!.id, patientId) : false;
  const historyEntries = useClinicMedicalHistory(patientId);
  const treatments = useClinicTreatments({ patientId });

  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;
    createTreatment({
      patientId,
      doctorId: user!.id,
      diagnosis: form.diagnosis,
      treatmentPlan: form.treatmentPlan,
      notes: form.notes,
      cost: parseFloat(form.cost) || 0,
    });
    refreshData();
    setMsg({ type: 'success', text: 'Treatment record added successfully.' });
    setForm({ diagnosis: '', treatmentPlan: '', notes: '', cost: '' });
  };

  return (
    <div>
      <PageHeader title="Patient Records" />
      {msg.text && <Alert type={msg.type === 'success' ? 'success' : 'error'}>{msg.text}</Alert>}
      <div className="grid gap-6 lg:grid-cols-4">
        <Card title="Patient List">
          <div className="space-y-1">
            {patients.length === 0 ? <p className="text-sm text-violet-300/70">No patients found.</p> : patients.map((p) => (
              <Link
                key={p.id}
                to={`/doctor/patient-records?patient=${p.id}`}
                className={`block rounded px-3 py-2 text-sm ${patientId === p.id ? 'bg-gradient-to-r from-candy-500 to-galaxy-600 text-white shadow-glow' : 'hover:bg-white/10'}`}
              >
                {p.name}
              </Link>
            ))}
          </div>
        </Card>
        <div className="lg:col-span-3">
          {!patientId ? (
            <Card><p className="text-violet-300/70">Select a patient to view records.</p></Card>
          ) : !hasAccess ? (
            <Alert type="error">You don&apos;t have access to this patient&apos;s records.</Alert>
          ) : (
            <>
              <Card title={patient?.name ?? 'Patient'}>
                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                  <div><strong>Email:</strong> {patient?.email}</div>
                  <div><strong>Phone:</strong> {patient?.phone || 'N/A'}</div>
                </div>
              </Card>
              <Card title="Medical History" className="mt-4">
                {historyEntries.length === 0 ? (
                  <p className="text-violet-300/70">No medical history on file.</p>
                ) : (
                  <ul className="space-y-3">
                    {historyEntries.map((entry) => {
                      const meta = getCategoryMeta(entry.category);
                      return (
                        <li
                          key={entry.id}
                          className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm"
                        >
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${meta.badge}`}
                          >
                            {meta.label}
                          </span>
                          <p className="mt-2 font-semibold text-violet-100">{entry.title}</p>
                          <p className="mt-1 whitespace-pre-wrap text-violet-200/85">{entry.details}</p>
                          <p className="mt-2 text-xs text-soft">Updated {formatDate(entry.updatedAt)}</p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
              <Card title="Add Treatment" className="mt-4">
                <form onSubmit={handleAddTreatment} className="grid gap-3 sm:grid-cols-2">
                  <Input label="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} required />
                  <Input label="Cost (₱)" type="number" step="0.01" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
                  <div className="sm:col-span-2"><Textarea label="Treatment Plan" value={form.treatmentPlan} onChange={(e) => setForm({ ...form, treatmentPlan: e.target.value })} required rows={2} /></div>
                  <div className="sm:col-span-2"><Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
                  <Button type="submit" variant="candy">Add Treatment</Button>
                </form>
              </Card>
              <Card title="Treatment History" className="mt-4">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/10"><th>Date</th><th>Diagnosis</th><th>Plan</th><th>Cost</th></tr></thead>
                  <tbody>
                    {treatments.map((t) => (
                      <tr key={t.id} className="border-b border-white/10">
                        <td className="py-2">{formatDate(t.createdAt)}</td>
                        <td>{t.diagnosis}</td>
                        <td>{t.treatmentPlan}</td>
                        <td>{formatCurrency(t.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
