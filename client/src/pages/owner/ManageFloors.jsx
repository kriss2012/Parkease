import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import SlotGrid from '../../components/SlotGrid';

export default function ManageFloors() {
  const { mallId } = useParams();
  const queryClient = useQueryClient();
  const [activeFloor, setActiveFloor] = useState(null);
  const [newFloor, setNewFloor] = useState({ name: '', level: 0 });
  const [bulkForm, setBulkForm] = useState({ prefix: '', count: 10, vehicleType: '4-wheeler' });

  const { data: floors } = useQuery({
    queryKey: ['floors', mallId],
    queryFn: async () => (await api.get(`/floors/mall/${mallId}`)).data.floors,
  });

  const currentFloorId = activeFloor || floors?.[0]?._id;

  const { data: slots } = useQuery({
    queryKey: ['slots', currentFloorId],
    queryFn: async () => (await api.get(`/slots/floor/${currentFloorId}`)).data.slots,
    enabled: !!currentFloorId,
  });

  const createFloor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/floors', { mall: mallId, name: newFloor.name, level: Number(newFloor.level) });
      toast.success('Floor added');
      setNewFloor({ name: '', level: 0 });
      queryClient.invalidateQueries({ queryKey: ['floors', mallId] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add floor');
    }
  };

  const createSlots = async (e) => {
    e.preventDefault();
    if (!currentFloorId) return toast.error('Select a floor first');
    try {
      await api.post('/slots/bulk', { floor: currentFloorId, ...bulkForm, count: Number(bulkForm.count) });
      toast.success('Slots created');
      queryClient.invalidateQueries({ queryKey: ['slots', currentFloorId] });
      queryClient.invalidateQueries({ queryKey: ['floors', mallId] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create slots');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-semibold mb-8">Floors & slots</h1>

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <form onSubmit={createFloor} className="card p-5 space-y-3">
            <h2 className="font-semibold">Add a floor</h2>
            <input className="input" placeholder="e.g. Basement, Ground, First" value={newFloor.name}
              onChange={(e) => setNewFloor({ ...newFloor, name: e.target.value })} required />
            <input className="input" type="number" placeholder="Level (e.g. -1, 0, 1)" value={newFloor.level}
              onChange={(e) => setNewFloor({ ...newFloor, level: e.target.value })} required />
            <button className="btn-secondary w-full">Add floor</button>
          </form>

          <form onSubmit={createSlots} className="card p-5 space-y-3">
            <h2 className="font-semibold">Bulk-create slots on {floors?.find(f => f._id === currentFloorId)?.name || 'selected floor'}</h2>
            <input className="input" placeholder="Slot prefix, e.g. G" value={bulkForm.prefix}
              onChange={(e) => setBulkForm({ ...bulkForm, prefix: e.target.value })} required />
            <input className="input" type="number" placeholder="Count" value={bulkForm.count}
              onChange={(e) => setBulkForm({ ...bulkForm, count: e.target.value })} required />
            <select className="input" value={bulkForm.vehicleType} onChange={(e) => setBulkForm({ ...bulkForm, vehicleType: e.target.value })}>
              <option value="4-wheeler">4-Wheeler</option>
              <option value="2-wheeler">2-Wheeler</option>
              <option value="ev">EV</option>
              <option value="handicap-accessible">Handicap Accessible</option>
            </select>
            <button className="btn-secondary w-full">Create slots</button>
          </form>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Slot map</h2>
            <div className="flex gap-2">
              {floors?.map((f) => (
                <button key={f._id} onClick={() => setActiveFloor(f._id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${currentFloorId === f._id ? 'bg-signal text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {f.name} ({f.availableSlots}/{f.totalSlots})
                </button>
              ))}
            </div>
          </div>
          <SlotGrid slots={slots} />
        </div>
      </div>
    </div>
  );
}
