export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  avatar?: string;
}

export interface TripDetails {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
}

export interface ItineraryItem {
  id: string;
  day: number;
  time: string;
  activity: string;
  location: string;
  costEUR: number;
  notes?: string;
}

export interface Comment {
  user: string;
  text: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  proposedBy: string;
  costEUR: number;
  votes: Record<string, 'yes' | 'no'>;
  comments: Comment[];
  link?: string;
}

export interface BudgetBreakdown {
  totalEUR: number;
  totalGBP: number;
  perPersonEUR: number;
  perPersonGBP: number;
  categoryData: { name: string; value: number }[];
}

export interface HotelInfo {
  id: number;
  trip_id: number;
  name: string;
  address: string;
  check_in: string;
  check_out: string;
  confirmation_number: string;
  notes: string;
}

export interface FlightInfo {
  id: number;
  trip_id: number;
  airline: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  booking_reference: string;
  notes: string;
}
