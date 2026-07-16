import React from 'react';

const COLORS = {
  available: 'bg-emerald/15 border-emerald text-emerald',
  occupied: 'bg-rose/15 border-rose text-rose',
  reserved: 'bg-amber/15 border-amber text-amber',
  maintenance: 'bg-slate-200 border-slate-300 text-slate-500',
};

// slots: [{ _id, slotNumber, status, vehicleType }]
export default function SlotGrid({ slots, onSlotClick }) {
  if (!slots?.length) {
    return <p className="text-sm text-slate-400 py-6 text-center">No slots on this floor yet.</p>;
  }
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
      {slots.map((s) => (
        <button
          key={s._id}
          onClick={() => onSlotClick?.(s)}
          title={`${s.slotNumber} · ${s.vehicleType} · ${s.status}`}
          className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-mono font-semibold transition-transform hover:scale-105 ${COLORS[s.status] || COLORS.maintenance}`}
        >
          {s.slotNumber}
        </button>
      ))}
    </div>
  );
}
