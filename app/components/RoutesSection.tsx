'use client';
import React, { useEffect, useState } from 'react';
import { BusFront, Clock, Users } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import Image from 'next/image';
import type { Route } from '../types';

// Define the custom colors for readability
const PRIMARY_COLOR = '#18234B'; // Dark Navy (Headings, accents)
const ACCENT_COLOR = '#A61924'; // Deep Red (Accent/Button)

// Vehicle type → image mapping
const VEHICLE_IMAGES: Record<string, string> = {
  Sedan: '/vehicles/sedan.svg',
  SUV: '/vehicles/suv.svg',
  Van: '/vehicles/van.svg'
};

type RoutesSectionProps = {
  setCurrentPage?: (page: string) => void;
  onSelectRoute?: (route: Route) => void;
};

// Animation variants
const headingVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' }
  }
};

const subtextVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay: 0.08 }
  }
};

const cardsContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, rotateX: -4 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut'
    }
  }
};

const RoutesSection: React.FC<RoutesSectionProps> = ({
  setCurrentPage,
  onSelectRoute
}) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRoutes() {
    try {
      setLoading(true);
      const res = await fetch('/api/routes');
      if (!res.ok) throw new Error(`Failed to load routes (${res.status})`);
      const data = await res.json();
      setRoutes(data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRoutes();
  }, []);

  const handleBooking = (route: Route) => {
    try {
      if (typeof onSelectRoute === 'function') onSelectRoute(route);
      if (typeof setCurrentPage === 'function') setCurrentPage('home');
    } catch (e) {
      console.error('Error during route selection/page change:', e);
    }
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 md:px-6 pb-10 pt-16 md:pt-18 transition-colors bg-gray-50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      {/* Centered Heading with bigger text sizes */}
<motion.div
  className="flex flex-col justify-center items-center mb-5 md:mb-8 text-center"
  variants={headingVariants}
>
  <p
    className="text-[11px] sm:text-[12px] md:text-sm font-semibold tracking-[0.24em] uppercase mb-1.5"
    style={{ color: ACCENT_COLOR }}
  >
    Private Airport & City Transfers
  </p>

  {/* 🔥 Increased the heading size here */}
  <h1
    className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight"
    style={{ color: PRIMARY_COLOR }}
  >
    Private Transfer Routes&nbsp;
    <span className="block sm:inline">and Fixed Pricing</span>
     <div
            className="w-24 h-1.5 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
          />
  </h1>

  <div
    className="w-20 h-[3px] mx-auto mt-3 rounded-full"
    style={{ backgroundColor: ACCENT_COLOR }}
  />

  <motion.p
    className="mt-3 text-[12px] sm:text-sm md:text-base text-gray-600 max-w-xl md:max-w-2xl leading-relaxed"
    variants={subtextVariants}
  >
    Browse our most popular routes between airports, hotels, and key
    destinations. All prices are per vehicle, not per person, with no
    hidden extras.
  </motion.p>
</motion.div>

      {/* Loading and Error messages */}
      {loading && (
        <p className="text-gray-600 text-center text-xs md:text-sm">
          Loading routes data...
        </p>
      )}
      {error && (
        <p className="text-red-500 font-medium text-center text-xs md:text-sm">
          Error: {error}
        </p>
      )}
      {!loading && !error && routes.length === 0 && (
        <p className="text-gray-600 text-center text-xs md:text-sm">
          No routes configured.
        </p>
      )}

      {/* Additional intro text once routes are loaded */}
      {!loading && !error && routes.length > 0 && (
        <motion.p
          className="text-gray-600 text-center mb-5 md:mb-6 max-w-2xl md:max-w-3xl mx-auto leading-relaxed text-[11px] sm:text-xs md:text-sm"
          variants={subtextVariants}
        >
        </motion.p>
      )}

      {/* Route Cards Grid */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-items-center"
        variants={cardsContainerVariants}
      >
        {routes.map(route => (
          <motion.div
            key={route.id}
            variants={cardVariants}
            whileHover={{
              y: -2,
              scale: 1.01
            }}
            className="
              group flex flex-col rounded-xl border border-gray-200 bg-white 
              p-3 sm:p-4 shadow-sm hover:shadow-md transition-all
              w-full max-w-[230px] mx-auto
            "
          >
         {/* 🔖 Label at the very top (extra small chip) */}
{route.label && (
  <div className="mb-1 flex justify-between items-center">
    <span className="inline-flex items-center rounded-full bg-red-50 px-1.5 py-[2px] 
                     text-[5px] font-semibold uppercase tracking-wide text-red-700">
      {route.label}
    </span>
  </div>
)}

{/* Route Names and Icons */}
<div className="mb-2.5 border-b border-gray-100 pb-2.5">
  <h3
    className="text-base sm:text-lg font-bold tracking-tight mb-1"
    style={{ color: PRIMARY_COLOR }}
  >
    {route.from}
    <span
      className="mx-1.5 text-base sm:text-xl font-extrabold"
      style={{ color: ACCENT_COLOR }}
    >
      →
    </span>
    {route.to}
  </h3>

              {/* Distance and Duration */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                <span className="flex items-center">
                  <BusFront className="mr-1 h-3.5 w-3.5" />
                  {route.distance}
                </span>
                <span className="flex items-center">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  {route.duration}
                </span>
              </div>
            </div>

            {/* Pricing Rows – compact, horizontal layout */}
            <div className="flex flex-col gap-1.5">
              {route.pricing.map((p, idx) => {
                const isFeatured = idx === 0;
                const imageSrc =
                  VEHICLE_IMAGES[p.vehicleType] ?? '/vehicles/sedan.svg';

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-[11px] sm:text-xs bg-slate-50 ${
                      isFeatured
                        ? 'border-red-200 ring-1 ring-red-100'
                        : 'border-gray-200'
                    }`}
                  >
                    {/* Vehicle image + details */}
                    <div className="flex items-center gap-2.5 flex-1">
                      <div className="relative h-7 w-8 flex-shrink-0 sm:h-8 sm:w-9">
                        <Image
                          src={imageSrc}
                          alt={p.vehicleType}
                          fill
                          className="object-contain"
                        />
                      </div>

                      <div className="flex flex-col leading-tight">
                        <p className="font-semibold text-gray-900 text-[11px] sm:text-[12px]">
                          {p.vehicleType}
                        </p>
                        <p className="mt-[2px] flex items-center text-[10px] text-gray-500">
                          <Users className="mr-1 h-3 w-3" />
                          {p.passengers} Passengers
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <p
                      className="ml-auto whitespace-nowrap text-xs sm:text-sm font-bold"
                      style={{
                        color: isFeatured ? ACCENT_COLOR : PRIMARY_COLOR
                      }}
                    >
                      ${Number(p.price).toFixed(0)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Note */}
            <p className="mt-3 border-t border-gray-100 pt-2 text-[10px] leading-snug text-gray-500 italic">
              <span className="font-semibold text-gray-600">Note:</span> Child
              seat available for additional $20.
            </p>

            {/* Book Button – compact */}
            <button
              onClick={e => {
                e.stopPropagation();
                handleBooking(route);
              }}
              className="mt-3 w-full rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                backgroundColor: ACCENT_COLOR
              }}
              aria-label={`Book route from ${route.from} to ${route.to}`}
            >
              Book This Route
            </button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default RoutesSection;
