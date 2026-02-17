import React, { useState, useEffect, useCallback } from 'react';
import { User, Activity, ItineraryItem, TripDetails, HotelInfo, FlightInfo } from './types';
import { API_BASE } from './lib/api';
import Login from './components/Login';
import Register from './components/Register';
import Countdown from './components/Countdown';
import Itinerary from './components/Itinerary';
import PinBoard from './components/PinBoard';
import Budget from './components/Budget';
import TripForm from './components/TripForm';
import HotelInfoCard from './components/HotelInfo';
import FlightInfoCard from './components/FlightInfo';
import Members from './components/Members';
import { Plus, MapPin, Calendar, LayoutDashboard, LogOut, Settings, DollarSign } from 'lucide-react';

interface Member {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  joinedAt: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(true);

  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [pins, setPins] = useState<Activity[]>([]);
  const [hotels, setHotels] = useState<HotelInfo[]>([]);
  const [flights, setFlights] = useState<FlightInfo[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'itinerary' | 'pins' | 'budget'>('dashboard');
  const [showTripForm, setShowTripForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(false);

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
      if (trips.length === 0) { setTrip(null); return; }

      const t = trips[0];
      const currentTrip: TripDetails = { id: t.id, destination: t.destination, startDate: t.start_date, endDate: t.end_date, travelers: t.travelers };
      setTrip(currentTrip);

      const [itinRes, actRes, hotelRes, flightRes] = await Promise.all([
        fetch(`${API_BASE}/api/trips/${t.id}/itinerary`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/trips/${t.id}/activities`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/trips/${t.id}/hotels`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/trips/${t.id}/flights`, { credentials: 'include' }),
      ]);

      if (itinRes.ok) {
        const items = await itinRes.json();
        setItinerary(items.map((i: any) => ({ id: String(i.id), day: i.day, time: i.time, activity: i.activity, location: i.location, costEUR: i.cost_eur, notes: i.notes })));
      }
      if (actRes.ok) setPins(await actRes.json());
      if (hotelRes.ok) setHotels(await hotelRes.json());
      if (flightRes.ok) setFlights(await flightRes.json());
    } catch (err) {
      console.error('Failed to load trip data:', err);
    }
  }, []);

  useEffect(() => { if (user) loadTripData(); }, [user, loadTripData]);

  const handleLogin = (u: User) => setUser(u);

  const handleLogout = async () => {
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null); setTrip(null); setItinerary([]); setPins([]); setHotels([]); setFlights([]); setMembers([]);
  };

  const addPin = async (pin: Activity) => {
    if (!trip) return;
    try {
      const res = await fetch(`${API_BASE}/api/trips/${trip.id}/activities`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ title: pin.title, description: pin.description, costEUR: pin.costEUR, link: pin.link }) });
      if (res.ok) { const newPin = await res.json(); setPins([...pins, newPin]); }
    } catch (err) { console.error('Failed to add activity:', err); }
  };

  const updatePin = async (updatedPin: Activity) => {
    setPins(pins.map(p => p.id === updatedPin.id ? updatedPin : p));
  };

  const addToItinerary = async (item: ItineraryItem) => {
    if (!trip) return;
    try {
      const res = await fetch(`${API_BASE}/api/trips/${trip.id}/itinerary`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ day: item.day, time: item.time, activity: item.activity, location: item.location, costEUR: item.costEUR, notes: item.notes }) });
      if (res.ok) {
        const n = await res.json();
        setItinerary([...itinerary, { id: String(n.id), day: n.day, time: n.time, activity: n.activity, location: n.location, costEUR: n.cost_eur, notes: n.notes }]);
      }
    } catch (err) { console.error('Failed to add itinerary item:', err); }
  };

  const addSuggestionToItinerary = (pin: Activity) => {
    addToItinerary({ id: '', day: 1, time: '10:00', activity: pin.title, location: pin.description, costEUR: pin.costEUR });
  };

  const handleTripSave = (savedTrip: TripDetails) => {
    setTrip(savedTrip); setShowTripForm(false); setEditingTrip(false); loadTripData();
  };

  const refreshTravelInfo = async () => {
    if (!trip) return;
    const [hotelRes, flightRes] = await Promise.all([
      fetch(`${API_BASE}/api/trips/${trip.id}/hotels`, { credentials: 'include' }),
      fetch(`${API_BASE}/api/trips/${trip.id}/flights`, { credentials: 'include' }),
    ]);
    if (hotelRes.ok) setHotels(await hotelRes.json());
    if (flightRes.ok) setFlights(await flightRes.json());
  };

  const nightsCount = trip ? Math.max(0, Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))) : 0;

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100"><p className="text-sm text-slate-400">Loading...</p></div>;
  }

  if (!user) {
    if (authView === 'register') return <Register onRegister={handleLogin} onSwitchToLogin={() => setAuthView('login')} />;
    return <Login onLogin={handleLogin} onSwitchToRegister={() => setAuthView('register')} />;
  }

  if (!trip && !showTripForm) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">No Trip Planned</h1>
          <p className="text-sm text-slate-500 mb-6">{user.isAdmin ? 'Create your first trip to get started.' : 'An admin needs to create a trip first.'}</p>
          {user.isAdmin && (
            <button onClick={() => setShowTripForm(true)} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto hover:bg-primary-dark transition-colors">
              <Plus size={16} /> Create Trip
            </button>
          )}
          <button onClick={handleLogout} className="mt-4 text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 mx-auto"><LogOut size={12} /> Sign out</button>
        </div>
      </div>
    );
  }

  if (showTripForm || editingTrip) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-lg mx-auto">
          <TripForm trip={editingTrip ? trip : null} onSave={handleTripSave} onCancel={() => { setShowTripForm(false); setEditingTrip(false); }} />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as const, label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { id: 'itinerary' as const, label: 'Itinerary', icon: <Calendar size={16} /> },
    { id: 'pins' as const, label: 'Suggestions', icon: <MapPin size={16} /> },
    { id: 'budget' as const, label: 'Budget', icon: <DollarSign size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${activeTab === tab.id ? 'bg-primary-light text-primary' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-slate-800">{user.name}</p>
              <p className="text-[10px] text-slate-400">{user.isAdmin ? 'Admin' : 'Member'}</p>
            </div>
            {user.isAdmin && (
              <button onClick={() => setEditingTrip(true)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-light rounded-md transition-colors" title="Edit Trip">
                <Settings size={16} />
              </button>
            )}
            <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden flex border-t border-slate-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 flex justify-center ${activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}
            >
              {tab.icon}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && trip && (
          <div className="space-y-5">
            {/* Hero + Countdown */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              <div className="lg:col-span-3 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
                <h1 className="text-2xl font-bold mb-1">{trip.destination}</h1>
                <p className="text-indigo-200 text-sm flex items-center gap-1.5 mb-5">
                  <Calendar size={14} />
                  {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
                </p>
                <div className="flex gap-3">
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg px-3.5 py-2">
                    <span className="block text-xl font-bold">{trip.travelers}</span>
                    <span className="text-[10px] text-indigo-200 uppercase tracking-wider">Travelers</span>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg px-3.5 py-2">
                    <span className="block text-xl font-bold">{nightsCount}</span>
                    <span className="text-[10px] text-indigo-200 uppercase tracking-wider">Nights</span>
                  </div>
                </div>
              </div>
              <Countdown targetDate={trip.startDate} />
            </div>

            {/* Info cards row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <HotelInfoCard hotels={hotels} tripId={trip.id} isAdmin={user.isAdmin} onRefresh={refreshTravelInfo} />
              <FlightInfoCard flights={flights} tripId={trip.id} isAdmin={user.isAdmin} onRefresh={refreshTravelInfo} />
              <Members members={members} />
            </div>

            {/* Suggestions + Upcoming */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    Top Suggestions
                  </h2>
                  <button onClick={() => setActiveTab('pins')} className="text-[11px] text-primary font-medium hover:underline">View all</button>
                </div>
                <div className="space-y-2.5">
                  {pins.length === 0 && <p className="text-slate-400 text-xs">No suggestions yet.</p>}
                  {pins.slice(0, 3).map(pin => (
                    <div key={pin.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{pin.title}</p>
                        <p className="text-[11px] text-slate-500">By {pin.proposedBy}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{Object.values(pin.votes).filter(v => v === 'yes').length} yes</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    Upcoming
                  </h2>
                  <button onClick={() => setActiveTab('itinerary')} className="text-[11px] text-primary font-medium hover:underline">Full plan</button>
                </div>
                <div className="space-y-2.5">
                  {itinerary.length === 0 && <p className="text-slate-400 text-xs">No itinerary items yet.</p>}
                  {itinerary.slice(0, 3).map(item => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-10 text-center bg-indigo-50 border border-indigo-100 rounded-lg py-1 shrink-0">
                        <span className="block text-[9px] font-bold text-indigo-400 uppercase">Day</span>
                        <span className="block text-sm font-bold text-indigo-700">{item.day}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.activity}</p>
                        <p className="text-[11px] text-slate-500">{item.time} · {item.location}</p>
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
    </div>
  );
}
