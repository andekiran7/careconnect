// store.js – localStorage-backed data store
// All reads/writes go through here. Think of it as a tiny DB.

import { SEED_USERS, SEED_PROFILES, SEED_SLOTS, SEED_APPOINTMENTS, SEED_REVIEWS } from './seed.js';

const KEYS = {
  USERS:'cc_users', PROFILES:'cc_profiles', SLOTS:'cc_slots',
  APPOINTMENTS:'cc_appointments', REVIEWS:'cc_reviews', SEEDED:'cc_seeded',
};

function get(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}
function set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function uid() { return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2,7); }
function now() { return new Date().toISOString(); }
function today() { return new Date().toISOString().split('T')[0]; }

// ── Seed on first load ──────────────────────────────────────
export function seedIfNeeded() {
  if (localStorage.getItem(KEYS.SEEDED)) return;
  set(KEYS.USERS, SEED_USERS);
  set(KEYS.PROFILES, SEED_PROFILES);
  set(KEYS.SLOTS, SEED_SLOTS);
  set(KEYS.APPOINTMENTS, SEED_APPOINTMENTS);
  set(KEYS.REVIEWS, SEED_REVIEWS);
  localStorage.setItem(KEYS.SEEDED, '1');
}

// ── AUTH ────────────────────────────────────────────────────
export function loginUser(email, password) {
  const users = get(KEYS.USERS);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return null;
  if (!user.active) return { error: 'Account is deactivated. Contact admin.' };
  return user;
}

export function registerUser({ name, email, password, phone, city, role }) {
  const users = get(KEYS.USERS);
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return { error: 'Email already registered.' };
  const user = { id: uid(), name, email, password, phone, city, role, active: true, createdAt: today() };
  users.push(user);
  set(KEYS.USERS, users);
  return user;
}

// ── USERS ───────────────────────────────────────────────────
export function getAllUsers() { return get(KEYS.USERS); }
export function getUserById(id) { return get(KEYS.USERS).find(u => u.id === id) || null; }
export function updateUser(id, data) {
  const users = get(KEYS.USERS).map(u => u.id === id ? { ...u, ...data } : u);
  set(KEYS.USERS, users);
  return users.find(u => u.id === id);
}
export function toggleUserActive(id) {
  const users = get(KEYS.USERS).map(u => u.id === id ? { ...u, active: !u.active } : u);
  set(KEYS.USERS, users);
}

// ── DOCTOR PROFILES ─────────────────────────────────────────
export function getAllProfiles() { return get(KEYS.PROFILES); }
export function getProfile(doctorId) { return get(KEYS.PROFILES).find(p => p.doctorId === doctorId) || null; }
export function createProfile(data) {
  const profiles = get(KEYS.PROFILES);
  profiles.push({ ...data });
  set(KEYS.PROFILES, profiles);
}
export function updateProfile(doctorId, data) {
  const profiles = get(KEYS.PROFILES).map(p => p.doctorId === doctorId ? { ...p, ...data } : p);
  set(KEYS.PROFILES, profiles);
}
export function approveDoctor(doctorId) { updateProfile(doctorId, { approvalStatus: 'APPROVED' }); }
export function rejectDoctor(doctorId)  { updateProfile(doctorId, { approvalStatus: 'REJECTED' }); }

// Returns merged user + profile for a doctor
export function getDoctorFull(doctorId) {
  const user    = getUserById(doctorId);
  const profile = getProfile(doctorId);
  if (!user || !profile) return null;
  return { ...user, ...profile };
}

export function getApprovedDoctors() {
  return getAllProfiles()
    .filter(p => p.approvalStatus === 'APPROVED')
    .map(p => getDoctorFull(p.doctorId))
    .filter(Boolean);
}

export function getAllDoctors() {
  return getAllProfiles()
    .map(p => getDoctorFull(p.doctorId))
    .filter(Boolean);
}

// ── SLOTS ───────────────────────────────────────────────────
export function getSlots(doctorId, date) {
  return get(KEYS.SLOTS).filter(s => s.doctorId === doctorId && s.date === date);
}
export function getSlotsByDoctor(doctorId) {
  return get(KEYS.SLOTS).filter(s => s.doctorId === doctorId);
}
export function addSlot(doctorId, date, startTime, endTime) {
  const slots = get(KEYS.SLOTS);
  const exists = slots.find(s => s.doctorId === doctorId && s.date === date && s.startTime === startTime);
  if (exists) return { error: 'Slot already exists for this time.' };
  const slot = { id: uid(), doctorId, date, startTime, endTime, status: 'AVAILABLE' };
  slots.push(slot);
  set(KEYS.SLOTS, slots);
  return slot;
}
export function deleteSlot(slotId) {
  const slots = get(KEYS.SLOTS).filter(s => s.id !== slotId);
  set(KEYS.SLOTS, slots);
}
export function bookSlot(slotId) {
  const slots = get(KEYS.SLOTS).map(s => s.id === slotId ? { ...s, status: 'BOOKED' } : s);
  set(KEYS.SLOTS, slots);
}
export function freeSlot(slotId) {
  const slots = get(KEYS.SLOTS).map(s => s.id === slotId ? { ...s, status: 'AVAILABLE' } : s);
  set(KEYS.SLOTS, slots);
}

