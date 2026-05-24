import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useClinicMedicalHistory } from '../hooks/useClinic';
import {
  createMedicalHistoryEntry,
  deleteMedicalHistoryEntry,
  updateMedicalHistoryEntry,
} from '../lib/storage';
import { getCategoryMeta, MEDICAL_HISTORY_CATEGORIES } from '../lib/medicalHistoryMeta';
import type { MedicalHistory, MedicalHistoryCategory } from '../types';
import { formatDate } from '../lib/utils';
import { Alert, Button, Card, Input, Modal, PageHeader, Select, Textarea } from '../components/ui';

const emptyForm = (): { category: MedicalHistoryCategory; title: string; details: string } => ({
  category: 'allergy',
  title: '',
  details: '',
});

export function MedicalHistory() {
  const { user } = useAuth();
  const { refreshData } = useData();
  const entries = useClinicMedicalHistory(user!.id);
  const [msg, setMsg] = useState({ type: '' as '' | 'success' | 'error', text: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MedicalHistory | null>(null);
  const [form, setForm] = useState(emptyForm());

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (entry: MedicalHistory) => {
    setEditing(entry);
    setForm({
      category: entry.category,
      title: entry.title,
      details: entry.details,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setMsg({ type: 'error', text: 'Please enter a title for this record.' });
      return;
    }
    if (!form.details.trim()) {
      setMsg({ type: 'error', text: 'Please enter details for this record.' });
      return;
    }

    const payload = { category: form.category, title: form.title, details: form.details };
    const r = editing
      ? updateMedicalHistoryEntry(editing.id, user!.id, payload)
      : createMedicalHistoryEntry(user!.id, payload);

    if (r.success) {
      refreshData();
      setMsg({
        type: 'success',
        text: editing ? 'Medical history updated.' : 'Medical history entry added.',
      });
      closeModal();
    } else {
      setMsg({ type: 'error', text: 'error' in r ? r.error! : 'Could not save.' });
    }
  };

  const handleDelete = (entry: MedicalHistory) => {
    if (!window.confirm(`Delete "${entry.title}"? This cannot be undone.`)) return;
    const r = deleteMedicalHistoryEntry(entry.id, user!.id);
    if (r.success) {
      refreshData();
      setMsg({ type: 'success', text: 'Entry deleted.' });
    } else {
      setMsg({ type: 'error', text: r.error ?? 'Could not delete.' });
    }
  };

  const counts = MEDICAL_HISTORY_CATEGORIES.map((c) => ({
    ...c,
    count: entries.filter((e) => e.category === c.value).length,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          title="Medical History"
          subtitle="Add, edit, or remove health records your dental team should know about"
        />
        <Button type="button" variant="candy" glow onClick={openAdd}>
          + Add record
        </Button>
      </div>

      {msg.text && <Alert type={msg.type === 'success' ? 'success' : 'error'}>{msg.text}</Alert>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {counts.map((c) => (
          <div
            key={c.value}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center backdrop-blur-sm"
          >
            <span className="text-lg">{c.icon}</span>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-violet-200">{c.label}</p>
            <p className="text-2xl font-bold text-white">{c.count}</p>
          </div>
        ))}
      </div>

      {entries.length === 0 ? (
        <Card title="No records yet">
          <div className="py-10 text-center">
            <p className="text-4xl opacity-60">📋</p>
            <p className="mt-3 text-muted">Start your medical history so doctors can care for you safely.</p>
            <Button type="button" variant="candy" className="mt-6" glow onClick={openAdd}>
              Add your first record
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {entries.map((entry) => {
            const meta = getCategoryMeta(entry.category);
            return (
              <article
                key={entry.id}
                className="glass-card overflow-hidden transition hover:border-candy-400/30 hover:shadow-glow"
              >
                <div className="border-b border-white/10 bg-gradient-to-r from-galaxy-900/80 to-galaxy-950/80 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}
                      >
                        <span>{meta.icon}</span> {meta.label}
                      </span>
                      <h3 className="mt-2 truncate text-lg font-semibold text-violet-50">{entry.title}</h3>
                      <p className="mt-1 text-xs text-soft">Updated {formatDate(entry.updatedAt)}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-violet-100/90">{entry.details}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => openEdit(entry)}>
                      Edit
                    </Button>
                    <Button type="button" variant="danger" size="sm" onClick={() => handleDelete(entry)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit medical record' : 'Add medical record'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as MedicalHistoryCategory })}
          >
            {MEDICAL_HISTORY_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </Select>
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Penicillin allergy"
            required
          />
          <Textarea
            label="Details"
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            rows={5}
            placeholder="Describe symptoms, dates, severity, or notes for your dentist…"
            required
          />
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" variant="candy" glow>
              {editing ? 'Save changes' : 'Add record'}
            </Button>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
