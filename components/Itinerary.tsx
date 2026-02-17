import React, { useState } from 'react';
import { ItineraryItem, TripDetails, User } from '../types';
import { Plus, MapPin, Euro } from 'lucide-react';

interface ItineraryProps {
  items: ItineraryItem[];
  onAdd: (item: ItineraryItem) => void;
  trip: TripDetails;
  currentUser: User;
}

const Itinerary: React.FC<ItineraryProps> = ({ items, onAdd, trip, currentUser }) => {
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ItineraryItem>>({ day: 1, time: '10:00', activity: '', location: '', costEUR: 0 });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.activity) return;
    onAdd({ ...newItem, id: Math.random().toString(36).substr(2, 9) } as ItineraryItem);
    setShowForm(false);
    setNewItem({ day: 1, time: '10:00', activity: '', location: '', costEUR: 0 });
  };

  const sortedItems = [...items].sort((a, b) => a.day !== b.day ? a.day - b.day : a.time.localeCompare(b.time));

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Itinerary</h2>
          <p className="text-xs text-slate-500 mt-0.5">The day-by-day plan.</p>
        </div>
        {currentUser.isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-dark transition-colors">
            <Plus size={14} /> Add item
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleManualSubmit} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Day</label>
              <input type="number" min="1" className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white" value={newItem.day} onChange={e => setNewItem({...newItem, day: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Time</label>
              <input type="time" className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white" value={newItem.time} onChange={e => setNewItem({...newItem, time: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Activity</label>
              <input type="text" placeholder="e.g. Museum Tour" className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white" value={newItem.activity} onChange={e => setNewItem({...newItem, activity: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cost (€)</label>
              <input type="number" className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white" value={newItem.costEUR} onChange={e => setNewItem({...newItem, costEUR: parseFloat(e.target.value)})} />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button type="submit" className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Save</button>
          </div>
        </form>
      )}

      {sortedItems.length === 0 && (
        <p className="text-slate-400 text-xs text-center py-8">No itinerary items yet.</p>
      )}

      <div className="space-y-6">
        {[...new Set(sortedItems.map(i => i.day))].map(day => (
          <div key={day} className="relative pl-6 border-l-2 border-indigo-100">
            <div className="absolute -left-[7px] top-0 w-3 h-3 bg-primary rounded-full"></div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Day {day}</h3>
            <div className="space-y-2">
              {sortedItems.filter(i => i.day === day).map(item => (
                <div key={item.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <span className="text-xs font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">{item.time}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.activity}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10}/> {item.location}</p>
                    </div>
                  </div>
                  {item.costEUR > 0 && (
                    <span className="text-xs font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-100 flex items-center gap-1 shrink-0">
                      <Euro size={10} /> {item.costEUR}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Itinerary;
