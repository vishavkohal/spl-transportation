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
  AlertTriangle,
  ChevronDown,
  Info
} from 'lucide-react';
import SurchargeModal from './SurchargeModal';
import { Phone as Phone } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { BookingFormData, Route } from '../types';
import { Services } from './Services';
import CustomerReviews from './CustomerReviews';
import HeroBackground from "./HeroBackground";
import { PHONE_COUNTRIES_LIST } from '../lib/phonecodes';
import { useDebouncedCallback } from 'use-debounce';
import {
  AFTER_HOURS_SURCHARGE,
  AFTER_HOURS_SURCHARGE_NOTICE,
  isAfterHours,
} from '@/app/lib/afterHours';
import { getStoredUtms } from '@/app/lib/utm';

import { COLORS } from '../lib/colors';

// Custom colors
const PRIMARY_COLOR = COLORS.primary;
const ACCENT_COLOR = COLORS.primary;
const COMPANY_PHONE = '+61470032460';

// Business rules
const MAX_PASSENGERS = 7;
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
  const count = pax || 1;
  if (count <= 5) return 3;
  if (count === 6) return 2;
  if (count <= MAX_PASSENGERS) return 4;
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

function FieldError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg bg-red-50/90 border border-red-200/90 text-red-700 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200 shadow-xs">
      <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
      <span>{error}</span>
    </div>
  );
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
   Framer Motion variants — Apple-style
------------------------------*/
const heroContentVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
  }
};

const heroDotsVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
  }
};

const bookingCardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.15
    }
  }
};

