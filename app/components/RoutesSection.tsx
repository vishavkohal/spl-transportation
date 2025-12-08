'use client';

import React, { useEffect, useState } from 'react';
import { BusFront, Clock, Users } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import type { Route } from '../types';

// Define the custom colors for readability
const PRIMARY_COLOR = '#18234B'; // Dark Navy (Heading, Primary Text)
const ACCENT_COLOR = '#A61924'; // Deep Red (Accent/Button)
const CARD_BG = '#FFFFFF'; // White (Fixed Card Background)
const TEXT_COLOR_LIGHT_PAGE = '#202124'; // Dark text for light page sections (used for body text)
const MUTED_TEXT_COLOR = '#5F6368'; // Medium Gray (Muted Text)

type RoutesSectionProps = {
  setCurrentPage?: (page: string) => void;
  onSelectRoute?: (route: Route) => void;
};

// Animation variants
const headingVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const subtextVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay: 0.1 },
  },
};

const cardsContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, rotateX: -6 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const RoutesSection: React.FC<RoutesSectionProps> = ({
  setCurrentPage,
  onSelectRoute,
}) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to load route data from the API
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

  // Load routes only once when the component mounts
  useEffect(() => {
    void loadRoutes();
  }, []);

  // Handler for selecting a route and navigating away
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
      className="min-h-screen max-w-7xl mx-auto px-6 pb-12 pt-24 md:pt-32 transition-colors bg-gray-50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      {/* Centered Heading */}
      <motion.div
        className="flex flex-col justify-center items-center mb-6"
        variants={headingVariants}
      >
        <h1
          className="text-3xl md:text-4xl font-extrabold text-center"
          style={{ color: PRIMARY_COLOR }}
        >
          Private Transfers Routes &amp; Pricing
        </h1>
          <div
            className="w-24 h-1.5 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
          />
      </motion.div>

      {/* Loading and Error messages */}
      {loading && (
        <p className="text-gray-600 text-center">Loading routes data...</p>
      )}
      {error && (
        <p className="text-red-500 font-medium text-center">Error: {error}</p>
      )}
      {!loading && !error && routes.length === 0 && (
        <p className="text-gray-600 text-center">No routes configured.</p>
      )}

      {/* Intro Text */}
      {!loading && !error && routes.length > 0 && (
        <motion.p
          className="text-gray-600 text-center mb-8 max-w-3xl mx-auto leading-relaxed"
          variants={subtextVariants}
        >
          With our private transfers, you’ll enjoy a comfortable,
          air-conditioned ride directly to your hotel or holiday rental without
          the delays of shared shuttle services. We operate 24/7, meaning you
          can rely on us whether you’re arriving on a late-night flight or
          catching an early morning departure.
        </motion.p>
      )}

      {/* Route Cards Grid */}
      <motion.div
        className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={cardsContainerVariants}
      >
        {routes.map((route) => (
          <motion.div
            key={route.id}
            variants={cardVariants}
            whileHover={{
              y: -4,
              scale: 1.01,
              boxShadow: '0 18px 40px rgba(0,0,0,0.12)',
            }}
            className="p-7 rounded-2xl shadow-lg border border-gray-100 transition-all flex flex-col"
            style={{ backgroundColor: CARD_BG }}
          >
            {/* Route Names and Icons */}
            <div className="mb-4 border-b border-gray-100 pb-4">
              <h3
                className="text-2xl font-bold tracking-tight mb-2"
                style={{ color: PRIMARY_COLOR }}
              >
                {route.from}
                <span
                  className="mx-2 text-xl"
                  style={{ color: ACCENT_COLOR, fontWeight: 900 }}
                >
                  →
                </span>
                {route.to}
              </h3>

              {/* Distance and Duration with Icons */}
              <div
                className="flex items-center space-x-6 text-sm"
                style={{ color: MUTED_TEXT_COLOR }}
              >
                <span className="flex items-center font-medium">
                  <BusFront
                    className="w-4 h-4 mr-1.5"
                    style={{ color: PRIMARY_COLOR }}
                  />
                  {route.distance}
                </span>
                <span className="flex items-center font-medium">
                  <Clock
                    className="w-4 h-4 mr-1.5"
                    style={{ color: PRIMARY_COLOR }}
                  />
                  {route.duration}
                </span>
              </div>
            </div>

            {/* Pricing Table */}
            <div className="flex-grow">
              {/* Table Header */}
              <div
                className="grid grid-cols-2 text-xs font-semibold uppercase mb-2 pb-1 border-b border-gray-100"
                style={{ color: MUTED_TEXT_COLOR }}
              >
                <span className="flex items-center">
                  <Users
                    className="w-3 h-3 mr-1"
                    style={{ color: MUTED_TEXT_COLOR }}
                  />
                  Passengers
                </span>
                <span className="text-right">Price</span>
              </div>

              {/* Pricing Rows */}
              {route.pricing.map((p, idx) => {
                const isFeatured = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-2 items-center py-3 px-2 rounded-lg transition-all ${
                      isFeatured
                        ? 'bg-red-50/50 font-semibold'
                        : 'hover:bg-gray-50'
                    }`}
                    style={{ color: TEXT_COLOR_LIGHT_PAGE }}
                  >
                    <p className="text-base">{p.passengers}</p>
                    <p
                      className="text-xl font-bold text-right"
                      style={{
                        color: isFeatured ? ACCENT_COLOR : PRIMARY_COLOR,
                      }}
                    >
                      ${p.price}
                    </p>
                  </div>
                );
              })}
            </div>

            <p
              className="text-xs mt-6 italic pt-4 border-t border-gray-100"
              style={{ color: MUTED_TEXT_COLOR }}
            >
              <span className="font-bold">Note:</span> Child seat available for
              additional $20
            </p>

            {/* Book Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBooking(route);
              }}
              className="w-full mt-8 px-6 py-3 text-lg text-white rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg hover:brightness-110"
              style={{
                backgroundColor: ACCENT_COLOR,
                boxShadow:
                  '0 4px 6px -1px rgba(166, 25, 36, 0.4), 0 2px 4px -2px rgba(166, 25, 36, 0.4)',
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
