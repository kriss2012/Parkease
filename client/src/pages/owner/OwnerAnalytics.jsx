import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const links = [
  { to: '/owner', label: 'Overview' },
  { to: '/owner/analytics', label: 'Analytics' },
];

export default function OwnerAnalytics() {
  const { data } = useQuery({
    queryKey: ['ownerRevenue'],
    queryFn: async () => (await api.get('/payments/owner/revenue')).data.revenue,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={links} title="Owner" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-8">Revenue trend</h1>
          <div className="card p-6 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#4F6BFF" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
