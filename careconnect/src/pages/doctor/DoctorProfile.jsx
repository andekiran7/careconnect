import React, { useState, useMemo } from 'react';
import AppLayout from '../../components/AppLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Stars } from '../../components/common/Ui.jsx';
import { getProfile, updateProfile, updateUser, getReviews, createProfile } from '../../data/store.js';
import { SPECIALIZATIONS, CITIES } from '../../data/seed.js';

export default function DoctorProfile() {
  const { user, refreshUser } = useAuth();
  const { show } = useToast();

  const existingProfile = useMemo(() => getProfile(user?.id), [user]);

  const [prof, setProf] = useState({
    specialization: existingProfile?.specialization || '',
    qualification:  existingProfile?.qualification  || '',
    experience:     existingProfile?.experience     || '',
    fee:            existingProfile?.fee             || '',
    hospital:       existingProfile?.hospital        || '',
    city:           existingProfile?.city            || user?.city || '',
    about:          existingProfile?.about           || '',
  });

  const [personal, setPersonal] = useState({
    name:  user?.name  || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const [pass, setPass] = useState({ current: '', newp: '', confirm: '' });
  const [passErr, setPassErr] = useState('');

  const reviews = useMemo(() => getReviews(user?.id), [user]);

  const saveProfile = () => {
    if (!prof.specialization || !prof.qualification || !prof.fee || !prof.hospital) {
      show('Please fill specialization, qualification, fee, and hospital.', 'red'); return;
    }
    const data = { ...prof, experience: Number(prof.experience), fee: Number(prof.fee) };
    if (existingProfile) {
      updateProfile(user.id, data);
    } else {
      createProfile({ doctorId: user.id, ...data, approvalStatus: 'PENDING', rating: 0, totalReviews: 0 });
    }
    updateUser(user.id, { name: personal.name, phone: personal.phone });
    refreshUser();
    show('Profile saved successfully!', 'green');
  };

  const changePassword = () => {
    setPassErr('');
    if (pass.current !== user.password) { setPassErr('Current password is incorrect.'); return; }
    if (pass.newp.length < 6)           { setPassErr('New password must be at least 6 characters.'); return; }
    if (pass.newp !== pass.confirm)     { setPassErr('Passwords do not match.'); return; }
    updateUser(user.id, { password: pass.newp });
    refreshUser();
    setPass({ current: '', newp: '', confirm: '' });
    show('Password changed!', 'green');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || '?';

  return (
    <AppLayout title="My Profile" subtitle="Manage your doctor profile and credentials">

      {!existingProfile && (
        <div className="banner bn-yellow mb-4">
          👨‍⚕️ Complete your doctor profile below. It will be reviewed by admin before going live.
        </div>
      )}
      {existingProfile?.approvalStatus === 'PENDING' && (
        <div className="banner bn-yellow mb-4">
          ⏳ Your profile is pending admin approval. Patients cannot book you yet.
        </div>
      )}
      {existingProfile?.approvalStatus === 'REJECTED' && (
        <div className="banner bn-red mb-4">
          ❌ Your profile was rejected. Please update details and contact admin.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Left column */}
        <div>
          {/* Hero card */}
          <div className="prof-hero">
            <div className="prof-big-av">{initials}</div>
            <h2>{user?.name}</h2>
            <p>{existingProfile?.specialization || 'No specialization set'}</p>
            <p>{existingProfile?.hospital || ''}</p>
            {existingProfile && (
              <div className="flex gap-3 mt-4" style={{ flexWrap: 'wrap' }}>
                <div className="prof-stat">
                  <div className="prof-stat-val">⭐ {existingProfile.rating || 0}</div>
                  <div className="prof-stat-lbl">Rating</div>
                </div>
                <div className="prof-stat">
                  <div className="prof-stat-val">{existingProfile.experience || 0}</div>
                  <div className="prof-stat-lbl">Yrs Exp</div>
                </div>
                <div className="prof-stat">
                  <div className="prof-stat-val" style={{ color: 'var(--mint)' }}>₹{existingProfile.fee || 0}</div>
                  <div className="prof-stat-lbl">Fee</div>
                </div>
              </div>
            )}
          </div>

          {/* Approval status */}
          {existingProfile && (
            <div className="card mb-4">
              <div className="sec-title" style={{ marginBottom: 8 }}>Approval Status</div>
              {existingProfile.approvalStatus === 'APPROVED' && <span className="badge b-green" style={{ fontSize: 12, padding: '5px 12px' }}>✅ Approved — Profile is live</span>}
              {existingProfile.approvalStatus === 'PENDING'  && <span className="badge b-yellow" style={{ fontSize: 12, padding: '5px 12px' }}>⏳ Pending Admin Review</span>}
              {existingProfile.approvalStatus === 'REJECTED' && <span className="badge b-red"    style={{ fontSize: 12, padding: '5px 12px' }}>❌ Rejected — Update profile</span>}
            </div>
          )}

          {/* Change password */}
          <div className="card">
            <div className="sec-title mb-4">🔒 Change Password</div>
            {passErr && <div className="banner bn-red mb-4">⚠️ {passErr}</div>}
            <div className="fgrp"><label className="flbl">Current Password</label><input className="finp" type="password" value={pass.current} onChange={e => setPass({ ...pass, current: e.target.value })} /></div>
            <div className="fgrp"><label className="flbl">New Password</label><input className="finp" type="password" value={pass.newp} onChange={e => setPass({ ...pass, newp: e.target.value })} /></div>
            <div className="fgrp"><label className="flbl">Confirm New</label><input className="finp" type="password" value={pass.confirm} onChange={e => setPass({ ...pass, confirm: e.target.value })} /></div>
            <button className="btn btn-p btn-sm" onClick={changePassword}>Update Password</button>
          </div>
        </div>

        {/* Right column — Edit form */}
        <div className="card">
          <div className="sec-title mb-4">Edit Profile</div>

          <div className="form-row">
            <div className="fgrp">
              <label className="flbl">Full Name</label>
              <input className="finp" value={personal.name} onChange={e => setPersonal({ ...personal, name: e.target.value })} />
            </div>
            <div className="fgrp">
              <label className="flbl">Phone</label>
              <input className="finp" value={personal.phone} onChange={e => setPersonal({ ...personal, phone: e.target.value })} placeholder="+91 98765 00001" />
            </div>
          </div>

          <div className="fgrp">
            <label className="flbl">Email (cannot change)</label>
            <input className="finp" value={personal.email} disabled style={{ opacity: 0.6 }} />
          </div>

          <div className="divider" />
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 12 }}>Professional Details</p>

          <div className="form-row">
            <div className="fgrp">
              <label className="flbl">Specialization *</label>
              <select className="fsel" value={prof.specialization} onChange={e => setProf({ ...prof, specialization: e.target.value })}>
                <option value="">Select…</option>
                {SPECIALIZATIONS.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="fgrp">
              <label className="flbl">Qualification *</label>
              <input className="finp" value={prof.qualification} onChange={e => setProf({ ...prof, qualification: e.target.value })} placeholder="MBBS, MD Cardiology" />
            </div>
          </div>

          <div className="form-row">
            <div className="fgrp">
              <label className="flbl">Experience (years) *</label>
              <input className="finp" type="number" min="0" max="60" value={prof.experience} onChange={e => setProf({ ...prof, experience: e.target.value })} placeholder="10" />
            </div>
            <div className="fgrp">
              <label className="flbl">Consultation Fee (₹) *</label>
              <input className="finp" type="number" min="0" value={prof.fee} onChange={e => setProf({ ...prof, fee: e.target.value })} placeholder="500" />
            </div>
          </div>

          <div className="form-row">
            <div className="fgrp">
              <label className="flbl">Hospital / Clinic *</label>
              <input className="finp" value={prof.hospital} onChange={e => setProf({ ...prof, hospital: e.target.value })} placeholder="Apollo Hospital" />
            </div>
            <div className="fgrp">
              <label className="flbl">City</label>
              <select className="fsel" value={prof.city} onChange={e => setProf({ ...prof, city: e.target.value })}>
                <option value="">Select…</option>
                {CITIES.filter(c => c !== 'All Cities').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="fgrp">
            <label className="flbl">About / Bio</label>
            <textarea className="finp" rows={4} value={prof.about} onChange={e => setProf({ ...prof, about: e.target.value })}
              placeholder="Describe your expertise, experience, and approach to patient care…" />
          </div>

          <button className="btn btn-p" onClick={saveProfile}>
            {existingProfile ? 'Save Changes' : 'Submit Profile for Review'}
          </button>

          {/* Reviews section */}
          {reviews.length > 0 && (
            <>
              <div className="divider" />
              <div className="sec-title mb-4">Patient Reviews ({reviews.length})</div>
              {reviews.map(r => (
                <div key={r.id} style={{ borderBottom: '1px solid var(--light)', paddingBottom: 10, marginBottom: 10 }}>
                  <div className="flex gap-2 mb-4">
                    <strong style={{ fontSize: 12 }}>{r.patientName}</strong>
                    <span className="stars" style={{ fontSize: 12 }}>{'★'.repeat(r.rating)}</span>
                    <span style={{ fontSize: 11, color: 'var(--mid)', marginLeft: 'auto' }}>{r.createdAt}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--mid)', lineHeight: 1.5 }}>{r.comment}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
