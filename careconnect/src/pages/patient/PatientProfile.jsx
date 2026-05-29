import React, { useState } from 'react';
import AppLayout from '../../components/AppLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { updateUser } from '../../data/store.js';
import { CITIES } from '../../data/seed.js';

export default function PatientProfile() {
  const { user, refreshUser } = useAuth();
  const { show } = useToast();
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', city: user?.city||'', email: user?.email||'' });
  const [pass, setPass] = useState({ current:'', newp:'', confirm:'' });
  const [passErr, setPassErr] = useState('');

  const saveProfile = () => {
    if (!form.name) { show('Name cannot be empty.', 'red'); return; }
    updateUser(user.id, { name: form.name, phone: form.phone, city: form.city });
    refreshUser();
    show('Profile updated successfully!', 'green');
  };

  const changePassword = () => {
    setPassErr('');
    if (pass.current !== user.password) { setPassErr('Current password is incorrect.'); return; }
    if (pass.newp.length < 6) { setPassErr('New password must be at least 6 characters.'); return; }
    if (pass.newp !== pass.confirm) { setPassErr('Passwords do not match.'); return; }
    updateUser(user.id, { password: pass.newp });
    refreshUser();
    setPass({ current:'', newp:'', confirm:'' });
    show('Password changed successfully!', 'green');
  };

  const initials = user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)||'?';

  return (
    <AppLayout title="My Profile" subtitle="Manage your personal information">
      <div className="split-equal" style={{gap:16}}>
        {/* Profile card */}
        <div>
          <div className="prof-hero">
            <div className="prof-big-av">{initials}</div>
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <p>{user?.phone} · {user?.city}</p>
          </div>

          {/* Change password */}
          <div className="card">
            <div className="sec-title mb-4">🔒 Change Password</div>
            {passErr && <div className="banner bn-red mb-4">⚠️ {passErr}</div>}
            <div className="fgrp"><label className="flbl">Current Password</label><input className="finp" type="password" value={pass.current} onChange={e=>setPass({...pass,current:e.target.value})} /></div>
            <div className="fgrp"><label className="flbl">New Password</label><input className="finp" type="password" value={pass.newp} onChange={e=>setPass({...pass,newp:e.target.value})} /></div>
            <div className="fgrp"><label className="flbl">Confirm New Password</label><input className="finp" type="password" value={pass.confirm} onChange={e=>setPass({...pass,confirm:e.target.value})} /></div>
            <button className="btn btn-p btn-sm" onClick={changePassword}>Update Password</button>
          </div>
        </div>

        {/* Edit form */}
        <div className="card">
          <div className="sec-title mb-4">Edit Personal Details</div>
          <div className="fgrp"><label className="flbl">Full Name</label><input className="finp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
          <div className="fgrp"><label className="flbl">Email (cannot change)</label><input className="finp" value={form.email} disabled style={{opacity:.6}} /></div>
          <div className="fgrp"><label className="flbl">Phone Number</label><input className="finp" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91 98765 43210" /></div>
          <div className="fgrp">
            <label className="flbl">City</label>
            <select className="fsel" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}>
              <option value="">Select city</option>
              {CITIES.filter(c=>c!=='All Cities').map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn btn-p" onClick={saveProfile}>Save Changes</button>
        </div>
      </div>
    </AppLayout>
  );
}
