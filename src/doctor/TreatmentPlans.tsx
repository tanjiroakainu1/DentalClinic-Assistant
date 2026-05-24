import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useClinicTreatmentTemplates } from '../hooks/useClinic';
import { createTreatmentTemplate, deleteTreatmentTemplate } from '../lib/storage';
import { Alert, Button, Card, Input, PageHeader, Textarea } from '../components/ui';
import { formatCurrency } from '../lib/utils';

export function TreatmentPlans() {
  const { user } = useAuth();
  const { refreshData } = useData();
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ title: '', category: '', description: '', procedureSteps: '', estimatedCost: '' });
  const templates = useClinicTreatmentTemplates(user!.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTreatmentTemplate({
      doctorId: user!.id,
      title: form.title,
      category: form.category,
      description: form.description,
      procedureSteps: form.procedureSteps,
      estimatedCost: parseFloat(form.estimatedCost) || 0,
    });
    refreshData();
    setMsg('Treatment plan template added successfully.');
    setForm({ title: '', category: '', description: '', procedureSteps: '', estimatedCost: '' });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this template?')) {
      deleteTreatmentTemplate(id, user!.id);
      refreshData();
    }
  };

  return (
    <div>
      <PageHeader title="Treatment Plan Templates" />
      {msg && <Alert type="success">{msg}</Alert>}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Add Template">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={2} />
            <Textarea label="Procedure Steps" value={form.procedureSteps} onChange={(e) => setForm({ ...form, procedureSteps: e.target.value })} required rows={3} />
            <Input label="Estimated Cost (₱)" type="number" step="0.01" min="0" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} required />
            <Button type="submit" variant="candy">Add Template</Button>
          </form>
        </Card>
        <Card title="My Templates">
          {templates.length === 0 ? <p className="text-violet-300/70">No templates yet.</p> : (
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="rounded border p-3">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{t.title}</h4>
                    <span className="text-sm text-candy-300">{formatCurrency(t.estimatedCost)}</span>
                  </div>
                  <p className="text-xs text-violet-300/70">{t.category}</p>
                  <p className="mt-1 text-sm">{t.description}</p>
                  <Button variant="danger" size="xs" className="mt-2" onClick={() => handleDelete(t.id)}>Delete</Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
