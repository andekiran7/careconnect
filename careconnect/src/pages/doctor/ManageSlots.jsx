import React, { useState, useMemo } from 'react';
import AppLayout from '../../components/AppLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { StatusBadge, ConfirmModal } from '../../components/common/Ui.jsx';
import { getSlotsByDoctor, addSlot, deleteSlot } from '../../data/store.js';

function addMin(t, m) {
  const [h, min] = t.split(':').map(Number);
  const tot = h * 60 + min + m;
  return `${String(Math.floor(tot / 60)).padStart(2, '0')}:${String(tot % 60).padStart(2, '0')}`;
}

function nextDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    days.push({ key: d.toISOString().split('T')[0], label: i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) });
  }
  return days;
}
const DATES = nextDays(10);

export default function ManageSlots() {
  const { user } = useAuth();
  const { show } = useToast();
  const [activeDate, setActiveDate] = useState(DATES[0]?.key);
  const [tick, setTick] = useState(0);
  const [delId, setDelId] = useState(null);

  const [form, setForm] = useState({ date: DATES[0]?.key, start: '09:00', end: '09:30' });

  const allSlots = useMemo(() => getSlotsByDoctor(user?.id), [user, tick]);
  const daySlots = allSlots.filter(s => s.date === activeDate).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleAdd = () => {
    if (!form.date || !form.start || !form.end) { show('Fill all fields.', 'red'); return; }
    if (form.start >= form.end) { show('End time must be after start time.', 'red'); return; }
    const result = addSlot(user.id, form.date, form.start, form.end);
    if (result.error) { show(result.error, 'red'); return; }
    setTick(t => t + 1);
    setActiveDate(form.date);
    show(`Slot ${form.start} – ${form.end} added for ${form.date}!`, 'green');
  };

  const handleDelete = (id) => {
    deleteSlot(id);
    setTick(t => t + 1);
    show('Slot deleted.', 'green');
  };

  const available = daySlots.filter(s => s.status === 'AVAILABLE').length;
  const booked    = daySlots.filter(s => s.status === 'BOOKED').length;

  return (
    <AppLayout title="Manage Availability" subtitle="Add or remove your consultation time slots">
      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: 20 }}>

        {/* Add form */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="sec-title" style={{ marginBottom: 14 }}>➕ Add New Slot</div>
          <div className="fgrp">
            <label className="flbl">Date</label>
            <input type="date" className="finp" value={form.date}
              min={DATES[0]?.key}
              onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="fgrp">
            <label className="flbl">Start Time</label>
            <input type="time" className="finp" value={form.start}
              onChange={e => setForm({ ...form, start: e.target.value, end: addMin(e.target.value, 30) })} />
          </div>
          <div className="fgrp">
            <label className="flbl">End Time</label>
            <input type="time" className="finp" value={form.end}
              onChange={e => setForm({ ...form, end: e.target.value })} />
          </div>
          <button className="btn btn-p btn-full" onClick={handleAdd}>Add Slot</button>

          <div className="divider" />
          <div className="sec-title" style={{ marginBottom: 10 }}>Today's Summary</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, textAlign: 'center', background: 'var(--off)', borderRadius: 8, padding: '10px 6px' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--teal)' }}>{available}</div>
              <div style={{ fontSize: 10, color: 'var(--mid)' }}>Free</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', background: 'var(--off)', borderRadius: 8, padding: '10px 6px' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1D4ED8' }}>{booked}</div>
              <div style={{ fontSize: 10, color: 'var(--mid)' }}>Booked</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', background: 'var(--off)', borderRadius: 8, padding: '10px 6px' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)' }}>{daySlots.length}</div>
              <div style={{ fontSize: 10, color: 'var(--mid)' }}>Total</div>
            </div>
          </div>
        </div>

        {/* Slot viewer */}
        <div>
          <div className="date-tabs" style={{ marginBottom: 16 }}>
            {DATES.map(d => (
              <button key={d.key} className={`date-tab${activeDate === d.key ? ' active' : ''}`}
                onClick={() => setActiveDate(d.key)}>{d.label}</button>
            ))}
          </div>

          {daySlots.length === 0 && (
            <div className="card empty">No slots added for this date. Use the form on the left to add some.</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {daySlots.map(slot => (
              <div key={slot.id} className="card" style={{ padding: '12px 14px', opacity: slot.status === 'BOOKED' ? 0.75 : 1 }}>
                <div className="flex gap-2" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>{slot.startTime}</span>
                  <StatusBadge status={slot.status} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--mid)', marginBottom: 8 }}>to {slot.endTime}</div>
                {slot.status === 'AVAILABLE' ? (
                  <button className="btn btn-d btn-sm btn-full" onClick={() => setDelId(slot.id)}>Delete</button>
                ) : (
                  <div style={{ fontSize: 10, color: 'var(--mid)', textAlign: 'center', padding: '4px 0' }}>Cannot delete — booked</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {delId && (
        <ConfirmModal
          msg="Delete this slot? If a patient has already booked it, please cancel the appointment first."
          onConfirm={() => handleDelete(delId)}
          onClose={() => setDelId(null)}
        />
      )}
    </AppLayout>
  );
}
