// types.ts

// 1. UPDATED: PricingTier now includes 'vehicleType'
export interface PricingTier {
  passengers: string;
  price: number;
  vehicleType: string; // <-- New required field
}

// 2. UPDATED: Route now includes 'label' and 'description'
export interface Route {
  id: number;
  from: string;
  to: string;
  label: string | null; // <-- New optional field
  description: string | null; // <-- New optional field
  pricing: PricingTier[];
  distance: string;
  duration: string;
}

export interface BookingFormData {
  // Standard transfer fields
  pickupLocation: string;
  pickupAddress: string;
  dropoffLocation: string;
  dropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  luggage: number;
  flightNumber: string;
  childSeat: boolean;
  fullName: string;
  email: string;
  contactNumber: string;

  // NEW: Chauffeur & Hourly Hire fields
  hourlyPickupLocation: string;
  hourlyHours: number;
  hourlyVehicleType: string; // 'Sedan' | 'SUV' | 'Van' stored as string
}

export interface Review {
  name: string;
  rating: number;
  comment: string;
  date: string;
}
