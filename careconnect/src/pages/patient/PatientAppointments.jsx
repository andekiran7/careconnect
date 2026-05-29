import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, StarRating, StatusBadge, Avatar, fmtDate, fmtMoney, ConfirmModal } from '../../components/common/Ui.jsx';
import { getPatientAppointments, getDoctorFull, cancelAppointment, addReview, hasReviewed } from '../../data/store.js';

export default function PatientAppointments() {
  const { user } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [tick, setTick] = useState(0);
  const [cancelId, setCancelId] = useState(null);
  const [reviewAppt, setReviewAppt] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const appts = useMemo(() => getPatientAppointments(user?.id), [user, tick]);
  const filtered = filter === 'All' ? appts : appts.filter(a => a.status === filter);

  const doCancel = (id) => {
    cancelAppointment(id);
    setTick(t => t+1);
    show('Appointment cancelled successfully.', 'green');
  };

  const doReview = () => {
    if (!rating) { show('Please select a rating.', 'blue'); return; }
    const doc = getDoctorFull(reviewAppt.doctorId);
    const result = addReview({ patientId: user.id, doctorId: reviewAppt.doctorId, appointmentId: reviewAppt.id, rating, comment, patientName: user.name });
    if (result.error) { show(result.error, 'red'); return; }
    show(`Review submitted for ${doc?.name}!`, 'green');
    setReviewAppt(null); setRating(5); setComment('');
  };

  return (
    <AppLayout title="My Appointments" subtitle="All past and upcoming bookings">
      <div className="flex gap-3 mb-4" style={{ justifyContent:'space-between', flexWrap:'wrap' }}>
        <div className="ftabs">
          {['All','CONFIRMED','COMPLETED','CANCELLED'].map(f => (
            <button key={f} className={`ftab${filter===f?' active':''}`} onClick={()=>setFilter(f)}>
              {f==='All'?'All':f[0]+f.slice(1).toLowerCase()}
              {' '}({f==='All'?appts.length:appts.filter(a=>a.status===f).length})
            </button>
          ))}
        </div>
        <button className="btn btn-p btn-sm" onClick={() => navigate('/patient/search')}>+ Book New</button>
      </div>

      <div className="card">
        {filtered.length === 0 && <div className="empty">No appointments found.</div>}
        {filtered.map(appt => {
          const doc = getDoctorFull(appt.doctorId);
          const reviewed = hasReviewed(user.id, appt.id);
          return (
            <div className="appt-row" key={appt.id}>
              <Avatar name={doc?.name} size={38} />
              <div style={{flex:1}}>
                <div className="appt-name">{doc?.name || '—'}</div>
                <div className="appt-spec">{doc?.specialization} · {doc?.hospital}</div>
                {appt.patientNotes && <div style={{fontSize:11,color:'var(--mid)',fontStyle:'italic',marginTop:2}}>"{appt.patientNotes}"</div>}
                {appt.doctorNotes   && <div style={{fontSize:11,color:'var(--teal)',marginTop:2}}>📝 {appt.doctorNotes}</div>}
              </div>
              <div className="appt-meta">
                <div className="appt-date">{fmtDate(appt.date)}</div>
                <div className="appt-time">{appt.startTime} – {appt.endTime}</div>
                <div className="rupee" style={{fontSize:12,marginTop:2}}>{fmtMoney(appt.fee)}</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:5,alignItems:'flex-end',marginLeft:8}}>
                <StatusBadge status={appt.status} />
                {appt.status==='CONFIRMED' && (
                  <button className="btn btn-d btn-sm" onClick={() => setCancelId(appt.id)}>Cancel</button>
                )}
                {appt.status==='COMPLETED' && !reviewed && (
                  <button className="btn btn-s btn-sm" onClick={() => { setReviewAppt(appt); setRating(5); setComment(''); }}>
                    ⭐ Review
                  </button>
                )}
                {appt.status==='COMPLETED' && reviewed && (
                  <span className="badge b-teal">Reviewed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel confirm */}
      {cancelId && (
        <ConfirmModal
          msg="Are you sure you want to cancel this appointment? The slot will be freed for others."
          onConfirm={() => doCancel(cancelId)}
          onClose={() => setCancelId(null)}
        />
      )}

      {/* Leave review modal */}
      {reviewAppt && (
        <Modal title="Leave a Review" onClose={() => setReviewAppt(null)}
          footer={
            <>
              <button className="btn btn-s btn-sm" onClick={() => setReviewAppt(null)}>Cancel</button>
              <button className="btn btn-p btn-sm" onClick={doReview}>Submit Review</button>
            </>
          }
        >
          {(() => { const doc = getDoctorFull(reviewAppt.doctorId); return (
            <>
              <div className="flex gap-3 mb-4">
                <Avatar name={doc?.name} size={42} />
                <div><div className="appt-name">{doc?.name}</div><div className="appt-spec">{doc?.specialization}</div><div className="appt-sub">{fmtDate(reviewAppt.date)}</div></div>
              </div>
              <div className="fgrp">
                <label className="flbl">Your Rating *</label>
                <StarRating value={rating} onChange={setRating} size={28} />
              </div>
              <div className="fgrp">
                <label className="flbl">Comment</label>
                <textarea className="finp" rows={3} placeholder="Share your experience…" value={comment} onChange={e=>setComment(e.target.value)} />
              </div>
            </>
          ); })()}
        </Modal>
      )}
    </AppLayout>
  );
}
