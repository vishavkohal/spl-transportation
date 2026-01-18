'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Plane,
  ArrowLeft,
  ArrowRight,
  Navigation,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { Phone as Phone } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { BookingFormData, Route } from '../types';
import { Services } from './Services';
import CustomerReviews from './CustomerReviews';
import HeroBackground from "./HeroBackground";
import { PHONE_COUNTRIES_LIST } from '../lib/phonecodes';
import { useDebouncedCallback } from 'use-debounce';
import { getStoredUtms } from '@/app/lib/utm';

// Custom colors
const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';
const COMPANY_PHONE = '+61470032460';

// Business rules
const MAX_PASSENGERS = 8;
const MAX_LUGGAGE = 4;

const VEHICLE_CONSTRAINTS: { maxPax: number; maxBags: number }[] = [
  { maxPax: 4, maxBags: 3 },
  { maxPax: 5, maxBags: 3 },
  { maxPax: 6, maxBags: 2 },
  { maxPax: 7, maxBags: 2 }
];

// slideshow images
const heroImages = ['/home.webp', '/copy.webp', '/copy3.webp'];
const PHONE_COUNTRIES = PHONE_COUNTRIES_LIST;

// NEW: Hourly Hire rates (hardcoded)
const HOURLY_RATES: Record<
  string,
  { hourly: number; fullDay: number }
> = {
  Sedan: { hourly: 120, fullDay: 820 },
  SUV: { hourly: 150, fullDay: 1050 },
  Van: { hourly: 150, fullDay: 1050 }
};

// Helper: max bags for pax
function getMaxBagsForCurrentPax(pax: number): number {
  if (pax >= 1 && pax <= 4) return 3;
  if (pax >= 5 && pax < 6) return 3;
  if (pax > 5 && pax <= 6) return 2;
  if (pax > 6 && pax <= MAX_PASSENGERS) return 4;
  return MAX_LUGGAGE;
}

// Helper: min date/time
function getMinDateForInput() {
  const now = new Date();
  return new Date(now.getTime()).toISOString().slice(0, 10);
}

// -----------------------------
// Payment fee helpers (GST inclusive)
// -----------------------------
const PAYMENT_FEE_RATE = 0.025; // 2.5%

function calculateProcessingFee(amount: number) {
  return Number((amount * PAYMENT_FEE_RATE).toFixed(2));
}

function calculateFinalAmount(amount: number) {
  return amount + calculateProcessingFee(amount);
}

function formatTime(date: Date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function getMinTimeForDate(dateStr: string | undefined) {
  const now = new Date();
  const minDateForInput = getMinDateForInput();
  const minDateTime = new Date(now.getTime() + 30 * 60_000); // now + 30m

  if (!dateStr) return '00:00';
  if (dateStr === minDateForInput) return formatTime(minDateTime);
  return '00:00';
}

function isPickupAtLeast30Mins(pickupDate: string, pickupTime: string) {
  if (!pickupDate || !pickupTime) return false;
  const [h, m] = pickupTime.split(':').map(Number);
  const dt = new Date(pickupDate);
  dt.setHours(h, m, 0, 0);
  return dt.getTime() - Date.now() >= 30 * 60_000;
}

// NEW: Hourly price helper
function getHourlyPrice(formData: BookingFormData): number {
  const vehicle = formData.hourlyVehicleType;
  const hours = Number(formData.hourlyHours || 0);

  if (!vehicle || !HOURLY_RATES[vehicle] || hours <= 0) return 0;

  const rate = HOURLY_RATES[vehicle];

  // Full-day private charter (8h+) flat rate
  if (hours >= 8) {
    return rate.fullDay;
  }

  // 2-hour minimum
  const billableHours = Math.max(2, hours);
  return billableHours * rate.hourly;
}

/* -----------------------------
   Framer Motion variants
------------------------------*/
const heroContentVariants: Variants = {
  hidden: { opacity: 0, y: 5, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
};

const heroDotsVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const bookingCardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 40,
      damping: 20,
      mass: 1,
      delay: 0.1
    }
  }
};

