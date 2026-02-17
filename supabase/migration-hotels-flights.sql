-- Hotels and flights tables - run in Supabase SQL Editor
-- Enables editable accommodation and flight cards with DB persistence

CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  address TEXT,
  check_in DATE,
  check_out DATE,
  confirmation_number TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id INTEGER NOT NULL DEFAULT 1,
  airline TEXT NOT NULL,
  flight_number TEXT,
  departure_airport TEXT,
  arrival_airport TEXT,
  departure_time TIMESTAMPTZ,
  arrival_time TIMESTAMPTZ,
  booking_reference TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_hotels_trip ON hotels(trip_id);
CREATE INDEX IF NOT EXISTS idx_flights_trip ON flights(trip_id);

-- Seed initial data (only if tables are empty)
INSERT INTO hotels (trip_id, name, address, check_in, check_out, confirmation_number, notes)
SELECT 1, 'Dreams Playa Dorada Lanzarote', 'Playa Dorada, Playa Blanca, Lanzarote', '2027-08-09', '2027-08-20', '', ''
WHERE (SELECT COUNT(*) FROM hotels) = 0;

INSERT INTO flights (trip_id, airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, booking_reference, notes)
SELECT 1, 'TBC', '', 'LGW', 'ACE', '2027-08-09 06:00:00+00', '2027-08-09 10:00:00+00', '', 'Outbound'
WHERE (SELECT COUNT(*) FROM flights) = 0;

INSERT INTO flights (trip_id, airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, booking_reference, notes)
SELECT 1, 'TBC', '', 'ACE', 'LGW', '2027-08-20 11:00:00+00', '2027-08-20 15:00:00+00', '', 'Return'
WHERE (SELECT COUNT(*) FROM flights) = 1;
