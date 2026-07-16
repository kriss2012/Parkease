import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import QRDisplay from '../../components/QRDisplay';

export default function BookingForm() {
  const { mallId } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { vehicleType: '4-wheeler', durationHours: 2, paymentMethod: 'dummy-card' },
  });
  const [confirmed, setConfirmed] = useState(null);

  const { data: mallData } = useQuery({
    queryKey: ['mall', mallId],
    queryFn: async () => (await api.get(`/malls/${mallId}`)).data,
  });
  const mall = mallData?.mall;
  const duration = watch('durationHours') || 0;
  const estimate = mall ? Math.round(mall.pricing.hourly * duration * 1.18 * 100) / 100 : 0;

  const onSubmit = async (form) => {
    try {
      const { data } = await api.post('/bookings', { ...form, mallId, durationHours: Number(form.durationHours) });
      setConfirmed(data);
      toast.success('Booking confirmed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 pt-16 text-center">
          <h1 className="text-2xl font-semibold mb-6">You're booked in 🎉</h1>
          <QRDisplay dataUrl={confirmed.qrCode} bookingCode={confirmed.booking.bookingCode} />
          <button className="btn-primary w-full mt-6" onClick={() => navigate('/bookings')}>
            View my bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 pt-16 pb-16">
        <h1 className="text-2xl font-semibold mb-1">Book a slot{mall ? ` at ${mall.name}` : ''}</h1>
        <p className="text-slate-500 text-sm mb-8">A slot is reserved for you the instant you confirm.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <div>
            <label className="label">Vehicle number</label>
            <input className="input uppercase" placeholder="KA-01-AB-1234" {...register('vehicleNumber', { required: true })} />
            {errors.vehicleNumber && <p className="text-rose text-xs mt-1">Required</p>}
          </div>
          <div>
            <label className="label">Vehicle type</label>
            <select className="input" {...register('vehicleType')}>
              <option value="2-wheeler">2-Wheeler</option>
              <option value="4-wheeler">4-Wheeler</option>
              <option value="ev">EV</option>
              <option value="handicap-accessible">Handicap Accessible</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" min={new Date().toISOString().split('T')[0]} {...register('date', { required: true })} />
            </div>
            <div>
              <label className="label">Arrival time</label>
              <input className="input" type="time" {...register('arrivalTime', { required: true })} />
            </div>
          </div>
          <div>
            <label className="label">Duration (hours)</label>
            <input className="input" type="number" min="1" max="720" step="0.5" {...register('durationHours', { required: true, min: 1 })} />
          </div>
          <div>
            <label className="label">Payment method</label>
            <select className="input" {...register('paymentMethod')}>
              <option value="dummy-card">Card</option>
              <option value="dummy-upi">UPI</option>
              <option value="dummy-wallet">Wallet</option>
            </select>
          </div>

          {mall && (
            <div className="bg-slate-50 rounded-lg p-3 text-sm flex justify-between">
              <span className="text-slate-500">Estimated total (incl. GST)</span>
              <span className="font-semibold">₹{estimate}</span>
            </div>
          )}

          <button className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Confirming…' : 'Confirm booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
