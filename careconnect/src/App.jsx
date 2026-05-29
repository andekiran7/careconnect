import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

// Pages
import LoginPage            from './pages/LoginPage.jsx';
import PatientDashboard     from './pages/patient/PatientDashboard.jsx';
import SearchDoctors        from './pages/patient/SearchDoctors.jsx';
import PatientAppointments  from './pages/patient/PatientAppointments.jsx';
import PatientProfile       from './pages/patient/PatientProfile.jsx';
import DoctorDashboard      from './pages/doctor/DoctorDashboard.jsx';
import DoctorAppointments   from './pages/doctor/DoctorAppointments.jsx';
import ManageSlots          from './pages/doctor/ManageSlots.jsx';
import DoctorProfile        from './pages/doctor/DoctorProfile.jsx';
import AdminDashboard       from './pages/admin/AdminDashboard.jsx';
import AdminDoctors         from './pages/admin/AdminDoctors.jsx';
import AdminPatients        from './pages/admin/AdminPatients.jsx';
import AdminApprovals       from './pages/admin/AdminApprovals.jsx';
import AdminAppointments    from './pages/admin/AdminAppointments.jsx';

const DEFAULTS = { PATIENT: '/patient/dashboard', DOCTOR: '/doctor/dashboard', ADMIN: '/admin/dashboard' };

function Guard({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'DM Sans,sans-serif', color:'#6B8F7A' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={DEFAULTS[user.role] || '/login'} replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={DEFAULTS[user.role]} replace /> : <LoginPage />} />

      {/* Patient */}
      <Route path="/patient/dashboard"    element={<Guard roles={['PATIENT']}><PatientDashboard /></Guard>} />
      <Route path="/patient/search"       element={<Guard roles={['PATIENT']}><SearchDoctors /></Guard>} />
      <Route path="/patient/appointments" element={<Guard roles={['PATIENT']}><PatientAppointments /></Guard>} />
      <Route path="/patient/profile"      element={<Guard roles={['PATIENT']}><PatientProfile /></Guard>} />

      {/* Doctor */}
      <Route path="/doctor/dashboard"    element={<Guard roles={['DOCTOR']}><DoctorDashboard /></Guard>} />
      <Route path="/doctor/appointments" element={<Guard roles={['DOCTOR']}><DoctorAppointments /></Guard>} />
      <Route path="/doctor/slots"        element={<Guard roles={['DOCTOR']}><ManageSlots /></Guard>} />
      <Route path="/doctor/profile"      element={<Guard roles={['DOCTOR']}><DoctorProfile /></Guard>} />

      {/* Admin */}
      <Route path="/admin/dashboard"    element={<Guard roles={['ADMIN']}><AdminDashboard /></Guard>} />
      <Route path="/admin/doctors"      element={<Guard roles={['ADMIN']}><AdminDoctors /></Guard>} />
      <Route path="/admin/patients"     element={<Guard roles={['ADMIN']}><AdminPatients /></Guard>} />
      <Route path="/admin/approvals"    element={<Guard roles={['ADMIN']}><AdminApprovals /></Guard>} />
      <Route path="/admin/appointments" element={<Guard roles={['ADMIN']}><AdminAppointments /></Guard>} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
