import React, { useState, useMemo } from 'react';
import AppLayout from '../../components/AppLayout.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Avatar, StatusBadge, ConfirmModal, fmtMoney } from '../../components/common/Ui.jsx';
import { getAllDoctors, approveDoctor, rejectDoctor, toggleUserActive } from '../../data/store.js';

export default function AdminDoctors() {
  const { show } = useToast();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [tick, setTick] = useState(0);
  const [confirmAction, setConfirmAction] = useState(null); // { type, doctor }

  const doctors = useMemo(() => getAllDoctors(), [tick]);

  const filtered = doctors.filter(d => {
    const matchStatus = filter === 'All' || d.approvalStatus === filter;
    const q = search.toLowerCase();
    const matchSearch = d.name.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q) || d.city?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const doAction = () => {
    const { type, doctor } = confirmAction;
    if (type === 'approve') { approveDoctor(doctor.id); show(`${doctor.name} approved!`, 'green'); }
    if (type === 'reject')  { rejectDoctor(doctor.id);  show(`${doctor.name} rejected.`, 'red'); }
    if (type === 'toggle')  { toggleUserActive(doctor.id); show(`${doctor.name} account ${doctor.active ? 'deactivated' : 'activated'}.`, 'green'); }
    setTick(t => t + 1);
    setConfirmAction(null);
  };

  const counts = {
    All: doctors.length,
    APPROVED: doctors.filter(d => d.approvalStatus === 'APPROVED').length,
    PENDING:  doctors.filter(d => d.approvalStatus === 'PENDING').length,
    REJECTED: doctors.filter(d => d.approvalStatus === 'REJECTED').length,
  };

  return (
    <AppLayout title="All Doctors" subtitle={`${doctors.length} doctors registered on CareConnect`}>
      <div className="flex gap-3 mb-4" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div className="ftabs">
          {['All', 'APPROVED', 'PENDING', 'REJECTED'].map(f => (
            <button key={f} className={`ftab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'All' ? 'All' : f[0] + f.slice(1).toLowerCase()} ({counts[f]})
            </button>
          ))}
        </div>
        <input className="finp" style={{ maxWidth: 240 }} placeholder="Search name, specialization, city…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Hospital &amp; City</th>
                <th>Experience</th>
                <th>Fee</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Account</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="empty">No doctors found.</td></tr>
              )}
              {filtered.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div className="flex gap-2">
                      <Avatar name={doc.name} size={34} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{doc.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--mid)' }}>{doc.email}</div>
                        <div style={{ fontSize: 11, color: 'var(--mid)' }}>{doc.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{doc.specialization}</div>
                    <div style={{ fontSize: 11, color: 'var(--mid)' }}>{doc.qualification}</div>
                  </td>
                  <td>
                    <div>{doc.hospital}</div>
                    <div style={{ fontSize: 11, color: 'var(--mid)' }}>{doc.city}</div>
                  </td>
                  <td>{doc.experience} yrs</td>
                  <td><span className="rupee">{fmtMoney(doc.fee)}</span></td>
                  <td>
                    <span className="stars" style={{ fontSize: 12 }}>⭐ {doc.rating}</span>
                    <div style={{ fontSize: 10, color: 'var(--mid)' }}>{doc.totalReviews} reviews</div>
                  </td>
                  <td><StatusBadge status={doc.approvalStatus} /></td>
                  <td>
                    <span className={`badge ${doc.active ? 'b-teal' : 'b-gray'}`}>
                      {doc.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                      {doc.approvalStatus === 'PENDING' && (
                        <>
                          <button className="btn btn-g btn-sm" onClick={() => setConfirmAction({ type: 'approve', doctor: doc })}>Approve</button>
                          <button className="btn btn-d btn-sm" onClick={() => setConfirmAction({ type: 'reject',  doctor: doc })}>Reject</button>
                        </>
                      )}
                      {doc.approvalStatus === 'REJECTED' && (
                        <button className="btn btn-g btn-sm" onClick={() => setConfirmAction({ type: 'approve', doctor: doc })}>Re-approve</button>
                      )}
                      <button className="btn btn-w btn-sm" onClick={() => setConfirmAction({ type: 'toggle', doctor: doc })}>
                        {doc.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmAction && (
        <ConfirmModal
          msg={
            confirmAction.type === 'approve' ? `Approve Dr. ${confirmAction.doctor.name}? Their profile will be visible to patients.`
            : confirmAction.type === 'reject' ? `Reject Dr. ${confirmAction.doctor.name}? They will not appear in search results.`
            : `${confirmAction.doctor.active ? 'Deactivate' : 'Activate'} ${confirmAction.doctor.name}'s account?`
          }
          onConfirm={doAction}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </AppLayout>
  );
}
