'use client';
import React, { useEffect, useState } from 'react';
import type { Route } from '../types';

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

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 pb-12 pt-24 md:pt-32 dark:bg-slate-950 transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white">
          Routes & Pricing
        </h1>

        <button
          onClick={load}
          disabled={loading}
          className="mt-3 md:mt-0 px-4 py-2 rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 transition-colors 
          dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {loading && <p className="text-slate-600 dark:text-slate-400">Loading…</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      {!loading && !error && routes.length === 0 && (
        <p className="text-slate-600 dark:text-slate-400">No routes configured.</p>
      )}

      <div className="space-y-8">
        {routes.map(route => (
          <div
            key={route.id}
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 transition-colors flex flex-col
            dark:bg-slate-900 dark:border-slate-800"
          >
            {/* Card Header: Route Names & Info */}
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {route.from} <span className="text-amber-400">→</span> {route.to}
              </h3>
              <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
                {route.distance} • {route.duration}
              </p>
            </div>

            {/* Pricing Grid */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5">
              {route.pricing.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl transition-colors 
                  dark:bg-slate-800 dark:border-slate-700"
                >
                  <p className="text-sm text-slate-500 mb-1 dark:text-slate-400">
                    {p.passengers} passengers
                  </p>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
                    ${p.price}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-sm text-slate-500 mt-4 dark:text-slate-500">
              * Child seat available for additional $20
            </p>

            {/* Button: Full width on mobile, centered and compact on Desktop */}
            <button
              onClick={() => {
                if (typeof onSelectRoute === 'function') {
                  try {
                    onSelectRoute(route);
                  } catch (e) {
                    console.error('onSelectRoute threw:', e);
                  }
                }
                if (typeof setCurrentPage === 'function') {
                  try {
                    setCurrentPage('home');
                  } catch (e) {
                    console.error('setCurrentPage threw:', e);
                  }
                }
              }}
              className="w-full md:w-auto md:self-center mt-8 px-10 py-3 bg-amber-400 text-white rounded-xl font-bold shadow-md hover:brightness-105 hover:shadow-lg transition-all active:scale-[0.99]"
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