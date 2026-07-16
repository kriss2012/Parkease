import React from 'react';

export default function QRDisplay({ dataUrl, bookingCode, caption }) {
  if (!dataUrl) return null;
  return (
    <div className="card p-6 flex flex-col items-center text-center gap-3">
      <img src={dataUrl} alt="Booking QR code" className="w-48 h-48" />
      {bookingCode && <p className="font-mono text-xs text-slate-500">{bookingCode}</p>}
      <p className="text-sm text-slate-500">{caption || 'Show this QR code to the guard at entry and exit.'}</p>
    </div>
  );
}
