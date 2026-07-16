import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';

const links = [
  { to: '/owner', label: 'Overview' },
  { to: '/owner/analytics', label: 'Analytics' },
];

export default function OwnerDashboard() {
  const { data: malls } = useQuery({
    queryKey: ['ownerMalls'],
    queryFn: async () => (await api.get('/malls/owner/mine')).data.malls,
  });

  const primaryMall = malls?.find((m) => m.status === 'approved') || malls?.[0];

  const { data: stats } = useQuery({
    queryKey: ['ownerMallDashboard', primaryMall?._id],
    queryFn: async () => (await api.get(`/malls/${primaryMall._id}/dashboard`)).data,
    enabled: !!primaryMall && primaryMall.status === 'approved',
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={links} title="Owner" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold">Your malls</h1>
            <button className="btn-primary text-sm" onClick={() => document.getElementById('new-mall-form')?.showModal?.()}>
              + Register a mall
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {malls?.map((m) => (
              <Link to={m.status === 'approved' ? `/owner/malls/${m._id}` : '#'} key={m._id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">{m.name}</p>
                  <StatusBadge status={m.status} />
                </div>
                <p className="text-sm text-slate-500">{m.city}</p>
                {m.status === 'approved' && (
                  <span className="text-xs text-signal mt-2 inline-block">Manage floors & slots →</span>
                )}
                {m.status === 'rejected' && m.rejectionReason && (
                  <p className="text-xs text-rose mt-2">{m.rejectionReason}</p>
                )}
              </Link>
            ))}
            {malls?.length === 0 && (
              <p className="text-slate-400 col-span-full">You haven't registered a mall yet. Use "Register a mall" to get started — new malls need admin approval before going live.</p>
            )}
          </div>

          {stats && (
            <>
              <h2 className="font-semibold mb-4">{primaryMall.name} — today</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Today's revenue" value={`₹${stats.todaysRevenue}`} accent="signal" />
                <StatCard label="Occupancy" value={`${stats.occupancyRate}%`} accent="amber" />
                <StatCard label="Available slots" value={stats.availableSlots} accent="emerald" />
                <StatCard label="Completed today" value={stats.completedBookingsToday} accent="signal" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
