import React, { useMemo, useState } from 'react';
import AppLayout from '../../components/AppLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Avatar, StatusBadge, fmtDate, fmtMoney } from '../../components/common/Ui.jsx';
import { getDoctorAppointments, getUserById, getProfile, completeAppointment, getReviews } from '../../data/store.js';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { show } = useToast();
  const [tick, setTick] = useState(0);
  const profile = useMemo(() => getProfile(user?.id), [user]);

  const today = new Date().toISOString().split('T')[0];
  const allAppts = useMemo(() => getDoctorAppointments(user?.id), [user, tick]);
  const todayAppts   = allAppts.filter(a => a.date === today && a.status === 'CONFIRMED');
  const upcoming     = allAppts.filter(a => a.status === 'CONFIRMED').length;
  const completed    = allAppts.filter(a => a.status === 'COMPLETED').length;
  const todayRevenue = allAppts.filter(a => a.date===today && a.status==='COMPLETED').reduce((s,a)=>s+a.fee,0);
  const totalRevenue = allAppts.filter(a => a.status==='COMPLETED').reduce((s,a)=>s+a.fee,0);
  const reviews      = useMemo(() => getReviews(user?.id), [user]);

  const markDone = (id) => {
    completeAppointment(id, '');
    setTick(t=>t+1);
    show('Appointment marked as completed.', 'green');
  };

  if (!profile || profile.approvalStatus !== 'APPROVED') {
    return (
      <AppLayout title="Dashboard" subtitle="Approval pending">
        <div className="banner bn-yellow">
          ⏳ Your doctor profile is <strong>{profile?.approvalStatus || 'PENDING'}</strong> review by admin. You will be notified once approved.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={`${user?.name}'s Dashboard 👨‍⚕️`}
      subtitle={`${profile.specialization} · ${profile.hospital}`}
    >
      {/* Live notification if today has appointments */}
      {todayAppts.length > 0 && (
        <div className="banner bn-green">
          <div className="live-dot" />
          You have <strong>{todayAppts.length}</strong> appointment{todayAppts.length>1?'s':''} today. Dashboard refreshes live.
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid g4">
        <div className="stat-card"><div className="stat-icon ic-blue">📅</div><div><div className="stat-val">{upcoming}</div><div className="stat-lbl">Upcoming</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-green">✅</div><div><div className="stat-val">{completed}</div><div className="stat-lbl">Completed</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-yellow">📆</div><div><div className="stat-val">{todayAppts.length}</div><div className="stat-lbl">Today</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-teal">💰</div><div><div className="stat-val" style={{fontSize:16}}>{fmtMoney(totalRevenue)}</div><div className="stat-lbl">Total Earnings</div></div></div>
      </div>

      <div className="split-equal" style={{gap:16}}>
        {/* Today's schedule */}
        <div className="card">
          <div className="sec-hdr">
            <div className="sec-title">📋 Today's Schedule — {fmtDate(today)}</div>
            <span style={{fontSize:12,color:'var(--mid)'}}>{fmtMoney(todayRevenue)} earned today</span>
          </div>
          {todayAppts.length === 0 && <div className="empty">No appointments today.</div>}
          {todayAppts.map(appt => {
            const pat = getUserById(appt.patientId);
            return (
              <div className="sched-block" key={appt.id}>
                <div className="sched-time">
                  <div className="sched-main">{appt.startTime}</div>
                  <div className="sched-end">{appt.endTime}</div>
                </div>
                <Avatar name={pat?.name} size={34} />
                <div style={{flex:1}}>
                  <div className="appt-name">{pat?.name}</div>
                  <div className="appt-sub">{pat?.phone}</div>
                  {appt.patientNotes && <div style={{fontSize:11,color:'var(--mid)',fontStyle:'italic'}}>"{appt.patientNotes}"</div>}
                </div>
                <button className="btn btn-g btn-sm" onClick={() => markDone(appt.id)}>✓ Done</button>
              </div>
            );
          })}
        </div>

        {/* Recent reviews */}
        <div className="card">
          <div className="sec-title mb-4">⭐ Patient Reviews ({reviews.length})</div>
          {reviews.length === 0 && <div className="empty">No reviews yet.</div>}
          {reviews.slice(0,4).map(r => (
            <div key={r.id} style={{borderBottom:'1px solid var(--light)',paddingBottom:10,marginBottom:10}}>
              <div className="flex gap-2 mb-4">
                <strong style={{fontSize:12}}>{r.patientName}</strong>
                <span className="stars" style={{fontSize:12}}>{'★'.repeat(r.rating)}</span>
                <span style={{fontSize:11,color:'var(--mid)',marginLeft:'auto'}}>{r.createdAt}</span>
              </div>
              <p style={{fontSize:12,color:'var(--mid)',lineHeight:1.5}}>{r.comment}</p>
            </div>
          ))}
          <div style={{textAlign:'center',marginTop:8}}>
            <span className="chip">⭐ {profile.rating} avg · {profile.totalReviews} reviews</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
