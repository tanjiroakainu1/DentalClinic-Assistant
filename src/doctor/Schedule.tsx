import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useClinicDoctorSchedule, useClinicTimeOffs } from '../hooks/useClinic';
import { addTimeOff, deleteTimeOff, saveDoctorSchedule } from '../lib/storage';
import type { DayOfWeek } from '../types';
import { Alert, Button, Card, Input, PageHeader } from '../components/ui';
import { formatDateShort } from '../lib/utils';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function DoctorSchedule() {
  const { user } = useAuth();
  const { refreshData } = useData();
  const existing = useClinicDoctorSchedule(user!.id);
  const timeOffs = useClinicTimeOffs(user!.id);
  const [msg, setMsg] = useState({ type: '' as '' | 'success' | 'error', text: '' });
  const [schedule, setSchedule] = useState(
    DAYS.map((day) => ({ day, active: false, start: '09:00', end: '17:00' }))
  );
  const [timeOffForm, setTimeOffForm] = useState({ startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    setSchedule(
      DAYS.map((day) => {
        const s = existing.find((e) => e.dayOfWeek === day);
        return {
          day,
          active: !!s?.isActive,
          start: s?.startTime ?? '09:00',
          end: s?.endTime ?? '17:00',
        };
      })
    );
  }, [existing]);

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const activeSchedules = schedule
      .filter((s) => s.active)
      .map((s) => ({
        dayOfWeek: s.day,
        startTime: s.start,
        endTime: s.end,
        isActive: true,
      }));
    if (activeSchedules.some((s) => s.endTime <= s.startTime)) {
      setMsg({ type: 'error', text: 'End time must be after start time.' });
      return;
    }
    saveDoctorSchedule(user!.id, activeSchedules);
    refreshData();
    setMsg({ type: 'success', text: 'Your schedule has been updated successfully.' });
  };

  const handleAddTimeOff = (e: React.FormEvent) => {
    e.preventDefault();
    addTimeOff({
      doctorId: user!.id,
      startDate: timeOffForm.startDate,
      endDate: timeOffForm.endDate,
      reason: timeOffForm.reason,
    });
    refreshData();
    setTimeOffForm({ startDate: '', endDate: '', reason: '' });
    setMsg({ type: 'success', text: 'Time off added.' });
  };

  return (
    <div>
      <PageHeader title="My Schedule" />
      {msg.text && <Alert type={msg.type === 'success' ? 'success' : 'error'}>{msg.text}</Alert>}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Weekly Schedule">
          <form onSubmit={handleSaveSchedule}>
            <div className="space-y-3">
              {schedule.map((s, i) => (
                <div key={s.day} className="flex flex-wrap items-center gap-3 rounded border p-3">
                  <label className="flex w-28 items-center gap-2 capitalize">
                    <input type="checkbox" checked={s.active} onChange={(e) => {
                      const next = [...schedule];
                      next[i] = { ...s, active: e.target.checked };
                      setSchedule(next);
                    }} />
                    {s.day}
                  </label>
                  {s.active && (
                    <>
                      <Input type="time" value={s.start} onChange={(e) => { const next = [...schedule]; next[i] = { ...s, start: e.target.value }; setSchedule(next); }} />
                      <span>to</span>
                      <Input type="time" value={s.end} onChange={(e) => { const next = [...schedule]; next[i] = { ...s, end: e.target.value }; setSchedule(next); }} />
                    </>
                  )}
                </div>
              ))}
            </div>
            <Button type="submit" variant="candy" className="mt-4" glow>Save Schedule</Button>
          </form>
        </Card>
        <div className="space-y-6">
          <Card title="Add Time Off">
            <form onSubmit={handleAddTimeOff} className="space-y-3">
              <Input label="Start Date" type="date" value={timeOffForm.startDate} onChange={(e) => setTimeOffForm({ ...timeOffForm, startDate: e.target.value })} required />
              <Input label="End Date" type="date" value={timeOffForm.endDate} onChange={(e) => setTimeOffForm({ ...timeOffForm, endDate: e.target.value })} required />
              <Input label="Reason" value={timeOffForm.reason} onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })} />
              <Button type="submit" variant="candy">Add Time Off</Button>
            </form>
          </Card>
          <Card title="Scheduled Time Off">
            {timeOffs.length === 0 ? <p className="text-sm text-violet-300/70">No time off scheduled.</p> : (
              <ul className="space-y-2 text-sm">
                {timeOffs.map((t) => (
                  <li key={t.id} className="flex justify-between rounded border p-2">
                    <span>{formatDateShort(t.startDate)} - {formatDateShort(t.endDate)}{t.reason && ` (${t.reason})`}</span>
                    <Button variant="danger" size="xs" onClick={() => { deleteTimeOff(t.id, user!.id); refreshData(); }}>Remove</Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
