import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/trips/:tripId/hotels', requireAuth, async (req, res) => {
  const supabase = (req as any).db;
  const tripId = parseInt(req.params.tripId, 10);
  const { data, error } = await supabase.from('hotels').select('*').eq('trip_id', tripId).order('check_in');
  if (error) return res.status(500).json({ error: error.message });
  res.json((data ?? []).map((h: any) => ({
    id: h.id,
    trip_id: h.trip_id,
    name: h.name,
    address: h.address ?? '',
    check_in: h.check_in ?? '',
    check_out: h.check_out ?? '',
    confirmation_number: h.confirmation_number ?? '',
    notes: h.notes ?? '',
  })));
});

router.post('/trips/:tripId/hotels', requireAdmin, async (req, res) => {
  const supabase = (req as any).db;
  const tripId = parseInt(req.params.tripId, 10);
  const { name, address, checkIn, checkOut, confirmationNumber, notes } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Hotel name is required' });
  const { data, error } = await supabase.from('hotels').insert({
    trip_id: tripId,
    name: name.trim(),
    address: address?.trim() ?? null,
    check_in: checkIn || null,
    check_out: checkOut || null,
    confirmation_number: confirmationNumber?.trim() ?? null,
    notes: notes?.trim() ?? null,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data.id, trip_id: data.trip_id, name: data.name, address: data.address ?? '', check_in: data.check_in ?? '', check_out: data.check_out ?? '', confirmation_number: data.confirmation_number ?? '', notes: data.notes ?? '' });
});

router.put('/hotels/:id', requireAdmin, async (req, res) => {
  const supabase = (req as any).db;
  const { name, address, checkIn, checkOut, confirmationNumber, notes } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Hotel name is required' });
  const { data, error } = await supabase.from('hotels').update({
    name: name.trim(),
    address: address?.trim() ?? null,
    check_in: checkIn || null,
    check_out: checkOut || null,
    confirmation_number: confirmationNumber?.trim() ?? null,
    notes: notes?.trim() ?? null,
  }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data.id, trip_id: data.trip_id, name: data.name, address: data.address ?? '', check_in: data.check_in ?? '', check_out: data.check_out ?? '', confirmation_number: data.confirmation_number ?? '', notes: data.notes ?? '' });
});

router.delete('/hotels/:id', requireAdmin, async (req, res) => {
  const supabase = (req as any).db;
  const { error } = await supabase.from('hotels').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

router.get('/trips/:tripId/flights', requireAuth, async (req, res) => {
  const supabase = (req as any).db;
  const tripId = parseInt(req.params.tripId, 10);
  const { data, error } = await supabase.from('flights').select('*').eq('trip_id', tripId).order('departure_time');
  if (error) return res.status(500).json({ error: error.message });
  res.json((data ?? []).map((f: any) => ({
    id: f.id,
    trip_id: f.trip_id,
    airline: f.airline,
    flight_number: f.flight_number ?? '',
    departure_airport: f.departure_airport ?? '',
    arrival_airport: f.arrival_airport ?? '',
    departure_time: f.departure_time ? new Date(f.departure_time).toISOString().slice(0, 16) : '',
    arrival_time: f.arrival_time ? new Date(f.arrival_time).toISOString().slice(0, 16) : '',
    booking_reference: f.booking_reference ?? '',
    notes: f.notes ?? '',
  })));
});

router.post('/trips/:tripId/flights', requireAdmin, async (req, res) => {
  const supabase = (req as any).db;
  const tripId = parseInt(req.params.tripId, 10);
  const { airline, flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, bookingReference, notes } = req.body;
  if (!airline?.trim()) return res.status(400).json({ error: 'Airline is required' });
  const { data, error } = await supabase.from('flights').insert({
    trip_id: tripId,
    airline: airline.trim(),
    flight_number: flightNumber?.trim() ?? null,
    departure_airport: departureAirport?.trim() ?? null,
    arrival_airport: arrivalAirport?.trim() ?? null,
    departure_time: departureTime || null,
    arrival_time: arrivalTime || null,
    booking_reference: bookingReference?.trim() ?? null,
    notes: notes?.trim() ?? null,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data.id, trip_id: data.trip_id, airline: data.airline, flight_number: data.flight_number ?? '', departure_airport: data.departure_airport ?? '', arrival_airport: data.arrival_airport ?? '', departure_time: data.departure_time ? new Date(data.departure_time).toISOString().slice(0, 16) : '', arrival_time: data.arrival_time ? new Date(data.arrival_time).toISOString().slice(0, 16) : '', booking_reference: data.booking_reference ?? '', notes: data.notes ?? '' });
});

router.put('/flights/:id', requireAdmin, async (req, res) => {
  const supabase = (req as any).db;
  const { airline, flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, bookingReference, notes } = req.body;
  if (!airline?.trim()) return res.status(400).json({ error: 'Airline is required' });
  const { data, error } = await supabase.from('flights').update({
    airline: airline.trim(),
    flight_number: flightNumber?.trim() ?? null,
    departure_airport: departureAirport?.trim() ?? null,
    arrival_airport: arrivalAirport?.trim() ?? null,
    departure_time: departureTime || null,
    arrival_time: arrivalTime || null,
    booking_reference: bookingReference?.trim() ?? null,
    notes: notes?.trim() ?? null,
  }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data.id, trip_id: data.trip_id, airline: data.airline, flight_number: data.flight_number ?? '', departure_airport: data.departure_airport ?? '', arrival_airport: data.arrival_airport ?? '', departure_time: data.departure_time ? new Date(data.departure_time).toISOString().slice(0, 16) : '', arrival_time: data.arrival_time ? new Date(data.arrival_time).toISOString().slice(0, 16) : '', booking_reference: data.booking_reference ?? '', notes: data.notes ?? '' });
});

router.delete('/flights/:id', requireAdmin, async (req, res) => {
  const supabase = (req as any).db;
  const { error } = await supabase.from('flights').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
