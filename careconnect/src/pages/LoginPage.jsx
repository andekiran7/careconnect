import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const DEMO = [
  { role:'patient', label:'Patient',  email:'kiran@demo.com', icon:'🙋' },
  { role:'doctor',  label:'Doctor',   email:'ande@demo.com', icon:'👨‍⚕️' },
  { role:'admin',   label:'Admin',    email:'admin@demo.com', icon:'🛡️' },
];
const REDIRECT = { PATIENT:'/patient/dashboard', DOCTOR:'/doctor/dashboard', ADMIN:'/admin/dashboard' };

export default function LoginPage() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // Login state
  const [email, setEmail] = useState('kiran@demo.com');
  const [pass,  setPass]  = useState('demo1234');
  const [selRole, setSelRole] = useState('patient');

  // Register state
  const [reg, setReg] = useState({ name:'', email:'', password:'', phone:'', city:'', role:'PATIENT' });

  if (user) { navigate(REDIRECT[user.role]); return null; }

  const handleLogin = () => {
    setErr(''); setLoading(true);
    const e = login(email, pass);
    setLoading(false);
    if (e) { setErr(e); return; }
    const u = JSON.parse(localStorage.getItem('cc_session'));
    navigate(REDIRECT[u.role]);
  };

  const handleRegister = () => {
    setErr('');
    if (!reg.name||!reg.email||!reg.password||!reg.phone) { setErr('Please fill all required fields.'); return; }
    if (reg.password.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const e = register(reg);
    setLoading(false);
    if (e) { setErr(e); return; }
    const u = JSON.parse(localStorage.getItem('cc_session'));
    navigate(REDIRECT[u.role]);
  };

  const pickDemo = (d) => {
    setEmail(d.email); setPass('demo1234'); setSelRole(d.role); setErr('');
  };

  return (
    <div className="auth-page">
      <div className="auth-circle" style={{ width:400,height:400,top:-100,right:-80 }} />
      <div className="auth-circle" style={{ width:260,height:260,bottom:-60,left:-50 }} />

      <div className="auth-box">
        <div className="auth-logo">🩺 <span>Care</span>Connect</div>
        <div className="auth-tagline">India's trusted doctor appointment platform</div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab==='login'?' active':''}`}  onClick={()=>{setTab('login');setErr('')}}>Sign In</button>
          <button className={`auth-tab${tab==='register'?' active':''}`} onClick={()=>{setTab('register');setErr('')}}>Register</button>
        </div>

        {err && <div className="banner bn-red" style={{ marginBottom:12 }}>⚠️ {err}</div>}

        {tab === 'login' ? (
          <>
            <div className="fgrp">
              <label className="flbl">Email address</label>
              <input className="finp" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" onKeyDown={e=>e.key==='Enter'&&handleLogin()} />
            </div>
            <div className="fgrp">
              <label className="flbl">Password</label>
              <input className="finp" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&handleLogin()} />
            </div>
            <button className="btn btn-p btn-full" style={{ marginTop:4 }} onClick={handleLogin} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>

            <div style={{ marginTop:18, paddingTop:14, borderTop:'1px solid var(--light)' }}>
              <div style={{ fontSize:10, color:'var(--mid)', textAlign:'center', marginBottom:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>
                Quick Demo — click to switch role
              </div>
              <div className="demo-grid">
                {DEMO.map(d => (
                  <div key={d.role} className={`demo-item${selRole===d.role?' active':''}`} onClick={()=>pickDemo(d)}>
                    <div style={{ fontSize:18, marginBottom:3 }}>{d.icon}</div>
                    <div className="demo-item-role">{d.label}</div>
                    <div className="demo-item-info">{d.email}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize:9, color:'var(--mid)', textAlign:'center', marginTop:7 }}>Password for all demos: demo1234</p>
            </div>
          </>
        ) : (
          <>
            <div className="form-row">
              <div className="fgrp">
                <label className="flbl">Full Name *</label>
                <input className="finp" value={reg.name} onChange={e=>setReg({...reg,name:e.target.value})} placeholder="Ramesh Kumar" />
              </div>
              <div className="fgrp">
                <label className="flbl">Role *</label>
                <select className="fsel" value={reg.role} onChange={e=>setReg({...reg,role:e.target.value})}>
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                </select>
              </div>
            </div>
            <div className="fgrp">
              <label className="flbl">Email address *</label>
              <input className="finp" type="email" value={reg.email} onChange={e=>setReg({...reg,email:e.target.value})} placeholder="you@email.com" />
            </div>
            <div className="form-row">
              <div className="fgrp">
                <label className="flbl">Password *</label>
                <input className="finp" type="password" value={reg.password} onChange={e=>setReg({...reg,password:e.target.value})} placeholder="min 6 characters" />
              </div>
              <div className="fgrp">
                <label className="flbl">Phone *</label>
                <input className="finp" value={reg.phone} onChange={e=>setReg({...reg,phone:e.target.value})} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="fgrp">
              <label className="flbl">City</label>
              <input className="finp" value={reg.city} onChange={e=>setReg({...reg,city:e.target.value})} placeholder="Mumbai" />
            </div>
            {reg.role === 'DOCTOR' && (
              <div className="banner bn-yellow">
                👨‍⚕️ After registration, your profile will be reviewed by admin before appearing in search.
              </div>
            )}
            <button className="btn btn-p btn-full" onClick={handleRegister} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
