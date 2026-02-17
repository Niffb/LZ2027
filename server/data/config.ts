// ─────────────────────────────────────────────────────────────────────────────
// TRIP CONFIGURATION
// Edit this file to update trip details, hotel, flights, and the invite code.
// ─────────────────────────────────────────────────────────────────────────────

/** Anyone registering must enter this code — share it only with your group */
export const INVITE_CODE = 'lz2027';

/** This name (case-insensitive) always gets admin privileges */
export const ADMIN_NAME = 'niff';

/** Fixed trip ID referenced by all itinerary / activity routes */
export const TRIP_ID = 1;

// ── Trip details ──────────────────────────────────────────────────────────────
export const TRIP = {
  id: TRIP_ID,
  destination: 'Lanzarote, Spain',
  start_date: '2027-06-01',
  end_date: '2027-06-08',
  travelers: 8,
};

// ── Hotel(s) ─────────────────────────────────────────────────────────────────
export const HOTELS = [
  {
    id: 1,
    trip_id: TRIP_ID,
    name: 'Hotel Name',
    address: 'Hotel Address, Lanzarote',
    check_in: '2027-06-01',
    check_out: '2027-06-08',
    confirmation_number: '',
    notes: '',
  },
];

// ── Flights ───────────────────────────────────────────────────────────────────
export const FLIGHTS = [
  {
    id: 1,
    trip_id: TRIP_ID,
    airline: 'easyJet',
    flight_number: 'EJxxxx',
    departure_airport: 'LGW',
    arrival_airport: 'ACE',
    departure_time: '2027-06-01T06:00',
    arrival_time: '2027-06-01T10:00',
    booking_reference: '',
    notes: 'Outbound',
  },
  {
    id: 2,
    trip_id: TRIP_ID,
    airline: 'easyJet',
    flight_number: 'EJxxxx',
    departure_airport: 'ACE',
    arrival_airport: 'LGW',
    departure_time: '2027-06-08T11:00',
    arrival_time: '2027-06-08T15:00',
    booking_reference: '',
    notes: 'Return',
  },
];
