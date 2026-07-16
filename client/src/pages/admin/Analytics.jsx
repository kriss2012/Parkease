import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const links = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/users', label: 'Users & Owners' },
  { to: '/admin/malls', label: 'Mall Approvals' },
  { to: '/admin/analytics', label: 'Analytics' },
];

export default function Analytics() {
  const { data } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => (await api.get('/admin/analytics')).data,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={links} title="Admin" />
        <div className="flex-1 space-y-8">
          <h1 className="text-2xl font-semibold">Platform analytics</h1>

          <div className="card p-6 h-80">
            <h2 className="font-semibold mb-4">Monthly revenue</h2>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={data?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#4F6BFF" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6 h-80">
            <h2 className="font-semibold mb-4">Bookings by status</h2>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={data?.bookingsByStatus || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1FAE7A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold mb-3">Most popular malls</h2>
            <ul className="space-y-2 text-sm">
              {data?.popularMalls?.map((m) => (
                <li key={m._id} className="flex justify-between">
                  <span>{m.mall?.name}</span>
                  <span className="text-slate-400">{m.bookings} bookings</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
