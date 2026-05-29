import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = {
  PATIENT: [
    { path:'/patient/dashboard',    icon:'🏠', label:'Dashboard' },
    { path:'/patient/search',       icon:'🔍', label:'Find Doctors' },
    { path:'/patient/appointments', icon:'📅', label:'My Appointments' },
    { path:'/patient/profile',      icon:'👤', label:'My Profile' },
  ],
  DOCTOR: [
    { path:'/doctor/dashboard',    icon:'🏠', label:'Dashboard' },
    { path:'/doctor/appointments', icon:'📅', label:'Appointments' },
    { path:'/doctor/slots',        icon:'🕐', label:'Manage Slots' },
    { path:'/doctor/profile',      icon:'👤', label:'My Profile' },
  ],
  ADMIN: [
    { path:'/admin/dashboard', icon:'🏠', label:'Dashboard' },
    { path:'/admin/doctors',   icon:'👨‍⚕️', label:'All Doctors' },
    { path:'/admin/patients',  icon:'👥', label:'All Patients' },
    { path:'/admin/approvals', icon:'✅', label:'Approvals' },
    { path:'/admin/appointments',icon:'📋', label:'All Appointments' },
  ],
};

export default function AppLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const nav = NAV[user?.role] || [];
  const initials = user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2) || '?';

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-text">🩺 <em>Care</em>Connect</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-label">Menu</div>
          {nav.map(item => (
            <button
              key={item.path}
              className={`nav-item${pathname===item.path?' active':''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="s-user">
            <div className="s-avatar">{initials}</div>
            <div><div className="s-name">{user?.name}</div><div className="s-role">{user?.role}</div></div>
          </div>
          <button className="s-logout" onClick={() => { logout(); navigate('/login'); }}>🚪 Sign out</button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{title}</div>
            {subtitle && <div className="topbar-sub">{subtitle}</div>}
          </div>
          <div className="topbar-right">
            <div className="bell">🔔</div>
          </div>
        </header>
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