// Smooth step transition variants
const stepTransitionVariants: Variants = {
  hidden: { opacity: 0, x: 20, position: 'absolute' },
  visible: {
    opacity: 1,
    x: 0,
    position: 'relative',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  },
  exit: {
    opacity: 0,
    x: -20,
    position: 'absolute',
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
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
  const [showSurchargeModal, setShowSurchargeModal] = useState(false);

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
          return 'Min 30 mins advance notice required';
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

  const getInputClass = (field: string, hasIconPadding: boolean = false) => {
    const error = getFieldError(field);
    const padding = hasIconPadding ? 'pl-9 pr-8' : 'px-3.5 pr-8';

    const base =
      `w-full ${padding} py-2 rounded-xl outline-none font-medium text-xs sm:text-sm ` +
      `transition-all duration-200 appearance-none relative z-10 text-slate-900 `;

    if (error) {
      return (
        base +
        'bg-red-50/60 border border-red-300 ring-2 ring-red-500/20 focus:ring-2 focus:ring-red-500 ' +
        'placeholder-red-300'
      );
    }

    return (
      base +
      'bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 ' +
      'focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 placeholder-slate-400 shadow-xs'
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
    <div className="min-h-screen bg-[#f8fafc]">
      {/* STACKED HERO SECTION */}
      <div className="relative bg-[#102A43] text-white pt-16 pb-36 md:pt-24 md:pb-48 overflow-hidden">
        {/* Background Image Wrapper */}
        <div className="absolute inset-0 z-0">
          <HeroBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75 z-10" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>PRIVATE TRANSFERS IN CAIRNS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-md tracking-tight leading-tight mb-4">
              Premium Transfers.<br />
              <span className="text-[#2DD4BF]">Every Journey.</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-gray-200 font-light mb-6 max-w-2xl leading-relaxed drop-shadow">
              Fixed prices, professional drivers and premium vehicles for your comfort across Cairns & Tropical North Queensland.
            </p>

            {/* Feature Bullets */}
            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-semibold text-white">
              <div className="flex items-center gap-2 drop-shadow">
                <CheckCircle className="w-4 h-4 text-[#2DD4BF]" />
                <span>Fixed, All-Inclusive Pricing</span>
              </div>
              <div className="flex items-center gap-2 drop-shadow">
                <MapPin className="w-4 h-4 text-[#2DD4BF]" />
                <span>Professional Local Drivers</span>
              </div>
              <div className="flex items-center gap-2 drop-shadow">
                <Clock className="w-4 h-4 text-[#2DD4BF]" />
                <span>Private Rides</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* OVERLAPPING BOOKING FORM CONTAINER */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 md:-mt-12 mb-16">
        <motion.div
          ref={formTopRef}
          id="booking-form"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="
            rounded-3xl bg-white 
            shadow-[0_20px_50px_rgba(0,0,0,0.12)] 
            border border-gray-100 
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

          <div className="p-5 lg:p-6">
            {/* Mode Selection Tabs (Segmented Control) */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-5 relative">
              {/* Sliding Background (Optional advanced feature, using simple conditional styles for now) */}

              {/* Standard Tab */}
              <button
                type="button"
                onClick={() => {
                  setBookingMode('standard');
                  setBookingStep(1);
                }}
                className={`
                        flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold text-center transition-all duration-200 ease-out
                        ${bookingMode === 'standard'
                    ? 'bg-[#102A43] text-white shadow-md'
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
                        flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold text-center transition-all duration-200 ease-out
                        ${bookingMode === 'hourly'
                    ? 'bg-[#102A43] text-white shadow-md'
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
                    ? 'bg-[#102A43] text-white shadow-md'
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
                  style={{ color: '#19324D' }}
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
                      onOpenSurchargeModal={() => setShowSurchargeModal(true)}
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
                      onOpenSurchargeModal={() => setShowSurchargeModal(true)}
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
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-black focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
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
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-black focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
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
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-black focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] bg-white"
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
                          className="w-[92%] mx-auto px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-black focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between w-[92%] mx-auto">
                          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                            <Clock className="w-3 h-3" style={{ color: PRIMARY_COLOR }} />
                            Pickup Time
                          </label>
                        </div>
                        <input
                          type="time"
                          value={formData.pickupTime}
                          onChange={e => handleInputChange('pickupTime', e.target.value)}
                          className="w-[92%] mx-auto px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-black focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                        />
                        {isAfterHours(formData.pickupTime) && (
                          <div className="w-[92%] mx-auto mt-1 p-2 rounded-lg bg-amber-50 border border-amber-200/90 flex items-center justify-between text-[11px] text-amber-900 shadow-xs">
                            <span className="font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>After-hours (9 PM - 5 AM): <strong>+$30 fee</strong></span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowSurchargeModal(true)}
                              className="text-amber-700 font-bold underline shrink-0 ml-1"
                            >
                              Details
                            </button>
                          </div>
                        )}
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
                            ${selectedDayTripVehicle.price + (isAfterHours(formData.pickupTime) ? AFTER_HOURS_SURCHARGE : 0)}
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
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                            <input
                              type="email"
                              placeholder="john@example.com"
                              value={formData.email}
                              onChange={e => handleInputChange('email', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                            <input
                              type="tel"
                              placeholder="+61 400 000 000"
                              value={formData.contactNumber}
                              onChange={e => handleInputChange('contactNumber', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] text-gray-900"
                            />
                          </div>
                        </div>

                        {/* Payment Summary */}
                        {selectedDayTripVehicle && (() => {
                          const dtAfterHours = isAfterHours(formData.pickupTime) ? AFTER_HOURS_SURCHARGE : 0;
                          const dtBase = selectedDayTripVehicle.price + dtAfterHours;
                          const dtFee = calculateProcessingFee(dtBase);
                          const dtTotal = calculateFinalAmount(dtBase);
                          return (
                            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm space-y-2">
                              <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wide">Payment Summary</h4>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Trip fare</span>
                                <span className="font-medium text-gray-900">${selectedDayTripVehicle.price}</span>
                              </div>
                              {dtAfterHours > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-amber-600 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    After-hours surcharge
                                  </span>
                                  <span className="font-medium text-amber-600">${AFTER_HOURS_SURCHARGE}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-600">Processing fee (2.5%)</span>
                                <span className="font-medium text-gray-900">${dtFee.toFixed(2)}</span>
                              </div>
                              <div className="border-t border-gray-200 pt-2 flex justify-between">
                                <span className="font-semibold text-gray-900">Total</span>
                                <span className="font-bold text-gray-900">${dtTotal.toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        })()}

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
                                if (data.url) {
                                  sessionStorage.setItem('spl_stripe_redirect', '1');
                                  window.location.href = data.url;
                                }
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

          {/* Trust Guarantees Bar */}
          <div className="border-t border-gray-100 bg-slate-50/80 px-5 py-3.5 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs font-medium text-slate-600">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span>Free cancellation up to 24h</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span>Up to 60 minutes free waiting</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span>Instant booking confirmation</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Surcharge Explanation Modal */}
      <SurchargeModal
        isOpen={showSurchargeModal}
        onClose={() => setShowSurchargeModal(false)}
      />
    </div>
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
  onOpenSurchargeModal: () => void;
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
    routesLoading,
    onOpenSurchargeModal
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

      {/* ── Transfer Type Toggle (One Way vs Round Trip) ── */}
      <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold mb-2">
        <button
          type="button"
          onClick={() => handleInputChange('transferType', 'one-way')}
          className={`px-4 py-1.5 rounded-lg transition-all ${
            (formData.transferType || 'one-way') === 'one-way'
              ? 'bg-[#102A43] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          One Way
        </button>
        <button
          type="button"
          onClick={() => handleInputChange('transferType', 'round-trip')}
          className={`px-4 py-1.5 rounded-lg transition-all ${
            formData.transferType === 'round-trip'
              ? 'bg-[#102A43] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Round Trip
        </button>
      </div>

      {/* Grid Layout */}
      <div className="space-y-6">
        {/* Row 1: Pickup, Dropoff, Date, Time (single row on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-[1.2fr_1.2fr_0.75fr_0.6fr] gap-4">
          {/* Pickup */}
          <div className="group relative">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#102A43]" />
                Pickup
              </label>
              {routesLoading && (
                <span className="text-[11px] text-gray-400 italic">
                  Loading…
                </span>
              )}
            </div>
            <div className="relative">
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
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-20" />
            </div>
            <FieldError error={getFieldError('pickupLocation')} />
          </div>

          {/* Dropoff */}
          <div className="group relative">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#102A43]" />
                Dropoff
              </label>
              {routesLoading && formData.pickupLocation && (
                <span className="text-[11px] text-gray-400 italic">
                  Loading…
                </span>
              )}
            </div>
            <div className="relative">
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
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-20" />
            </div>
            <FieldError error={getFieldError('dropoffLocation')} />
          </div>

          {/* Date */}
          <div className="relative group">
            <div className="flex justify-between">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-[#102A43]" />
                Date
              </label>
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
            <FieldError error={getFieldError('pickupDate')} />
          </div>

          {/* Time */}
          <div className="relative group">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-700 ml-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#102A43]" />
                Time
              </label>
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
            <FieldError error={getFieldError('pickupTime')} />
            {isAfterHours(formData.pickupTime) && (
              <div className="mt-1.5 p-2 rounded-xl bg-amber-50/90 border border-amber-200/90 flex items-center justify-between text-xs text-amber-900 shadow-xs">
                <span className="font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>After-hours (9 PM - 5 AM): <strong>+$30 surcharge</strong></span>
                </span>
                <button
                  type="button"
                  onClick={onOpenSurchargeModal}
                  className="text-amber-700 font-bold underline hover:text-amber-900 shrink-0 ml-2"
                >
                  Details
                </button>
              </div>
            )}
          </div>
        </div>

        {formData.transferType === 'round-trip' && (
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0F766E] flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Return Transfer Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Return Date</label>
                <input
                  type="date"
                  min={formData.pickupDate || minDateForInput}
                  value={formData.returnDate || ''}
                  onChange={e => handleInputChange('returnDate', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Return Time</label>
                <input
                  type="time"
                  value={formData.returnTime || ''}
                  onChange={e => handleInputChange('returnTime', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Return Flight # (Optional)</label>
                <input
                  type="text"
                  value={formData.returnFlightNumber || ''}
                  onChange={e => handleInputChange('returnFlightNumber', e.target.value)}
                  placeholder="e.g. QF802"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Row 2: Pax (Dropdown), Bags (Dropdown), Flight #, Child Seat (single row on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-[0.4fr_0.4fr_0.65fr_auto] gap-4 items-end">
          {/* Pax Dropdown */}
          <div>
            <div className="flex justify-between">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-[#102A43]" />
                Passengers
              </label>
            </div>
            <div className="relative">
              <select
                value={formData.passengers}
                onChange={e => {
                  const val = Number(e.target.value);
                  handleInputChange('passengers', val);
                  onPassengersChange(String(val));
                }}
                onBlur={onPassengersBlur}
                className={getInputClass('passengers', false)}
              >
                {Array.from({ length: MAX_PASSENGERS }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-20" />
            </div>
            <FieldError error={getFieldError('passengers')} />
          </div>

          {/* Luggage Dropdown */}
          <div>
            <div className="flex justify-between">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3 text-[#102A43]" />
                Bags
              </label>
            </div>
            <div className="relative">
              <select
                value={formData.luggage}
                onChange={e => {
                  const val = Number(e.target.value);
                  handleInputChange('luggage', val);
                  onLuggageChange(String(val));
                }}
                onBlur={onLuggageBlur}
                className={getInputClass('luggage', false)}
              >
                {Array.from({ length: getMaxBagsForCurrentPax(formData.passengers) + 1 }, (_, i) => i).map(num => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-20" />
            </div>
            <FieldError error={getFieldError('luggage')} />
          </div>

          {/* Flight # */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
              <Plane className="w-3 h-3 text-[#102A43]" />
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

          {/* Child Seat Selector */}
          <div className="col-span-2 md:col-span-1 pb-2 md:pb-2.5">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <div
                className="w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0"
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
              <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-gray-900 whitespace-nowrap">
                Child Seat (+$20)
              </span>
            </label>
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
        <div className="mt-2.5 text-xs text-slate-500 flex items-start gap-2 px-1">
          <AlertCircle className="w-3.5 h-3.5 text-[#102A43] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <a href="/contact" className="text-[#102A43] font-bold underline hover:text-[#0F766E] transition-colors">
              Request a custom quote
            </a>{' '}
            for bookings, routes, luggage, vehicles, pricing, or destinations outside our standard service area.
          </p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-end pt-2">

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
  onOpenSurchargeModal: () => void;
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
    hourlyPrice,
    onOpenSurchargeModal
  } = props;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 space-y-2">
          {/* Label + error */}
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[#102A43]" />
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
            <FieldError error={getFieldError('hourlyPickupLocation')} />
          </div>

          {/* Hours */}
          <div className="group relative">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#102A43]" />
                No. of Hours
              </label>
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
            <FieldError error={getFieldError('hourlyHours')} />
          </div>

          {/* Vehicle type */}
          <div className="group relative">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">
                Vehicle Type
              </label>
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
            <FieldError error={getFieldError('hourlyVehicleType')} />
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
                    <Calendar className="w-3 h-3 text-[#102A43]" />
                    Date
                  </label>
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
                <FieldError error={getFieldError('pickupDate')} />
              </div>
            </div>

            {/* Time */}
            <div className="col-span-1 sm:col-span-2">
              <div className="relative group">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-700 ml-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#102A43]" />
                    Time
                  </label>
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
                <FieldError error={getFieldError('pickupTime')} />
                {isAfterHours(formData.pickupTime) && (
                  <div className="mt-1.5 p-2 rounded-xl bg-amber-50/90 border border-amber-200/90 flex items-center justify-between text-xs text-amber-900 shadow-xs">
                    <span className="font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>After-hours (9 PM - 5 AM): <strong>+$30 surcharge</strong></span>
                    </span>
                    <button
                      type="button"
                      onClick={onOpenSurchargeModal}
                      className="text-amber-700 font-bold underline hover:text-amber-900 shrink-0 ml-2"
                    >
                      Details
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Pax */}
            <div className="col-span-1 sm:col-span-2">
              <div className="flex justify-between">
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[#102A43]" />
                  Pax
                </label>
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
              <FieldError error={getFieldError('passengers')} />
            </div>

            {/* Luggage */}
            <div className="col-span-1 sm:col-span-2">
              <div className="flex justify-between">
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-[#102A43]" />
                  Bags
                </label>
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
              <FieldError error={getFieldError('luggage')} />
            </div>

            {/* Flight # */}
            <div className="col-span-2 sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1 flex items-center gap-1.5">
                <Plane className="w-3 h-3 text-[#102A43]" />
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
      sessionStorage.setItem('spl_stripe_redirect', '1');
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
              </div>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => handleInputChange('fullName', e.target.value)}
                onBlur={() => markTouched('fullName')}
                className={getInputClass('fullName', false)}
                placeholder="e.g. John Doe"
              />
              <FieldError error={getFieldError('fullName')} />
            </div>

            {/* Email */}
            <div>
              <div className="flex justify-between">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Email
                </label>
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                onBlur={() => markTouched('email')}
                className={getInputClass('email', false)}
                placeholder="john@example.com"
              />
              <FieldError error={getFieldError('email')} />
            </div>

            {/* Mobile: country code + number */}
            <PhoneInput
              formData={formData}
              getFieldError={getFieldError}
              markTouched={markTouched}
              handleInputChange={handleInputChange}
            />

            {/* Promo Code Input */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2">
              <label className="block text-xs font-bold text-slate-700">Have a promo code?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.promoCode || ''}
                  onChange={e => handleInputChange('promoCode', e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER10"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold tracking-wider text-slate-900 bg-white"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.promoCode) return;
                    try {
                      const res = await fetch('/api/promos/validate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          code: formData.promoCode,
                          amount: calculatedPrice,
                          transferType: formData.transferType || 'one-way',
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'Invalid promo code');
                      handleInputChange('appliedDiscount', data.promo);
                    } catch (err: any) {
                      alert(err.message || 'Invalid promo code');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#102A43] text-white hover:bg-[#0F766E] transition"
                >
                  Apply
                </button>
              </div>
              {formData.appliedDiscount && (
                <div className="text-[11px] font-bold text-emerald-700">
                  ✓ Code {formData.appliedDiscount.code} applied (-${formData.appliedDiscount.discountAmount} AUD)
                </div>
              )}
            </div>
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

            {isAfterHours(formData.pickupTime) && (
              <div className="flex justify-between">
                <span className="text-amber-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  After-hours surcharge
                </span>
                <span className="font-medium text-amber-600">${AFTER_HOURS_SURCHARGE}</span>
              </div>
            )}

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

  const afterHoursFee = isAfterHours(formData.pickupTime) ? AFTER_HOURS_SURCHARGE : 0;
  const hourlyPriceWithSurcharge = hourlyPrice + afterHoursFee;
  const processingFee = calculateProcessingFee(hourlyPriceWithSurcharge);
  const finalAmount = calculateFinalAmount(hourlyPriceWithSurcharge);

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
      sessionStorage.setItem('spl_stripe_redirect', '1');
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

            {afterHoursFee > 0 && (
              <div className="flex justify-between">
                <span className="text-amber-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  After-hours surcharge
                </span>
                <span className="font-medium text-amber-600">${AFTER_HOURS_SURCHARGE}</span>
              </div>
            )}

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
