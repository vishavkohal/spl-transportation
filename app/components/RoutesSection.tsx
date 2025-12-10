'use client';

import React from 'react';
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
  routes: Route[];
  loading: boolean;
  error?: string | null;
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
  routes,
  loading,
  error,
  setCurrentPage,
  onSelectRoute
}) => {
  const handleBooking = (route: Route) => {
    try {
      if (typeof onSelectRoute === 'function') onSelectRoute(route);
      if (typeof setCurrentPage === 'function') setCurrentPage('home');
    } catch (e) {
      console.error('Error during route selection/page change:', e);
    }
  };

  // 🔹 Shimmer skeleton cards while data is loading
  const renderSkeletonCards = () => {
    const skeletonItems = Array.from({ length: 5 });

    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 justify-items-center mt-2">
        {skeletonItems.map((_, idx) => (
          <div
            key={idx}
            className="
              w-full max-w-[350px] mx-auto
              rounded-xl border border-white/70 bg-white/60 
              backdrop-blur-sm
              p-3 sm:p-4 shadow-sm
            "
          >
            {/* Top chip */}
            <div className="mb-2 h-3 w-20 skeleton-block rounded-full" />

            {/* Route title */}
            <div className="mb-2.5 border-b border-gray-100/70 pb-2.5">
              <div className="h-4 w-3/4 mx-auto rounded skeleton-block mb-2" />
              <div className="flex justify-center gap-3">
                <div className="h-3 w-16 rounded skeleton-block" />
                <div className="h-3 w-16 rounded skeleton-block" />
              </div>
            </div>

            {/* Pricing rows (2 skeleton rows) */}
            <div className="flex flex-col gap-1.5">
              {[0, 1].map(i => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-lg border border-gray-200/70 px-2.5 py-2 bg-slate-50/60"
                >
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="h-7 w-8 rounded skeleton-block" />
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="h-3 w-20 rounded skeleton-block" />
                      <div className="h-3 w-24 rounded skeleton-block" />
                    </div>
                  </div>
                  <div className="h-3 w-10 rounded skeleton-block" />
                </div>
              ))}
            </div>

            {/* Note */}
            <div className="mt-3 border-top border-gray-100/70 pt-2">
              <div className="h-3 w-5/6 rounded skeleton-block" />
            </div>

            {/* Button */}
            <div className="mt-3 h-8 w-full rounded-lg skeleton-block" />
          </div>
        ))}
      </div>
    );
  };

  // 🔹 Decide what to render *inside the glass panel*
  const renderContent = () => {
    if (loading) {
      return renderSkeletonCards();
    }

    if (error) {
      return (
        <p className="text-red-500 font-medium text-center text-xs md:text-sm mt-2">
          Error: {error}
        </p>
      );
    }

    if (!routes || routes.length === 0) {
      return (
        <p className="text-gray-600 text-center text-xs md:text-sm mt-2">
          No routes configured.
        </p>
      );
    }

    // ✅ Normal case: we have routes
    return (
      <>
        <motion.p
          className="text-gray-600 text-center mb-4 md:mb-5 max-w-2xl md:max-w-3xl mx-auto leading-relaxed text-[11px] sm:text-xs md:text-sm"
          variants={subtextVariants}
        >
          Select a route below and you can finalise your date, passengers and payment
          in the booking form.
        </motion.p>

       <motion.div
  className="
    grid 
    grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
    gap-x-5 md:gap-x-6 
    gap-y-7 md:gap-y-8 
    justify-items-center
  "
  variants={cardsContainerVariants}
>

  {routes.map(route => (
  <motion.article
    key={route.id}
    variants={cardVariants}
    whileHover={{
      y: -3,
      scale: 1.01,
      boxShadow: '0 18px 40px rgba(15,23,42,0.18)'
    }}
    className="
      group flex flex-col
      rounded-xl border border-white/70 bg-white/85 
      backdrop-blur-sm
      p-3 sm:p-4 
      shadow-sm
      hover:bg-white
      transition-all duration-200
      w-full max-w-[350px] mx-auto
    "
  >
    {/* Label chip */}
    {route.label && (
      <div className="mb-1 flex justify-between items-center">
        <span
          className="
            inline-flex items-center rounded-full 
            px-2.5 py-[2.5px] 
            text-[10px] font-semibold uppercase tracking-wide
            bg-gradient-to-r from-red-100 to-red-50
            text-red-700 border border-red-200/80
          "
        >
          {route.label}
        </span>
      </div>
    )}

    {/* HEADER: route + distance / time */}
    <header className="mb-3 border-b border-gray-100 pb-2.5 w-full">
    <h2
  className="
    text-lg sm:text-lg md:text-xl 
    font-semibold 
    tracking-tight 
    text-center leading-snug
  "
  style={{ color: PRIMARY_COLOR }}
>
  {route.from}
  <span
    className="
      mx-1.5 
      text-2xl sm:text-2xl md:text-2xl 
      font-bold
    "
    style={{ color: ACCENT_COLOR }}
  >
    →
  </span>
  {route.to}
</h2>


      <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-gray-500 justify-center">
        <span className="inline-flex items-center">
          <BusFront className="mr-1 h-3.5 w-3.5" />
          {route.distance}
        </span>
        <span className="inline-flex items-center">
          <Clock className="mr-1 h-3.5 w-3.5" />
          {route.duration}
        </span>
      </div>
    </header>

    {/* PRICING LIST */}
    <section className="space-y-1.5">
      {/* Mini header row */}
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-gray-400 px-1">
        <span>Vehicle &amp; capacity</span>
        <span>One-way fare</span>
      </div>

      {route.pricing.map((p, idx) => {
        const isFeatured = idx === 0;
        const imageSrc = VEHICLE_IMAGES[p.vehicleType] ?? '/vehicles/sedan.svg';

        return (
          <div
            key={idx}
            className={`
              flex items-center gap-2.5 rounded-lg border px-2.5 py-2 
              text-[11px] sm:text-xs 
              bg-slate-50/80 
              ${
                isFeatured
                  ? 'border-red-200 ring-1 ring-red-100/80'
                  : 'border-gray-200/80'
              }
            `}
          >
            {/* Vehicle image + text */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="relative h-7 w-8 flex-shrink-0 sm:h-8 sm:w-9">
                <Image
                  src={imageSrc}
                  alt={p.vehicleType}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col leading-tight min-w-0">
                <p className="font-semibold text-gray-900 text-[11px] sm:text-[12px] truncate">
                  {p.vehicleType}
                </p>
                <p className="mt-[2px] flex items-center text-[10px] text-gray-500">
                  <Users className="mr-1 h-3 w-3" />
                  {p.passengers} Passengers
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="flex flex-col items-end flex-shrink-0">
              {isFeatured && (
                <span className="text-[9px] uppercase font-semibold text-black-500 mb-0.5">
                  From
                </span>
              )}
              <p
                className="whitespace-nowrap text-lg sm:text-base font-bold leading-none"
                style={{
                  color: isFeatured ? ACCENT_COLOR : PRIMARY_COLOR
                }}
              >
                ${Number(p.price).toFixed(0)}
              </p>
            </div>
          </div>
        );
      })}
    </section>

<footer className="mt-3 pt-2 border-t border-gray-100 flex flex-col gap-3">
  {/* Note */}
  <p className="text-[10px] leading-snug text-gray-500 italic">
    <span className="font-semibold text-gray-600">Note:</span>{' '}
    {route.description ?? 'Fixed pricing per vehicle, with no hidden fees.'}
  </p>

  {/* Button */}
  <button
    onClick={e => {
      e.stopPropagation();
      handleBooking(route);
    }}
    className="
      w-full
      rounded-lg px-4 py-2 
      text-xs sm:text-sm font-semibold 
      text-white 
      shadow-md shadow-red-500/20
      transition-all
      hover:brightness-110 active:scale-[0.98]
    "
    style={{ backgroundColor: PRIMARY_COLOR }}
    aria-label={`Book route from ${route.from} to ${route.to}`}
  >
    Book this route
  </button>
</footer>

  </motion.article>
))}

        </motion.div>
      </>
    );
  };

  return (
    <motion.div
      className="
        relative 
        bg-gradient-to-b from-slate-50 via-slate-50/90 to-slate-100
        px-4 md:px-6 
        pb-14 pt-12 md:pt-16
      "
      initial="visible"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Centered Heading */}
        <motion.div
          className="flex flex-col justify-center items-center mb-5 md:mb-7 text-center"
          variants={headingVariants}
        >
          <p
            className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.24em] uppercase mb-1.5"
            style={{ color: ACCENT_COLOR }}
          >
            Private Airport & City Transfers
          </p>

          <h2
            className="text-3xl sm:text-3xl md:text-4xl font-extrabold leading-tight"
            style={{ color: PRIMARY_COLOR }}
          >
            Private Transfer Routes
            <span className="block sm:inline"> &amp; Fixed Pricing</span>
            <div
              className="w-24 h-1.5 mx-auto mt-4 rounded-full"
              style={{ backgroundColor: ACCENT_COLOR }}
            />
          </h2>

          <motion.p
            className="mt-3 text-[12px] sm:text-sm md:text-base text-gray-600 max-w-xl md:max-w-2xl leading-relaxed"
            variants={subtextVariants}
          >
            Browse our most popular routes between airports, hotels and key
            destinations. Pricing is per vehicle, not per person, with no hidden extras.
          </motion.p>
        </motion.div>

        {/* Glass panel wrapper for cards / skeleton / messages */}
        <div
          className="
            mt-4 md:mt-6 
            rounded-3xl 
            bg-white/80 
            backdrop-blur-sm 
            border border-white/70 
            shadow-[0_18px_45px_rgba(15,23,42,0.08)]
            px-3 sm:px-5 md:px-6 
            py-4 sm:py-5 md:py-6
          "
        >
          {renderContent()}
        </div>
      </div>
    </motion.div>
  );
};

export default RoutesSection;
