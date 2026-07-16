import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function UserDashboard() {
  const { user } = useAuth();
  const { data: bookings } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => (await api.get('/bookings/mine')).data.bookings,
  });
  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => (await api.get('/users/favorites')).data.malls,
  });

  const active = bookings?.find((b) => ['pending', 'confirmed', 'entered'].includes(b.status));
  const upcoming = bookings?.filter((b) => b.status === 'confirmed').slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-semibold mb-1">Hey {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 mb-8">Here's what's happening with your parking.</p>

        {active && (
          <div className="card p-5 mb-6 border-l-4 border-l-signal">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active booking</p>
                <p className="font-semibold text-lg">{active.mall?.name}</p>
              </div>
              <StatusBadge status={active.status} />
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="card p-5">
            <h2 className="font-semibold mb-4">Upcoming bookings</h2>
            {upcoming?.length ? (
              <ul className="space-y-3">
                {upcoming.map((b) => (
                  <li key={b._id} className="flex justify-between text-sm">
                    <span>{b.mall?.name}</span>
                    <StatusBadge status={b.status} />
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-400">No upcoming bookings.</p>}
            <Link to="/bookings" className="text-sm text-signal hover:underline mt-4 inline-block">View all bookings →</Link>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold mb-4">Favorite malls</h2>
            {favorites?.length ? (
              <ul className="space-y-2">
                {favorites.map((m) => (
                  <li key={m._id}>
                    <Link to={`/malls/${m._id}`} className="text-sm text-signal hover:underline">{m.name}</Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-400">You haven't saved any malls yet.</p>}
            <Link to="/" className="text-sm text-signal hover:underline mt-4 inline-block">Find parking →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
