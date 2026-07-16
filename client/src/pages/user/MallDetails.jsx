import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import SlotGrid from '../../components/SlotGrid';
import { useAuth } from '../../context/AuthContext';

export default function MallDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeFloor, setActiveFloor] = useState(null);

  const { data: mallData } = useQuery({
    queryKey: ['mall', id],
    queryFn: async () => (await api.get(`/malls/${id}`)).data,
  });

  const { data: floors } = useQuery({
    queryKey: ['floors', id],
    queryFn: async () => (await api.get(`/floors/mall/${id}`)).data.floors,
    enabled: !!id,
  });

  const currentFloorId = activeFloor || floors?.[0]?._id;

  const { data: slots } = useQuery({
    queryKey: ['slots', currentFloorId],
    queryFn: async () => (await api.get(`/slots/floor/${currentFloorId}`)).data.slots,
    enabled: !!currentFloorId,
  });

  const mall = mallData?.mall;
  if (!mall) return <div className="min-h-screen bg-slate-50"><Navbar /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-semibold">{mall.name}</h1>
        <p className="text-slate-500 mt-1">{mall.address}, {mall.city}</p>

        <div className="grid sm:grid-cols-3 gap-4 my-8">
          <div className="card p-4">
            <p className="text-xs text-slate-400 uppercase">Hourly</p>
            <p className="font-display text-xl font-semibold">₹{mall.pricing.hourly}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-slate-400 uppercase">Daily</p>
            <p className="font-display text-xl font-semibold">₹{mall.pricing.daily}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-slate-400 uppercase">Monthly</p>
            <p className="font-display text-xl font-semibold">₹{mall.pricing.monthly}</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Live availability</h2>
            <div className="flex gap-2">
              {floors?.map((f) => (
                <button
                  key={f._id}
                  onClick={() => setActiveFloor(f._id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${currentFloorId === f._id ? 'bg-signal text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
          <SlotGrid slots={slots} />
        </div>

        <div className="mt-8">
          {user?.role === 'user' ? (
            <Link to={`/book/${mall._id}`} className="btn-primary inline-block">Book a slot</Link>
          ) : !user ? (
            <Link to="/login" className="btn-primary inline-block">Log in to book</Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
