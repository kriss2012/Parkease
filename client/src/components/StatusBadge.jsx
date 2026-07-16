import React from 'react';

const STYLES = {
  available: 'bg-emerald/10 text-emerald',
  occupied: 'bg-rose/10 text-rose',
  reserved: 'bg-amber/10 text-amber',
  maintenance: 'bg-slate-200 text-slate-600',
  pending: 'bg-amber/10 text-amber',
  confirmed: 'bg-signal/10 text-signal',
  entered: 'bg-emerald/10 text-emerald',
  completed: 'bg-slate-200 text-slate-600',
  cancelled: 'bg-rose/10 text-rose',
  expired: 'bg-slate-200 text-slate-600',
  approved: 'bg-emerald/10 text-emerald',
  rejected: 'bg-rose/10 text-rose',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge capitalize ${STYLES[status] || 'bg-slate-200 text-slate-600'}`}>
      {status}
    </span>
  );
}
