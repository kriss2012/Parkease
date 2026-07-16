import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';

export default function ManageMall() {
  const { mallId } = useParams();

  const { data: mallData } = useQuery({
    queryKey: ['mall', mallId],
    queryFn: async () => (await api.get(`/malls/${mallId}`)).data,
  });

  const { data: bookingsData } = useQuery({
    queryKey: ['mallBookings', mallId],
    queryFn: async () => (await api.get(`/malls/${mallId}/bookings`, { params: { limit: 10 } })).data,
  });

  const mall = mallData?.mall;
  if (!mall) return <div className="min-h-screen bg-slate-50"><Navbar /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">{mall.name}</h1>
            <p className="text-slate-500 text-sm">{mall.address}, {mall.city}</p>
          </div>
          <Link to={`/owner/malls/${mallId}/floors`} className="btn-primary text-sm">Manage floors & slots</Link>
        </div>

        <div className="card p-5 mb-8">
          <h2 className="font-semibold mb-3">Pricing</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-slate-400">Hourly</p><p className="font-semibold">₹{mall.pricing.hourly}</p></div>
            <div><p className="text-slate-400">Daily</p><p className="font-semibold">₹{mall.pricing.daily}</p></div>
            <div><p className="text-slate-400">Monthly</p><p className="font-semibold">₹{mall.pricing.monthly}</p></div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-4">Recent bookings</h2>
          <div className="space-y-3">
            {bookingsData?.bookings?.map((b) => (
              <div key={b._id} className="flex justify-between text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <span>{b.user?.name} · {b.vehicleNumber} · Slot {b.slot?.slotNumber}</span>
                <StatusBadge status={b.status} />
              </div>
            ))}
            {bookingsData?.bookings?.length === 0 && <p className="text-slate-400 text-sm">No bookings yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
