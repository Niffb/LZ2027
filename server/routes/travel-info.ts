import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Hotel Info
router.get('/trips/:tripId/hotels', requireAuth, (req, res) => {
  const hotels = db.prepare('SELECT * FROM hotel_info WHERE trip_id = ?').all(req.params.tripId);
  res.json(hotels);
});

router.post('/trips/:tripId/hotels', requireAdmin, (req, res) => {
  const { name, address, checkIn, checkOut, confirmationNumber, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Hotel name is required' });

  const result = db.prepare(
    'INSERT INTO hotel_info (trip_id, name, address, check_in, check_out, confirmation_number, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(req.params.tripId, name, address || '', checkIn || '', checkOut || '', confirmationNumber || '', notes || '');

  const hotel = db.prepare('SELECT * FROM hotel_info WHERE id = ?').get(result.lastInsertRowid);
  res.json(hotel);
});

router.put('/hotels/:id', requireAdmin, (req, res) => {
  const { name, address, checkIn, checkOut, confirmationNumber, notes } = req.body;
  db.prepare(
    'UPDATE hotel_info SET name = ?, address = ?, check_in = ?, check_out = ?, confirmation_number = ?, notes = ? WHERE id = ?'
  ).run(name, address, checkIn, checkOut, confirmationNumber, notes, req.params.id);

  const hotel = db.prepare('SELECT * FROM hotel_info WHERE id = ?').get(req.params.id);
  res.json(hotel);
});

router.delete('/hotels/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM hotel_info WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Flight Info
router.get('/trips/:tripId/flights', requireAuth, (req, res) => {
  const flights = db.prepare('SELECT * FROM flight_info WHERE trip_id = ?').all(req.params.tripId);
  res.json(flights);
});

router.post('/trips/:tripId/flights', requireAdmin, (req, res) => {
  const { airline, flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, bookingReference, notes } = req.body;
  if (!airline) return res.status(400).json({ error: 'Airline is required' });

  const result = db.prepare(
    'INSERT INTO flight_info (trip_id, airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, booking_reference, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(req.params.tripId, airline, flightNumber || '', departureAirport || '', arrivalAirport || '', departureTime || '', arrivalTime || '', bookingReference || '', notes || '');

  const flight = db.prepare('SELECT * FROM flight_info WHERE id = ?').get(result.lastInsertRowid);
  res.json(flight);
});

router.put('/flights/:id', requireAdmin, (req, res) => {
  const { airline, flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, bookingReference, notes } = req.body;
  db.prepare(
    'UPDATE flight_info SET airline = ?, flight_number = ?, departure_airport = ?, arrival_airport = ?, departure_time = ?, arrival_time = ?, booking_reference = ?, notes = ? WHERE id = ?'
  ).run(airline, flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, bookingReference, notes, req.params.id);

  const flight = db.prepare('SELECT * FROM flight_info WHERE id = ?').get(req.params.id);
  res.json(flight);
});

router.delete('/flights/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM flight_info WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
