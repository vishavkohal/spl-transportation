'use client';
import React, { useEffect, useState } from 'react';
import { BusFront, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import type { Route } from '../types';

// Define the custom colors for readability
const PRIMARY_COLOR = '#18234B'; // Dark Navy (Heading, Primary Text)
const ACCENT_COLOR = '#A61924'; // Deep Red (Accent/Button)
const CARD_BG = '#FFFFFF'; // White (Fixed Card Background)
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
      setError(err.message ?? 'Failed to load routes');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
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
    <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-6 pb-14 pt-20 mt-10 md:pt-28 bg-gray-50">
      {/* ---------- INTRO / HERO COPY (SEO-FOCUSED) ---------- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 md:mb-10">
        <div className="max-w-3xl">
          <p
            className="text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase mb-2"
            style={{ color: ACCENT_COLOR }}
          >
            Cairns Airport & Queensland Private Transfers
          </p>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight"
            style={{ color: PRIMARY_COLOR }}
          >
            Fixed-Price Private Transfer Routes in Cairns, Port Douglas & Palm Cove
          </h1>

          <p className="mt-3 text-sm sm:text-base text-gray-600">
            Browse our most popular <strong>airport and regional transfer routes in
            Tropical North Queensland</strong>, including Cairns Airport, Cairns City,
            Port Douglas, Palm Cove, Kuranda, the Atherton Tablelands and more.
            Every journey is a <strong>door-to-door, private transfer</strong> with a
            professional local driver – no ridesharing, no crowded shuttle buses.
          </p>

          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            All prices shown are <strong>fixed in Australian dollars (AUD)</strong> and
            include meet &amp; greet at Cairns Airport, basic tolls and taxes. What you
            see here is what you pay – <strong>no surge pricing, no hidden fees.</strong>
          </p>
        </div>
      </header>

      {/* Supporting SEO text / reassurance */}
      <section className="mb-8 text-xs sm:text-sm text-gray-600 space-y-2">
        <p>
          Whether you are landing at <strong>Cairns Airport</strong> and heading straight
          to <strong>Port Douglas</strong>, relaxing at <strong>Palm Cove</strong>,
          exploring <strong>Kuranda</strong> and the Skyrail, or travelling further
          afield to the <strong>Atherton Tablelands</strong>, booking in advance guarantees
          a comfortable vehicle, on-time pickup and luggage assistance.
        </p>
        <p>
          Choose the route that best matches your itinerary below, select the vehicle size
          for your group, then tap <strong>&ldquo;Book This Route&rdquo;</strong> to
          continue your booking on our main form. You can change dates, flight numbers and
          passenger details on the next step.
        </p>
      </section>

      {/* Error & empty states */}
      {error && (
        <p className="text-red-500 font-medium text-sm mb-4">
          Error loading routes: {error}
        </p>
      )}
      {!loading && !error && routes.length === 0 && (
        <p className="text-gray-600 text-sm">
          No transfer routes are currently configured. Please check back soon or contact
          our team for a custom quote from Cairns Airport or Cairns City.
        </p>
      )}

      {/* Skeleton Loading */}
      {loading && (
        <section
          aria-label="Loading transfer routes"
          className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 md:p-6 rounded-2xl shadow-md border border-gray-100 bg-white flex flex-col animate-pulse"
            >
              {/* Label skeleton */}
              <div className="h-4 w-24 bg-gray-200 rounded-full mb-3" />

              {/* Route title skeleton */}
              <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-200 rounded mb-4" />

              {/* Pricing skeleton rows */}
              <div className="flex flex-col gap-2 mt-auto">
                {Array.from({ length: 3 }).map((__, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 px-2.5 py-2"
                  >
                    <div className="h-8 w-9 bg-gray-200 rounded flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 w-1/2 bg-gray-200 rounded mb-1" />
                      <div className="h-3 w-1/3 bg-gray-200 rounded" />
                    </div>
                    <div className="h-4 w-10 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>

              {/* Note skeleton */}
              <div className="h-3 w-2/3 bg-gray-200 rounded mt-4" />

              {/* Button skeleton */}
              <div className="h-9 w-full bg-gray-200 rounded-xl mt-4" />
            </div>
          ))}
        </section>
      )}

      {/* Actual Cards – SEO-friendly markup */}
      {!loading && !error && routes.length > 0 && (
        <section
          aria-label="Available fixed-price transfer routes"
          className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {routes.map(route => (
            <article
              key={route.id}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white 
                         p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-[2px] 
                         transition-all"
              style={{ backgroundColor: CARD_BG }}
            >
              {/* 🔖 Label at the very top (small chip) */}
              {route.label && (
                <div className="mb-1 flex justify-between items-center">
                  <span
                    className="inline-flex items-center rounded-full bg-red-50 px-2 py-[3px] 
                               text-[9px] font-semibold uppercase tracking-wide text-red-700"
                  >
                    {route.label}
                  </span>
                </div>
              )}

              {/* Route Names + Distance + Duration */}
              <div className="mb-2.5 border-b border-gray-100 pb-2.5 w-full">
                <div className="flex w-full items-start justify-between gap-2">
                  <h2
                    className="flex-1 text-base sm:text-lg font-bold tracking-tight"
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
                  </h2>

                  <div className="flex flex-col items-end gap-0.5 text-[10px] sm:text-[11px] text-gray-500 whitespace-nowrap">
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
              </div>

              {/* 💰 Pricing Rows – compact, horizontal layout */}
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
              <p
                className="mt-3 border-t border-gray-100 pt-2 text-[10px] leading-snug italic"
                style={{ color: MUTED_TEXT_COLOR }}
              >
                <span className="font-semibold text-gray-600">Good to know:</span>{' '}
                Child seats are available on request for an additional $20 per seat –
                ideal for families travelling with young children to or from Cairns
                Airport.
              </p>

              {/* Book Button – same accent style */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleBooking(route);
                }}
                className="mt-3 w-full rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-[0.98]"
                style={{
                  backgroundColor: PRIMARY_COLOR,
                  boxShadow:
                    '0 4px 6px -1px rgba(41, 78, 128, 0.4), 0 2px 4px -2px rgba(40, 54, 144, 0.4)'
                }}
                aria-label={`Book private transfer from ${route.from} to ${route.to}`}
              >
                Book This Route
              </button>
            </article>
          ))}
        </section>
      )}

      {/* Extra SEO copy / FAQ style footer section */}
      {!loading && !error && routes.length > 0 && (
        <section className="mt-10 space-y-3 text-xs sm:text-sm text-gray-600">
          <h2 className="text-base sm:text-lg font-semibold" style={{ color: PRIMARY_COLOR }}>
            Why book a fixed-price private transfer in Cairns?
          </h2>
          <p>
            Pre-booking a private transfer in Cairns means your driver is waiting when you
            land, your vehicle is sized correctly for your group and luggage, and your
            price is locked in before you travel. This is especially important for popular
            routes such as <strong>Cairns Airport to Port Douglas</strong>,
            <strong> Cairns Airport to Palm Cove</strong> and
            <strong> Cairns City to Kuranda</strong>, where taxis and rideshare can be
            limited in peak season.
          </p>
          <p>
            Our local drivers monitor flight arrival times, help with bags and know the
            best routes to avoid traffic when possible. Simply choose a route above to see
            the price for your group size, then complete your booking on the next step.
          </p>
        </section>
      )}
    </div>
  );
}
