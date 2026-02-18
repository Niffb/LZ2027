import React, { useState } from 'react';
import { ItineraryItem, TripDetails, User } from '../types';
import { Plus, MapPin, Euro, X } from 'lucide-react';

interface ItineraryProps {
  items: ItineraryItem[];
  onAdd: (item: ItineraryItem) => void;
  onDelete: (id: string) => void;
  trip: TripDetails;
  currentUser: User;
}

const Itinerary: React.FC<ItineraryProps> = ({ items, onAdd, onDelete, trip, currentUser }) => {
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
    <div className="space-y-3 sm:space-y-5">
      <div className="card p-4 sm:p-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Itinerary</h2>
            <p className="text-xs text-slate-500 mt-0.5">The day-by-day plan.</p>
          </div>
          {currentUser.isAdmin && (
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark active:scale-[0.98] transition-all min-h-[44px] shadow-sm shadow-indigo-200">
              <Plus size={14} /> Add item
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="card p-4 sm:p-5">
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Day</label>
                <input type="number" min="1" className="w-full mt-1 px-3 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={newItem.day} onChange={e => setNewItem({...newItem, day: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Time</label>
                <input type="time" className="w-full mt-1 px-3 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={newItem.time} onChange={e => setNewItem({...newItem, time: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Activity</label>
              <input type="text" placeholder="e.g. Beach day, Museum Tour" className="w-full mt-1 px-3 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={newItem.activity} onChange={e => setNewItem({...newItem, activity: e.target.value})} required />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Location</label>
              <input type="text" placeholder="e.g. Playa Blanca" className="w-full mt-1 px-3 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cost per person (€)</label>
              <input type="number" className="w-full mt-1 px-3 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={newItem.costEUR} onChange={e => setNewItem({...newItem, costEUR: parseFloat(e.target.value)})} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-slate-500 text-sm font-medium hover:bg-slate-50 rounded-xl min-h-[48px] flex items-center justify-center gap-1">
                <X size={14} /> Cancel
              </button>
              <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-semibold min-h-[48px] shadow-sm shadow-indigo-200 active:scale-[0.98] transition-all">Save</button>
            </div>
          </form>
        </div>
      )}

      {sortedItems.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-12">No itinerary items yet.</p>
      )}

      <div className="space-y-4">
        {[...new Set(sortedItems.map(i => i.day))].map(day => (
          <div key={day} className="card p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                {day}
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Day {day}</h3>
            </div>
            <div className="space-y-2 pl-0 sm:pl-[52px]">
              {sortedItems.filter(i => i.day === day).map(item => (
                <div key={item.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded-lg border border-slate-100 shrink-0">{item.time}</span>
                        <p className="text-sm font-medium text-slate-800 truncate">{item.activity}</p>
                      </div>
                      {item.location && (
                        <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10}/> {item.location}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.costEUR > 0 && (
                        <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-100 flex items-center gap-0.5">
                          <Euro size={10} /> {item.costEUR}
                        </span>
                      )}
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
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
