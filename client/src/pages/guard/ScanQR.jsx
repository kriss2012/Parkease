import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';

export default function ScanQR() {
  const scannerRef = useRef(null);
  const [result, setResult] = useState(null); // { action, message, booking }
  const [processing, setProcessing] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          if (processing) return;
          await scanner.pause(true);
          await handleScan(decodedText);
        },
        () => {} // ignore per-frame scan failures
      )
      .then(() => setScanning(true))
      .catch(() => toast.error('Could not access camera. Check permissions.'));

    return () => {
      if (scanner.isScanning) scanner.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScan = async (decodedText) => {
    setProcessing(true);
    try {
      const payload = JSON.parse(decodedText);
      const { data } = await api.post('/guard/scan', { payload });
      setResult(data);
      if (!data.success) toast.error(data.message);
    } catch (err) {
      toast.error('Unrecognized QR code');
      setResult({ success: false, message: 'Unrecognized QR code' });
    } finally {
      setProcessing(false);
    }
  };

  const resumeScanning = () => {
    setResult(null);
    scannerRef.current?.resume();
  };

  const confirmEntry = async () => {
    try {
      await api.post(`/guard/entry/${result.booking._id}`);
      toast.success('Entry recorded');
      resumeScanning();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record entry');
    }
  };

  const confirmExit = async () => {
    try {
      const { data } = await api.post(`/guard/exit/${result.booking._id}`);
      toast.success(`Exit recorded — ₹${data.receipt.totalAmount} charged`);
      resumeScanning();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record exit');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">Scan vehicle QR</h1>

        <div id="qr-reader" className="card overflow-hidden mb-6" />

        {result && (
          <div className="card p-5 space-y-3">
            <p className="text-sm">{result.message}</p>
            {result.booking && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Vehicle</span>
                  <span className="font-mono font-semibold">{result.booking.vehicleNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Slot</span>
                  <span>{result.booking.slot?.slotNumber}</span>
                </div>
                <StatusBadge status={result.booking.status} />
              </>
            )}

            <div className="flex gap-2 pt-2">
              {result.action === 'ENTRY_READY' && (
                <button onClick={confirmEntry} className="btn-primary flex-1">Confirm entry</button>
              )}
              {result.action === 'EXIT_READY' && (
                <button onClick={confirmExit} className="btn-primary flex-1">Confirm exit</button>
              )}
              <button onClick={resumeScanning} className="btn-secondary flex-1">
                {result.action ? 'Scan next' : 'Try again'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
