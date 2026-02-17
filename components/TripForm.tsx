import React, { useState } from 'react';
import { TripDetails } from '../types';
import { API_BASE } from '../lib/api';
import { Check, X } from 'lucide-react';

interface TripFormProps {
  trip?: TripDetails | null;
  onSave: (trip: TripDetails) => void;
  onCancel: () => void;
}

const TripForm: React.FC<TripFormProps> = ({ trip, onSave, onCancel }) => {
  const [destination, setDestination] = useState(trip?.destination || '');
  const [startDate, setStartDate] = useState(trip?.startDate ? trip.startDate.slice(0, 10) : '');
  const [endDate, setEndDate] = useState(trip?.endDate ? trip.endDate.slice(0, 10) : '');
  const [travelers, setTravelers] = useState(trip?.travelers || 2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !startDate || !endDate) return;
    setLoading(true);
    setError('');

    try {
      const url = trip ? `${API_BASE}/api/trips/${trip.id}` : `${API_BASE}/api/trips`;
      const method = trip ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ destination, startDate, endDate, travelers })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save trip');
        return;
      }
      onSave({ id: data.id, destination: data.destination, startDate: data.start_date, endDate: data.end_date, travelers: data.travelers });
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-5">{trip ? 'Edit Trip' : 'Create Trip'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Destination</label>
          <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Santorini, Greece" required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-slate-50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-slate-50" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Travelers</label>
          <input type="number" min={1} value={travelers} onChange={e => setTravelers(parseInt(e.target.value) || 1)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-slate-50" />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50">
            <Check size={14} /> {loading ? 'Saving...' : trip ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={onCancel} className="text-slate-500 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 flex items-center gap-1.5">
            <X size={14} /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TripForm;
