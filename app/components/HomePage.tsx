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
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { BookingFormData, Route } from '../types';
import { Services } from './Services';
import CustomerReviews from './CustomerReviews';
import HeroSection from './FeatureSection';

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
  { maxPax: 7, maxBags: 2 },
];

// slideshow images
const heroImages = ['/copy.jpg', '/copy2.png', '/copy3.png'];

const DiscountSticker = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(80px + 20px)',
        right: '20px',
        zIndex: 9999,
        cursor: 'pointer'
      }}
    >
      <Image
        src="/sticker.png"
        alt="Discount sticker"
        width={240}
        height={80}
        priority={false}
        style={{ display: 'block', objectFit: 'contain' }}
      />
    </div>
  );
};

// Helper: max bags for pax
function getMaxBagsForCurrentPax(pax: number): number {
  if (pax >= 1 && pax <= 4) return 3;
  if (pax >= 5 && pax <6)  return 3;
   if (pax > 5 && pax <=6)  return 2;
  if (pax > 6 && pax <= MAX_PASSENGERS) return 4;
  return MAX_LUGGAGE;
}

// Helper: min date/time
function getMinDateForInput() {
  const now = new Date();
  return new Date(now.getTime()).toISOString().slice(0, 10);
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

/* -----------------------------
   Framer Motion variants
------------------------------*/
const heroContentVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' }
  }
};

const heroDotsVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut', delay: 0.4 }
  }
};

const bookingCardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', delay: 0.2 }
  }
};

const stepTransitionVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } }
};

