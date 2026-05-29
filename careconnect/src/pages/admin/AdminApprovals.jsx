import React, { useState, useMemo } from 'react';
import AppLayout from '../../components/AppLayout.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Avatar, fmtMoney } from '../../components/common/Ui.jsx';
import { getAllDoctors, approveDoctor, rejectDoctor } from '../../data/store.js';

export default function AdminApprovals() {
  const { show } = useToast();
  const [tick, setTick] = useState(0);
  const doctors = useMemo(() => getAllDoctors(), [tick]);
  const pending  = doctors.filter(d => d.approvalStatus === 'PENDING');
  const approved = doctors.filter(d => d.approvalStatus === 'APPROVED');
  const rejected = doctors.filter(d => d.approvalStatus === 'REJECTED');

  const doApprove = (doc) => {
    approveDoctor(doc.id);
    setTick(t => t + 1);
    show(`${doc.name} approved! They can now accept patient bookings.`, 'green');
  };

  const doReject = (doc) => {
    rejectDoctor(doc.id);
    setTick(t => t + 1);
    show(`${doc.name} rejected.`, 'red');
  };

  return (
    <AppLayout title="Doctor Approvals" subtitle="Review and approve new doctor registrations">

      {/* Pending */}
      <div className="sec-title mb-4" style={{ fontSize: 15 }}>
        ⏳ Pending Review ({pending.length})
      </div>

      {pending.length === 0 && (
        <div className="banner bn-green mb-4">✅ All doctor applications have been reviewed. No pending requests.</div>
      )}

      {pending.map(doc => (
        <div className="appr-card" key={doc.id}>
          <div className="flex gap-3" style={{ flex: 1 }}>
            <Avatar name={doc.name} size={50} />
            <div style={{ flex: 1 }}>
              <div className="appt-name" style={{ fontSize: 15 }}>{doc.name}</div>
              <div className="appt-spec">{doc.specialization} · {doc.qualification}</div>
              <div className="appt-sub">{doc.hospital || 'Hospital not set'} · {doc.city}</div>
              <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 4 }}>
                📧 {doc.email} · 📞 {doc.phone}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <span className="chip">💼 {doc.experience || 0} yrs exp</span>
                <span className="chip">💰 {fmtMoney(doc.fee || 0)}/visit</span>
                <span className="chip">📍 {doc.city || '—'}</span>
              </div>
              {doc.about && (
                <p style={{ fontSize: 12, color: 'var(--mid)', marginTop: 8, lineHeight: 1.6 }}>{doc.about}</p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <button className="btn btn-g" onClick={() => doApprove(doc)}>✅ Approve</button>
            <button className="btn btn-d" onClick={() => doReject(doc)}>❌ Reject</button>
          </div>
        </div>
      ))}

      {/* Recently approved */}
      {approved.length > 0 && (
        <>
          <div className="divider" />
          <div className="sec-title mb-4">✅ Approved Doctors ({approved.length})</div>
          <div className="card">
            {approved.map(doc => (
              <div className="appt-row" key={doc.id}>
                <Avatar name={doc.name} size={36} />
                <div style={{ flex: 1 }}>
                  <div className="appt-name">{doc.name}</div>
                  <div className="appt-spec">{doc.specialization} · {doc.hospital}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--mid)' }}>{doc.city}</div>
                <span className="badge b-green">Approved</span>
                <button className="btn btn-d btn-sm" onClick={() => doReject(doc)}>Revoke</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <>
          <div className="divider" />
          <div className="sec-title mb-4">❌ Rejected Doctors ({rejected.length})</div>
          <div className="card">
            {rejected.map(doc => (
              <div className="appt-row" key={doc.id}>
                <Avatar name={doc.name} size={36} />
                <div style={{ flex: 1 }}>
                  <div className="appt-name">{doc.name}</div>
                  <div className="appt-spec">{doc.specialization} · {doc.hospital}</div>
                </div>
                <span className="badge b-red">Rejected</span>
                <button className="btn btn-g btn-sm" onClick={() => doApprove(doc)}>Re-approve</button>
              </div>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
}
