import React, { useState, useMemo } from 'react';
import AppLayout from '../../components/AppLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, Stars, Avatar, fmtMoney } from '../../components/common/Ui.jsx';
import { getApprovedDoctors, getSlots, bookAppointment, getReviews } from '../../data/store.js';
import { SPECIALIZATIONS, CITIES } from '../../data/seed.js';

function nextDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    if (d.getDay() === 0) continue; // skip Sunday
    days.push({ key: d.toISOString().split('T')[0], label: i===0?'Today': d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}) });
  }
  return days.slice(0, 7);
}
const DATES = nextDays(10);

export default function SearchDoctors() {
  const { user } = useAuth();
  const { show } = useToast();

  const [search, setSearch] = useState('');
  const [spec,   setSpec]   = useState('All');
  const [city,   setCity]   = useState('All Cities');
  const [selDoc, setSelDoc] = useState(null);
  const [date,   setDate]   = useState(DATES[0]?.key || '');
  const [selSlot,setSelSlot]= useState(null);
  const [notes,  setNotes]  = useState('');
  const [bookModal, setBookModal] = useState(false);
  const [viewDoc,   setViewDoc]   = useState(null);

  const doctors = useMemo(() => getApprovedDoctors(), []);

  const filtered = useMemo(() => doctors.filter(d => {
    const q = search.toLowerCase();
    return (spec==='All' || d.specialization===spec)
        && (city==='All Cities' || d.city===city)
        && (d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q) || d.hospital?.toLowerCase().includes(q));
  }), [doctors, search, spec, city]);

  const slots = useMemo(() => selDoc ? getSlots(selDoc.id, date) : [], [selDoc, date]);
  const reviews = useMemo(() => viewDoc ? getReviews(viewDoc.id) : [], [viewDoc]);

  const handleBook = () => {
    if (!selSlot) { show('Please select a time slot', 'blue'); return; }
    const result = bookAppointment({
      patientId: user.id, doctorId: selDoc.id,
      slotId: selSlot.id, date, startTime: selSlot.startTime,
      endTime: selSlot.endTime, fee: selDoc.fee, patientNotes: notes,
    });
    if (result.error) { show(result.error, 'red'); return; }
    show(`Appointment booked with ${selDoc.name} on ${date} at ${selSlot.startTime}!`, 'green');
    setBookModal(false); setSelSlot(null); setNotes('');
    setSelDoc({ ...selDoc }); // trigger re-render for slots
  };

  return (
    <AppLayout title="Find a Doctor" subtitle="Search from verified doctors across India">

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input className="finp" style={{ maxWidth:260 }} placeholder="Name, specialization, hospital…" value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="fsel" style={{ maxWidth:180 }} value={spec} onChange={e=>setSpec(e.target.value)}>
          {SPECIALIZATIONS.map(s=><option key={s}>{s}</option>)}
        </select>
        <select className="fsel" style={{ maxWidth:160 }} value={city} onChange={e=>setCity(e.target.value)}>
          {CITIES.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="banner bn-green">
        <div className="live-dot" />
        ⚡ Showing real-time slot availability. Green = bookable · Grey = already booked.
      </div>

      <div className="split">
        {/* Doctor list */}
        <div>
          <div className="sec-title mb-4">{filtered.length} doctor{filtered.length!==1?'s':''} found</div>
          <div style={{ maxHeight:'calc(100vh - 310px)', overflowY:'auto', paddingRight:4 }}>
            {filtered.length === 0 && <div className="empty">No doctors match your search.</div>}
            {filtered.map(doc => (
              <div key={doc.id} className={`doc-card${selDoc?.id===doc.id?' sel':''}`} onClick={() => { setSelDoc(doc); setSelSlot(null); }}>
                <div className="flex gap-3">
                  <Avatar name={doc.name} size={44} />
                  <div style={{flex:1}}>
                    <div className="appt-name">{doc.name}</div>
                    <div className="appt-spec">{doc.specialization}</div>
                    <div className="appt-sub">{doc.hospital} · {doc.city}</div>
                    <div style={{fontSize:11,color:'var(--mid)',marginTop:4}}>
                      <Stars rating={doc.rating} /> · {doc.experience} yrs · {doc.totalReviews} reviews
                    </div>
                  </div>
                  <div>
                    <div className="rupee" style={{fontSize:15}}>{fmtMoney(doc.fee)}</div>
                    <div style={{fontSize:10,color:'var(--mid)'}}>per visit</div>
                    <button className="btn btn-s btn-sm" style={{marginTop:6}} onClick={e=>{e.stopPropagation();setViewDoc(doc);}}>
                      Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking panel */}
        {selDoc ? (
          <div className="card" style={{alignSelf:'start'}}>
            <div className="flex gap-3 mb-4">
              <Avatar name={selDoc.name} size={46} />
              <div style={{flex:1}}>
                <div className="appt-name" style={{fontSize:15}}>{selDoc.name}</div>
                <div className="appt-spec">{selDoc.specialization} · {selDoc.hospital}</div>
                <div className="appt-sub">{selDoc.qualification} · {selDoc.experience} yrs exp</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="rupee" style={{fontSize:20}}>{fmtMoney(selDoc.fee)}</div>
                <div style={{fontSize:10,color:'var(--mid)'}}>per consultation</div>
              </div>
            </div>

            <p style={{fontSize:12,color:'var(--mid)',marginBottom:14,lineHeight:1.6}}>{selDoc.about}</p>
            <div className="divider" />

            <div className="sec-title mb-4">Select Date</div>
            <div className="date-tabs">
              {DATES.map(d => (
                <button key={d.key} className={`date-tab${date===d.key?' active':''}`} onClick={()=>{setDate(d.key);setSelSlot(null);}}>
                  {d.label}
                </button>
              ))}
            </div>

            <div className="sec-title mb-4">
              {slots.length} slot{slots.length!==1?'s':''} available
            </div>
            {slots.length === 0
              ? <p style={{fontSize:12,color:'var(--mid)'}}>No slots on this day. Try another date.</p>
              : (
                <div className="slot-grid">
                  {slots.map(s => (
                    <button
                      key={s.id}
                      className={`slot-btn${s.status==='BOOKED'?' booked':selSlot?.id===s.id?' sel-slot':''}`}
                      onClick={() => s.status!=='BOOKED' && setSelSlot(s)}
                    >
                      {s.startTime}<br/>
                      <span style={{fontSize:9}}>{s.status==='BOOKED'?'Booked':'Available'}</span>
                    </button>
                  ))}
                </div>
              )
            }

            {selSlot && (
              <>
                <div className="divider" />
                <div className="fgrp">
                  <label className="flbl">Notes for doctor (optional)</label>
                  <textarea className="finp" rows={2} placeholder="Describe your symptoms briefly…" value={notes} onChange={e=>setNotes(e.target.value)} />
                </div>
                <div className="banner bn-blue" style={{marginBottom:12}}>
                  📋 Selected: <strong>{selDoc.name}</strong> on <strong>{date}</strong> at <strong>{selSlot.startTime}</strong> · <span className="rupee">{fmtMoney(selDoc.fee)}</span>
                </div>
                <button className="btn btn-p btn-full" onClick={() => setBookModal(true)}>
                  Confirm Booking
                </button>
              </>
            )}

            <div className="divider" />
            <div style={{fontSize:11,color:'var(--mid)'}}>💳 Payment at clinic · UPI / Cash / Card accepted</div>
          </div>
        ) : (
          <div className="card" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:300}}>
            <div className="empty">← Select a doctor to view slots and book</div>
          </div>
        )}
      </div>

      {/* Confirm booking modal */}
      {bookModal && selSlot && selDoc && (
        <Modal title="Confirm Appointment" onClose={() => setBookModal(false)}
          footer={
            <>
              <button className="btn btn-s btn-sm" onClick={() => setBookModal(false)}>Go back</button>
              <button className="btn btn-p btn-sm" onClick={handleBook}>Yes, Book Now</button>
            </>
          }
        >
          <table style={{width:'100%',fontSize:13,borderCollapse:'collapse'}}>
            {[
              ['Doctor', selDoc.name],
              ['Specialization', selDoc.specialization],
              ['Hospital', selDoc.hospital],
              ['Date', date],
              ['Time', `${selSlot.startTime} – ${selSlot.endTime}`],
              ['Consultation Fee', fmtMoney(selDoc.fee)],
              ['Patient Notes', notes || '—'],
            ].map(([l,v])=>(
              <tr key={l} style={{borderBottom:'1px solid var(--light)'}}>
                <td style={{padding:'8px 0',color:'var(--mid)',width:'45%'}}>{l}</td>
                <td style={{padding:'8px 0',fontWeight:600}}>{v}</td>
              </tr>
            ))}
          </table>
        </Modal>
      )}

      {/* Doctor profile modal */}
      {viewDoc && (
        <Modal title="Doctor Profile" onClose={() => setViewDoc(null)}>
          <div className="prof-hero">
            <div className="prof-big-av">{viewDoc.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
            <h2>{viewDoc.name}</h2>
            <p>{viewDoc.specialization} · {viewDoc.qualification}</p>
            <p>{viewDoc.hospital} · {viewDoc.city}</p>
            <div className="flex gap-3 mt-4">
              <div className="prof-stat"><div className="prof-stat-val">⭐ {viewDoc.rating}</div><div className="prof-stat-lbl">Rating</div></div>
              <div className="prof-stat"><div className="prof-stat-val">{viewDoc.experience}</div><div className="prof-stat-lbl">Yrs Exp</div></div>
              <div className="prof-stat"><div className="prof-stat-val" style={{color:'var(--mint)'}}>₹{viewDoc.fee}</div><div className="prof-stat-lbl">Fee</div></div>
              <div className="prof-stat"><div className="prof-stat-val">{viewDoc.totalReviews}</div><div className="prof-stat-lbl">Reviews</div></div>
            </div>
          </div>
          <p style={{fontSize:13,color:'var(--mid)',lineHeight:1.7,marginBottom:14}}>{viewDoc.about}</p>
          {reviews.length > 0 && (
            <>
              <div className="sec-title mb-4">Patient Reviews</div>
              {reviews.map(r=>(
                <div key={r.id} style={{borderBottom:'1px solid var(--light)',paddingBottom:10,marginBottom:10}}>
                  <div className="flex gap-2 mb-4">
                    <strong style={{fontSize:13}}>{r.patientName}</strong>
                    <Stars rating={r.rating} />
                    <span style={{fontSize:11,color:'var(--mid)',marginLeft:'auto'}}>{r.createdAt}</span>
                  </div>
                  <p style={{fontSize:12,color:'var(--mid)'}}>{r.comment}</p>
                </div>
              ))}
            </>
          )}
        </Modal>
      )}
    </AppLayout>
  );
}