// ── APPOINTMENTS ────────────────────────────────────────────
export function getAllAppointments() { return get(KEYS.APPOINTMENTS); }
export function getPatientAppointments(patientId) {
  return get(KEYS.APPOINTMENTS)
    .filter(a => a.patientId === patientId)
    .sort((a,b) => b.date.localeCompare(a.date));
}
export function getDoctorAppointments(doctorId) {
  return get(KEYS.APPOINTMENTS)
    .filter(a => a.doctorId === doctorId)
    .sort((a,b) => b.date.localeCompare(a.date));
}
export function bookAppointment({ patientId, doctorId, slotId, date, startTime, endTime, fee, patientNotes }) {
  const appts = get(KEYS.APPOINTMENTS);
  // Check double booking
  const clash = appts.find(a =>
    a.doctorId === doctorId && a.date === date &&
    a.startTime === startTime && a.status === 'CONFIRMED'
  );
  if (clash) return { error: 'This slot was just booked by someone else!' };
  const appt = {
    id: uid(), patientId, doctorId, slotId, date, startTime, endTime, fee,
    patientNotes: patientNotes || '', doctorNotes: '', status: 'CONFIRMED', createdAt: now(),
  };
  appts.push(appt);
  set(KEYS.APPOINTMENTS, appts);
  if (slotId) bookSlot(slotId);
  return appt;
}
export function cancelAppointment(apptId) {
  const appts = get(KEYS.APPOINTMENTS).map(a =>
    a.id === apptId ? { ...a, status: 'CANCELLED' } : a
  );
  const appt = appts.find(a => a.id === apptId);
  set(KEYS.APPOINTMENTS, appts);
  if (appt?.slotId) freeSlot(appt.slotId);
}
export function completeAppointment(apptId, doctorNotes) {
  const appts = get(KEYS.APPOINTMENTS).map(a =>
    a.id === apptId ? { ...a, status: 'COMPLETED', doctorNotes: doctorNotes || '' } : a
  );
  set(KEYS.APPOINTMENTS, appts);
}
export function updateDoctorNotes(apptId, notes) {
  const appts = get(KEYS.APPOINTMENTS).map(a =>
    a.id === apptId ? { ...a, doctorNotes: notes } : a
  );
  set(KEYS.APPOINTMENTS, appts);
}

// ── REVIEWS ─────────────────────────────────────────────────
export function getReviews(doctorId) {
  return get(KEYS.REVIEWS).filter(r => r.doctorId === doctorId);
}
export function getAllReviews() { return get(KEYS.REVIEWS); }
export function hasReviewed(patientId, appointmentId) {
  return get(KEYS.REVIEWS).some(r => r.patientId === patientId && r.appointmentId === appointmentId);
}
export function addReview({ patientId, doctorId, appointmentId, rating, comment, patientName }) {
  if (hasReviewed(patientId, appointmentId)) return { error: 'Already reviewed.' };
  const reviews = get(KEYS.REVIEWS);
  const review = { id: uid(), patientId, doctorId, appointmentId, rating, comment, patientName, createdAt: today() };
  reviews.push(review);
  set(KEYS.REVIEWS, reviews);
  // Recalculate doctor rating
  const docReviews = reviews.filter(r => r.doctorId === doctorId);
  const avg = docReviews.reduce((s,r) => s+r.rating, 0) / docReviews.length;
  updateProfile(doctorId, { rating: Math.round(avg*10)/10, totalReviews: docReviews.length });
  return review;
}

// ── ADMIN STATS ─────────────────────────────────────────────
export function getAdminStats() {
  const users = get(KEYS.USERS);
  const profiles = get(KEYS.PROFILES);
  const appts = get(KEYS.APPOINTMENTS);
  const completedAppts = appts.filter(a => a.status === 'COMPLETED');
  const revenue = completedAppts.reduce((s,a) => s+a.fee, 0);
  return {
    totalDoctors:    profiles.filter(p => p.approvalStatus === 'APPROVED').length,
    pendingApprovals:profiles.filter(p => p.approvalStatus === 'PENDING').length,
    totalPatients:   users.filter(u => u.role === 'PATIENT').length,
    totalAppointments: appts.length,
    completedToday:  completedAppts.filter(a => a.date === today()).length,
    revenue,
    todayAppts: appts.filter(a => a.date === today() && a.status === 'CONFIRMED').length,
  };
}
