import React, { useState, useMemo } from 'react';
import AppLayout from '../../components/AppLayout.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Avatar, ConfirmModal, fmtDate } from '../../components/common/Ui.jsx';
import { getAllUsers, getPatientAppointments, toggleUserActive } from '../../data/store.js';

export default function AdminPatients() {
  const { show } = useToast();
  const [search, setSearch] = useState('');
  const [tick, setTick] = useState(0);
  const [confirmToggle, setConfirmToggle] = useState(null);

  const patients = useMemo(() =>
    getAllUsers().filter(u => u.role === 'PATIENT'), [tick]);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q);
  });

  const doToggle = () => {
    toggleUserActive(confirmToggle.id);
    setTick(t => t + 1);
    show(`${confirmToggle.name} account ${confirmToggle.active ? 'deactivated' : 'activated'}.`, 'green');
    setConfirmToggle(null);
  };

  return (
    <AppLayout title="All Patients" subtitle={`${patients.length} registered patients`}>
      <div className="flex gap-3 mb-4" style={{ justifyContent: 'space-between' }}>
        <input className="finp" style={{ maxWidth: 280 }} placeholder="Search by name, email or city…" value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ fontSize: 13, color: 'var(--mid)' }}>
          Active: <strong>{patients.filter(p => p.active).length}</strong> · Inactive: <strong>{patients.filter(p => !p.active).length}</strong>
        </div>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phone</th>
                <th>City</th>
                <th>Registered</th>
                <th>Total Appts</th>
                <th>Account</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="empty">No patients found.</td></tr>
              )}
              {filtered.map(pat => {
                const appts = getPatientAppointments(pat.id);
                return (
                  <tr key={pat.id}>
                    <td>
                      <div className="flex gap-2">
                        <Avatar name={pat.name} size={34} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{pat.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--mid)' }}>{pat.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{pat.phone || '—'}</td>
                    <td>{pat.city || '—'}</td>
                    <td>{fmtDate(pat.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span className="badge b-green">{appts.filter(a => a.status === 'COMPLETED').length} done</span>
                        <span className="badge b-blue">{appts.filter(a => a.status === 'CONFIRMED').length} upcoming</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${pat.active ? 'b-teal' : 'b-gray'}`}>
                        {pat.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-w btn-sm" onClick={() => setConfirmToggle(pat)}>
                        {pat.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {confirmToggle && (
        <ConfirmModal
          msg={`${confirmToggle.active ? 'Deactivate' : 'Activate'} ${confirmToggle.name}'s account? ${confirmToggle.active ? 'They will not be able to log in.' : 'They will regain access.'}`}
          onConfirm={doToggle}
          onClose={() => setConfirmToggle(null)}
        />
      )}
    </AppLayout>
  );
}
