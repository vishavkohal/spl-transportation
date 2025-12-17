'use client';

import React, { useEffect, useState } from 'react';
import { BusFront, Clock, Users, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from '../types';
import { routeToSlug } from '../lib/routeSlug';

/* ================= Brand ================= */
const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';

const VEHICLE_IMAGES: Record<string, string> = {
  Sedan: '/vehicles/sedan.svg',
  SUV: '/vehicles/suv.svg',
  Van: '/vehicles/van.svg'
};

/* ================= Skeleton (Updated Borders) ================= */
const RouteSkeleton = () => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 animate-pulse h-full">
    <div className="h-6 w-3/4 bg-slate-100 rounded mb-4" />
    <div className="flex gap-4 mb-6">
      <div className="h-4 w-16 bg-slate-100 rounded" />
      <div className="h-4 w-16 bg-slate-100 rounded" />
    </div>
    <div className="space-y-3 mb-8">
      <div className="h-16 w-full bg-slate-50 rounded-xl border border-slate-100" />
      <div className="h-16 w-full bg-slate-50 rounded-xl border border-slate-100" />
    </div>
    <div className="flex gap-3 mt-auto">
      <div className="h-10 flex-1 bg-slate-100 rounded-xl" />
      <div className="h-10 flex-1 bg-slate-100 rounded-xl" />
    </div>
  </div>
);

export default function TransfersPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/routes');
        if (!res.ok) throw new Error(`Failed (${res.status})`);
        setRoutes(await res.json());
      } catch (e: any) {
        setError(e.message ?? 'Failed to load routes');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    // Changed background to slate-50 to make white cards stand out
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14">

        <header className="max-w-3xl mb-14">
          <span
            className="inline-block mb-3 rounded-full px-4 py-1 text-[11px] font-bold tracking-widest uppercase border border-slate-200"
            style={{ backgroundColor: 'white', color: ACCENT_COLOR }}
          >
            Queensland Private Transfers
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: PRIMARY_COLOR }}>
            Airport & Regional Transfer Routes
          </h1>
        </header>

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <RouteSkeleton key={i} />)}
          </div>
        )}

        {!loading && !error && routes.length > 0 && (
          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {routes.map(route => {
              const url = `/transfers/${routeToSlug(route)}`;

              return (
                <article
                  key={route.id}
                  className="
                    group relative overflow-hidden rounded-3xl 
                    bg-white border border-slate-200
                    shadow-sm transition-all duration-300
                    hover:shadow-md hover:border-slate-300
                  "
                >
                  <div className="p-6 flex flex-col h-full">
                    <h2 className="text-lg font-bold mb-2" style={{ color: PRIMARY_COLOR }}>
                      {route.from} <span style={{ color: ACCENT_COLOR }}>→</span> {route.to}
                    </h2>

                    <div className="flex gap-5 text-xs text-slate-500 mb-5">
                      <span className="flex items-center gap-1"><BusFront className="h-4 w-4" /> {route.distance}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {route.duration}</span>
                    </div>

                    <div className="space-y-3 mb-6">
                      {route.pricing.slice(0, 2).map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                        >
                          <div className="relative h-9 w-9">
                            <Image src={VEHICLE_IMAGES[p.vehicleType] ?? '/vehicles/sedan.svg'} alt={p.vehicleType} fill className="object-contain" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-700">{p.vehicleType}</p>
                            <p className="text-[11px] text-slate-500 flex items-center">
                              <Users className="h-3 w-3 mr-1" /> {p.passengers} pax
                            </p>
                          </div>
                          <p className="text-sm font-bold" style={{ color: PRIMARY_COLOR }}>${p.price}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-3">
                      <Link
                        href={url}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-600 text-center hover:bg-slate-50 transition"
                      >
                        Details
                      </Link>
                      <Link
                        href={url}
                        className="rounded-xl px-4 py-2.5 text-xs font-bold text-white flex items-center justify-center gap-1"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                      >
                        Book Now <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}