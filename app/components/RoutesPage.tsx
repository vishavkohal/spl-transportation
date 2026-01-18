'use client';

import React from 'react';
import { BusFront, Clock, MapPin, ArrowRight, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from '../types';
import { routeToSlug } from '../lib/routeSlug';

/* ================= Brand ================= */
const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';
const DEFAULT_IMAGE = '/routes/cairns-airport-to-cairns-city.jpg';

/* ================= Image Mapping ================= */
// Copied from PopularDestinations to ensure consistent images
const popularRouteConfigs = [
  {
    from: 'Cairns Airport',
    to: 'Cairns City',
    image: '/routes/cairns-airport-to-cairns-city.jpg'
  },
  {
    from: 'Cairns Airport',
    to: 'Port Douglas',
    image: '/routes/cairns-airport-to-port-douglas.jpg'
  },
  {
    from: 'Cairns Airport',
    to: 'Palm Cove',
    image: '/routes/cairns-airport-to-palm-cove.jpg'
  },
  {
    from: 'Palm Cove',
    to: 'Cairns Airport',
    image: '/routes/palm-cove-to-cairns-airport.jpg'
  },
  {
    from: 'Cairns City',
    to: 'Tablelands',
    image: '/routes/cairns-city-to-tablelands.jpg'
  },
  {
    from: 'Cairns City',
    to: 'Kuranda',
    image: '/routes/cairns-city-to-kuranda.jpg'
  },
];

function getRouteImage(route: Route): string {
  const match = popularRouteConfigs.find(
    c =>
      c.from.toLowerCase() === route.from.toLowerCase() &&
      c.to.toLowerCase() === route.to.toLowerCase()
  );
  return match ? match.image : DEFAULT_IMAGE;
}

function getFromPrice(route: Route): string {
  if (!route.pricing || !route.pricing.length) return 'Contact';
  const min = Math.min(...route.pricing.map(p => p.price));
  return `$${min}`;
}

/* ================= Skeleton ================= */
const RouteSkeleton = () => (
  <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm h-full flex flex-col">
    <div className="h-56 w-full bg-slate-200 animate-pulse" />
    <div className="p-6 flex flex-col flex-grow space-y-4">
      <div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

import { useBooking } from '../providers/BookingProvider';

export default function TransfersPage() {
  const { routes: allRoutes, routesLoading: loading } = useBooking();

  // No local fetch needed - use global context
  // Filter out Day Trips
  const routes = allRoutes.filter(route =>
    !route.to.toLowerCase().includes('day trip') &&
    !route.from.toLowerCase().includes('day trip')
  );

  // Error handling is managed by provider or we just show empty if failed
  const error = null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14">

        <header className="max-w-3xl mb-12">
          <span
            className="inline-block mb-3 rounded-full px-4 py-1 text-[11px] font-bold tracking-widest uppercase border border-slate-200 bg-white shadow-sm"
            style={{ color: ACCENT_COLOR }}
          >
            Queensland Private Transfers
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: PRIMARY_COLOR }}>
            Available Routes
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl">
            Explore our comprehensive list of transfer destinations across Tropical North Queensland.
            From airport shuttles to private charters, we cover it all.
          </p>
        </header>

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <RouteSkeleton key={i} />)}
          </div>
        )}

        {!loading && !error && routes.length > 0 && (
          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {routes
              .filter(route => !route.to.toLowerCase().includes('day trip') && !route.from.toLowerCase().includes('day trip'))
              .map(route => {
                const url = `/transfers/${routeToSlug(route)}`;
                const image = getRouteImage(route);
                const price = getFromPrice(route);

                return (
                  <Link
                    key={route.id}
                    href={url}
                    className="
                    group relative flex flex-col
                    bg-white rounded-2xl 
                    shadow-md hover:shadow-2xl transition-all duration-300
                    hover:-translate-y-1 overflow-hidden border border-gray-100
                  "
                  >
                    {/* IMAGE CONTAINER */}
                    <div className="relative h-56 w-full overflow-hidden">
                      <Image
                        src={image}
                        alt={`${route.from} to ${route.to}`}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/90 text-slate-800 shadow-sm backdrop-blur-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          Transfer
                        </span>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h2
                        className="text-xl font-bold mb-2 group-hover:text-[#A61924] transition-colors"
                        style={{ color: PRIMARY_COLOR }}
                      >
                        {route.from} <span className="text-gray-300 mx-1">→</span> {route.to}
                      </h2>

                      <div className="flex gap-4 mb-6 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><BusFront className="h-4 w-4" /> {route.distance}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {route.duration}</span>
                      </div>

                      {/* Pricing Tiers */}
                      <div className="space-y-2 mb-6">
                        {route.pricing.slice(0, 3).map((p, i) => (
                          <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0 hover:bg-slate-50 rounded px-1 -mx-1 transition-colors">
                            <span className="font-medium text-slate-700 w-24">{p.vehicleType}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1 mr-auto">
                              <Users className="w-3 h-3 text-slate-400" />
                              {p.passengers}
                            </span>
                            <span className="font-bold whitespace-nowrap" style={{ color: PRIMARY_COLOR }}>${p.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-100 w-full flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wide mb-0.5">Starting from</p>
                          <p className="text-lg font-bold" style={{ color: PRIMARY_COLOR }}>{price}</p>
                        </div>

                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-slate-600 group-hover:bg-[#A61924] group-hover:text-white transition-all shadow-sm">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </section>
        )}
      </div>
    </main>
  );
}