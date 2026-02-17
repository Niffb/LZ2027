import React, { useState } from 'react';
import { FlightInfo as FlightInfoType } from '../types';
import { apiFetch, API_BASE } from '../lib/api';
import { Plane, Plus, X, Edit2, Check } from 'lucide-react';

interface FlightInfoProps {
  flights: FlightInfoType[];
  tripId: number;
  isAdmin: boolean;
  onRefresh: () => void;
}

const FlightInfoCard: React.FC<FlightInfoProps> = ({ flights, tripId, isAdmin, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [form, setForm] = useState({ airline: '', flightNumber: '', departureAirport: '', arrivalAirport: '', departureTime: '', arrivalTime: '', bookingReference: '', notes: '' });

  const resetForm = () => {
    setForm({ airline: '', flightNumber: '', departureAirport: '', arrivalAirport: '', departureTime: '', arrivalTime: '', bookingReference: '', notes: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.airline) return;
    const url = editingId ? `${API_BASE}/api/flights/${editingId}` : `${API_BASE}/api/trips/${tripId}/flights`;
    const method = editingId ? 'PUT' : 'POST';
    await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    resetForm();
    onRefresh();
  };

  const handleEdit = (flight: FlightInfoType) => {
    setForm({ airline: flight.airline, flightNumber: flight.flight_number, departureAirport: flight.departure_airport, arrivalAirport: flight.arrival_airport, departureTime: flight.departure_time, arrivalTime: flight.arrival_time, bookingReference: flight.booking_reference, notes: flight.notes });
    setEditingId(flight.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string | number) => {
    await apiFetch(`${API_BASE}/api/flights/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Plane size={16} className="text-primary" />
          Flights
        </h2>
        {isAdmin && !showForm && (
          <button onClick={() => setShowForm(true)} className="text-xs text-primary font-medium hover:underline flex items-center gap-1 min-h-[44px]">
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <input value={form.airline} onChange={e => setForm({ ...form, airline: e.target.value })} placeholder="Airline *" required className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            <input value={form.flightNumber} onChange={e => setForm({ ...form, flightNumber: e.target.value })} placeholder="Flight #" className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <input value={form.departureAirport} onChange={e => setForm({ ...form, departureAirport: e.target.value })} placeholder="From (e.g. LGW)" className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white" />
            <input value={form.arrivalAirport} onChange={e => setForm({ ...form, arrivalAirport: e.target.value })} placeholder="To (e.g. ACE)" className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider">Departure</label>
              <input type="datetime-local" value={form.departureTime} onChange={e => setForm({ ...form, departureTime: e.target.value })} className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider">Arrival</label>
              <input type="datetime-local" value={form.arrivalTime} onChange={e => setForm({ ...form, arrivalTime: e.target.value })} className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white" />
            </div>
          </div>
          <input value={form.bookingReference} onChange={e => setForm({ ...form, bookingReference: e.target.value })} placeholder="Booking reference" className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white" />
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white" rows={2} />
          <div className="flex gap-2 pt-1">
            <button type="submit" className="bg-primary text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 min-h-[44px]"><Check size={14} /> {editingId ? 'Update' : 'Add'}</button>
            <button type="button" onClick={resetForm} className="text-slate-400 px-3 py-2.5 rounded-xl text-xs hover:bg-slate-100 min-h-[44px] flex items-center"><X size={14} /></button>
          </div>
        </form>
      )}

      {flights.length === 0 && !showForm && (
        <p className="text-slate-400 text-xs py-2">No flight info yet.</p>
      )}

      <div className="space-y-2.5">
        {flights.map(flight => (
          <div key={flight.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800">{flight.airline}{flight.flight_number && ` ${flight.flight_number}`}</p>
                {(flight.departure_airport || flight.arrival_airport) && (
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <span className="font-semibold text-slate-700">{flight.departure_airport}</span>
                    <span className="text-slate-300">→</span>
                    <span className="font-semibold text-slate-700">{flight.arrival_airport}</span>
                  </p>
                )}
              </div>
              {isAdmin && (
                <div className="flex gap-1 shrink-0 ml-2">
                  <button onClick={() => handleEdit(flight)} className="p-2 text-slate-400 hover:text-primary min-w-[36px] min-h-[36px] flex items-center justify-center"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(flight.id)} className="p-2 text-slate-400 hover:text-red-500 min-w-[36px] min-h-[36px] flex items-center justify-center"><X size={14} /></button>
                </div>
              )}
            </div>
            {(flight.departure_time || flight.arrival_time) && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                {flight.departure_time && <span>Dep: {new Date(flight.departure_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} {new Date(flight.departure_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>}
                {flight.arrival_time && <span>Arr: {new Date(flight.arrival_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} {new Date(flight.arrival_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>}
              </div>
            )}
            {flight.booking_reference && (
              <p className="mt-1.5 text-xs text-slate-500">Ref: <span className="font-mono font-medium text-slate-700">{flight.booking_reference}</span></p>
            )}
            {flight.notes && <p className="mt-1.5 text-xs text-slate-600 font-medium">{flight.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlightInfoCard;
