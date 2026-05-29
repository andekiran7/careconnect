import React, { useState, useMemo } from 'react';
import AppLayout from '../../components/AppLayout.jsx';
import { Avatar, StatusBadge, fmtDate, fmtMoney } from '../../components/common/Ui.jsx';
import { getAllAppointments, getUserById } from '../../data/store.js';

export default function AdminAppointments() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const appts = useMemo(() => getAllAppointments().sort((a, b) => b.date.localeCompare(a.date)), []);

  const filtered = appts.filter(a => {
    const pat = getUserById(a.patientId);
    const doc = getUserById(a.doctorId);
    const matchStatus = filter === 'All' || a.status === filter;
    const q = search.toLowerCase();
    const matchSearch = pat?.name.toLowerCase().includes(q) || doc?.name.toLowerCase().includes(q) || a.date.includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    All: appts.length,
    CONFIRMED: appts.filter(a => a.status === 'CONFIRMED').length,
    COMPLETED: appts.filter(a => a.status === 'COMPLETED').length,
    CANCELLED: appts.filter(a => a.status === 'CANCELLED').length,
  };

  const totalRevenue = appts.filter(a => a.status === 'COMPLETED').reduce((s, a) => s + a.fee, 0);

  return (
    <AppLayout title="All Appointments" subtitle="Every booking across the platform">
      <div className="flex gap-3 mb-4" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div className="ftabs">
          {['All', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(f => (
            <button key={f} className={`ftab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'All' ? 'All' : f[0] + f.slice(1).toLowerCase()} ({counts[f]})
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input className="finp" style={{ maxWidth: 220 }} placeholder="Search patient or doctor…" value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ fontSize: 13, color: 'var(--mid)', alignSelf: 'center', whiteSpace: 'nowrap' }}>
            Revenue: <span className="rupee">{fmtMoney(totalRevenue)}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date &amp; Time</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Patient Notes</th>
                <th>Doctor Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="empty">No appointments found.</td></tr>
              )}
              {filtered.map(appt => {
                const pat = getUserById(appt.patientId);
                const doc = getUserById(appt.doctorId);
                return (
                  <tr key={appt.id}>
                    <td>
                      <div className="flex gap-2">
                        <Avatar name={pat?.name} size={30} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>{pat?.name || '—'}</div>
                          <div style={{ fontSize: 10, color: 'var(--mid)' }}>{pat?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{doc?.name || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{fmtDate(appt.date)}</div>
                      <div style={{ fontSize: 11, color: 'var(--mid)' }}>{appt.startTime} – {appt.endTime}</div>
                    </td>
                    <td><span className="rupee">{fmtMoney(appt.fee)}</span></td>
                    <td><StatusBadge status={appt.status} /></td>
                    <td style={{ maxWidth: 160 }}>
                      <span style={{ fontSize: 11, color: 'var(--mid)', fontStyle: 'italic' }}>{appt.patientNotes || '—'}</span>
                    </td>
                    <td style={{ maxWidth: 160 }}>
                      <span style={{ fontSize: 11, color: 'var(--teal)' }}>{appt.doctorNotes || '—'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
