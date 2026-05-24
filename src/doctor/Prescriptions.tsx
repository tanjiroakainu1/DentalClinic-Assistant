import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useClinicDoctorPatients, useClinicPrescriptions } from '../hooks/useClinic';
import { createPrescription, updatePrescriptionStatus } from '../lib/storage';
import { Alert, Badge, Button, Card, Input, PageHeader, Select, Textarea } from '../components/ui';
import { formatDate } from '../lib/utils';

export function Prescriptions() {
  const { user } = useAuth();
  const { refreshData } = useData();
  const [msg, setMsg] = useState({ type: '' as '' | 'success' | 'error', text: '' });
  const patients = useClinicDoctorPatients(user!.id);
  const prescriptions = useClinicPrescriptions({ doctorId: user!.id });
  const [form, setForm] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = createPrescription({
      patientId: Number(form.patientId),
      doctorId: user!.id,
      medication: form.medication,
      dosage: form.dosage,
      frequency: form.frequency,
      duration: form.duration,
      instructions: form.instructions,
      notes: form.notes,
    });
    if (r.success) {
      refreshData();
      setMsg({ type: 'success', text: 'Prescription added successfully.' });
      setForm({ patientId: '', medication: '', dosage: '', frequency: '', duration: '', instructions: '', notes: '' });
    } else {
      setMsg({ type: 'error', text: r.error ?? 'Failed' });
    }
  };

  return (
    <div>
      <PageHeader title="Prescriptions" />
      {msg.text && <Alert type={msg.type === 'success' ? 'success' : 'error'}>{msg.text}</Alert>}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Add Prescription">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Select label="Patient" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Input label="Medication" value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })} required />
            <Input label="Dosage" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} required />
            <Input label="Frequency" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} required />
            <Input label="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
            <Textarea label="Instructions" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} required rows={2} />
            <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            <Button type="submit" variant="candy">Add Prescription</Button>
          </form>
        </Card>
        <Card title="Prescription List">
          {prescriptions.length === 0 ? <p className="text-violet-300/70">No prescriptions yet.</p> : (
            <div className="max-h-[500px] space-y-3 overflow-y-auto">
              {prescriptions.map((rx) => {
                const patient = patients.find((p) => p.id === rx.patientId);
                return (
                  <div key={rx.id} className="rounded border p-3 text-sm">
                    <div className="flex justify-between">
                      <strong>{rx.medication}</strong>
                      <Badge status={rx.status} />
                    </div>
                    <p>Patient: {patient?.name}</p>
                    <p>{rx.dosage} - {rx.frequency} for {rx.duration}</p>
                    <p className="text-violet-300/70">{formatDate(rx.createdAt)}</p>
                    {rx.status === 'active' && (
                      <Button variant="success" size="xs" className="mt-2" onClick={() => { updatePrescriptionStatus(rx.id, 'completed'); refreshData(); }}>
                        Mark Complete
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
