import { z } from 'zod';

export const quoteRequestSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100, 'Full name must not exceed 100 characters'),
  email: z.string().trim().email('Invalid email address').max(150, 'Email must not exceed 150 characters'),
  phone: z.string().trim().min(1, 'Phone number is required').max(30, 'Phone number must not exceed 30 characters'),
  pickupAddress: z.string().trim().min(1, 'Pickup address is required').max(300, 'Pickup address must not exceed 300 characters'),
  dropoffAddress: z.string().trim().min(1, 'Dropoff address is required').max(300, 'Dropoff address must not exceed 300 characters'),
  travelDate: z.string().trim().min(1, 'Travel date is required').max(30),
  travelTime: z.string().trim().min(1, 'Travel time is required').max(30),
  passengers: z.number().int().min(1, 'At least 1 passenger is required').max(7, 'Max 7 passengers'),
  checkInBags: z.number().int().min(0).max(5).optional().default(0),
  carryOnBags: z.number().int().min(0).max(5).optional().default(0),
  childSeats: z.string().max(50).optional().default('No'),
  flightArrivalType: z.string().max(50).nullable().optional(),
  flightArrivalNumber: z.string().max(50).nullable().optional(),
  flightArrivalTime: z.string().max(50).nullable().optional(),
  flightDepartureType: z.string().max(50).nullable().optional(),
  flightDepartureNumber: z.string().max(50).nullable().optional(),
  flightDepartureTime: z.string().max(50).nullable().optional(),
  message: z.string().max(1000, 'Message must not exceed 1000 characters').nullable().optional(),
});

export const bookingDetailsSchema = z.object({
  bookingType: z.enum(['standard', 'hourly', 'daytrip']),
  pickupLocation: z.string().trim().max(300).optional().default(''),
  pickupAddress: z.string().trim().max(300).nullable().optional(),
  dropoffLocation: z.string().trim().max(300).optional().default(''),
  dropoffAddress: z.string().trim().max(300).nullable().optional(),
  pickupDate: z.string().trim().min(1, 'Pickup date is required').max(30),
  pickupTime: z.string().trim().min(1, 'Pickup time is required').max(30),
  passengers: z.number().int().min(1).max(50),
  luggage: z.number().int().min(0).max(50),
  flightNumber: z.string().max(50).nullable().optional(),
  childSeat: z.boolean().optional().default(false),
  fullName: z.string().trim().min(1, 'Full name is required').max(100, 'Full name must not exceed 100 characters'),
  email: z.string().trim().email('Invalid email address').max(150, 'Email must not exceed 150 characters'),
  contactNumber: z.string().trim().min(1, 'Contact number is required').max(30, 'Contact number must not exceed 30 characters'),

  // Hourly fields
  hourlyPickupLocation: z.string().trim().max(300).nullable().optional(),
  hourlyHours: z.number().min(1).max(24).nullable().optional(),
  hourlyVehicleType: z.string().max(50).nullable().optional(),

  // Daytrip fields
  dayTripPickup: z.string().trim().max(300).nullable().optional(),
  dayTripDestination: z.string().trim().max(300).nullable().optional(),
  dayTripVehicleType: z.string().max(50).nullable().optional(),
  dayTripPrice: z.number().min(0).optional(),

  // Round-trip fields
  transferType: z.enum(['one-way', 'round-trip']).optional().default('one-way'),
  returnDate: z.string().trim().max(30).nullable().optional(),
  returnTime: z.string().trim().max(30).nullable().optional(),
  returnFlightNumber: z.string().max(50).nullable().optional(),

  // Promo Code fields
  promoCode: z.string().max(50).nullable().optional(),
  appliedDiscount: z.object({
    code: z.string(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']),
    discountValue: z.number(),
    discountAmount: z.number(),
  }).nullable().optional(),
});

export const leadUpsertSchema = z.object({
  id: z.string().max(100).optional(),
  bookingType: z.enum(['standard', 'hourly', 'daytrip']),
  pickupLocation: z.string().max(300).nullable().optional(),
  pickupAddress: z.string().max(300).nullable().optional(),
  dropoffLocation: z.string().max(300).nullable().optional(),
  dropoffAddress: z.string().max(300).nullable().optional(),
  pickupDate: z.string().max(30).nullable().optional(),
  pickupTime: z.string().max(30).nullable().optional(),
  passengers: z.number().int().min(0).max(50).nullable().optional(),
  luggage: z.number().int().min(0).max(50).nullable().optional(),
  flightNumber: z.string().max(50).nullable().optional(),
  childSeat: z.boolean().nullable().optional(),
  hourlyPickupLocation: z.string().max(300).nullable().optional(),
  hourlyHours: z.number().min(0).max(24).nullable().optional(),
  hourlyVehicleType: z.string().max(50).nullable().optional(),
  dayTripPickup: z.string().max(300).nullable().optional(),
  dayTripDestination: z.string().max(300).nullable().optional(),
  dayTripVehicleType: z.string().max(50).nullable().optional(),
  fullName: z.string().trim().max(100).nullable().optional(),
  email: z.string().trim().max(150).nullable().optional(),
  contactNumber: z.string().trim().max(30).nullable().optional(),
  quotedPriceCents: z.number().int().min(0).nullable().optional(),
  currency: z.string().max(10).optional().default('AUD'),
  status: z.string().max(30).optional().default('draft'),
  source: z.string().max(100).nullable().optional(),
  utmSource: z.string().max(100).nullable().optional(),
  utmMedium: z.string().max(100).nullable().optional(),
  utmCampaign: z.string().max(100).nullable().optional(),
  utmTerm: z.string().max(100).nullable().optional(),
  utmContent: z.string().max(100).nullable().optional(),
});
