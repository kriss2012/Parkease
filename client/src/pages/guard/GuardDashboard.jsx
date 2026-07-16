import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import StatCard from '../../components/StatCard';

export default function GuardDashboard() {
  const { data } = useQuery({
    queryKey: ['guardDashboard'],
    queryFn: async () => (await api.get('/guard/dashboard')).data,
    refetchInterval: 15000,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Gate desk</h1>
          <Link to="/guard/scan" className="btn-primary">Scan a QR code</Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard label="Today's entries" value={data?.todaysEntries ?? '—'} accent="emerald" />
          <StatCard label="Today's exits" value={data?.todaysExits ?? '—'} accent="signal" />
          <StatCard label="Vehicles inside" value={data?.pendingVehicles ?? '—'} accent="amber" />
        </div>
      </div>
    </div>
  );
}
