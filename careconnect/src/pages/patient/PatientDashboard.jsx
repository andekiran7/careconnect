import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Avatar, StatusBadge, fmtDate, fmtMoney } from '../../components/common/Ui.jsx';
import { getPatientAppointments, getDoctorFull } from '../../data/store.js';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const appts = useMemo(() => getPatientAppointments(user?.id), [user]);
  const upcoming  = appts.filter(a => a.status === 'CONFIRMED');
  const completed = appts.filter(a => a.status === 'COMPLETED');
  const cancelled = appts.filter(a => a.status === 'CANCELLED');
  const recent    = appts.slice(0, 4);

  const totalSpent = completed.reduce((s,a) => s+a.fee, 0);

  return (
    <AppLayout title={`Welcome, ${user?.name?.split(' ')[0]} 👋`} subtitle="Your health dashboard">
      <div className="stat-grid g4">
        <div className="stat-card"><div className="stat-icon ic-blue">📅</div><div><div className="stat-val">{upcoming.length}</div><div className="stat-lbl">Upcoming</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-green">✅</div><div><div className="stat-val">{completed.length}</div><div className="stat-lbl">Completed</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-red">❌</div><div><div className="stat-val">{cancelled.length}</div><div className="stat-lbl">Cancelled</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-yellow">💰</div><div><div className="stat-val" style={{fontSize:18}}>{fmtMoney(totalSpent)}</div><div className="stat-lbl">Total Spent</div></div></div>
      </div>

      <div style={{ marginBottom:20, display:'flex', gap:10 }}>
        <button className="btn btn-p" onClick={() => navigate('/patient/search')}>🔍 Find &amp; Book Doctor</button>
        <button className="btn btn-s" onClick={() => navigate('/patient/appointments')}>View All Appointments</button>
      </div>

      <div className="split-equal" style={{ gap:16 }}>
        {/* Recent appointments */}
        <div className="card">
          <div className="sec-hdr">
            <div className="sec-title">Recent Appointments</div>
            <button className="btn btn-s btn-sm" onClick={() => navigate('/patient/appointments')}>View all →</button>
          </div>
          {recent.length === 0 && <div className="empty">No appointments yet. Book your first one!</div>}
          {recent.map(appt => {
            const doc = getDoctorFull(appt.doctorId);
            return (
              <div className="appt-row" key={appt.id}>
                <Avatar name={doc?.name} size={36} />
                <div style={{flex:1}}>
                  <div className="appt-name">{doc?.name || '—'}</div>
                  <div className="appt-spec">{doc?.specialization}</div>
                  {appt.doctorNotes && <div style={{fontSize:11,color:'var(--teal)',marginTop:2}}>📝 {appt.doctorNotes}</div>}
                </div>
                <div className="appt-meta">
                  <div className="appt-date">{fmtDate(appt.date)}</div>
                  <div className="appt-time">{appt.startTime} – {appt.endTime}</div>
                </div>
                <StatusBadge status={appt.status} />
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div>
          {upcoming.length > 0 && (
            <div className="banner bn-blue mb-4">
              📅 You have <strong>{upcoming.length}</strong> upcoming appointment{upcoming.length>1?'s':''}. Don't forget to carry your government ID.
            </div>
          )}
          <div className="card mb-4">
            <div className="sec-title" style={{marginBottom:10}}>💡 Health Tips</div>
            <ul style={{fontSize:12,color:'var(--mid)',lineHeight:1.9,paddingLeft:16}}>
              <li>Book at least 24 hours in advance</li>
              <li>Carry Aadhaar or any government ID</li>
              <li>Arrive 10 minutes early</li>
              <li>Bring previous prescriptions if any</li>
            </ul>
          </div>
          <div className="card">
            <div className="sec-title" style={{marginBottom:10}}>📞 Emergency</div>
            <p style={{fontSize:13,color:'var(--mid)',lineHeight:1.7}}>
              Ambulance: <strong style={{color:'var(--warn)',fontSize:16}}>108</strong><br/>
              Police: <strong style={{color:'var(--warn)'}}>100</strong> &nbsp;|&nbsp; Women helpline: <strong style={{color:'var(--warn)'}}>1091</strong>
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
