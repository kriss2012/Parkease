import React, { useState } from 'react';
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

export default function ManageUsers() {
  const [keyword, setKeyword] = useState('');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['adminUsers', keyword],
    queryFn: async () => (await api.get('/admin/users', { params: { keyword } })).data.users,
  });

  const toggleSuspend = async (id) => {
    try {
      await api.put(`/admin/users/${id}/suspend`);
      toast.success('Updated');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex gap-8">
        <Sidebar links={links} title="Admin" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-6">Users & owners</h1>
          <input className="input max-w-sm mb-6" placeholder="Search by name or email…" value={keyword} onChange={(e) => setKeyword(e.target.value)} />

          <div className="card divide-y divide-slate-100">
            {data?.map((u) => (
              <div key={u._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{u.name} <span className="text-xs text-slate-400 capitalize">({u.role})</span></p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                </div>
                <button
                  onClick={() => toggleSuspend(u._id)}
                  className={`text-sm px-3 py-1.5 rounded-lg font-medium ${u.isSuspended ? 'bg-emerald/10 text-emerald' : 'bg-rose/10 text-rose'}`}
                >
                  {u.isSuspended ? 'Reinstate' : 'Suspend'}
                </button>
              </div>
            ))}
            {data?.length === 0 && <p className="p-4 text-slate-400 text-sm">No users found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