export default function HomePage(props: {
  formData: BookingFormData;
  handleInputChange: (field: keyof BookingFormData, value: string | number | boolean) => void;
  bookingStep: 1 | 2;
  setBookingStep: (n: 1 | 2) => void;
  setCurrentPage: (p: string) => void;
  AVAILABLE_LOCATIONS: string[];
  dropoffOptions: string[];
  selectedRoute: Route | null;
  calculatedPrice: number;
}) {
  const {
    formData,
    handleInputChange,
    bookingStep,
    setBookingStep,
    AVAILABLE_LOCATIONS,
    dropoffOptions,
    selectedRoute,
    calculatedPrice
  } = props;

  const formTopRef = useRef<HTMLDivElement>(null);

  const [passengerInput, setPassengerInput] = useState<string>(String(formData.passengers));
  const [luggageInput, setLuggageInput] = useState<string>(String(formData.luggage));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [firstHeroLoaded, setFirstHeroLoaded] = useState(false); // 👈 NEW: track first image load

  const minDateForInput = getMinDateForInput();

  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Scroll + slideshow
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
    }
  }, []);

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
      formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

      default:
        return null;
    }
  };

  const getInputClass = (field: string, hasIconPadding: boolean = true) => {
    const error = getFieldError(field);
    const padding = hasIconPadding ? 'pl-10' : 'pl-4';

    const base =
      `w-full ${padding} pr-4 py-3 rounded-xl outline-none font-medium text-base ` +
      `transition-all duration-200 appearance-none relative z-10 `;
    const theme = 'bg-white text-gray-900 ';

    if (error) {
      return (
        base +
        theme +
        'border border-red-500 ring-1 ring-red-500 focus:ring-2 focus:ring-red-500 ' +
        'focus:border-red-500 placeholder-red-300'
      );
    }

    return (
      base +
      theme +
      'border border-gray-200 focus:ring-2 focus:border-transparent placeholder-gray-400'
    );
  };

  // STEP 1 validity
  const isStep1Valid = () => {
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
          if (bags > maxAllowedBags) error = `Max ${maxAllowedBags} Bags for ${pax} Pax`;
          break;
        }
      }
      return !error;
    });
  };

  // STEP 2 validity
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
      const parsed = Math.max(1, Math.min(MAX_PASSENGERS, parseInt(passengerInput, 10)));
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
      const parsed = Math.max(0, Math.min(parseInt(luggageInput, 10), maxAllowedBags));
      setLuggageInput(String(parsed));
      handleInputChange('luggage', parsed);
    }
    markTouched('passengers');
  };

  const onPickupDateChange = (v: string) => {
    handleInputChange('pickupDate', v);
    const minT = getMinTimeForDate(v);
    if (v === minDateForInput && formData.pickupTime && formData.pickupTime < minT) {
      handleInputChange('pickupTime', minT);
    }
  };

  const goToStep2 = () => {
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

    if (isStep1Valid()) {
      setBookingStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-white-50 pt-2 md:pt-14">
      {/* Optional: <DiscountSticker /> */}

      {/* Hero Section */}
      <div className="relative h-[550px] lg:h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          {heroImages.map((src, index) => (
            <div
              key={src}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              // Ensure the first image is visible initially
              style={{ opacity: index === currentImageIndex ? 3 : 0 }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${src}')` }}
              ></div>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10"></div>

        <motion.div
          className="relative z-20 h-full container mx-auto px-4 flex items-center justify-center text-center"
          variants={heroContentVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="py-10 lg:py-0 max-w-5xl lg:max-w-7xl mx-auto">
            <span
              className="inline-block py-1 px-3 rounded-full text-xs font-bold tracking-wider mb-4 backdrop-blur-sm border"
              style={{
                backgroundColor: `${ACCENT_COLOR}20`,
                color: ACCENT_COLOR,
                borderColor: `${ACCENT_COLOR}30`
              }}
            >
              PREMIUM TRANSFERS
            </span>

            <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl font-extrabold text-white mt-5 mb-6 leading-tight">
              Spl Transportation
              <br />
              <span className="text-2xl md:text-3xl lg:text-4xl font-normal text-red-500">
                Smoothest Start to the Tropics.
              </span>
            </h1>

            <p className="text-gray-200 text-xs mt-4 max-w-xl mx-auto">
              Experience reliable, comfortable transportation across Queensland.
            </p>

            <p className="text-gray-200 text-xs mb-8 max-w-xl mx-auto">
              Free quotes for all destinations. Book online or call us at{' '}
              <strong>
                <a href="tel:+61470032460">+61 470 032 460</a>
              </strong>
              .
            </p>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2"
          variants={heroDotsVariants}
          initial="hidden"
          animate="visible"
        >
          {heroImages.map((_, index) => (
            <button
              key={index}
              className="w-2.5 h-2.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  index === currentImageIndex ? ACCENT_COLOR : 'rgba(255, 255, 255, 0.4)'
              }}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </motion.div>
      </div>

      {/* Booking Card */}
      <div className="container max-w-5xl mx-auto px-4 relative z-30 -mt-32 lg:-mt-24 mb-20">
        <motion.div
          ref={formTopRef}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 backdrop-blur-xl overflow-hidden transition-colors duration-300"
          variants={bookingCardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2
                  className="text-2xl font-bold text-gray-900 tracking-tight"
                  style={{ color: PRIMARY_COLOR }}
                >
                  {bookingStep === 1 ? 'Booking Details' : 'Confirm & Pay'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {bookingStep === 1
                    ? 'Enter your trip information below'
                    : 'Review your trip, add contact info & pay securely via Stripe'}
                </p>
              </div>

              <div className="flex items-center bg-gray-100 rounded-lg p-1 self-start md:self-auto">
                <div
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-default ${
                    bookingStep === 1 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  1. Ride
                </div>
                <div
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-default ${
                    bookingStep === 2 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  2. Checkout
                </div>
              </div>
            </div>

            {/* Step content with animation */}
            <AnimatePresence mode="wait">
              {bookingStep === 1 ? (
                <motion.div
                  key="step1"
                  variants={stepTransitionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Step1Content
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
                    isStep1Valid={isStep1Valid}
                    goToStep2={goToStep2}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  variants={stepTransitionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Step2Content
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
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* -----------------------------
   STEP 1 CONTENT (extracted)
------------------------------*/
function Step1Content(props: {
  formData: BookingFormData;
  handleInputChange: (field: keyof BookingFormData, value: string | number | boolean) => void;
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
    goToStep2
  } = props;

  return (
    <div className="space-y-6">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Pickup/Dropoff */}
        <div className="lg:col-span-5 space-y-4">
          {/* Pickup */}
          <div className="group relative">
            <MapPin
              className={`absolute left-3 top-9 ${
                getFieldError('pickupLocation') ? 'text-red-500' : ''
              } w-5 h-5 z-20 pointer-events-none transition-colors`}
              style={{ color: getFieldError('pickupLocation') ? undefined : ACCENT_COLOR }}
            />
            <div className="flex justify-between">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                Pickup
              </label>
              {getFieldError('pickupLocation') && (
                <span className="text-xs font-bold text-red-500 animate-pulse">Required</span>
              )}
            </div>
            <select
              name="pickupLocation"
              value={formData.pickupLocation || ''}
              onChange={e => handleInputChange('pickupLocation', e.target.value)}
              onBlur={() => markTouched('pickupLocation')}
              className={getInputClass('pickupLocation')}
            >
              <option value="">Select Location</option>
              {AVAILABLE_LOCATIONS.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Dropoff */}
          <div className="group relative">
            <MapPin
              className={`absolute left-3 top-9 ${
                getFieldError('dropoffLocation') ? 'text-red-500' : 'text-gray-400'
              } w-5 h-5 z-20 pointer-events-none transition-colors`}
            />
            <div className="flex justify-between">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                Dropoff
              </label>
              {getFieldError('dropoffLocation') && (
                <span className="text-xs font-bold text-red-500 animate-pulse">Required</span>
              )}
            </div>
            <select
              name="dropoffLocation"
              value={formData.dropoffLocation || ''}
              onChange={e => handleInputChange('dropoffLocation', e.target.value)}
              onBlur={() => markTouched('dropoffLocation')}
              className={getInputClass('dropoffLocation')}
            >
              <option value="">Select Destination</option>
              {dropoffOptions.length === 0 ? (
                <option value="" disabled>
                  Select pickup first
                </option>
              ) : (
                dropoffOptions.map(loc => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))
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
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                    Date
                  </label>
                  {getFieldError('pickupDate') && (
                    <span className="text-xs font-bold text-red-500">Required</span>
                  )}
                </div>
                <div className="relative">
                  <Calendar
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      getFieldError('pickupDate') ? 'text-red-500' : 'text-gray-400'
                    } w-5 h-5 pointer-events-none z-20 transition-colors`}
                  />
                  <input
                    type="date"
                    value={formData.pickupDate}
                    min={minDateForInput}
                    onChange={e => onPickupDateChange(e.target.value)}
                    onBlur={() => markTouched('pickupDate')}
                    className={`${getInputClass(
                      'pickupDate'
                    )} [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                  />
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="col-span-1 sm:col-span-2">
              <div className="relative group">
                <div className="flex justify-between">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                    Time
                  </label>
                  {getFieldError('pickupTime') && (
                    <span className="text-xs font-bold text-red-500">
                      {getFieldError('pickupTime')}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Clock
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      getFieldError('pickupTime') ? 'text-red-500' : 'text-gray-400'
                    } w-5 h-5 pointer-events-none z-20 transition-colors`}
                  />
                  <input
                    type="time"
                    value={formData.pickupTime}
                    min={getMinTimeForDate(formData.pickupDate)}
                    onChange={e => handleInputChange('pickupTime', e.target.value)}
                    onBlur={() => markTouched('pickupTime')}
                    className={`${getInputClass(
                      'pickupTime'
                    )} [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                  />
                </div>
              </div>
            </div>

            {/* Pax */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex justify-between">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                  Pax
                </label>
                {getFieldError('passengers') && (
                  <span className="text-xs font-bold text-red-500">
                    {getFieldError('passengers')}
                  </span>
                )}
              </div>
              <div className="relative group">
                <Users className="absolute left-3 top-3.5 text-gray-400 w-4 h-4 pointer-events-none z-20 transition-colors" />
                <input
                  type="number"
                  min={1}
                  max={MAX_PASSENGERS}
                  value={passengerInput}
                  onChange={e => onPassengersChange(e.target.value)}
                  onBlur={onPassengersBlur}
                  className={getInputClass('passengers').replace('pl-10', 'pl-9')}
                />
              </div>
            </div>

            {/* Luggage */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex justify-between">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                  Bags
                </label>
                {getFieldError('luggage') && (
                  <span className="text-xs font-bold text-red-500">
                    {getFieldError('luggage')}
                  </span>
                )}
              </div>
              <div className="relative group">
                <Briefcase className="absolute left-3 top-3.5 text-gray-400 w-4 h-4 pointer-events-none z-20 transition-colors" />
                <input
                  type="number"
                  min={0}
                  max={getMaxBagsForCurrentPax(formData.passengers)}
                  value={luggageInput}
                  onChange={e => onLuggageChange(e.target.value)}
                  onBlur={onLuggageBlur}
                  className={getInputClass('luggage').replace('pl-10', 'pl-9')}
                />
              </div>
            </div>

            {/* Flight # */}
            <div className="col-span-2 md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">
                Flight #
              </label>
              <div className="relative group">
                <Plane className="absolute left-3 top-3.5 text-gray-400 w-4 h-4 pointer-events-none z-20 transition-colors" />
                <input
                  type="text"
                  value={formData.flightNumber}
                  onChange={e => handleInputChange('flightNumber', e.target.value)}
                  placeholder="       Optional"
                  className={getInputClass('flightNumber', false).replace('pl-10', 'pl-9')}
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
                <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT_COLOR }} />
                <span className="truncate">{formData.dropoffLocation}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-100">
                  <Navigation className="w-3 h-3" style={{ color: ACCENT_COLOR }} />
                  <span>
                    Distance:{' '}
                    <span className="font-semibold" style={{ color: PRIMARY_COLOR }}>
                      {selectedRoute.distance || '-- km'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-100">
                  <Clock className="w-3 h-3" style={{ color: ACCENT_COLOR }} />
                  <span>
                    Duration:{' '}
                    <span className="font-semibold" style={{ color: PRIMARY_COLOR }}>
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
  <span className="text-sm font-medium">
    Please contact us prior to booking. For assistance with any details (time, destination, passengers, luggage, vehicle, price, or payment), please reach us via 
     <a href='tel:+61470032460'> phone</a> or email. We are happy to help.
  </span>
</div>
      )}

      {/* Footer Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
        <label className="flex items-center space-x-2 cursor-pointer group">
          <div
            className="w-5 h-5 rounded border flex items-center justify-center transition-colors"
            style={{
              backgroundColor: formData.childSeat ? ACCENT_COLOR : 'transparent',
              borderColor: formData.childSeat ? ACCENT_COLOR : 'rgb(209 213 219)'
            }}
          >
            {formData.childSeat && <CheckCircle className="w-3.5 h-3.5 text-white" />}
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
            backgroundColor: isStep1Valid() ? ACCENT_COLOR : undefined,
            boxShadow: isStep1Valid() ? `0 8px 15px ${ACCENT_COLOR}30` : undefined
          }}
        >
          Continue Booking <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* -----------------------------
   STEP 2 CONTENT (Stripe Checkout)
------------------------------*/
function Step2Content(props: {
  formData: BookingFormData;
  selectedRoute: Route | null;
  calculatedPrice: number;
  getFieldError: (field: string) => string | null;
  getInputClass: (field: string, hasIconPadding?: boolean) => string;
  markTouched: (field: string) => void;
  setBookingStep: (n: 1 | 2) => void;
  isStep2FormValid: () => boolean;
  validateStep2: () => boolean;
  handleInputChange: (field: keyof BookingFormData, value: string | number | boolean) => void;
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
          amount: calculatedPrice,
          booking: formData
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
    <div className="flex flex-col md:flex-row gap-8">
      {/* Summary */}
      <div className="w-full md:w-1/2 bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6 relative order-1">
        <div className="absolute -left-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full"></div>
        <div className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full"></div>

        <h3
          className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"
          style={{ color: PRIMARY_COLOR }}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ACCENT_COLOR }}></span>
          Trip Summary
        </h3>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">From</span>
              <span className="font-bold text-gray-900" style={{ color: PRIMARY_COLOR }}>
                {formData.pickupLocation}
              </span>
              <span className="text-xs text-gray-500 truncate max-w-[200px]">
                {formData.pickupAddress}
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
              <span className="text-xs text-gray-500">To</span>
              <span className="font-bold text-gray-900" style={{ color: PRIMARY_COLOR }}>
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
      </div>

      {/* Contact + Payment */}
      <div className="w-full md:w-1/2 flex flex-col justify-between order-2">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900" style={{ color: PRIMARY_COLOR }}>
            Contact Details
          </h3>

          <div className="space-y-3">
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

            {/* Mobile */}
            <div>
              <div className="flex justify-between">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Mobile
                </label>
                {getFieldError('contactNumber') && (
                  <span className="text-xs text-red-500 font-bold">
                    {getFieldError('contactNumber')}
                  </span>
                )}
              </div>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={e => handleInputChange('contactNumber', e.target.value)}
                onBlur={() => markTouched('contactNumber')}
                className={getInputClass('contactNumber', false)}
                placeholder="+61 400 000 000"
              />
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold uppercase tracking-wider block mb-0.5">
              Note: Please contact us before booking.
            </span>
            For any questions or issues—time, passengers, luggage, car type, price, or payment—
            reach us by phone or email. We’re happy to assist!
          </div>
        </div>

        {/* Payment Section */}
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-gray-800">
            Pay securely via Stripe Checkout
          </h4>

          {paymentError && (
            <p className="text-xs text-red-500 mt-1">{paymentError}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
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
              {loadingPayment ? 'Redirecting...' : 'Pay & Confirm Booking'}
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
