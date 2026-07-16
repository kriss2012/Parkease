import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

export default function SearchMalls() {
  const [keyword, setKeyword] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['malls', keyword, vehicleType],
    queryFn: async () => {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (vehicleType) params.vehicleType = vehicleType;
      const { data } = await api.get('/malls', { params });
      return data.malls;
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-semibold mb-2">Find parking near you</h1>
        <p className="text-slate-500 mb-8">Search by mall, city, or vehicle type — see live slot availability before you book.</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            className="input sm:max-w-sm"
            placeholder="Search mall or city…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <select className="input sm:max-w-xs" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
            <option value="">Any vehicle type</option>
            <option value="2-wheeler">2-Wheeler</option>
            <option value="4-wheeler">4-Wheeler</option>
            <option value="ev">EV</option>
            <option value="handicap-accessible">Handicap Accessible</option>
          </select>
        </div>

        {isLoading ? (
          <p className="text-slate-400">Loading malls…</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data?.map((mall) => (
              <Link to={`/malls/${mall._id}`} key={mall._id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="h-32 rounded-lg bg-gradient-to-br from-signal/20 to-emerald/10 mb-4 flex items-center justify-center text-slate-400 text-sm">
                  {mall.images?.[0] ? (
                    <img src={mall.images[0]} alt={mall.name} className="w-full h-full object-cover rounded-lg" />
                  ) : 'No image'}
                </div>
                <h3 className="font-semibold text-lg">{mall.name}</h3>
                <p className="text-sm text-slate-500">{mall.city}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-medium text-signal">₹{mall.pricing?.hourly}/hr</span>
                  {mall.availableSlots !== undefined && (
                    <span className="text-xs text-emerald font-medium">{mall.availableSlots} slots open</span>
                  )}
                </div>
              </Link>
            ))}
            {data?.length === 0 && <p className="text-slate-400 col-span-full">No malls match your search.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
