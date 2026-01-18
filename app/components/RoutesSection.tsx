'use client';

import React, { useState } from 'react';
import { MapPin, Clock, Users, ChevronRight, Plane, Building2, Palmtree } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import Image from 'next/image';
import type { Route } from '../types';

// Brand colors
const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';

// Vehicle images
const VEHICLE_IMAGES: Record<string, string> = {
  Sedan: '/vehicles/sedan.svg',
  SUV: '/vehicles/suv.svg',
  Van: '/vehicles/van.svg'
};

type RoutesSectionProps = {
  routes: Route[];
  loading: boolean;
  error?: string | null;
  setCurrentPage?: (page: string) => void;
  onSelectRoute?: (route: Route) => void;
};

// Filter categories
const FILTER_CATEGORIES = [
  { id: 'all', label: 'All Routes', icon: null },
  { id: 'airport', label: 'Airport', icon: Plane },
  { id: 'city', label: 'City', icon: Building2 },
  { id: 'beach', label: 'Beach', icon: Palmtree }
];

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 50, damping: 15 }
  }
};

const RoutesSection: React.FC<RoutesSectionProps> = ({
  routes,
  loading,
  error,
  setCurrentPage,
  onSelectRoute
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleBooking = (route: Route) => {
    try {
      if (typeof onSelectRoute === 'function') onSelectRoute(route);
      if (typeof setCurrentPage === 'function') setCurrentPage('home');
      const bookingForm = document.getElementById('booking-form');
      if (bookingForm) {
        bookingForm.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (e) {
      console.error('Error during route selection:', e);
    }
  };

  // Filter routes based on search and category
  const filteredRoutes = routes.filter(route => {
    const matchesSearch =
      searchQuery === '' ||
      route.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.to.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'airport' &&
        (route.from.toLowerCase().includes('airport') ||
          route.to.toLowerCase().includes('airport'))) ||
      (activeFilter === 'city' &&
        (route.from.toLowerCase().includes('city') ||
          route.to.toLowerCase().includes('city') ||
          route.from.toLowerCase().includes('cairns') ||
          route.to.toLowerCase().includes('cairns'))) ||
      (activeFilter === 'beach' &&
        (route.from.toLowerCase().includes('cove') ||
          route.to.toLowerCase().includes('cove') ||
          route.from.toLowerCase().includes('beach') ||
          route.to.toLowerCase().includes('beach')));

    return matchesSearch && matchesFilter;
  });

  // Separate day trip routes and combine their pricing
  const dayTripRoutes = routes.filter(r => r.from === 'Day trip (8 hours)');
  const regularRoutes = filteredRoutes.filter(r => r.from !== 'Day trip (8 hours)');

  // Combine all day trip pricing into one array
  const dayTripPricing = dayTripRoutes.flatMap(r => r.pricing || []);

  // Get lowest price for a route
  const getLowestPrice = (route: Route) => {
    if (!route.pricing || route.pricing.length === 0) return 0;
    return Math.min(...route.pricing.map(p => Number(p.price)));
  };

  // Handler for day trip booking - scrolls to form with special flag
  const handleDayTripBooking = () => {
    // Dispatch custom event for day trip mode
    window.dispatchEvent(new CustomEvent('selectDayTrip', {
      detail: { pricing: dayTripPricing }
    }));
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
      bookingForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Skeleton cards
  const renderSkeletonCards = () => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4">
            <div className="h-5 w-3/4 skeleton-block rounded mb-2" />
            <div className="h-4 w-1/2 skeleton-block rounded" />
          </div>
          <div className="flex gap-2 mb-4">
            <div className="h-8 w-20 skeleton-block rounded-full" />
            <div className="h-8 w-20 skeleton-block rounded-full" />
          </div>
          <div className="h-10 w-full skeleton-block rounded-xl" />
        </div>
      ))}
    </div>
  );

  // Main content
  const renderContent = () => {
    if (loading) return renderSkeletonCards();

    if (error) {
      return (
        <p className="text-red-500 font-medium text-center py-8">
          Error loading routes: {error}
        </p>
      );
    }

    if (!routes || routes.length === 0) {
      return (
        <p className="text-gray-600 text-center py-8">
          No routes available at the moment.
        </p>
      );
    }

    if (filteredRoutes.length === 0) {
      return (
        <p className="text-gray-600 text-center py-8">
          No routes match your search. Try a different filter.
        </p>
      );
    }

    return (
      <>
        {/* Day Trip Featured Card */}
        {dayTripPricing.length > 0 && activeFilter === 'all' && searchQuery === '' && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div
              className="
                relative overflow-hidden rounded-2xl
                bg-gradient-to-r from-[#18234B] to-[#2a3a6b]
                border-2 border-[#18234B]
                p-8
                shadow-[0_8px_30px_rgba(0,0,0,0.2)]
              "
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Left: Info */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full mb-4">
                    <Clock className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">8 Hours Charter</span>
                  </div>

                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    Full Day Trip
                  </h3>
                  <p className="text-white/80 text-sm lg:text-base max-w-md">
                    Explore Tropical North Queensland at your own pace.
                    Custom pickup & destination with professional chauffeur.
                  </p>

                  {/* Vehicle Options */}
                  <div className="flex flex-wrap gap-3 mt-5">
                    {dayTripPricing.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20"
                      >
                        <div className="relative w-8 h-6">
                          <Image
                            src={VEHICLE_IMAGES[p.vehicleType] ?? '/vehicles/suv.svg'}
                            alt={p.vehicleType}
                            fill
                            className="object-contain brightness-0 invert"
                          />
                        </div>
                        <div className="text-white">
                          <p className="text-xs font-medium">{p.vehicleType}</p>
                          <p className="text-lg font-bold">${Number(p.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: CTA */}
                <div className="flex flex-col items-start lg:items-end gap-3">
                  <div className="text-white/70 text-sm">Starting from</div>
                  <div className="text-4xl font-extrabold text-white">
                    ${Math.min(...dayTripPricing.map(p => Number(p.price)))}
                  </div>
                  <button
                    onClick={handleDayTripBooking}
                    className="
                      mt-2 px-8 py-3.5 rounded-xl
                      bg-white text-[#18234B]
                      font-bold text-sm
                      shadow-lg hover:shadow-xl
                      transform hover:scale-[1.03]
                      transition-all duration-200
                      flex items-center gap-2
                    "
                  >
                    Book Day Trip
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Regular Routes Grid */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {regularRoutes.map((route, index) => {
            const lowestPrice = getLowestPrice(route);
            const isPopular = index === 0;

            return (
              <motion.article
                key={route.id}
                variants={cardVariants}
                className={`
                group relative flex flex-col
                rounded-2xl bg-white
                border-2 ${isPopular ? 'border-[#18234B]' : 'border-gray-200'}
                p-6
                shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)]
                hover:-translate-y-1
                transition-all duration-300
              `}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div
                    className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Route Header */}
                <div className="mb-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${PRIMARY_COLOR}10` }}
                    >
                      <MapPin className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                    </div>
                    <h3
                      className="flex-1 text-base sm:text-lg font-bold leading-tight"
                      style={{ color: PRIMARY_COLOR }}
                    >
                      {route.from}
                      <span className="mx-2 text-gray-400">→</span>
                      {route.to}
                    </h3>
                  </div>

                  {/* Quick Info Chips */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {route.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {route.distance}
                    </span>
                  </div>
                </div>

                {/* Vehicle Options Preview */}
                <div className="flex-1 mb-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Available Vehicles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {route.pricing.slice(0, 3).map((p, idx) => {
                      const imageSrc = VEHICLE_IMAGES[p.vehicleType] ?? '/vehicles/sedan.svg';
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100"
                        >
                          <div className="relative w-8 h-6">
                            <Image
                              src={imageSrc}
                              alt={p.vehicleType}
                              fill
                              className="object-contain opacity-70"
                            />
                          </div>
                          <div className="text-xs">
                            <p className="font-semibold text-gray-700">{p.vehicleType}</p>
                            <p className="text-gray-400 flex items-center gap-0.5">
                              <Users className="w-3 h-3" /> {p.passengers}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Starting from</p>
                      <p
                        className="text-2xl font-extrabold"
                        style={{ color: PRIMARY_COLOR }}
                      >
                        ${lowestPrice.toFixed(0)}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          /vehicle
                        </span>
                      </p>
                    </div>
                    <p className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                      Fixed Price
                    </p>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleBooking(route);
                    }}
                    className="
                    w-full py-3.5 rounded-xl
                    font-bold text-sm text-white
                    shadow-md hover:shadow-lg
                    transform hover:scale-[1.02]
                    transition-all duration-200
                    flex items-center justify-center gap-2
                  "
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    Select & Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </>
    );
  };

  return (
    <section
      className="
        relative 
        bg-gradient-to-b from-slate-50 to-white
        px-4 md:px-8 mx-4 md:mx-8 mb-8 md:mb-16
        py-12 md:py-16
        rounded-[2rem] 
        shadow-[0_0_60px_-15px_rgba(0,0,0,0.15)]
        overflow-hidden
      "
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-50 to-transparent rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-50 to-transparent rounded-full blur-3xl opacity-40" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-2"
            style={{ color: ACCENT_COLOR }}
          >
            Private Airport & City Transfers
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4"
            style={{ color: PRIMARY_COLOR }}
          >
            Choose Your Route
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Select from our popular transfer routes. All prices are per vehicle
            with no hidden fees or surprises.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {FILTER_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                    transition-all duration-200
                    ${activeFilter === cat.id
                      ? 'bg-[#18234B] text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                    }
                  `}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search routes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="
                w-full sm:w-64 px-4 py-2.5 pl-10
                rounded-full border border-gray-200
                text-sm placeholder:text-gray-400
                focus:outline-none focus:border-[#18234B] focus:ring-2 focus:ring-[#18234B]/20
                transition-all
              "
            />
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Route Cards Grid */}
        {renderContent()}

        {/* Trust Indicators */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-wrap justify-center gap-6 text-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-lg">✓</span>
              </div>
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-lg">🚗</span>
              </div>
              <span>Professional Drivers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 text-lg">⏱</span>
              </div>
              <span>Flight Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 text-lg">💳</span>
              </div>
              <span>Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoutesSection;
