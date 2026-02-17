import React, { useState, useEffect, useCallback } from 'react';
import { User, Activity, ItineraryItem, TripDetails, HotelInfo, FlightInfo } from './types';
import { API_BASE } from './lib/api';
import Login from './components/Login';
import Countdown from './components/Countdown';
import Itinerary from './components/Itinerary';
import PinBoard from './components/PinBoard';
import Budget from './components/Budget';
import HotelInfoCard from './components/HotelInfo';
import FlightInfoCard from './components/FlightInfo';
import Members from './components/Members';
import { MapPin, Calendar, LayoutDashboard, LogOut, DollarSign, Sun } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  isAdmin: boolean;
  joinedAt: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [pins, setPins] = useState<Activity[]>([]);
  const [hotels, setHotels] = useState<HotelInfo[]>([]);
  const [flights, setFlights] = useState<FlightInfo[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'itinerary' | 'pins' | 'budget'>('dashboard');

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setUser(data); })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  const loadTripData = useCallback(async () => {
    try {
      const [tripsRes, membersRes] = await Promise.all([
        fetch(`${API_BASE}/api/trips`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/members`, { credentials: 'include' }),
      ]);

      if (membersRes.ok) setMembers(await membersRes.json());

      if (!tripsRes.ok) return;
      const trips = await tripsRes.json();
      if (trips.length === 0) return;

      const t = trips[0];
      const currentTrip: TripDetails = {
        id: t.id,
        destination: t.destination,
        startDate: t.start_date,
        endDate: t.end_date,
        travelers: t.travelers,
      };
      setTrip(currentTrip);

      const [itinRes, actRes, hotelRes, flightRes] = await Promise.all([
        fetch(`${API_BASE}/api/trips/${t.id}/itinerary`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/trips/${t.id}/activities`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/trips/${t.id}/hotels`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/trips/${t.id}/flights`, { credentials: 'include' }),
      ]);

      if (itinRes.ok) {
        const items = await itinRes.json();
        setItinerary(items.map((i: any) => ({
          id: String(i.id),
          day: i.day,
          time: i.time,
          activity: i.activity,
          location: i.location,
          costEUR: i.cost_eur,
          notes: i.notes,
        })));
      }
      if (actRes.ok) setPins(await actRes.json());
      if (hotelRes.ok) setHotels(await hotelRes.json());
      if (flightRes.ok) setFlights(await flightRes.json());
    } catch (err) {
      console.error('Failed to load trip data:', err);
    }
  }, []);

  useEffect(() => { if (user) loadTripData(); }, [user, loadTripData]);

  const handleLogout = async () => {
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    setTrip(null);
    setItinerary([]);
    setPins([]);
    setHotels([]);
    setFlights([]);
    setMembers([]);
  };

  const addPin = async (pin: Activity) => {
    if (!trip) return;
    try {
      const res = await fetch(`${API_BASE}/api/trips/${trip.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: pin.title, description: pin.description, costEUR: pin.costEUR, link: pin.link }),
      });
      if (res.ok) { const newPin = await res.json(); setPins([...pins, newPin]); }
    } catch (err) { console.error('Failed to add activity:', err); }
  };

  const updatePin = async (updatedPin: Activity) => {
    setPins(pins.map(p => p.id === updatedPin.id ? updatedPin : p));
  };

  const addToItinerary = async (item: ItineraryItem) => {
    if (!trip) return;
    try {
      const res = await fetch(`${API_BASE}/api/trips/${trip.id}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ day: item.day, time: item.time, activity: item.activity, location: item.location, costEUR: item.costEUR, notes: item.notes }),
      });
      if (res.ok) {
        const n = await res.json();
        setItinerary([...itinerary, {
          id: String(n.id),
          day: n.day,
          time: n.time,
          activity: n.activity,
          location: n.location,
          costEUR: n.cost_eur,
          notes: n.notes,
        }]);
      }
    } catch (err) { console.error('Failed to add itinerary item:', err); }
  };

  const addSuggestionToItinerary = (pin: Activity) => {
    addToItinerary({ id: '', day: 1, time: '10:00', activity: pin.title, location: pin.description, costEUR: pin.costEUR });
  };

  const nightsCount = trip
    ? Math.max(0, Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <Sun size={28} className="text-amber-400 mx-auto mb-3 animate-spin" style={{ animationDuration: '3s' }} />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const tabs = [
    { id: 'dashboard' as const, label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'itinerary' as const, label: 'Itinerary', icon: <Calendar size={18} /> },
    { id: 'pins' as const, label: 'Suggestions', icon: <MapPin size={18} /> },
    { id: 'budget' as const, label: 'Budget', icon: <DollarSign size={18} /> },
  ];

  return (
    <div className="min-h-screen min-h-dvh bg-slate-100 pb-20 md:pb-0">
      {/* Top nav - desktop only */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-800 md:hidden">Lanzarote 2027</span>
          <div className="hidden md:flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 min-h-[44px] ${activeTab === tab.id ? 'bg-primary-light text-primary' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-slate-800">{user.name}</p>
              <p className="text-[10px] text-slate-400">{user.isAdmin ? 'Admin' : 'Member'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {activeTab === 'dashboard' && trip && (
          <div className="space-y-3 sm:space-y-5">
            {/* Hero + Countdown */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-5">
              <div className="lg:col-span-3 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>
                <h1 className="text-2xl sm:text-3xl font-extrabold mb-1 tracking-tight">{trip.destination}</h1>
                <p className="text-indigo-200 text-sm flex items-center gap-1.5 mb-5">
                  <Calendar size={14} />
                  {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
                    <span className="block text-xl font-bold">{trip.travelers}</span>
                    <span className="text-[10px] text-indigo-200 uppercase tracking-wider">Travellers</span>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
                    <span className="block text-xl font-bold">{nightsCount}</span>
                    <span className="text-[10px] text-indigo-200 uppercase tracking-wider">Nights</span>
                  </div>
                </div>
              </div>
              <Countdown targetDate={trip.startDate} />
            </div>

            {/* Info cards - stack on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              <HotelInfoCard hotels={hotels} tripId={trip.id} isAdmin={user.isAdmin} onRefresh={loadTripData} />
              <FlightInfoCard flights={flights} tripId={trip.id} isAdmin={user.isAdmin} onRefresh={loadTripData} />
              <Members members={members} />
            </div>

            {/* Suggestions + Upcoming - stack on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5">
              <div className="card p-4 sm:p-5">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    Top Suggestions
                  </h2>
                  <button onClick={() => setActiveTab('pins')} className="text-xs text-primary font-medium hover:underline min-h-[44px] flex items-center">View all</button>
                </div>
                <div className="space-y-2">
                  {pins.length === 0 && <p className="text-slate-400 text-xs py-2">No suggestions yet.</p>}
                  {pins.slice(0, 3).map(pin => (
                    <div key={pin.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="text-sm font-medium text-slate-800 truncate">{pin.title}</p>
                        <p className="text-[11px] text-slate-500">By {pin.proposedBy}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0">
                        {Object.values(pin.votes).filter(v => v === 'yes').length} yes
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-4 sm:p-5">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    Upcoming
                  </h2>
                  <button onClick={() => setActiveTab('itinerary')} className="text-xs text-primary font-medium hover:underline min-h-[44px] flex items-center">Full plan</button>
                </div>
                <div className="space-y-2">
                  {itinerary.length === 0 && <p className="text-slate-400 text-xs py-2">No itinerary items yet.</p>}
                  {itinerary.slice(0, 3).map(item => (
                    <div key={item.id} className="flex gap-3 items-center p-2 rounded-xl">
                      <div className="w-11 text-center bg-indigo-50 border border-indigo-100 rounded-xl py-1.5 shrink-0">
                        <span className="block text-[9px] font-bold text-indigo-400 uppercase">Day</span>
                        <span className="block text-sm font-bold text-indigo-700">{item.day}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{item.activity}</p>
                        <p className="text-[11px] text-slate-500 truncate">{item.time} · {item.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Budget itinerary={itinerary} pins={pins} travelerCount={trip.travelers} currentUserName={user.name} />
          </div>
        )}

        {activeTab === 'itinerary' && trip && (
          <Itinerary items={itinerary} onAdd={addToItinerary} trip={trip} currentUser={user} />
        )}

        {activeTab === 'pins' && trip && (
          <PinBoard pins={pins} currentUser={user} onAddPin={addPin} onUpdatePin={updatePin} onAddToItinerary={addSuggestionToItinerary} tripLocation={trip.destination} />
        )}

        {activeTab === 'budget' && trip && (
          <Budget itinerary={itinerary} pins={pins} travelerCount={trip.travelers} currentUserName={user.name} expanded={true} />
        )}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-slate-400'}`}
              aria-label={tab.label}
            >
              {tab.icon}
              <span className={`text-[10px] mt-0.5 ${activeTab === tab.id ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
