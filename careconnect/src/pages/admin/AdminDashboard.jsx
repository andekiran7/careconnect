import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout.jsx';
import { Avatar, StatusBadge, fmtDate, fmtMoney } from '../../components/common/Ui.jsx';
import { getAdminStats, getAllDoctors, getAllAppointments, getUserById } from '../../data/store.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const stats   = useMemo(() => getAdminStats(), []);
  const doctors = useMemo(() => getAllDoctors(), []);
  const appts   = useMemo(() => getAllAppointments(), []);

  const recentAppts = [...appts].sort((a, b) => b.createdAt?.localeCompare(a.createdAt)).slice(0, 5);
  const pending     = doctors.filter(d => d.approvalStatus === 'PENDING');

  return (
    <AppLayout title="Admin Dashboard" subtitle="CareConnect platform overview">

      {pending.length > 0 && (
        <div className="banner bn-yellow" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/approvals')}>
          ⚠️ <strong>{pending.length}</strong> doctor registration{pending.length > 1 ? 's' : ''} pending your approval. Click to review →
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid g4">
        <div className="stat-card"><div className="stat-icon ic-blue">👨‍⚕️</div><div><div className="stat-val">{stats.totalDoctors}</div><div className="stat-lbl">Approved Doctors</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-yellow">⏳</div><div><div className="stat-val">{stats.pendingApprovals}</div><div className="stat-lbl">Pending Approvals</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-green">👥</div><div><div className="stat-val">{stats.totalPatients}</div><div className="stat-lbl">Registered Patients</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-teal">📅</div><div><div className="stat-val">{stats.totalAppointments}</div><div className="stat-lbl">Total Appointments</div></div></div>
      </div>

      <div className="stat-grid g4">
        <div className="stat-card"><div className="stat-icon ic-purple">💰</div><div><div className="stat-val" style={{ fontSize: 16 }}>{fmtMoney(stats.revenue)}</div><div className="stat-lbl">Platform Revenue</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-green">✅</div><div><div className="stat-val">{appts.filter(a => a.status === 'COMPLETED').length}</div><div className="stat-lbl">Completed</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-blue">📆</div><div><div className="stat-val">{stats.todayAppts}</div><div className="stat-lbl">Today's Bookings</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-red">❌</div><div><div className="stat-val">{appts.filter(a => a.status === 'CANCELLED').length}</div><div className="stat-lbl">Cancelled</div></div></div>
      </div>

      <div className="split-equal" style={{ gap: 16 }}>
        {/* Recent appointments */}
        <div className="card">
          <div className="sec-hdr">
            <div className="sec-title">Recent Appointments</div>
            <button className="btn btn-s btn-sm" onClick={() => navigate('/admin/appointments')}>View all →</button>
          </div>
          {recentAppts.length === 0 && <div className="empty">No appointments yet.</div>}
          {recentAppts.map(appt => {
            const pat = getUserById(appt.patientId);
            const doc = getUserById(appt.doctorId);
            return (
              <div className="appt-row" key={appt.id}>
                <Avatar name={pat?.name} size={34} />
                <div style={{ flex: 1 }}>
                  <div className="appt-name" style={{ fontSize: 12 }}>{pat?.name}</div>
                  <div className="appt-sub">→ {doc?.name}</div>
                </div>
                <div className="appt-meta">
                  <div className="appt-date">{fmtDate(appt.date)}</div>
                  <div className="appt-time">{appt.startTime}</div>
                </div>
                <StatusBadge status={appt.status} />
              </div>
            );
          })}
        </div>

        {/* Quick actions + summary */}
        <div>
          <div className="card mb-4">
            <div className="sec-title" style={{ marginBottom: 12 }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-p" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/admin/approvals')}>
                ✅ Review Pending Approvals ({stats.pendingApprovals})
              </button>
              <button className="btn btn-s" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/admin/doctors')}>
                👨‍⚕️ Manage All Doctors
              </button>
              <button className="btn btn-s" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/admin/patients')}>
                👥 Manage Patients
              </button>
              <button className="btn btn-s" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/admin/appointments')}>
                📋 All Appointments
              </button>
            </div>
          </div>

          <div className="card">
            <div className="sec-title" style={{ marginBottom: 12 }}>Platform Summary</div>
            {[
              { label: 'Specializations covered', val: '8' },
              { label: 'Cities active', val: '6' },
              { label: 'Avg doctor rating', val: `${(doctors.filter(d=>d.approvalStatus==='APPROVED').reduce((s,d)=>s+d.rating,0) / Math.max(doctors.filter(d=>d.approvalStatus==='APPROVED').length,1)).toFixed(1)} ⭐` },
              { label: 'Completion rate', val: `${Math.round((appts.filter(a=>a.status==='COMPLETED').length/Math.max(appts.length,1))*100)}%` },
              { label: 'Platform revenue', val: fmtMoney(stats.revenue) },
            ].map(item => (
              <div key={item.label} className="flex" style={{ justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--light)' }}>
                <span style={{ color: 'var(--mid)' }}>{item.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
