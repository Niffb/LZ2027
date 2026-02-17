import React, { useState } from 'react';
import { HotelInfo as HotelInfoType } from '../types';
import { apiFetch, API_BASE } from '../lib/api';
import { Building2, Plus, X, Edit2, Check } from 'lucide-react';

interface HotelInfoProps {
  hotels: HotelInfoType[];
  tripId: number;
  isAdmin: boolean;
  onRefresh: () => void;
}

const HotelInfoCard: React.FC<HotelInfoProps> = ({ hotels, tripId, isAdmin, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [form, setForm] = useState({ name: '', address: '', checkIn: '', checkOut: '', confirmationNumber: '', notes: '' });

  const resetForm = () => {
    setForm({ name: '', address: '', checkIn: '', checkOut: '', confirmationNumber: '', notes: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const url = editingId ? `${API_BASE}/api/hotels/${editingId}` : `${API_BASE}/api/trips/${tripId}/hotels`;
    const method = editingId ? 'PUT' : 'POST';
    await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    resetForm();
    onRefresh();
  };

  const handleEdit = (hotel: HotelInfoType) => {
    setForm({ name: hotel.name, address: hotel.address, checkIn: hotel.check_in, checkOut: hotel.check_out, confirmationNumber: hotel.confirmation_number, notes: hotel.notes });
    setEditingId(hotel.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string | number) => {
    await apiFetch(`${API_BASE}/api/hotels/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Building2 size={16} className="text-primary" />
          Accommodation
        </h2>
        {isAdmin && !showForm && (
          <button onClick={() => setShowForm(true)} className="text-xs text-primary font-medium hover:underline flex items-center gap-1 min-h-[44px]">
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2.5">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Hotel name *" required className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address" className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider">Check-in</label>
              <input type="date" value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider">Check-out</label>
              <input type="date" value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })} className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white" />
            </div>
          </div>
          <input value={form.confirmationNumber} onChange={e => setForm({ ...form, confirmationNumber: e.target.value })} placeholder="Confirmation number" className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white" />
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white" rows={2} />
          <div className="flex gap-2 pt-1">
            <button type="submit" className="bg-primary text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 min-h-[44px]"><Check size={14} /> {editingId ? 'Update' : 'Add'}</button>
            <button type="button" onClick={resetForm} className="text-slate-400 px-3 py-2.5 rounded-xl text-xs hover:bg-slate-100 min-h-[44px] flex items-center"><X size={14} /></button>
          </div>
        </form>
      )}

      {hotels.length === 0 && !showForm && (
        <p className="text-slate-400 text-xs py-2">No accommodation info yet.</p>
      )}

      <div className="space-y-2.5">
        {hotels.map(hotel => (
          <div key={hotel.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800">{hotel.name}</p>
                {hotel.address && <p className="text-xs text-slate-500 mt-0.5">{hotel.address}</p>}
              </div>
              {isAdmin && (
                <div className="flex gap-1 shrink-0 ml-2">
                  <button onClick={() => handleEdit(hotel)} className="p-2 text-slate-400 hover:text-primary min-w-[36px] min-h-[36px] flex items-center justify-center"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(hotel.id)} className="p-2 text-slate-400 hover:text-red-500 min-w-[36px] min-h-[36px] flex items-center justify-center"><X size={14} /></button>
                </div>
              )}
            </div>
            {(hotel.check_in || hotel.check_out) && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                {hotel.check_in && <span>In: {new Date(hotel.check_in).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                {hotel.check_out && <span>Out: {new Date(hotel.check_out).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
              </div>
            )}
            {hotel.confirmation_number && (
              <p className="mt-1.5 text-xs text-slate-500">Ref: <span className="font-mono font-medium text-slate-700">{hotel.confirmation_number}</span></p>
            )}
            {hotel.notes && <p className="mt-1.5 text-xs text-slate-600">{hotel.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelInfoCard;
