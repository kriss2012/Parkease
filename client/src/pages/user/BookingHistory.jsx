import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';

export default function BookingHistory() {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => (await api.get('/bookings/mine')).data.bookings,
  });

  const cancelBooking = async (id) => {
    try {
      await api.put(`/bookings/${id}/cancel`, { reason: 'Changed my plans' });
      toast.success('Booking cancelled');
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel booking');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-semibold mb-8">Booking history</h1>

        {isLoading ? (
          <p className="text-slate-400">Loading…</p>
        ) : (
          <div className="space-y-3">
            {bookings?.map((b) => (
              <div key={b._id} className="card p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{b.mall?.name}</p>
                  <p className="text-sm text-slate-500">
                    {b.vehicleNumber} · Slot {b.slot?.slotNumber} · {new Date(b.date).toLocaleDateString()} {b.arrivalTime}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-1">{b.bookingCode}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={b.status} />
                  {['pending', 'confirmed'].includes(b.status) && (
                    <button onClick={() => cancelBooking(b._id)} className="text-rose text-sm hover:underline">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
            {bookings?.length === 0 && <p className="text-slate-400">No bookings yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
