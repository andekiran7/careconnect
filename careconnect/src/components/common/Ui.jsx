import React, { useState } from 'react';

// ── Modal ──────────────────────────────────────────────────
export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex gap-3" style={{ marginBottom:16 }}>
          <div className="modal-title" style={{ margin:0 }}>{title}</div>
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--mid)' }}>✕</button>
        </div>
        {children}
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// ── Star Rating ────────────────────────────────────────────
export function StarRating({ value, onChange, size = 22 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-2" style={{ cursor: onChange ? 'pointer' : 'default' }}>
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          style={{ fontSize: size, color: i <= (hover||value) ? '#F59E0B' : '#D1D5DB', transition:'color .1s' }}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(i)}
        >★</span>
      ))}
    </div>
  );
}

// ── Display Stars ──────────────────────────────────────────
export function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="stars">
      {'★'.repeat(full)}{half?'☆':''} <span style={{ fontSize:12, color:'var(--mid)', fontWeight:600 }}>{rating}</span>
    </span>
  );
}

// ── Avatar ─────────────────────────────────────────────────
const COLORS = ['av-teal','av-blue','av-green','av-navy','av-purple','av-warn'];
export function Avatar({ name, size = 38 }) {
  const initials = name?.split(' ').map(w=>w[0]).join('').slice(0,2) || '?';
  const idx = name?.charCodeAt(0) % COLORS.length || 0;
  return (
    <div className={`avatar ${COLORS[idx]}`} style={{ width:size, height:size, fontSize:size*0.34 }}>
      {initials}
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    CONFIRMED: ['b-blue','Confirmed'],
    COMPLETED: ['b-green','Completed'],
    CANCELLED: ['b-red','Cancelled'],
    APPROVED:  ['b-green','Approved'],
    PENDING:   ['b-yellow','Pending'],
    REJECTED:  ['b-red','Rejected'],
    AVAILABLE: ['b-teal','Available'],
    BOOKED:    ['b-blue','Booked'],
  };
  const [cls, label] = map[status] || ['b-gray', status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ── Format helpers ─────────────────────────────────────────
export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}
export function fmtMoney(n) { return `₹${Number(n).toLocaleString('en-IN')}`; }

// ── Confirm Dialog ─────────────────────────────────────────
export function ConfirmModal({ msg, onConfirm, onClose }) {
  return (
    <Modal title="Confirm Action" onClose={onClose}
      footer={
        <>
          <button className="btn btn-s btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-d btn-sm" onClick={() => { onConfirm(); onClose(); }}>Confirm</button>
        </>
      }
    >
      <p style={{ fontSize:14, color:'var(--dark)' }}>{msg}</p>
    </Modal>
  );
}
