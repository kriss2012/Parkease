import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const links = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/users', label: 'Users & Owners' },
  { to: '/admin/malls', label: 'Mall Approvals' },
  { to: '/admin/analytics', label: 'Analytics' },
];

export default function ApproveMalls() {
  const queryClient = useQueryClient();
  const { data: malls } = useQuery({
    queryKey: ['pendingMalls'],
    queryFn: async () => (await api.get('/admin/malls/pending')).data.malls,
  });

  const approve = async (id) => {
    try {
      await api.put(`/admin/malls/${id}/approve`);
      toast.success('Mall approved');
      queryClient.invalidateQueries({ queryKey: ['pendingMalls'] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const reject = async (id) => {
    const reason = window.prompt('Reason for rejection?') || 'Did not meet listing requirements';
    try {
      await api.put(`/admin/malls/${id}/reject`, { reason });
      toast.success('Mall rejected');
      queryClient.invalidateQueries({ queryKey: ['pendingMalls'] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={links} title="Admin" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-6">Pending mall approvals</h1>
          <div className="space-y-4">
            {malls?.map((m) => (
              <div key={m._id} className="card p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-slate-500">{m.address}, {m.city}</p>
                  <p className="text-xs text-slate-400 mt-1">Owner: {m.owner?.name} ({m.owner?.email})</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approve(m._id)} className="bg-emerald/10 text-emerald px-3 py-1.5 rounded-lg text-sm font-medium">Approve</button>
                  <button onClick={() => reject(m._id)} className="bg-rose/10 text-rose px-3 py-1.5 rounded-lg text-sm font-medium">Reject</button>
                </div>
              </div>
            ))}
            {malls?.length === 0 && <p className="text-slate-400">No pending mall registrations.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
