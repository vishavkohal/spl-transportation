'use client';

import React, { useState, useMemo } from 'react';
import {
  BusFront,
  Clock,
  MapPin,
  ArrowRight,
  Users,
  Plane,
  DollarSign,
  Car,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from '../types';
import { routeToSlug } from '../lib/routeSlug';
import { useBooking } from '../providers/BookingProvider';
import CustomerReviews from './CustomerReviews';
import { COLORS } from '../lib/colors';

/* ================= Brand Palette ================= */
const PRIMARY_COLOR = COLORS.primary;
const ACCENT_COLOR = COLORS.primary;
const DEFAULT_IMAGE = '/routes/cairns-airport-to-cairns-city.jpg';

/* ================= Image Mapping ================= */
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

function getRouteImage(route: Route, routeContents: any[] = []): string {
  if (!route || !route.from || !route.to) return DEFAULT_IMAGE;
  const fromLower = route.from.toLowerCase().trim();
  const toLower = route.to.toLowerCase().trim();

  // 1. Direct DB match
  const directMatch = (routeContents || []).find(
    c => c.route?.from?.toLowerCase().trim() === fromLower && c.route?.to?.toLowerCase().trim() === toLower
  );
  if (directMatch?.imageId) {
    return `/api/images/${directMatch.imageId}`;
  }

  // 2. Reverse DB match
  const reverseMatch = (routeContents || []).find(
    c => c.route?.from?.toLowerCase().trim() === toLower && c.route?.to?.toLowerCase().trim() === fromLower
  );
  if (reverseMatch?.reverseImageId) {
    return `/api/images/${reverseMatch.reverseImageId}`;
  }

  // 3. Static fallback
  const match = popularRouteConfigs.find(
    c =>
      c.from.toLowerCase() === fromLower &&
      c.to.toLowerCase() === toLower
  );
  return match ? match.image : DEFAULT_IMAGE;
}

function getFromPrice(route: Route): string {
  if (!route || !route.pricing || !route.pricing.length) return 'Contact';
  const min = Math.min(...route.pricing.map(p => p.price));
  return `$${min}`;
}

/* ================= Skeleton ================= */
const RouteSkeleton = () => (
  <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm h-full flex flex-col max-w-[340px] w-full mx-auto">
    <div className="h-36 w-full bg-slate-200 animate-pulse" />
    <div className="p-4 flex flex-col flex-grow space-y-4">
      <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse" />
      <div className="h-3 w-1/2 bg-slate-200 rounded animate-pulse" />
      <div className="h-10 w-full bg-slate-100 rounded animate-pulse mt-4" />
      <div className="mt-auto pt-3 flex justify-between items-center">
        <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
        <div className="h-6 w-6 bg-slate-200 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

export default function RoutesPage() {
  const { routes: allRoutes = [], routesLoading: loading } = useBooking();
  const [routeContents, setRouteContents] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  React.useEffect(() => {
    fetch('/api/route-content')
      .then(res => res.ok ? res.json() : [])
      .then(data => setRouteContents(data))
      .catch(() => { });
  }, []);

  // Filter out Day Trips
  const baseRoutes = useMemo(() => {
    return (allRoutes || []).filter(route =>
      route &&
      route.to &&
      route.from &&
      !route.to.toLowerCase().includes('day trip') &&
      !route.from.toLowerCase().includes('day trip')
    );
  }, [allRoutes]);

  // Categorized filter
  const filteredRoutes = useMemo(() => {
    if (activeCategory === 'all') return baseRoutes;
    if (activeCategory === 'airport') {
      return baseRoutes.filter(r => r.from.toLowerCase().includes('airport') || r.to.toLowerCase().includes('airport'));
    }
    if (activeCategory === 'beaches') {
      return baseRoutes.filter(r => r.to.toLowerCase().includes('palm cove') || r.from.toLowerCase().includes('palm cove') || r.to.toLowerCase().includes('beach'));
    }
    if (activeCategory === 'portdouglas') {
      return baseRoutes.filter(r => r.to.toLowerCase().includes('port douglas') || r.from.toLowerCase().includes('port douglas'));
    }
    if (activeCategory === 'tablelands') {
      return baseRoutes.filter(r => r.to.toLowerCase().includes('kuranda') || r.to.toLowerCase().includes('tablelands') || r.from.toLowerCase().includes('kuranda'));
    }
    return baseRoutes;
  }, [baseRoutes, activeCategory]);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">

      {/* 1. HERO HEADER SECTION - DARK NAVY WITH RED ACCENTS */}
      <section className="relative bg-[#102A43] text-white py-16 md:py-24 border-b border-slate-800 overflow-hidden">
        {/* Subtle Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-100">
          <Image
            src="/hero-mercedes.webp"
            alt="SPL Transportation Premium Chauffeured Vehicles"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient to ensure text readability on the left, but fading to reveal the image on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#102A43] via-[#102A43]/85 to-[#102A43]/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-[#0F766E]" />
            <span className="text-gray-200">Transfer Destinations</span>
          </nav>

          <div className="max-w-3xl space-y-6">


            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-serif">
              Explore Private Transfer Routes Across Far North Queensland
            </h1>

            <p className="text-base md:text-lg text-slate-300 max-w-2xl font-light mb-8 leading-relaxed">
              Reliable, fixed-price chauffeured transfers across Cairns, Port Douglas, Palm Cove, and Tropical North Queensland. No meters, no surge pricing.
            </p>

            {/* Quick Value Props */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mb-8">
              <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-xl">
                <Car className="w-5 h-5 text-[#0F766E]" />
                <span className="text-xs font-semibold">100% Private Transfers</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-xl">
                <Plane className="w-5 h-5 text-[#0F766E]" />
                <span className="text-xs font-semibold">Flight Tracking Included</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-xl">
                <DollarSign className="w-5 h-5 text-[#0F766E]" />
                <span className="text-xs font-semibold">Fixed Pricing Guarantee</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-xl">
                <Clock className="w-5 h-5 text-[#0F766E]" />
                <span className="text-xs font-semibold">24/7 Availability</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/#booking-form"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white bg-[#0F766E] hover:bg-[#0C5D59] shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Book a Transfer Online</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* 2. DYNAMIC REGION FILTER TABS & ROUTE CATALOG */}
      <section className="py-14 max-w-7xl mx-auto px-4 md:px-6">

        {/* Filter Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-200">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0F766E] block mb-1">
              Select Destination
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102A43]">
              Select Your Travel Route
            </h2>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === 'all'
                ? 'bg-[#102A43] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-gray-200'
                }`}
            >
              All Routes
            </button>
            <button
              onClick={() => setActiveCategory('airport')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === 'airport'
                ? 'bg-[#102A43] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-gray-200'
                }`}
            >
              Airport Transfers
            </button>
            <button
              onClick={() => setActiveCategory('portdouglas')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === 'portdouglas'
                ? 'bg-[#102A43] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-gray-200'
                }`}
            >
              Port Douglas
            </button>
            <button
              onClick={() => setActiveCategory('beaches')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === 'beaches'
                ? 'bg-[#102A43] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-gray-200'
                }`}
            >
              Palm Cove & Beaches
            </button>
            <button
              onClick={() => setActiveCategory('tablelands')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === 'tablelands'
                ? 'bg-[#102A43] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-gray-200'
                }`}
            >
              Kuranda & Tablelands
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <RouteSkeleton key={i} />)}
          </div>
        )}

        {/* Routes Grid */}
        {!loading && filteredRoutes.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRoutes.map(route => {
              const url = `/transfers/${routeToSlug(route)}`;
              const image = getRouteImage(route, routeContents);
              const price = getFromPrice(route);

              return (
                <Link
                  key={route.id}
                  href={url}
                  className="
                    group relative flex flex-col
                    bg-white rounded-3xl 
                    shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300
                    hover:-translate-y-1 overflow-hidden border border-gray-100
                    max-w-[340px] w-full mx-auto
                  "
                >
                  {/* IMAGE CONTAINER */}
                  <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={image}
                      alt={`${route.from} to ${route.to} Transfer`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Badge inside top-left corner */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest bg-[#102A43] text-white shadow-sm border border-white/10">
                        <MapPin className="w-2.5 h-2.5 mr-1 text-white/80" />
                        Private Route
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 flex flex-col flex-grow bg-white">
                    {/* Route Path Vertical layout */}
                    <div className="flex flex-col relative mb-3">
                      {/* Dashed line connecting origin and destination */}
                      <div className="absolute left-[11px] top-5 bottom-5 w-px border-l-2 border-dashed border-slate-200"></div>

                      {/* Origin */}
                      <div className="flex items-center gap-3 mb-2.5 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                          <Plane className="w-3 h-3 text-[#102A43]" />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{route.from}</span>
                      </div>

                      {/* Destination */}
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                          <MapPin className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-base font-bold text-[#102A43] leading-tight">{route.to}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 text-[9px] text-slate-500 font-medium mb-3">
                      <span className="flex items-center gap-1"><BusFront className="w-2.5 h-2.5 text-slate-400" /> {route.distance}</span>
                      <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5 text-slate-400" /> {route.duration}</span>
                    </div>

                    {/* Vehicle Tiers Breakdown */}
                    <div className="space-y-2.5 mb-4 flex-grow">
                      {route.pricing.slice(0, 3).map((p, i) => {
                        let vehicleIcon = '/vehicles/sedan.png';
                        if (p.vehicleType.toLowerCase().includes('suv')) vehicleIcon = '/vehicles/suv.png';
                        if (p.vehicleType.toLowerCase().includes('van') || p.vehicleType.toLowerCase().includes('8-seater') || p.vehicleType.toLowerCase().includes('seater') || p.vehicleType.toLowerCase().includes('mercedes')) vehicleIcon = '/vehicles/mercedes-v-class.png';
                        const isSedan = vehicleIcon.includes('sedan');

                        return (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-11 h-7 flex items-center justify-center shrink-0">
                                <Image src={vehicleIcon} alt={p.vehicleType} width={44} height={28} className={`object-contain ${isSedan ? 'scale-135' : 'scale-110'}`} />
                              </div>

                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-700 leading-tight">{p.vehicleType}</span>
                                <span className="text-[8px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Users className="w-2 h-2 text-slate-400" />
                                  {p.passengers}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-bold text-[#102A43] leading-tight">${p.price}</span>
                              <span className="text-[7px] text-slate-400 uppercase font-semibold">AUD</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-auto bg-slate-50 rounded-xl p-3 flex items-center justify-between group-hover:bg-[#f8fafc] transition-colors border border-transparent group-hover:border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Starting At</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-extrabold text-[#102A43] leading-none">{price}</span>
                          <span className="text-[8px] font-semibold text-slate-500">AUD</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#102A43] flex items-center justify-center shadow-sm group-hover:bg-[#0C5D59] transition-colors shrink-0">
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && filteredRoutes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 p-8">
            <p className="font-bold text-slate-800">No matching routes found for this filter.</p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-3 px-4 py-2 bg-[#102A43] text-white text-xs font-bold rounded-xl"
            >
              View All Routes
            </button>
          </div>
        )}

      </section>


      {/* 3. THE SPL TRANSPORTATION DIFFERENCE (UNIQUE FEATURE CARDS) */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0F766E] block mb-2">
              Why Travellers Choose Us
            </span>
            <h2 className="text-3xl font-extrabold text-[#102A43] font-serif">
              The SPL Transportation Standard
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Designed around comfort, punctuality, and complete peace of mind for every passenger.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Feature 1 */}
            <div className="bg-[#f8fafc] p-6 rounded-2xl border border-gray-200/80 space-y-3 relative overflow-hidden group hover:border-[#102A43]/30 transition-all">
              <div className="w-11 h-11 bg-[#0F766E] text-white rounded-xl flex items-center justify-center shadow-md">
                <Plane className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#102A43]">Automated Flight Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We monitor your flight status in real-time. If your arrival is delayed, your driver automatically adjusts pickup at no additional cost.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#f8fafc] p-6 rounded-2xl border border-gray-200/80 space-y-3 relative overflow-hidden group hover:border-[#102A43]/30 transition-all">
              <div className="w-11 h-11 bg-[#0F766E] text-white rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#102A43]">Personalized Meet & Greet</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your driver greets you inside the terminal with a name board and provides hands-on assistance with all your luggage.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#f8fafc] p-6 rounded-2xl border border-gray-200/80 space-y-3 relative overflow-hidden group hover:border-[#102A43]/30 transition-all">
              <div className="w-11 h-11 bg-[#0F766E] text-white rounded-xl flex items-center justify-center shadow-md">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#102A43]">Exclusive Vehicle Ownership</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your vehicle is 100% private. No riding with strangers, no extra passenger pickups, and no detour delays.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#f8fafc] p-6 rounded-2xl border border-gray-200/80 space-y-3 relative overflow-hidden group hover:border-[#102A43]/30 transition-all">
              <div className="w-11 h-11 bg-[#0F766E] text-white rounded-xl flex items-center justify-center shadow-md">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#102A43]">Guaranteed Fixed Fares</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enjoy transparent pricing with zero surprise charges, traffic surge multipliers, or hidden luggage fees.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* 4. CALL TO ACTION BANNER */}
      <section className="py-16 bg-[#102A43] text-white relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#0F766E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10 space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#0F766E]">
            Need a Custom Route or Group Transport?
          </span>
          <h2 className="text-3xl font-extrabold font-serif">
            Tailored Private Chauffeur Solutions
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto font-light">
            Travelling with a large group, specialized equipment, or need multi-stop itineraries across Far North Queensland? Our dispatch team is ready to assist.
          </p>
          <div className="pt-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0F766E] hover:bg-[#0C5D59] text-white font-bold text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <span>Request Custom Quote</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* 5. VERIFIED CUSTOMER REVIEWS */}
      <CustomerReviews />

    </main>
  );
}