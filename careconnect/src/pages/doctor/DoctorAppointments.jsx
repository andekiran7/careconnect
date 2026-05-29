import React, { useState, useMemo } from 'react';
import AppLayout from '../../components/AppLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, StatusBadge, Avatar, ConfirmModal, fmtDate, fmtMoney } from '../../components/common/Ui.jsx';
import { getDoctorAppointments, getUserById, completeAppointment, cancelAppointment } from '../../data/store.js';

export default function DoctorAppointments() {
  const { user } = useAuth();
  const { show } = useToast();
  const [filter, setFilter] = useState('All');
  const [tick, setTick] = useState(0);
  const [cancelId, setCancelId] = useState(null);
  const [notesModal, setNotesModal] = useState(null); // appt object
  const [notesText, setNotesText] = useState('');

  const appts = useMemo(() => getDoctorAppointments(user?.id), [user, tick]);
  const filtered = filter === 'All' ? appts : appts.filter(a => a.status === filter);

  const doComplete = (appt) => {
    setNotesModal(appt);
    setNotesText(appt.doctorNotes || '');
  };

  const submitComplete = () => {
    completeAppointment(notesModal.id, notesText);
    setTick(t => t + 1);
    setNotesModal(null);
    show('Appointment marked as completed.', 'green');
  };

  const doCancel = (id) => {
    cancelAppointment(id);
    setTick(t => t + 1);
    show('Appointment cancelled.', 'green');
  };

  const counts = {
    All: appts.length,
    CONFIRMED: appts.filter(a => a.status === 'CONFIRMED').length,
    COMPLETED: appts.filter(a => a.status === 'COMPLETED').length,
    CANCELLED: appts.filter(a => a.status === 'CANCELLED').length,
  };

  return (
    <AppLayout title="Appointments" subtitle="All patient bookings at your clinic">
      <div className="flex gap-3 mb-4" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div className="ftabs">
          {['All', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(f => (
            <button key={f} className={`ftab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'All' ? 'All' : f[0] + f.slice(1).toLowerCase()} ({counts[f]})
            </button>
          ))}
        </div>
        <div style={{ fontSize: 13, color: 'var(--mid)' }}>
          Total earnings: <span className="rupee">{fmtMoney(appts.filter(a => a.status === 'COMPLETED').reduce((s, a) => s + a.fee, 0))}</span>
        </div>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date &amp; Time</th>
                <th>Patient Notes</th>
                <th>Doctor Notes</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="empty">No appointments found.</td></tr>
              )}
              {filtered.map(appt => {
                const pat = getUserById(appt.patientId);
                return (
                  <tr key={appt.id}>
                    <td>
                      <div className="flex gap-2">
                        <Avatar name={pat?.name} size={32} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{pat?.name || '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--mid)' }}>{pat?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{fmtDate(appt.date)}</div>
                      <div style={{ fontSize: 11, color: 'var(--mid)' }}>{appt.startTime} – {appt.endTime}</div>
                    </td>
                    <td style={{ maxWidth: 160 }}>
                      <span style={{ fontSize: 12, color: 'var(--mid)', fontStyle: 'italic' }}>
                        {appt.patientNotes || '—'}
                      </span>
                    </td>
                    <td style={{ maxWidth: 160 }}>
                      <span style={{ fontSize: 12, color: 'var(--teal)' }}>
                        {appt.doctorNotes || '—'}
                      </span>
                    </td>
                    <td><span className="rupee">{fmtMoney(appt.fee)}</span></td>
                    <td><StatusBadge status={appt.status} /></td>
                    <td>
                      <div className="flex gap-2">
                        {appt.status === 'CONFIRMED' && (
                          <>
                            <button className="btn btn-g btn-sm" onClick={() => doComplete(appt)}>✓ Complete</button>
                            <button className="btn btn-d btn-sm" onClick={() => setCancelId(appt.id)}>Cancel</button>
                          </>
                        )}
                        {appt.status !== 'CONFIRMED' && <span style={{ color: 'var(--mid)', fontSize: 12 }}>—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete with notes modal */}
      {notesModal && (
        <Modal
          title="Mark as Completed"
          onClose={() => setNotesModal(null)}
          footer={
            <>
              <button className="btn btn-s btn-sm" onClick={() => setNotesModal(null)}>Cancel</button>
              <button className="btn btn-p btn-sm" onClick={submitComplete}>Save &amp; Complete</button>
            </>
          }
        >
          <p style={{ fontSize: 13, color: 'var(--mid)', marginBottom: 14 }}>
            Add your clinical notes for <strong>{getUserById(notesModal.patientId)?.name}</strong>. The patient can see these after the appointment.
          </p>
          <div className="fgrp">
            <label className="flbl">Doctor Notes / Prescription</label>
            <textarea className="finp" rows={4} value={notesText} onChange={e => setNotesText(e.target.value)}
              placeholder="e.g. BP normal. Prescribed paracetamol 500mg. Follow-up in 2 weeks." />
          </div>
        </Modal>
      )}

      {/* Cancel confirm */}
      {cancelId && (
        <ConfirmModal
          msg="Cancel this appointment? The slot will be freed for other patients."
          onConfirm={() => doCancel(cancelId)}
          onClose={() => setCancelId(null)}
        />
      )}
    </AppLayout>
  );
}
