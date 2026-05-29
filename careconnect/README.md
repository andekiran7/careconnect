# 🩺 CareConnect — Doctor Appointment Booking System

A **fully working** React frontend with complete localStorage-based data persistence.
No backend or database needed — everything runs in the browser.

---

## 🚀 Run in 2 steps

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

---

## 🔐 Demo Login Credentials

| Role    | Email               | Password  | Description               |
|---------|---------------------|-----------|---------------------------|
| Patient | Kiran@demo.com      | demo1234  | Has existing appointments |
| Patient | riya@demo.com       | demo1234  | Another patient account   |
| Doctor  | Ande@demo.com      | demo1234  | Cardiologist, approved    |
| Doctor  | rahul@demo.com      | demo1234  | Neurologist, approved     |
| Admin   | admin@demo.com      | demo1234  | Full admin access         |

---

## ✅ Full Feature List

### 🙋 Patient
- Register a new account
- Login / logout
- Dashboard with stats (upcoming, completed, cancelled, total spent in ₹)
- Search doctors by name, specialization, city
- View doctor profile with ratings and patient reviews
- See real-time slot availability (green = free, grey = booked)
- Book appointment with patient notes
- Confirm booking via modal
- View all appointments with filters (All / Confirmed / Completed / Cancelled)
- Cancel upcoming appointments (slot freed automatically)
- Leave star rating + written review after completed appointment
- Edit personal profile (name, phone, city)
- Change password

### 👨‍⚕️ Doctor
- Register as doctor (triggers pending approval)
- Dashboard with today's schedule, earnings, review summary
- Cannot be found by patients until admin approves
- View all patient appointments in a table
- Mark appointment as Complete with clinical notes (visible to patient)
- Cancel appointments
- Add new time slots (date + time picker)
- Delete available slots (cannot delete booked ones)
- See slot summary per date (free / booked / total)
- Edit full profile: specialization, qualification, experience, fee (₹), hospital, bio
- View all patient reviews on profile page
- Change password

### 🛡️ Admin
- Platform dashboard with 8 stats (doctors, patients, appointments, revenue in ₹, etc.)
- Warning banner for pending approvals
- All Doctors table with filter, search, approve/reject/re-approve, activate/deactivate
- All Patients table with appointment counts, activate/deactivate
- Approvals page — full doctor card with all details, approve / reject buttons
- All Appointments — cross-platform view with patient & doctor notes
- Revenue tracking in ₹

### 💾 Data Persistence
- All data stored in **localStorage** — survives page refresh and browser close
- Seeded with realistic Indian data on first launch
- No data lost between sessions

---

## 🇮🇳 All Indian Data
- Indian names, cities, hospitals, phone numbers
- Fees and revenue in **₹ (Indian Rupees)**
- Emergency number: **108** (Ambulance)
- Hospitals: Apollo, Fortis, AIIMS, NIMHANS, Yashoda, Rainbow, Lilavati
- Cities: Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kochi

---

## 📁 Project Structure

```
src/
├── App.jsx                    ← Router + auth guards
├── main.jsx                   ← Entry
├── index.css                  ← All styles
├── context/
│   ├── AuthContext.jsx        ← Login/register/session
│   └── ToastContext.jsx       ← Global toast notifications
├── data/
│   ├── seed.js                ← Initial Indian data
│   └── store.js               ← localStorage data layer (the "database")
├── components/
│   ├── AppLayout.jsx          ← Sidebar + topbar
│   └── common/Ui.jsx          ← Modal, Avatar, Badge, Stars, helpers
└── pages/
    ├── LoginPage.jsx
    ├── patient/
    │   ├── PatientDashboard.jsx
    │   ├── SearchDoctors.jsx
    │   ├── PatientAppointments.jsx
    │   └── PatientProfile.jsx
    ├── doctor/
    │   ├── DoctorDashboard.jsx
    │   ├── DoctorAppointments.jsx
    │   ├── ManageSlots.jsx
    │   └── DoctorProfile.jsx
    └── admin/
        ├── AdminDashboard.jsx
        ├── AdminDoctors.jsx
        ├── AdminPatients.jsx
        ├── AdminApprovals.jsx
        └── AdminAppointments.jsx
```

---

## 🔄 To reset all data

Open browser console (F12) and run:
```javascript
localStorage.clear(); location.reload();
```
