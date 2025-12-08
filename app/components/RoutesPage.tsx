'use client';
import React, { useEffect, useState } from 'react';
import { BusFront, Clock, Info } from 'lucide-react';
import Image from 'next/image';
import type { Route } from '../types';

// Define the custom colors for readability
const PRIMARY_COLOR = '#18234B'; // Dark Navy (Heading, Primary Text)
const ACCENT_COLOR = '#A61924'; // Deep Red (Accent/Button)
const CARD_BG = '#FFFFFF'; // White (Fixed Card Background)
const TEXT_COLOR_LIGHT_PAGE = '#202124'; // Dark text for light page sections (used for body text)
const MUTED_TEXT_COLOR = '#5F6368'; // Medium Gray (Muted Text)

// Vehicle type → image mapping
const VEHICLE_IMAGES: Record<string, string> = {
  Sedan: '/vehicles/sedan.svg',
  SUV: '/vehicles/suv.svg',
  Van: '/vehicles/van.svg'
};

export default function RoutesPage({
  setCurrentPage,
  onSelectRoute
}: {
  setCurrentPage?: (page: string) => void;
  onSelectRoute?: (route: Route) => void;
}) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch('/api/routes');
      if (!res.ok) throw new Error(`Failed to load routes (${res.status})`);
      const data = await res.json();
      setRoutes(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
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
    <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-6 pb-10 pt-20 md:pt-28 transition-colors bg-gray-50">
      {/* Heading + description + refresh */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 md:mb-10">
        <div className="max-w-2xl">
          <p
            className="text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase mb-2"
            style={{ color: ACCENT_COLOR }}
          >
            Private Airport & City Transfers
          </p>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight"
            style={{ color: PRIMARY_COLOR }}
          >
            Private Transfer Routes&nbsp;
            <span className="block sm:inline">and Fixed Pricing</span>
          </h1>

          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Choose from our curated routes between airports, hotels, and popular
            destinations. Enjoy upfront, fixed pricing with professional drivers
            and private vehicles only.
          </p>

          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            All transfers include meet & greet, taxes and basic tolls. No hidden
            fees, no shared rides.
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="self-stretch md:self-auto px-4 py-2 rounded-full border border-gray-300 bg-white text-sm sm:text-base text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Refreshing…' : 'Refresh Data'}
        </button>
      </div>

      {/* Loading and Error messages */}
      {loading && <p className="text-gray-600 text-sm">Loading routes data...</p>}
      {error && <p className="text-red-500 font-medium text-sm">Error: {error}</p>}
      {!loading && !error && routes.length === 0 && (
        <p className="text-gray-600 text-sm">No routes configured.</p>
      )}

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {routes.map(route => (
          <div
            key={route.id}
            className="p-4 sm:p-5 md:p-7 rounded-2xl shadow-md border border-gray-100 transition-all flex flex-col hover:shadow-xl hover:-translate-y-0.5 bg-white"
            style={{ backgroundColor: CARD_BG }}
          >
            {/* 🔖 Label at the very top of the card */}
            {route.label && (
              <div className="mb-2 flex justify-between items-center">
                <span
                  className="inline-flex items-center px-2.5 py-0.5 text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wide"
                  style={{ backgroundColor: ACCENT_COLOR, color: CARD_BG }}
                >
                  {route.label}
                </span>
              </div>
            )}

            {/* 📍 Route Names, Description, Distance & Duration */}
            <div className="mb-3 sm:mb-4 border-b border-gray-100 pb-3 sm:pb-4">
              <div className="flex flex-wrap items-center mb-1.5 gap-1.5">
                <h3
                  className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight"
                  style={{ color: PRIMARY_COLOR }}
                >
                  {route.from}
                  <span
                    className="mx-1 sm:mx-2 text-lg sm:text-xl"
                    style={{ color: ACCENT_COLOR, fontWeight: '900' }}
                  >
                    →
                  </span>
                  {route.to}
                </h3>
              </div>

              {/* Description */}
              {route.description && (
                <p className="flex items-start text-xs sm:text-sm mb-2.5 text-gray-600 italic">
                  <Info
                    className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 mt-[2px]"
                    style={{ color: PRIMARY_COLOR }}
                  />
                  {route.description}
                </p>
              )}

              {/* Distance and Duration */}
              <div
                className="flex flex-wrap items-center gap-3 text-xs sm:text-sm"
                style={{ color: MUTED_TEXT_COLOR }}
              >
                <span className="flex items-center font-medium">
                  <BusFront
                    className="w-4 h-4 mr-1"
                    style={{ color: PRIMARY_COLOR }}
                  />
                  {route.distance}
                </span>
                <span className="flex items-center font-medium">
                  <Clock
                    className="w-4 h-4 mr-1"
                    style={{ color: PRIMARY_COLOR }}
                  />
                  {route.duration}
                </span>
              </div>
            </div>

            {/* 💰 Pricing Cards (Sedan, SUV, Van) */}
            <div className="flex-grow">
              <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4">
                {route.pricing.map((p, idx) => {
                  const imageSrc =
                    VEHICLE_IMAGES[p.vehicleType] ?? '/vehicles/sedan.svg';

                  return (
                    <div
                      key={idx}
                      className="flex flex-row sm:flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
                      style={{ color: TEXT_COLOR_LIGHT_PAGE }}
                    >
                      {/* Image - smaller on mobile */}
                      <div className="relative w-16 h-14 sm:w-full sm:h-24 md:h-28 flex-shrink-0">
                        <Image
                          src={imageSrc}
                          alt={p.vehicleType}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 30vw, (max-width: 1024px) 30vw, 20vw"
                        />
                      </div>

                      {/* Content: horizontal row on mobile, vertical on sm+ */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-start gap-1.5 sm:gap-1 px-3 py-2 sm:px-4 sm:py-3 w-full">
                        <p className="text-[11px] sm:text-sm font-semibold leading-snug whitespace-nowrap">
                          {p.vehicleType}
                        </p>
                        <p className="text-[10px] sm:text-xs leading-snug whitespace-nowrap">
                          {p.passengers} Passengers
                        </p>
                        <p
                          className="text-xs sm:text-lg font-bold sm:mt-1 ml-auto sm:ml-0 whitespace-nowrap"
                          style={{ color: ACCENT_COLOR }}
                        >
                          ${Number(p.price).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p
              className="text-[10px] sm:text-xs mt-4 sm:mt-5 italic pt-3 sm:pt-4 border-t border-gray-100"
              style={{ color: MUTED_TEXT_COLOR }}
            >
              <span className="font-bold">Note:</span> Child seat available for
              additional $20
            </p>

            {/* Book Button - Primary Action (Deep Red) */}
            <button
              onClick={e => {
                e.stopPropagation();
                handleBooking(route);
              }}
              className="w-full mt-5 sm:mt-6 px-5 py-2.5 sm:py-3 text-sm sm:text-lg text-white rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg hover:brightness-110"
              style={{
                backgroundColor: ACCENT_COLOR,
                boxShadow:
                  '0 4px 6px -1px rgba(166, 25, 36, 0.4), 0 2px 4px -2px rgba(166, 25, 36, 0.4)'
              }}
              aria-label={`Book route from ${route.from} to ${route.to}`}
            >
              Book This Route
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