// NEW: Smooth step transition variants
const stepTransitionVariants: Variants = {
  hidden: { opacity: 0, x: 20, position: 'absolute' }, // float right
  visible: {
    opacity: 1,
    x: 0,
    position: 'relative',
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: {
    opacity: 0,
    x: -20,
    position: 'absolute',
    transition: { duration: 0.2 }
  }
};



type BookingMode = 'standard' | 'hourly' | 'daytrip';

export default function HomePage(props: {
  formData: BookingFormData;
  handleInputChange: (
    field: keyof BookingFormData,
    value: string | number | boolean
  ) => void;
  bookingStep: 1 | 2;
  setBookingStep: (n: 1 | 2) => void;
  AVAILABLE_LOCATIONS: string[];
  dropoffOptions: string[];
  selectedRoute: Route | null;
  calculatedPrice: number;
  routesLoading: boolean;
}) {
  const {
    formData,
    handleInputChange,
    bookingStep,
    setBookingStep,
    AVAILABLE_LOCATIONS,
    dropoffOptions,
    selectedRoute,
    calculatedPrice,
    routesLoading
  } = props;

  const formTopRef = useRef<HTMLDivElement>(null);

  const [passengerInput, setPassengerInput] = useState<string>(
    String(formData.passengers)
  );
  const [luggageInput, setLuggageInput] = useState<string>(
    String(formData.luggage)
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [bookingMode, setBookingMode] = useState<BookingMode>('standard');

  // Day Trip state
  const [dayTripPricing, setDayTripPricing] = useState<{ passengers: string; price: number; vehicleType: string }[]>([]);
  const [dayTripPickup, setDayTripPickup] = useState('');
  const [dayTripDestination, setDayTripDestination] = useState('');
  const [selectedDayTripVehicle, setSelectedDayTripVehicle] = useState<{ vehicleType: string; price: number } | null>(null);
  const [isDayTripRedirecting, setIsDayTripRedirecting] = useState(false); // NEW: loading state for day trip redirect

  const minDateForInput = getMinDateForInput();

  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Listen for day trip selection from RoutesSection
  useEffect(() => {
    const handleDayTripSelect = (e: CustomEvent<{ pricing: { passengers: string; price: number; vehicleType: string }[] }>) => {
      setBookingMode('daytrip');
      setDayTripPricing(e.detail.pricing);
      if (e.detail.pricing.length > 0) {
        setSelectedDayTripVehicle({ vehicleType: e.detail.pricing[0].vehicleType, price: e.detail.pricing[0].price });
      }
    };

    window.addEventListener('selectDayTrip', handleDayTripSelect as EventListener);
    return () => window.removeEventListener('selectDayTrip', handleDayTripSelect as EventListener);
  }, []);

  // Scroll + slideshow


  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentImageIndex]);

  useEffect(() => {
    setPassengerInput(String(formData.passengers));
  }, [formData.passengers]);

  useEffect(() => {
    setLuggageInput(String(formData.luggage));
  }, [formData.luggage]);

  useEffect(() => {
    if (bookingStep === 2 && formTopRef.current) {
      formTopRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [bookingStep]);

  // -------------------------------
  // VALIDATION
  // -------------------------------
  const getFieldError = (field: string): string | null => {
    if (!touched[field]) return null;

    const value = formData[field as keyof BookingFormData];
    const pax = formData.passengers;
    const bags = formData.luggage;

    switch (field) {
      // Shared / standard fields
      case 'pickupLocation':
      case 'dropoffLocation':
      case 'pickupDate':
        return value ? null : 'Required';

      case 'pickupTime':
        if (!value) return 'Required';
        if (!isPickupAtLeast30Mins(formData.pickupDate, String(value))) {
          return 'Min 30 mins notice';
        }
        return null;

      case 'fullName':
        return value ? null : 'Name is required';

      case 'email':
        if (!value) return 'Email is required';
        return /\S+@\S+\.\S+/.test(String(value)) ? null : 'Invalid email';

      case 'contactNumber':
        return value ? null : 'Mobile is required';

      case 'passengers':
        if (pax > MAX_PASSENGERS) return `Max ${MAX_PASSENGERS} Pax`;
        return null;

      case 'luggage': {
        const maxAllowedBags = getMaxBagsForCurrentPax(pax);
        if (bags > maxAllowedBags) {
          return `Max ${maxAllowedBags} Bags for ${pax} Pax`;
        }
        return null;
      }

      // NEW: hourly fields
      case 'hourlyPickupLocation':
        return value ? null : 'Required';

      case 'hourlyHours': {
        const hours = Number(value);
        if (!hours || Number.isNaN(hours)) return 'Required';
        if (hours < 2) return 'Min 2 hours';
        if (hours > 8) return 'Max 8 hours';
        return null;
      }


      case 'hourlyVehicleType':
        return value ? null : 'Required';

      default:
        return null;
    }
  };

  const getInputClass = (field: string, hasIconPadding: boolean = true) => {
    const error = getFieldError(field);
    const padding = hasIconPadding ? 'pl-10' : 'pl-3'; // pl-3 aligns with Day Trip px-3 if no icon

    const base =
      `w-full ${padding} pr-3 py-2.5 rounded-lg outline-none font-medium text-sm ` + // rounded-lg, py-2.5, text-sm
      `transition-all duration-200 appearance-none relative z-10 text-black `;      // text-black

    if (error) {
      return (
        base +
        'bg-red-50 ' + // Light red bg for error
        'border border-red-500 ring-1 ring-red-500 focus:ring-2 focus:ring-red-500 ' +
        'focus:border-red-500 placeholder-red-300'
      );
    }

    return (
      base +
      'bg-white ' + // Match Day Trip bg-white
      'border border-gray-300 focus:ring-2 focus:ring-[#18234B]/20 focus:border-[#18234B] placeholder-gray-400' // Match Day Trip borders/ring
    );
  };

  // STEP 1 validity (STANDARD TRANSFER)
  const isStandardStep1Valid = () => {
    if (!selectedRoute || calculatedPrice <= 0) return false;

    const mandatoryFields = [
      'pickupLocation',
      'dropoffLocation',
      'pickupDate',
      'pickupTime',
      'passengers',
      'luggage'
    ];

    return mandatoryFields.every(field => {
      const value = formData[field as keyof BookingFormData];
      const pax = formData.passengers;
      const bags = formData.luggage;

      let error: string | null = null;
      switch (field) {
        case 'pickupLocation':
        case 'dropoffLocation':
        case 'pickupDate':
          error = value ? null : 'Required';
          break;
        case 'pickupTime':
          if (!value) error = 'Required';
          else if (!isPickupAtLeast30Mins(formData.pickupDate, String(value)))
            error = 'Min 30 mins notice';
          break;
        case 'passengers':
          if (pax > MAX_PASSENGERS) error = `Max ${MAX_PASSENGERS} Pax`;
          break;
        case 'luggage': {
          const maxAllowedBags = getMaxBagsForCurrentPax(pax);
          if (bags > maxAllowedBags)
            error = `Max ${maxAllowedBags} Bags for ${pax} Pax`;
          break;
        }
      }
      return !error;
    });
  };

  // STEP 1 validity (HOURLY)
  const hourlyPrice = getHourlyPrice(formData);

  const isHourlyStep1Valid = () => {
    if (!formData.hourlyPickupLocation) return false;
    if (!formData.pickupDate || !formData.pickupTime) return false;
    if (!isPickupAtLeast30Mins(formData.pickupDate, formData.pickupTime))
      return false;

    const hours = Number(formData.hourlyHours || 0);
    if (!hours || hours < 2) return false;
    if (hours > 8) return false;          // 👈 new line

    if (!formData.hourlyVehicleType) return false;
    if (hourlyPrice <= 0) return false;

    return true;
  };


  // STEP 2 validity (shared)
  const isStep2FormValid = () => {
    const { fullName, email, contactNumber } = formData;
    if (!fullName || !email || !contactNumber) return false;
    if (!/\S+@\S+\.\S+/.test(String(email))) return false;
    return true;
  };

  // helper to mark contact fields touched & return validity
  const validateStep2 = () => {
    const fields = ['fullName', 'email', 'contactNumber'];
    const newTouched = { ...touched };
    fields.forEach(f => (newTouched[f] = true));
    setTouched(newTouched);
    return isStep2FormValid();
  };

  // -------------------------------
  // HANDLERS
  // -------------------------------
  const onPassengersChange = (v: string) => {
    setPassengerInput(v);
    if (/^\d+$/.test(v)) {
      const parsed = Math.max(1, Math.min(MAX_PASSENGERS, parseInt(v, 10)));
      handleInputChange('passengers', parsed);

      const maxBagsAfterChange = getMaxBagsForCurrentPax(parsed);
      if (formData.luggage > maxBagsAfterChange) {
        handleInputChange('luggage', maxBagsAfterChange);
        setLuggageInput(String(maxBagsAfterChange));
      }
    }
  };

  const onPassengersBlur = () => {
    markTouched('passengers');
    if (!/^\d+$/.test(passengerInput)) {
      setPassengerInput(String(formData.passengers));
    } else {
      const parsed = Math.max(
        1,
        Math.min(MAX_PASSENGERS, parseInt(passengerInput, 10))
      );
      setPassengerInput(String(parsed));
      handleInputChange('passengers', parsed);
    }
    markTouched('luggage');
  };

  const onLuggageChange = (v: string) => {
    setLuggageInput(v);
    if (/^\d+$/.test(v)) {
      const parsed = Math.max(0, parseInt(v, 10));
      handleInputChange('luggage', parsed);
    }
  };

  const onLuggageBlur = () => {
    markTouched('luggage');
    if (!/^\d+$/.test(luggageInput)) {
      setLuggageInput(String(formData.luggage));
    } else {
      const maxAllowedBags = getMaxBagsForCurrentPax(formData.passengers);
      const parsed = Math.max(
        0,
        Math.min(parseInt(luggageInput, 10), maxAllowedBags)
      );
      setLuggageInput(String(parsed));
      handleInputChange('luggage', parsed);
    }
    markTouched('passengers');
  };

  const onPickupDateChange = (v: string) => {
    handleInputChange('pickupDate', v);
    const minT = getMinTimeForDate(v);
    if (
      v === minDateForInput &&
      formData.pickupTime &&
      formData.pickupTime < minT
    ) {
      handleInputChange('pickupTime', minT);
    }
  };

  // STANDARD: go to step 2
  const goToStep2Standard = () => {
    const fields = [
      'pickupLocation',
      'dropoffLocation',
      'pickupDate',
      'pickupTime',
      'passengers',
      'luggage'
    ];
    const newTouched = { ...touched };
    fields.forEach(f => {
      newTouched[f] = true;
    });
    setTouched(newTouched);

    if (isStandardStep1Valid()) {
      setBookingStep(2);
    }
  };

  // HOURLY: go to step 2
  const goToStep2Hourly = () => {
    const fields = [
      'hourlyPickupLocation',
      'pickupDate',
      'pickupTime',
      'hourlyHours',
      'hourlyVehicleType'
    ];
    const newTouched = { ...touched };
    fields.forEach(f => {
      newTouched[f] = true;
    });
    setTouched(newTouched);

    if (isHourlyStep1Valid()) {
      setBookingStep(2);
    }
  };

  const [leadId, setLeadId] = useState<string | null>(null);

  // ----------------------------------
  // STEP 2 LEAD AUTOSAVE (ONLY WITH CONTACT INFO)
  // ----------------------------------
  const saveLead = useDebouncedCallback(async () => {
    // ❌ Never save in Step 1
    if (bookingStep !== 2) return;

    // ❌ No contact info → not a lead
    if (!formData.email && !formData.contactNumber) return;

    try {
      const utms = getStoredUtms(); // ✅ read once per autosave

      const res = await fetch('/api/leads/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId, // 👈 if present → UPDATE, else CREATE
          bookingType: bookingMode,
          quotedPrice:
            bookingMode === 'standard'
              ? calculatedPrice
              : bookingMode === 'daytrip'
                ? selectedDayTripVehicle?.price
                : hourlyPrice,
          source: 'homepage', // UI context only

          // Day Trip specific fields
          dayTripPickup: bookingMode === 'daytrip' ? dayTripPickup : undefined,
          dayTripDestination: bookingMode === 'daytrip' ? dayTripDestination : undefined,
          dayTripVehicleType: bookingMode === 'daytrip' ? selectedDayTripVehicle?.vehicleType : undefined,

          // ✅ Attribution (only sent if exists)
          utm: utms ?? undefined,

          ...formData,
        }),
      });

      const data = await res.json();

      // Capture leadId once (idempotent)
      if (data?.leadId && !leadId) {
        setLeadId(data.leadId);
      }
    } catch (err) {
      // Silent fail — never block UX
      console.error('Lead autosave failed', err);
    }
  }, 2500);

  useEffect(() => {
    saveLead();
  }, [
    bookingStep,
    formData.fullName,
    formData.email,
    formData.contactNumber,
    // Triggers for Day Trip & Hourly updates
    dayTripPickup,
    dayTripDestination,
    selectedDayTripVehicle,
    hourlyPrice, // ensure hourly updates trigger autosave too
    saveLead
  ]);


  return (
    <div className="min-h-screen bg-white-50">
      {/* NEW HERO LAYOUT */}
      <div className="relative flex flex-col lg:block lg:h-screen lg:min-h-[800px]">

        {/* Background Image Wrapper */}
        <div className="relative h-[35vh] min-h-[300px] lg:absolute lg:inset-0 lg:h-full lg:w-full z-0">
          <HeroBackground />
          <div className="absolute inset-0 bg-black/30 lg:bg-gradient-to-r lg:from-black/60 lg:via-black/40 lg:to-transparent z-10" />

          {/* Mobile Headline Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 z-20 lg:hidden pointer-events-none">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg font-serif tracking-wide leading-tight mb-4">
              Experience the<br /> Pinnacle of Travel
            </h1>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-white drop-shadow-md">
                <CheckCircle className="w-3 h-3 text-white" />
                <span>Airport Meet & Greet</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-white drop-shadow-md">
                <CheckCircle className="w-3 h-3 text-white" />
                <span>Premium Fleet</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-white drop-shadow-md">
                <CheckCircle className="w-3 h-3 text-white" />
                <span>Private Rides</span>
              </div>
            </div>

            {/* Call CTA - Mobile */}
            <div className="mt-6 pointer-events-auto">
              <a
                href="tel:+61470032460"
                className="inline-flex items-center justify-center gap-2 bg-black/20 backdrop-blur-sm px-10 py-3 rounded-xl font-bold text-sm border border-white/60 text-white hover:bg-white/10 transition-colors w-full max-w-xs"
                aria-label="Call Now"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>

        {/* Desktop Content Container */}
        <div className="relative z-10 container mx-auto px-4 lg:h-full lg:flex lg:items-center">
          <div className="grid lg:grid-cols-12 gap-8 w-full items-center">

            {/* Desktop Headline (Left) */}
            <div className="hidden lg:block lg:col-span-7 text-white pl-8 xl:pl-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-5xl xl:text-7xl font-bold mb-6 font-serif leading-tight">
                  Experience the <br />
                  Pinnacle of Travel
                </h1>
                <p className="text-lg text-gray-200 max-w-xl font-light mb-8 leading-relaxed">
                  Chauffeured luxury transfers across Cairns, Port Douglas,
                  and Tropical North Queensland. <br />
                  <span className="text-base font-medium text-white/90">Free quotes for all destinations.</span>
                </p>

                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center gap-2 text-sm font-medium text-white drop-shadow-md">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Airport Meet & Greet</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-white drop-shadow-md">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Premium Fleet</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-white drop-shadow-md">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Private Rides</span>
                  </div>
                </div>

                {/* Call CTA - Desktop */}
                <a
                  href="tel:+61470032460"
                  className="inline-flex items-center justify-center gap-3 bg-black/20 backdrop-blur-sm px-12 py-4 rounded-xl font-bold text-lg border border-white/60 text-white hover:bg-white/10 transition-all duration-300 min-w-[240px]"
                  aria-label="Call Now"
                >
                  <Phone className="w-5 h-5 text-white" />
                  <span>Call Now</span>
                </a>
              </motion.div>
            </div>


            {/* Booking Form Card (Right / Stacked) */}
            {/* Booking Form Card (Right / Stacked) */}
            <div className="lg:col-span-5 -mt-4 lg:mt-0 relative z-30 mb-12 lg:mb-0">
              <motion.div
                ref={formTopRef}
                id="booking-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="
                         rounded-2xl lg:rounded-3xl
                         bg-white shadow-[0_20px_40px_rgba(0,0,0,0.15)]
                         lg:shadow-[0_8px_32px_rgba(0,0,0,0.2)]
                         overflow-hidden
                       "
              >

                {/* Progress bar */}
                <div className="h-1 w-full bg-gray-100">
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                      width: bookingStep === 1 ? '50%' : '100%',
                      backgroundColor: ACCENT_COLOR
                    }}
                  ></div>
                </div>

                <div className="p-6 lg:p-8">
                  {/* Mode Selection Tabs (Segmented Control) */}
                  <div className="flex p-1.5 bg-gray-100 rounded-xl mb-8 relative">
                    {/* Sliding Background (Optional advanced feature, using simple conditional styles for now) */}

                    {/* Standard Tab */}
                    <button
                      type="button"
                      onClick={() => {
                        setBookingMode('standard');
                        setBookingStep(1);
                      }}
                      className={`
                        flex-1 py-3 rounded-lg text-sm font-bold text-center transition-all duration-200 ease-out
                        ${bookingMode === 'standard'
                          ? 'bg-[#18234B] text-white shadow-md'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}
                      `}
                    >
                      Standard
                    </button>

                    {/* Hourly Tab */}
                    <button
                      type="button"
                      onClick={() => {
                        setBookingMode('hourly');
                        setBookingStep(1);
                      }}
                      className={`
                        flex-1 py-3 rounded-lg text-sm font-bold text-center transition-all duration-200 ease-out
                        ${bookingMode === 'hourly'
                          ? 'bg-[#18234B] text-white shadow-md'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}
                      `}
                    >
                      Hourly Hire
                    </button>

                    {/* Day Trip Tab */}
                    <button
                      type="button"
                      onClick={async () => {
                        setBookingMode('daytrip');
                        setBookingStep(1);
                        // Fetch routes to populate day trip pricing if not already loaded
                        if (dayTripPricing.length === 0) {
                          try {
                            const res = await fetch('/api/routes');
                            const routes = await res.json();
                            // Get day trip routes
                            const pricing: { passengers: string; price: number; vehicleType: string }[] = [];
                            routes.forEach((route: { from: string; to: string; pricing?: { passengers: string; price: number; vehicleType: string }[] }) => {
                              if (route.from && route.from.toLowerCase().includes('day trip') && route.pricing) {
                                route.pricing.forEach(p => {
                                  if (!pricing.find(existing => existing.vehicleType === p.vehicleType)) {
                                    pricing.push({
                                      vehicleType: p.vehicleType,
                                      passengers: p.passengers,
                                      price: p.price
                                    });
                                  }
                                });
                              }
                            });
                            // sort by price
                            pricing.sort((a, b) => a.price - b.price);
                            setDayTripPricing(pricing);
                            if (pricing.length > 0) {
                              setSelectedDayTripVehicle({ vehicleType: pricing[0].vehicleType, price: pricing[0].price });
                            }
                          } catch (err) {
                            console.error('Failed to load day trip routes', err);
                          }
                        }
                      }}
                      className={`
                        flex-1 py-3 rounded-lg text-sm font-bold text-center transition-all duration-200 ease-out
                        ${bookingMode === 'daytrip'
                          ? 'bg-[#18234B] text-white shadow-md'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}
                      `}
                    >
                      Day Trips
                    </button>
                  </div>


                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                      <h2
                        className="text-2xl font-bold text-gray-900 tracking-tight"
                        style={{ color: PRIMARY_COLOR }}
                      >
                        {bookingStep === 1
                          ? bookingMode === 'standard'
                            ? 'Booking Details'
                            : bookingMode === 'daytrip'
                              ? 'Day Trip Details'
                              : 'Hourly Hire Details'
                          : 'Confirm & Pay'}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {bookingStep === 1
                          ? bookingMode === 'standard'
                            ? 'Enter your trip information below'
                            : bookingMode === 'daytrip'
                              ? '8-hour charter to explore Tropical North Queensland'
                              : 'Tell us where to pick you up and how long you need the chauffeur'
                          : 'Review your trip, add contact info & pay securely via Stripe'}
                      </p>
                    </div>

                    <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1 self-start md:self-auto">
                      <div
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-default ${bookingStep === 1
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500'
                          }`}
                      >
                        1. Ride
                      </div>
                      <div
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-default ${bookingStep === 2
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500'
                          }`}
                      >
                        2. Checkout
                      </div>
                    </div>
                  </div>

                  {/* Step content with animation */}
                  <AnimatePresence mode="wait">
                    {bookingMode === 'standard' ? (
                      bookingStep === 1 ? (
                        <motion.div
                          key="standard-step1"
                          variants={stepTransitionVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <Step1StandardContent
                            formData={formData}
                            handleInputChange={handleInputChange}
                            AVAILABLE_LOCATIONS={AVAILABLE_LOCATIONS}
                            dropoffOptions={dropoffOptions}
                            selectedRoute={selectedRoute}
                            calculatedPrice={calculatedPrice}
                            getFieldError={getFieldError}
                            getInputClass={getInputClass}
                            minDateForInput={minDateForInput}
                            onPickupDateChange={onPickupDateChange}
                            passengerInput={passengerInput}
                            luggageInput={luggageInput}
                            onPassengersChange={onPassengersChange}
                            onPassengersBlur={onPassengersBlur}
                            onLuggageChange={onLuggageChange}
                            onLuggageBlur={onLuggageBlur}
                            markTouched={markTouched}
                            isStep1Valid={isStandardStep1Valid}
                            goToStep2={goToStep2Standard}
                            routesLoading={routesLoading}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="standard-step2"
                          variants={stepTransitionVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <Step2StandardContent
                            formData={formData}
                            selectedRoute={selectedRoute}
                            calculatedPrice={calculatedPrice}
                            getFieldError={getFieldError}
                            getInputClass={getInputClass}
                            markTouched={markTouched}
                            setBookingStep={setBookingStep}
                            isStep2FormValid={isStep2FormValid}
                            validateStep2={validateStep2}
                            handleInputChange={handleInputChange}
                          />
                        </motion.div>
                      )
                    ) : bookingMode === 'hourly' ? (
                      bookingStep === 1 ? (
                        <motion.div
                          key="hourly-step1"
                          variants={stepTransitionVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <Step1HourlyContent
                            formData={formData}
                            handleInputChange={handleInputChange}
                            getFieldError={getFieldError}
                            getInputClass={getInputClass}
                            minDateForInput={minDateForInput}
                            onPickupDateChange={onPickupDateChange}
                            passengerInput={passengerInput}
                            luggageInput={luggageInput}
                            onPassengersChange={onPassengersChange}
                            onPassengersBlur={onPassengersBlur}
                            onLuggageChange={onLuggageChange}
                            onLuggageBlur={onLuggageBlur}
                            markTouched={markTouched}
                            isStep1Valid={isHourlyStep1Valid}
                            goToStep2={goToStep2Hourly}
                            hourlyPrice={hourlyPrice}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="hourly-step2"
                          variants={stepTransitionVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <Step2HourlyContent
                            formData={formData}
                            hourlyPrice={hourlyPrice}
                            getFieldError={getFieldError}
                            getInputClass={getInputClass}
                            markTouched={markTouched}
                            setBookingStep={setBookingStep}
                            isStep2FormValid={isStep2FormValid}
                            validateStep2={validateStep2}
                            handleInputChange={handleInputChange}
                          />
                        </motion.div>
                      )
                    ) : null}

                    {/* Day Trip Mode */}
                    {bookingMode === 'daytrip' && (
                      bookingStep === 1 ? (
                        <motion.div
                          key="daytrip-step1"
                          variants={stepTransitionVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="space-y-4"
                        >


                          {/* Pickup Location */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                              <MapPin className="w-3 h-3" style={{ color: PRIMARY_COLOR }} />
                              Pickup Location
                            </label>
                            <input
                              type="text"
                              placeholder="Enter pickup address or location"
                              value={dayTripPickup}
                              onChange={e => setDayTripPickup(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-black focus:ring-2 focus:ring-[#18234B]/20 focus:border-[#18234B]"
                            />
                          </div>

                          {/* Destination */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                              <Navigation className="w-3 h-3" style={{ color: PRIMARY_COLOR }} />
                              Destination / Area to Explore
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Port Douglas, Daintree Rainforest, Tablelands"
                              value={dayTripDestination}
                              onChange={e => setDayTripDestination(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-black focus:ring-2 focus:ring-[#18234B]/20 focus:border-[#18234B]"
                            />
                          </div>

                          {/* Vehicle Selection Dropdown */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700">Select Vehicle</label>
                            <select
                              value={selectedDayTripVehicle?.vehicleType || ''}
                              onChange={e => {
                                const selected = dayTripPricing.find(p => p.vehicleType === e.target.value);
                                if (selected) {
                                  setSelectedDayTripVehicle({ vehicleType: selected.vehicleType, price: selected.price });
                                }
                              }}
                              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-black focus:ring-2 focus:ring-[#18234B]/20 focus:border-[#18234B] bg-white"
                            >
                              <option value="">Choose a vehicle...</option>
                              {dayTripPricing.map((p, idx) => (
                                <option key={idx} value={p.vehicleType}>
                                  {p.vehicleType} - {p.passengers} passengers - ${p.price}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Date, Time & Duration */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <Calendar className="w-3 h-3" style={{ color: PRIMARY_COLOR }} />
                                Date
                              </label>
                              <input
                                type="date"
                                value={formData.pickupDate}
                                min={minDateForInput}
                                onChange={e => handleInputChange('pickupDate', e.target.value)}
                                className="w-[92%] mx-auto px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-black focus:ring-2 focus:ring-[#18234B]/20 focus:border-[#18234B]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <Clock className="w-3 h-3" style={{ color: PRIMARY_COLOR }} />
                                Pickup Time
                              </label>
                              <input
                                type="time"
                                value={formData.pickupTime}
                                onChange={e => handleInputChange('pickupTime', e.target.value)}
                                className="w-[92%] mx-auto px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-black focus:ring-2 focus:ring-[#18234B]/20 focus:border-[#18234B]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <Clock className="w-3 h-3" style={{ color: PRIMARY_COLOR }} />
                                Duration
                              </label>
                              <div
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm font-semibold text-center"
                                style={{ color: PRIMARY_COLOR }}
                              >
                                8 Hours
                              </div>
                            </div>
                          </div>

                          {/* Price Preview & Continue */}
                          {selectedDayTripVehicle && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm text-gray-600">Estimated Total</span>
                                <span className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                  ${selectedDayTripVehicle.price}
                                </span>
                              </div>
                              <button
                                type="button"
                                disabled={!dayTripPickup || !dayTripDestination || !selectedDayTripVehicle || !formData.pickupDate || !formData.pickupTime}
                                onClick={() => setBookingStep(2)}
                                className="w-full py-3 rounded-xl font-bold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ backgroundColor: PRIMARY_COLOR }}
                              >
                                Book Now
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="daytrip-step2"
                          variants={stepTransitionVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Trip Summary - Left Side */}
                            <div className="w-full md:w-1/2 bg-gray-50 rounded-xl border border-dashed border-gray-300 p-5 relative">
                              <div className="absolute -left-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full"></div>
                              <div className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full"></div>

                              <h3
                                className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"
                                style={{ color: PRIMARY_COLOR }}
                              >
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: ACCENT_COLOR }}
                                ></span>
                                Day Trip Summary
                              </h3>

                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-start">
                                  <div className="flex flex-col">
                                    <span className="text-xs text-gray-500">Pickup</span>
                                    <span className="font-bold text-gray-900" style={{ color: PRIMARY_COLOR }}>
                                      {dayTripPickup}
                                    </span>
                                  </div>
                                  <div className="text-right flex flex-col items-end">
                                    <span className="text-xs text-gray-500">Date</span>
                                    <span className="font-semibold text-gray-900">{formData.pickupDate}</span>
                                    <span
                                      className="text-xs font-mono px-1 rounded"
                                      style={{ color: ACCENT_COLOR, backgroundColor: `${ACCENT_COLOR}20` }}
                                    >
                                      {formData.pickupTime}
                                    </span>
                                  </div>
                                </div>

                                <div className="w-full h-[1px] bg-gray-200"></div>

                                <div className="flex justify-between items-start">
                                  <div className="flex flex-col">
                                    <span className="text-xs text-gray-500">Destination</span>
                                    <span className="font-bold text-gray-900" style={{ color: PRIMARY_COLOR }}>
                                      {dayTripDestination}
                                    </span>
                                  </div>
                                  <div className="text-right flex flex-col items-end">
                                    <span className="text-xs text-gray-500">Vehicle</span>
                                    <span className="font-medium text-gray-900">{selectedDayTripVehicle?.vehicleType}</span>
                                    <span className="text-xs text-gray-500">8 Hours</span>
                                  </div>
                                </div>

                                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-end">
                                  <div className="flex flex-col">
                                    <span className="text-gray-500 font-medium">Total Quote</span>
                                    <span className="text-xs text-gray-400">Day Trip Charter</span>
                                  </div>
                                  <span className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>
                                    ${selectedDayTripVehicle?.price}
                                  </span>
                                </div>
                              </div>

                              {/* Note - Compact */}
                              <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                <strong>Note: Please contact us before booking.</strong> For any questions or issues—time, passengers, luggage, car type, price, or payment— reach us by phone or email. We’re happy to assist!
                              </p>
                            </div>

                            {/* Contact & Payment - Right Side */}
                            <div className="w-full md:w-1/2 flex flex-col">
                              <h3 className="text-base font-bold mb-3" style={{ color: PRIMARY_COLOR }}>
                                Contact Details
                              </h3>

                              <div className="space-y-2">
                                <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={formData.fullName}
                                    onChange={e => handleInputChange('fullName', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#18234B]/20 focus:border-[#18234B] text-gray-900"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                  <input
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={e => handleInputChange('email', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#18234B]/20 focus:border-[#18234B] text-gray-900"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                                  <input
                                    type="tel"
                                    placeholder="+61 400 000 000"
                                    value={formData.contactNumber}
                                    onChange={e => handleInputChange('contactNumber', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#18234B]/20 focus:border-[#18234B] text-gray-900"
                                  />
                                </div>
                              </div>

                              {/* Payment Summary */}
                              {selectedDayTripVehicle && (
                                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm space-y-2">
                                  <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wide">Payment Summary</h4>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Trip fare</span>
                                    <span className="font-medium text-gray-900">${selectedDayTripVehicle.price}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Processing fee (2.5%)</span>
                                    <span className="font-medium text-gray-900">${(selectedDayTripVehicle.price * 0.025).toFixed(2)}</span>
                                  </div>
                                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                                    <span className="font-semibold text-gray-900">Total</span>
                                    <span className="font-bold text-gray-900">${(selectedDayTripVehicle.price * 1.025).toFixed(2)}</span>
                                  </div>
                                </div>
                              )}

                              {/* Buttons */}
                              <div className="flex gap-3 mt-4">
                                <button
                                  onClick={() => setBookingStep(1)}
                                  className="px-4 py-2.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                                  type="button"
                                >
                                  <ArrowLeft className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={!formData.fullName || !formData.email || !formData.contactNumber || isDayTripRedirecting}
                                  onClick={async () => {
                                    setIsDayTripRedirecting(true);
                                    try {
                                      const booking = {
                                        bookingType: 'daytrip',
                                        dayTripPickup,
                                        dayTripDestination,
                                        dayTripVehicleType: selectedDayTripVehicle?.vehicleType,
                                        dayTripPrice: selectedDayTripVehicle?.price,
                                        pickupDate: formData.pickupDate,
                                        pickupTime: formData.pickupTime,
                                        fullName: formData.fullName,
                                        email: formData.email,
                                        contactNumber: formData.contactNumber,
                                        ...getStoredUtms(),
                                      };
                                      const res = await fetch('/api/create-checkout-session', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ booking }),
                                      });
                                      const data = await res.json();
                                      if (data.url) window.location.href = data.url;
                                      else {
                                        alert(data.error || 'Failed to create checkout session');
                                        setIsDayTripRedirecting(false);
                                      }
                                    } catch (err) {
                                      console.error(err);
                                      alert('Something went wrong. Please try again.');
                                      setIsDayTripRedirecting(false);
                                    }
                                  }}
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide transition shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:shadow-none"
                                >
                                  {isDayTripRedirecting ? (
                                    <>
                                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                      Redirecting...
                                    </>
                                  ) : (
                                    <>
                                      Pay & Confirm
                                      <CheckCircle className="w-4 h-4" />
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </div >
      </div >
    </div >
  );
}

/* -----------------------------
   STEP 1 CONTENT (STANDARD)
------------------------------*/
function Step1StandardContent(props: {
  formData: BookingFormData;
  handleInputChange: (
    field: keyof BookingFormData,
    value: string | number | boolean
  ) => void;
  AVAILABLE_LOCATIONS: string[];
  dropoffOptions: string[];
  selectedRoute: Route | null;
  calculatedPrice: number;
  getFieldError: (field: string) => string | null;
  getInputClass: (field: string, hasIconPadding?: boolean) => string;
  minDateForInput: string;
  onPickupDateChange: (v: string) => void;
  passengerInput: string;
  luggageInput: string;
  onPassengersChange: (v: string) => void;
  onPassengersBlur: () => void;
  onLuggageChange: (v: string) => void;
  onLuggageBlur: () => void;
  markTouched: (field: string) => void;
  isStep1Valid: () => boolean;
  goToStep2: () => void;
  routesLoading: boolean;
}) {
  const {
    formData,
    handleInputChange,
    AVAILABLE_LOCATIONS,
    dropoffOptions,
    selectedRoute,
    calculatedPrice,
    getFieldError,
    getInputClass,
    minDateForInput,
    onPickupDateChange,
    passengerInput,
    luggageInput,
    onPassengersChange,
    onPassengersBlur,
    onLuggageChange,
    onLuggageBlur,
    markTouched,
    isStep1Valid,
    goToStep2,
    routesLoading
  } = props;

  // derived disabled flags
  const isPickupDisabled = routesLoading || AVAILABLE_LOCATIONS.length === 0;
  const isDropoffDisabled =
    routesLoading || !formData.pickupLocation || dropoffOptions.length === 0;

  return (
    <div className="space-y-6">
      {/* Routes loading banner */}
      {routesLoading && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-800 mb-2">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          <span>
            Fetching available routes and prices… this usually takes just a
            moment.
          </span>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Pickup/Dropoff */}
        <div className="lg:col-span-5 space-y-4">
          {/* Pickup */}
          <div className="group relative">

            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#18234B]" />
                Pickup
              </label>
              {routesLoading ? (
                <span className="text-[11px] text-gray-400 italic">
                  Loading routes…
                </span>
              ) : (
                getFieldError('pickupLocation') && (
                  <span className="text-xs font-bold text-red-500 animate-pulse">
                    Required
                  </span>
                )
              )}
            </div>
            <select
              name="pickupLocation"
              value={formData.pickupLocation || ''}
              onChange={e => handleInputChange('pickupLocation', e.target.value)}
              onBlur={() => markTouched('pickupLocation')}
              disabled={isPickupDisabled}
              className={
                getInputClass('pickupLocation', false) +
                (isPickupDisabled ? ' cursor-not-allowed opacity-60' : '')
              }
            >
              {routesLoading ? (
                <option value="">..</option>
              ) : (
                <>
                  <option value="">Select Location</option>
                  {AVAILABLE_LOCATIONS.filter(loc => !loc.toLowerCase().includes('day trip')).map(loc => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Dropoff */}
          <div className="group relative">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#18234B]" />
                Dropoff
              </label>
              {routesLoading && formData.pickupLocation ? (
                <span className="text-[11px] text-gray-400 italic">
                  Loading destinations…
                </span>
              ) : (
                getFieldError('dropoffLocation') && (
                  <span className="text-xs font-bold text-red-500 animate-pulse">
                    Required
                  </span>
                )
              )}
            </div>
            <select
              name="dropoffLocation"
              value={formData.dropoffLocation || ''}
              onChange={e => handleInputChange('dropoffLocation', e.target.value)}
              onBlur={() => markTouched('dropoffLocation')}
              disabled={isDropoffDisabled}
              className={
                getInputClass('dropoffLocation', false) +
                (isDropoffDisabled ? ' cursor-not-allowed opacity-60' : '')
              }
            >
              {!formData.pickupLocation && !routesLoading && (
                <option value="">Select pickup first</option>
              )}

              {formData.pickupLocation && routesLoading && (
                <option value="">Loading destinations…</option>
              )}

              {formData.pickupLocation &&
                !routesLoading &&
                dropoffOptions.length === 0 && (
                  <option value="">No destinations available</option>
                )}

              {formData.pickupLocation &&
                !routesLoading &&
                dropoffOptions.length > 0 && (
                  <>
                    <option value="">Select Destination</option>
                    {dropoffOptions.map(loc => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </>
                )}
            </select>
          </div>
        </div>

        {/* Date / Time / Pax / Bags / Flight */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {/* Date */}
            <div className="col-span-1 sm:col-span-2">
              <div className="relative group">
                <div className="flex justify-between">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[#18234B]" />
                    Date
                  </label>
                  {getFieldError('pickupDate') && (
                    <span className="text-xs font-bold text-red-500">
                      Required
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.pickupDate}
                    min={minDateForInput}
                    onChange={e => onPickupDateChange(e.target.value)}
                    onBlur={() => markTouched('pickupDate')}
                    className={`${getInputClass(
                      'pickupDate', false
                    )} [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                  />
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="col-span-1 sm:col-span-2">
              <div className="relative group">
                <div className="flex justify-between items-center gap-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#18234B]" />
                    Time
                  </label>
                  {getFieldError('pickupTime') && (
                    <span className="text-xs font-bold text-red-500">
                      {getFieldError('pickupTime')}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.pickupTime}
                    min={getMinTimeForDate(formData.pickupDate)}
                    onChange={e => handleInputChange('pickupTime', e.target.value)}
                    onBlur={() => markTouched('pickupTime')}
                    className={`${getInputClass(
                      'pickupTime', false
                    )} [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                  />
                </div>
              </div>
            </div>

            {/* Pax */}
            <div className="col-span-1 sm:col-span-2">
              <div className="flex justify-between">
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[#18234B]" />
                  Pax
                </label>
                {getFieldError('passengers') && (
                  <span className="text-xs font-bold text-red-500">
                    {getFieldError('passengers')}
                  </span>
                )}
              </div>
              <div className="relative group">
                <input
                  type="number"
                  min={1}
                  max={MAX_PASSENGERS}
                  value={passengerInput}
                  onChange={e => onPassengersChange(e.target.value)}
                  onBlur={onPassengersBlur}
                  className={getInputClass('passengers', false)}
                />
              </div>
            </div>

            {/* Luggage */}
            <div className="col-span-1 sm:col-span-2">
              <div className="flex justify-between">
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-[#18234B]" />
                  Bags
                </label>
                {getFieldError('luggage') && (
                  <span className="text-xs font-bold text-red-500">
                    {getFieldError('luggage')}
                  </span>
                )}
              </div>
              <div className="relative group">
                <input
                  type="number"
                  min={0}
                  max={getMaxBagsForCurrentPax(formData.passengers)}
                  value={luggageInput}
                  onChange={e => onLuggageChange(e.target.value)}
                  onBlur={onLuggageBlur}
                  className={getInputClass('luggage', false)}
                />
              </div>
            </div>

            {/* Flight # */}
            <div className="col-span-2 sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Plane className="w-3 h-3 text-[#18234B]" />
                Flight #
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={formData.flightNumber}
                  onChange={e => handleInputChange('flightNumber', e.target.value)}
                  placeholder="Optional"
                  className={getInputClass('flightNumber', false)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Addresses */}
      {(formData.pickupLocation || formData.dropoffLocation) && (
        <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          {formData.pickupLocation && (
            <input
              type="text"
              value={formData.pickupAddress}
              onChange={e => handleInputChange('pickupAddress', e.target.value)}
              placeholder="Enter specific pickup address (Optional)"
              className={getInputClass('pickupAddress', false)}
            />
          )}
          {formData.dropoffLocation && (
            <input
              type="text"
              value={formData.dropoffAddress}
              onChange={e => handleInputChange('dropoffAddress', e.target.value)}
              placeholder="Enter specific dropoff address (Optional)"
              className={getInputClass('dropoffAddress', false)}
            />
          )}
        </div>
      )}

      {/* Route & Price */}
      {calculatedPrice > 0 && selectedRoute ? (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex-1 w-full">
              <div
                className="flex items-center gap-2 text-sm font-bold mb-2"
                style={{ color: PRIMARY_COLOR }}
              >
                <span className="text-gray-500 font-normal">Route:</span>
                <span className="truncate">{formData.pickupLocation}</span>
                <ArrowRight
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: ACCENT_COLOR }}
                />
                <span className="truncate">{formData.dropoffLocation}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-100">
                  <Navigation className="w-3 h-3" style={{ color: ACCENT_COLOR }} />
                  <span>
                    Distance:{' '}
                    <span
                      className="font-semibold"
                      style={{ color: PRIMARY_COLOR }}
                    >
                      {selectedRoute.distance || '-- km'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-100">
                  <Clock className="w-3 h-3" style={{ color: ACCENT_COLOR }} />
                  <span>
                    Duration:{' '}
                    <span
                      className="font-semibold"
                      style={{ color: PRIMARY_COLOR }}
                    >
                      {selectedRoute.duration || '-- min'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto text-right border-t md:border-t-0 md:border-l border-gray-200 pt-3 md:pt-0 md:pl-6 flex flex-row md:flex-col justify-between items-center md:items-end">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total Fare
              </span>
              <span
                className="text-3xl font-extrabold tracking-tight"
                style={{ color: PRIMARY_COLOR }}
              >
                ${calculatedPrice}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium leading-relaxed">
            For questions about bookings, routes, luggage, vehicles or pricing, feel free to contact us.
            For destinations outside our listed routes, we offer a rate of <span className="font-semibold">$3.80 per kilometre</span>.
            Reach us anytime by <a href="tel:+61470032460" className="underline">phone</a> or email.
          </p>


        </div>
      )}

      {/* Footer Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
        {/* Child seat only for STANDARD transfer */}
        <label className="flex items-center space-x-2 cursor-pointer group">
          <div
            className="w-5 h-5 rounded border flex items-center justify-center transition-colors"
            style={{
              backgroundColor: formData.childSeat ? ACCENT_COLOR : 'transparent',
              borderColor: formData.childSeat ? ACCENT_COLOR : 'rgb(209 213 219)'
            }}
          >
            {formData.childSeat && (
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            )}
          </div>
          <input
            type="checkbox"
            checked={formData.childSeat}
            onChange={e => handleInputChange('childSeat', e.target.checked)}
            className="hidden"
          />
          <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
            Child Seat (+$20)
          </span>
        </label>

        <button
          onClick={goToStep2}
          type="button"
          disabled={!isStep1Valid()}
          className="w-full md:w-auto text-white px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase transition-all shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:shadow-none"
          style={{
            backgroundColor: isStep1Valid() ? '#003366' : undefined,
            boxShadow: isStep1Valid() ? `0 8px 15px rgba(0, 51, 102, 0.3)` : undefined
          }}
        >
          Book Now <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* -----------------------------
   STEP 1 CONTENT (HOURLY)
------------------------------*/
function Step1HourlyContent(props: {
  formData: BookingFormData;
  handleInputChange: (
    field: keyof BookingFormData,
    value: string | number | boolean
  ) => void;
  getFieldError: (field: string) => string | null;
  getInputClass: (field: string, hasIconPadding?: boolean) => string;
  minDateForInput: string;
  onPickupDateChange: (v: string) => void;
  passengerInput: string;
  luggageInput: string;
  onPassengersChange: (v: string) => void;
  onPassengersBlur: () => void;
  onLuggageChange: (v: string) => void;
  onLuggageBlur: () => void;
  markTouched: (field: string) => void;
  isStep1Valid: () => boolean;
  goToStep2: () => void;
  hourlyPrice: number;
}) {
  const {
    formData,
    handleInputChange,
    getFieldError,
    getInputClass,
    minDateForInput,
    onPickupDateChange,
    passengerInput,
    luggageInput,
    onPassengersChange,
    onPassengersBlur,
    onLuggageChange,
    onLuggageBlur,
    markTouched,
    isStep1Valid,
    goToStep2,
    hourlyPrice
  } = props;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 space-y-2">
          {/* Label + error */}
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[#18234B]" />
              Pickup Location
            </label>
            {getFieldError('hourlyPickupLocation') && (
              <span className="text-xs font-bold text-red-500 animate-pulse">
                Required
              </span>
            )}
          </div>

          {/* Input + icon */}
          <div className="relative group">
            <input
              type="text"
              value={formData.hourlyPickupLocation}
              onChange={e =>
                handleInputChange('hourlyPickupLocation', e.target.value)
              }
              onBlur={() => markTouched('hourlyPickupLocation')}
              placeholder="Address, hotel, venue, etc."
              className={getInputClass('hourlyPickupLocation', false)}
            />
          </div>

          {/* Hours */}
          <div className="group relative">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#18234B]" />
                No. of Hours
              </label>
              {getFieldError('hourlyHours') && (
                <span className="text-xs font-bold text-red-500">
                  {getFieldError('hourlyHours')}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                min={2}
                max={8}
                value={formData.hourlyHours || ''}
                onChange={e =>
                  handleInputChange('hourlyHours', Number(e.target.value))
                }
                onBlur={() => markTouched('hourlyHours')}
                placeholder="2+"
                className={getInputClass('hourlyHours', false)}
              />
            </div>
          </div>

          {/* Vehicle type */}
          <div className="group relative">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">
                Vehicle Type
              </label>
              {getFieldError('hourlyVehicleType') && (
                <span className="text-xs font-bold text-red-500 animate-pulse">
                  Required
                </span>
              )}
            </div>
            <select
              value={formData.hourlyVehicleType || ''}
              onChange={e =>
                handleInputChange('hourlyVehicleType', e.target.value)
              }
              onBlur={() => markTouched('hourlyVehicleType')}
              className={getInputClass('hourlyVehicleType', false)}
            >
              <option value="">Select vehicle</option>
              <option value="Sedan">Sedan (1–3 pax)</option>
              <option value="SUV">SUV (up to 5 pax)</option>
              <option value="Van">Van (group / luggage)</option>
            </select>
          </div>
        </div>

        {/* Date / Time / Pax / Bags / Flight */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {/* Date */}
            <div className="col-span-1 sm:col-span-2">
              <div className="relative group">
                <div className="flex justify-between">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[#18234B]" />
                    Date
                  </label>
                  {getFieldError('pickupDate') && (
                    <span className="text-xs font-bold text-red-500">
                      Required
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.pickupDate}
                    min={minDateForInput}
                    onChange={e => onPickupDateChange(e.target.value)}
                    onBlur={() => markTouched('pickupDate')}
                    className={`${getInputClass(
                      'pickupDate', false
                    )} [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                  />
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="col-span-1 sm:col-span-2">
              <div className="relative group">
                <div className="flex justify-between items-center gap-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#18234B]" />
                    Time
                  </label>
                  {getFieldError('pickupTime') && (
                    <span className="text-xs font-bold text-red-500">
                      {getFieldError('pickupTime')}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.pickupTime}
                    min={getMinTimeForDate(formData.pickupDate)}
                    onChange={e => handleInputChange('pickupTime', e.target.value)}
                    onBlur={() => markTouched('pickupTime')}
                    className={`${getInputClass(
                      'pickupTime', false
                    )} [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                  />
                </div>
              </div>
            </div>

            {/* Pax */}
            <div className="col-span-1 sm:col-span-2">
              <div className="flex justify-between">
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[#18234B]" />
                  Pax
                </label>
                {getFieldError('passengers') && (
                  <span className="text-xs font-bold text-red-500">
                    {getFieldError('passengers')}
                  </span>
                )}
              </div>
              <div className="relative group">
                <input
                  type="number"
                  min={1}
                  max={MAX_PASSENGERS}
                  value={passengerInput}
                  onChange={e => onPassengersChange(e.target.value)}
                  onBlur={onPassengersBlur}
                  className={getInputClass('passengers', false)}
                />
              </div>
            </div>

            {/* Luggage */}
            <div className="col-span-1 sm:col-span-2">
              <div className="flex justify-between">
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-[#18234B]" />
                  Bags
                </label>
                {getFieldError('luggage') && (
                  <span className="text-xs font-bold text-red-500">
                    {getFieldError('luggage')}
                  </span>
                )}
              </div>
              <div className="relative group">
                <input
                  type="number"
                  min={0}
                  max={getMaxBagsForCurrentPax(formData.passengers)}
                  value={luggageInput}
                  onChange={e => onLuggageChange(e.target.value)}
                  onBlur={onLuggageBlur}
                  className={getInputClass('luggage', false)}
                />
              </div>
            </div>

            {/* Flight # */}
            <div className="col-span-2 sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Plane className="w-3 h-3 text-[#18234B]" />
                Flight #
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={formData.flightNumber}
                  onChange={e => handleInputChange('flightNumber', e.target.value)}
                  placeholder="Optional"
                  className={getInputClass('flightNumber', false)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Summary & Price */}
      {isStep1Valid() && hourlyPrice > 0 ? (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex-1 w-full">
              <div
                className="flex items-center gap-2 text-sm font-bold mb-2"
                style={{ color: PRIMARY_COLOR }}
              >
                <span className="text-gray-500 font-normal">
                  Chauffeur & Hourly Hire:
                </span>
                <span className="truncate">
                  {formData.hourlyVehicleType || 'Vehicle'}
                </span>
                <ArrowRight
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: ACCENT_COLOR }}
                />
                <span className="truncate">
                  {formData.hourlyHours} hour
                  {Number(formData.hourlyHours || 0) > 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  • Dedicated professional driver & wait time included for the
                  booked period.
                </p>
                <p>
                  • Business travel, weddings, events & custom itineraries
                  tailored to you.
                </p>
                <p className="text-[11px] text-gray-500">
                  Sedan: $120/hr (full-day: $820) • SUV/Van: $150/hr (full-day:
                  $1050)
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto text-right border-t md:border-t-0 md:border-l border-gray-200 pt-3 md:pt-0 md:pl-6 flex flex-row md:flex-col justify-between items-center md:items-end">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total Quote
              </span>
              <span
                className="text-3xl font-extrabold tracking-tight"
                style={{ color: PRIMARY_COLOR }}
              >
                ${hourlyPrice}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">
            Set pickup date & time, number of hours (min 2), and choose a
            vehicle type to see your hourly hire quote.
          </span>
        </div>
      )}

      {/* Footer Actions (NO Child Seat here) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-gray-500">
          2-hour minimum applies. 8 hours or more is charged at full-day
          charter rate.
        </div>

        <button
          onClick={goToStep2}
          type="button"
          disabled={!isStep1Valid()}
          className="w-full md:w-auto text-white px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase transition-all shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:shadow-none"
          style={{
            backgroundColor: isStep1Valid() ? '#003366' : undefined,
            boxShadow: isStep1Valid() ? `0 8px 15px rgba(0, 51, 102, 0.3)` : undefined
          }}
        >
          Book Now <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* -----------------------------
   STEP 2 CONTENT (STANDARD)
------------------------------*/
function Step2StandardContent(props: {
  formData: BookingFormData;
  selectedRoute: Route | null;
  calculatedPrice: number;
  getFieldError: (field: string) => string | null;
  getInputClass: (field: string, hasIconPadding?: boolean) => string;
  markTouched: (field: string) => void;
  setBookingStep: (n: 1 | 2) => void;
  isStep2FormValid: () => boolean;
  validateStep2: () => boolean;
  handleInputChange: (
    field: keyof BookingFormData,
    value: string | number | boolean
  ) => void;
}) {
  const {
    formData,
    selectedRoute,
    calculatedPrice,
    getFieldError,
    getInputClass,
    markTouched,
    setBookingStep,
    isStep2FormValid,
    validateStep2,
    handleInputChange
  } = props;

  const processingFee = calculateProcessingFee(calculatedPrice);
  const finalAmount = calculateFinalAmount(calculatedPrice);

  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePayAndRedirect = async () => {
    setPaymentError(null);

    const valid = validateStep2();
    if (!valid) {
      setPaymentError('Please fill in your contact details correctly.');
      return;
    }

    try {
      setLoadingPayment(true);

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          booking: {
            ...formData,
            bookingType: 'standard'
          }
        })
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setPaymentError(data.error || 'Could not start payment. Please try again.');
        setLoadingPayment(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setPaymentError('Payment failed. Please try again.');
      setLoadingPayment(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-5">
      {/* Summary */}
      <div className="w-full md:w-1/2 bg-gray-50 rounded-xl border border-dashed border-gray-300 p-4 relative order-1">
        <div className="absolute -left-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full"></div>
        <div className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full"></div>

        <h3
          className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"
          style={{ color: PRIMARY_COLOR }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
          ></span>
          Trip Summary
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">From</span>
              <span
                className="font-bold text-gray-900"
                style={{ color: PRIMARY_COLOR }}
              >
                {formData.pickupLocation}
              </span>
              <span className="text-xs text-gray-500 truncate max-w-[200px]">
                {formData.pickupAddress}
              </span>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-xs text-gray-500">Date</span>
              <span className="font-semibold text-gray-900">
                {formData.pickupDate}
              </span>
              <span
                className="text-xs font-mono px-1 rounded"
                style={{ color: ACCENT_COLOR, backgroundColor: `${ACCENT_COLOR}20` }}
              >
                {formData.pickupTime}
              </span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-gray-200"></div>

          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">To</span>
              <span
                className="font-bold text-gray-900"
                style={{ color: PRIMARY_COLOR }}
              >
                {formData.dropoffLocation}
              </span>
              <span className="text-xs text-gray-500 truncate max-w-[200px]">
                {formData.dropoffAddress}
              </span>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-xs text-gray-500">Details</span>
              <span className="font-medium text-gray-900">
                {formData.passengers} Pax, {formData.luggage} Bags
              </span>
              {formData.childSeat && (
                <span className="text-xs text-green-600">+ Child Seat</span>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-gray-500 font-medium">Total Quote</span>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {selectedRoute && (
                  <span>
                    {selectedRoute.distance} • {selectedRoute.duration}
                  </span>
                )}
              </div>
            </div>
            <span
              className="text-3xl font-bold text-gray-900"
              style={{ color: PRIMARY_COLOR }}
            >
              ${calculatedPrice}
            </span>
          </div>
        </div>

        {/* Note - Compact */}
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <strong>Note: Please contact us before booking.</strong> For any questions or issues—time, passengers, luggage, car type, price, or payment— reach us by phone or email. We’re happy to assist!
        </p>
      </div>

      {/* Contact + Payment */}
      <div className="w-full md:w-1/2 flex flex-col order-2">
        <div className="space-y-2">
          <h3
            className="text-base font-bold text-gray-900"
            style={{ color: PRIMARY_COLOR }}
          >
            Contact Details
          </h3>

          <div className="space-y-2">
            {/* Name */}
            <div>
              <div className="flex justify-between">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Full Name
                </label>
                {getFieldError('fullName') && (
                  <span className="text-xs text-red-500 font-bold">
                    {getFieldError('fullName')}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => handleInputChange('fullName', e.target.value)}
                onBlur={() => markTouched('fullName')}
                className={getInputClass('fullName', false)}
                placeholder="e.g. John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <div className="flex justify-between">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Email
                </label>
                {getFieldError('email') && (
                  <span className="text-xs text-red-500 font-bold">
                    {getFieldError('email')}
                  </span>
                )}
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                onBlur={() => markTouched('email')}
                className={getInputClass('email', false)}
                placeholder="john@example.com"
              />
            </div>

            {/* Mobile: country code + number */}
            <PhoneInput
              formData={formData}
              getFieldError={getFieldError}
              markTouched={markTouched}
              handleInputChange={handleInputChange}
            />
          </div>
        </div>

        {/* Payment Section */}
        <div className="mt-3 space-y-2">
          <h4 className="text-sm font-semibold text-gray-800">
            Payment Summary
          </h4>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-900">Trip fare</span>
              <span className="font-medium text-gray-900">${calculatedPrice}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-900">
                Payment processing fee (2.5%)
              </span>
              <span className="font-medium text-gray-900">${processingFee}</span>
            </div>

            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-semibold text-gray-900">
                Total amount payable
              </span>
              <span className="font-bold text-lg text-gray-900">
                ${finalAmount}
              </span>
            </div>
          </div>
          {paymentError && (
            <p className="text-xs text-red-500 mt-1">{paymentError}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => setBookingStep(1)}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              type="button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handlePayAndRedirect}
              type="button"
              disabled={!isStep2FormValid() || loadingPayment}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:shadow-none"
            >
              {loadingPayment
                ? 'Redirecting...'
                : `Pay & Confirm Booking`}
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   STEP 2 CONTENT (HOURLY)
------------------------------*/
function Step2HourlyContent(props: {
  formData: BookingFormData;
  hourlyPrice: number;
  getFieldError: (field: string) => string | null;
  getInputClass: (field: string, hasIconPadding?: boolean) => string;
  markTouched: (field: string) => void;
  setBookingStep: (n: 1 | 2) => void;
  isStep2FormValid: () => boolean;
  validateStep2: () => boolean;
  handleInputChange: (
    field: keyof BookingFormData,
    value: string | number | boolean
  ) => void;
}) {
  const {
    formData,
    hourlyPrice,
    getFieldError,
    getInputClass,
    markTouched,
    setBookingStep,
    isStep2FormValid,
    validateStep2,
    handleInputChange
  } = props;

  const processingFee = calculateProcessingFee(hourlyPrice);
  const finalAmount = calculateFinalAmount(hourlyPrice);

  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePayAndRedirect = async () => {
    setPaymentError(null);

    const valid = validateStep2();
    if (!valid) {
      setPaymentError('Please fill in your contact details correctly.');
      return;
    }

    if (!hourlyPrice || hourlyPrice <= 0) {
      setPaymentError('Invalid quote amount. Please adjust your booking.');
      return;
    }

    try {
      setLoadingPayment(true);

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          booking: {
            ...formData,
            bookingType: 'hourly'
          }
        })
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setPaymentError(data.error || 'Could not start payment. Please try again.');
        setLoadingPayment(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setPaymentError('Payment failed. Please try again.');
      setLoadingPayment(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-5">
      {/* Summary */}
      <div className="w-full md:w-1/2 bg-gray-50 rounded-xl border border-dashed border-gray-300 p-4 relative order-1">
        <div className="absolute -left-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full"></div>
        <div className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full"></div>

        <h3
          className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"
          style={{ color: PRIMARY_COLOR }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
          ></span>
          Hourly Hire Summary
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Pickup</span>
              <span
                className="font-bold text-gray-900"
                style={{ color: PRIMARY_COLOR }}
              >
                {formData.hourlyPickupLocation}
              </span>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-xs text-gray-500">Date</span>
              <span className="font-semibold text-gray-900">
                {formData.pickupDate}
              </span>
              <span
                className="text-xs font-mono px-1 rounded"
                style={{ color: ACCENT_COLOR, backgroundColor: `${ACCENT_COLOR}20` }}
              >
                {formData.pickupTime}
              </span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-gray-200"></div>

          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Details</span>
              <span className="font-medium text-gray-900">
                {formData.hourlyHours} hour
                {Number(formData.hourlyHours || 0) > 1 ? 's' : ''} •{' '}
                {formData.hourlyVehicleType || 'Vehicle'}
              </span>
              <span className="text-xs text-gray-500">
                {formData.passengers} Pax, {formData.luggage} Bags
              </span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-gray-500 font-medium">Total Quote</span>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Chauffeur & Hourly Hire</span>
              </div>
            </div>
            <span
              className="text-3xl font-bold text-gray-900"
              style={{ color: PRIMARY_COLOR }}
            >
              ${hourlyPrice}
            </span>
          </div>
        </div>

        {/* Note - Compact */}
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <strong>Note: Please contact us before booking.</strong> For any questions or issues—time, passengers, luggage, car type, price, or payment— reach us by phone or email. We’re happy to assist!
        </p>
      </div>

      {/* Contact + Payment */}
      <div className="w-full md:w-1/2 flex flex-col order-2">
        <div className="space-y-2">
          <h3
            className="text-base font-bold text-gray-900"
            style={{ color: PRIMARY_COLOR }}
          >
            Contact Details
          </h3>

          <div className="space-y-2">
            {/* Name */}
            <div>
              <div className="flex justify-between">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Full Name
                </label>
                {getFieldError('fullName') && (
                  <span className="text-xs text-red-500 font-bold">
                    {getFieldError('fullName')}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => handleInputChange('fullName', e.target.value)}
                onBlur={() => markTouched('fullName')}
                className={getInputClass('fullName', false)}
                placeholder="e.g. John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <div className="flex justify-between">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Email
                </label>
                {getFieldError('email') && (
                  <span className="text-xs text-red-500 font-bold">
                    {getFieldError('email')}
                  </span>
                )}
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                onBlur={() => markTouched('email')}
                className={getInputClass('email', false)}
                placeholder="john@example.com"
              />
            </div>

            {/* Mobile: country code + number */}
            <PhoneInput
              formData={formData}
              getFieldError={getFieldError}
              markTouched={markTouched}
              handleInputChange={handleInputChange}
            />
          </div>
        </div>

        {/* Payment Section */}
        <div className="mt-3 space-y-2">
          <h4 className="text-sm font-semibold text-gray-800">
            Payment Summary
          </h4>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Hourly hire quote</span>
              <span className="font-medium text-gray-900">${hourlyPrice}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Processing fee (2.5%)</span>
              <span className="font-medium text-gray-900">${processingFee}</span>
            </div>

            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-gray-900">${finalAmount}</span>
            </div>
          </div>
          {paymentError && (
            <p className="text-xs text-red-500 mt-1">{paymentError}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => setBookingStep(1)}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              type="button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handlePayAndRedirect}
              type="button"
              disabled={!isStep2FormValid() || loadingPayment || !hourlyPrice}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:shadow-none"
            >
              {loadingPayment
                ? 'Redirecting...'
                : `Pay & Confirm Booking`}
              <CheckCircle className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   Phone Input Component (simplified)
------------------------------*/
type PhoneInputProps = {
  formData: BookingFormData;
  getFieldError: (field: string) => string | null;
  markTouched: (field: string) => void;
  handleInputChange: (
    field: keyof BookingFormData,
    value: string | number | boolean
  ) => void;
};

type PhoneCountry = (typeof PHONE_COUNTRIES)[number];

function PhoneInput({
  formData,
  getFieldError,
  markTouched,
  handleInputChange
}: PhoneInputProps) {
  const error = getFieldError('contactNumber');

  // Helper: parse initial full number into dialCode + localNumber
  const parseInitialPhone = (full: string | number | undefined) => {
    const existing = String(full || '').trim();
    if (!existing) {
      const fallback = PHONE_COUNTRIES.find(c => c.code === 'AU') ?? PHONE_COUNTRIES[0];
      return {
        country: fallback,
        dialCode: fallback.dialCode,
        number: ''
      };
    }

    // Try to find a matching country by dialCode prefix
    const match =
      PHONE_COUNTRIES
        .slice()
        .sort((a, b) => b.dialCode.length - a.dialCode.length)
        .find(c => existing.startsWith(c.dialCode)) ??
      (PHONE_COUNTRIES.find(c => c.code === 'AU') ?? PHONE_COUNTRIES[0]);

    const dial = match.dialCode;
    const local = existing.replace(dial, '').replace(/\D/g, '');

    return {
      country: match,
      dialCode: dial,
      number: local
    };
  };

  const initial = parseInitialPhone(formData.contactNumber);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<PhoneCountry>(initial.country);
  const [dialCode, setDialCode] = useState<string>(initial.dialCode);
  const [phoneNumber, setPhoneNumber] = useState<string>(initial.number);

  // Whenever dialCode/phoneNumber change, push combined value up to the form
  useEffect(() => {
    const combined = phoneNumber ? `${dialCode}${phoneNumber}` : '';
    // Only update if actually changed, to avoid unnecessary parent re-renders
    if (combined !== formData.contactNumber) {
      handleInputChange('contactNumber', combined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialCode, phoneNumber]);

  // Ensure selected country follows dialCode, if it matches a known one
  useEffect(() => {
    const match = PHONE_COUNTRIES
      .slice()
      .sort((a, b) => b.dialCode.length - a.dialCode.length)
      .find(c => dialCode.startsWith(c.dialCode));
    if (match && match.code !== selectedCountry.code) {
      setSelectedCountry(match);
    }
  }, [dialCode, selectedCountry.code]);

  const onPhoneChange = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    setPhoneNumber(numeric);
  };

  const onDialCodeChange = (raw: string) => {
    // Keep only '+' and digits
    let v = raw.replace(/[^\d+]/g, '');

    // Ensure a single leading '+'
    v = v.replace(/\+/g, '');
    v = '+' + v;

    // Limit to + + 3 digits => max length 4
    const digits = v.slice(1).replace(/\D/g, '').slice(0, 3);
    const finalValue = '+' + digits;

    setDialCode(finalValue);
  };

  const onSelectCountry = (country: PhoneCountry) => {
    setSelectedCountry(country);
    setDialCode(country.dialCode);
    setIsOpen(false);
  };

  return (
    <div className="space-y-1 relative">
      <div className="flex justify-between">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Mobile
        </label>
        {error && (
          <span className="text-xs text-red-500 font-bold">{error}</span>
        )}
      </div>

      <div
        className={`flex items-stretch rounded-xl bg-white border ${error ? 'border-red-500' : 'border-gray-200'
          } shadow-sm overflow-hidden`}
      >
        {/* Country selector + editable dial code */}
        <div className="flex items-center bg-gray-50 border-r border-gray-200 px-2 py-2 gap-1.5 shrink-0">
          {/* Flag + dropdown trigger */}
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className="inline-flex items-center gap-1 px-1 py-0.5 text-sm font-medium text-gray-700"
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {/* Editable dial code (max 3 digits) */}
          <input
            type="tel"
            inputMode="numeric"
            maxLength={4} // '+' + 3 digits
            className="w-20 bg-transparent outline-none border-none text-sm font-medium text-gray-900"
            value={dialCode}
            onChange={e => onDialCodeChange(e.target.value)}
          />
        </div>

        {/* Phone number input – digits only */}
        <div className="relative flex-1">
          <input
            id="phone-input"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={phoneNumber}
            onChange={e => onPhoneChange(e.target.value)}
            onBlur={() => markTouched('contactNumber')}
            className="w-full px-3 py-2.5 text-sm font-medium text-gray-900 bg-white outline-none border-none placeholder:text-gray-400"
            placeholder="400000000"
          />
        </div>
      </div>

      {/* Country dropdown */}
      {isOpen && (
        <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
          <ul className="text-sm py-1">
            {PHONE_COUNTRIES.map(country => (
              <li key={country.code}>
                <button
                  type="button"
                  onClick={() => onSelectCountry(country)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left"
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1">
                    {country.name}{' '}
                    <span className="text-gray-500">
                      ({country.dialCode})
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
