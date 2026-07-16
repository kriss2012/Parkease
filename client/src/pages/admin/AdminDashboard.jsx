import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';

const links = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/users', label: 'Users & Owners' },
  { to: '/admin/malls', label: 'Mall Approvals' },
  { to: '/admin/analytics', label: 'Analytics' },
];

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => (await api.get('/admin/dashboard')).data,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={links} title="Admin" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-8">Platform overview</h1>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="Total users" value={data?.totalUsers ?? '—'} accent="signal" />
            <StatCard label="Active malls" value={data?.totalMalls ?? '—'} accent="emerald" />
            <StatCard label="Active bookings" value={data?.activeBookings ?? '—'} accent="signal" />
            <StatCard label="Pending approvals" value={data?.pendingApprovals ?? '—'} accent="amber" />
            <StatCard label="Total revenue" value={`₹${data?.revenue ?? 0}`} accent="emerald" />
          </div>
        </div>
      </div>
    </div>
  );
}
