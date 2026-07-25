'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Car,
  Calendar,
  Phone,
  ArrowRight,
  Plane,
  Building2,
  Palmtree,
  HelpCircle,
  Compass,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import type { RouteDTO } from '@/app/lib/routesStore';
import { routeToSlug } from '@/app/lib/routeSlug';

const COMPANY_PHONE = '+61470032460';

interface ServicesPageClientProps {
  initialRoutes: RouteDTO[];
}

type DisplayRoute = {
  key: string;
  primaryRoute: RouteDTO;
  reverseRoute?: RouteDTO;
  from: string;
  to: string;
  displayFrom: string;
  displayTo: string;
  distance: string;
  duration: string;
  description: string | null;
  pricing: RouteDTO['pricing'];
  isBidirectional: boolean;
};

// Filter category options
const FILTER_TABS = [
  { id: 'all', label: 'All Services & Routes', icon: Compass },
  { id: 'airport', label: 'Airport Transfers', icon: Plane },
  { id: 'city', label: 'City Routes', icon: Building2 },
  { id: 'beach', label: 'Beach & Coast', icon: Palmtree },
  { id: 'hourly', label: 'Hourly Hire', icon: Clock },
  { id: 'daytrip', label: 'Day Trips (8-Hr)', icon: Calendar },
];

// FAQ items data
const FAQ_ITEMS = [
  {
    q: 'Are your rates per passenger or per vehicle?',
    a: 'All prices listed on our rates page are 100% fixed per vehicle, NOT per passenger. Whether 1 person or a full group of 7 travels in the vehicle, your total fare remains exactly the same.',
  },
  {
    q: 'What is included in the Hourly Chauffeur Hire rates?',
    a: 'Hourly Hire includes a professional dedicated driver, fuel, unlimited stops within your booked hours, and waiting time. Fares start at $120/hr for Sedans and $150/hr for Premium SUVs/Vans with a 2-hour minimum booking.',
  },
  {
    q: 'How does the 8-Hour Day Trip Private Charter work?',
    a: 'Our Day Trip packages give you 8 consecutive hours of dedicated chauffeur and vehicle service. You set the itinerary to explore destinations like Daintree Rainforest, Kuranda Village, Atherton Tablelands, or Port Douglas at your own pace.',
  },
  {
    q: 'What is the After-Hours Surcharge policy?',
    a: 'Pickups scheduled between 9:00 PM and 5:00 AM incur a flat $30 after-hours surcharge. This is automatically applied and clearly displayed before you confirm your payment.',
  },
  {
    q: 'Are child safety seats provided?',
    a: 'Yes! We provide Australian-standard rear-facing seats, forward-facing seats, and booster seats for $20 per seat. You can select your required child seats directly during the booking process.',
  },
  {
    q: 'What happens if my flight is delayed?',
    a: 'We monitor all incoming domestic and international flights in real-time. If your flight is delayed, your driver adjusts your pickup schedule automatically at no additional charge.',
  },
  {
    q: 'Are there any hidden fees or extra tolls?',
    a: 'No hidden fees whatsoever. All prices include GST, tolls, airport parking fees, and flight tracking. The price you see on our rate list is the final fare.',
  },
];

function normalizeRouteText(value: string | null | undefined): string {
  return (value || '').trim().toLowerCase();
}

function buildUndirectedRouteKey(route: Pick<RouteDTO, 'from' | 'to'>): string {
  return [normalizeRouteText(route.from), normalizeRouteText(route.to)]
    .sort()
    .join('::');
}

function normalizePricing(pricing: RouteDTO['pricing']) {
  return [...pricing]
    .map((item) => ({
      vehicleType: normalizeRouteText(item.vehicleType),
      passengers: normalizeRouteText(item.passengers),
      price: item.price,
    }))
    .sort((a, b) => {
      const vehicleCompare = a.vehicleType.localeCompare(b.vehicleType);
      if (vehicleCompare !== 0) return vehicleCompare;
      return a.passengers.localeCompare(b.passengers);
    });
}

function hasEquivalentServiceDetails(a: RouteDTO, b: RouteDTO): boolean {
  const isReversePair =
    normalizeRouteText(a.from) === normalizeRouteText(b.to) &&
    normalizeRouteText(a.to) === normalizeRouteText(b.from);

  if (!isReversePair) return false;

  return (
    normalizeRouteText(a.distance) === normalizeRouteText(b.distance) &&
    normalizeRouteText(a.duration) === normalizeRouteText(b.duration) &&
    JSON.stringify(normalizePricing(a.pricing)) === JSON.stringify(normalizePricing(b.pricing))
  );
}

function choosePrimaryRoute(a: RouteDTO, b: RouteDTO): RouteDTO {
  const aStartsAtAirport = normalizeRouteText(a.from).includes('airport');
  const bStartsAtAirport = normalizeRouteText(b.from).includes('airport');

  if (aStartsAtAirport !== bStartsAtAirport) {
    return aStartsAtAirport ? a : b;
  }

  return a.id <= b.id ? a : b;
}

function buildDisplayRoute(primaryRoute: RouteDTO, reverseRoute?: RouteDTO): DisplayRoute {
  const primaryDescription = primaryRoute.description?.trim() || null;
  const reverseDescription = reverseRoute?.description?.trim() || null;
  const hasSharedDescription =
    primaryDescription &&
    reverseDescription &&
    normalizeRouteText(primaryDescription) === normalizeRouteText(reverseDescription);

  return {
    key: reverseRoute
      ? `pair-${Math.min(primaryRoute.id, reverseRoute.id)}-${Math.max(primaryRoute.id, reverseRoute.id)}`
      : `route-${primaryRoute.id}`,
    primaryRoute,
    reverseRoute,
    from: primaryRoute.from,
    to: primaryRoute.to,
    displayFrom: primaryRoute.from,
    displayTo: primaryRoute.to,
    distance: primaryRoute.distance,
    duration: primaryRoute.duration,
    description:
      reverseRoute
        ? (hasSharedDescription ? primaryDescription : 'Fixed fare available in both directions.')
        : primaryDescription,
    pricing: primaryRoute.pricing,
    isBidirectional: Boolean(reverseRoute),
  };
}

function routeMatchesTab(route: DisplayRoute, activeTab: string): boolean {
  if (activeTab === 'all') return true;

  const locations = [
    route.primaryRoute.from,
    route.primaryRoute.to,
    route.reverseRoute?.from,
    route.reverseRoute?.to,
  ]
    .filter(Boolean)
    .map((value) => normalizeRouteText(value));

  if (activeTab === 'airport') return locations.some((value) => value.includes('airport'));
  if (activeTab === 'city') return locations.some((value) => value.includes('city') || value.includes('cairns'));
  if (activeTab === 'beach') return locations.some((value) => value.includes('cove') || value.includes('douglas'));
  return true;
}

function getVehiclePrice(
  pricing: RouteDTO['pricing'],
  matcher: (vehicleType: string) => boolean
): number | undefined {
  return pricing.find((item) => matcher(item.vehicleType.toLowerCase()))?.price;
}

export default function ServicesPageClient({ initialRoutes }: ServicesPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Filter regular transfer routes
  const regularRoutes = useMemo(() => {
    return initialRoutes.filter(r => !r.from.toLowerCase().includes('day trip'));
  }, [initialRoutes]);

  const displayRoutes = useMemo(() => {
    const groupedRoutes = new Map<string, RouteDTO[]>();

    regularRoutes.forEach((route) => {
      const key = buildUndirectedRouteKey(route);
      const existing = groupedRoutes.get(key) || [];
      existing.push(route);
      groupedRoutes.set(key, existing);
    });

    return Array.from(groupedRoutes.values())
      .flatMap((group) => {
        if (group.length === 2 && hasEquivalentServiceDetails(group[0], group[1])) {
          const primaryRoute = choosePrimaryRoute(group[0], group[1]);
          const reverseRoute = primaryRoute.id === group[0].id ? group[1] : group[0];
          return [buildDisplayRoute(primaryRoute, reverseRoute)];
        }

        return [...group]
          .sort((a, b) => a.id - b.id)
          .map((route) => buildDisplayRoute(route));
      })
      .sort((a, b) => a.primaryRoute.id - b.primaryRoute.id);
  }, [regularRoutes]);

  // Filtered routes based on search and tab selection
  const filteredRoutes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return displayRoutes.filter((route) => {
      const searchableValues = [
        route.primaryRoute.from,
        route.primaryRoute.to,
        route.primaryRoute.label,
        route.primaryRoute.description,
        route.reverseRoute?.from,
        route.reverseRoute?.to,
        route.reverseRoute?.label,
        route.reverseRoute?.description,
      ]
        .filter(Boolean)
        .map((value) => normalizeRouteText(value));

      const matchesSearch = !q || searchableValues.some((value) => value.includes(q));

      if (!matchesSearch) return false;

      return routeMatchesTab(route, activeTab);
    });
  }, [displayRoutes, searchQuery, activeTab]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC]">

      {/* ================= HERO HEADER ================= */}
      <section className="relative bg-[#102A43] text-white pt-24 pb-32 md:pt-28 md:pb-40 overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-mercedes.webp"
            alt="SPL Transportation Fleet"
            fill
            className="object-cover opacity-25"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#102A43]/90 via-[#102A43]/85 to-[#102A43]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#2DD4BF] text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TRANSPARENT PRICING &amp; SERVICES</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Services &amp; Rate List
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 font-light mb-8 max-w-2xl leading-relaxed">
              Explore fixed-rate pricing for all private airport transfers, hourly chauffeur hire, and 8-hour day trip charters across Cairns, Port Douglas &amp; Tropical North Queensland.
            </p>

            {/* Trust Badges Bar */}
            <div className="flex flex-wrap gap-2.5 text-xs sm:text-sm font-semibold">
              {[
                '100% Fixed Rates',
                'No Surge Fees',
                'GST & Tolls Included',
                'Flight Tracking',
                '24/7 Availability',
              ].map((badge) => (
                <span
                  key={badge}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEARCH & CATEGORY FILTER BAR ================= */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-14 mb-12">
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200/80 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {FILTER_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200
                      ${isActive
                        ? 'bg-[#0F766E] text-white shadow-md shadow-teal-900/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input Box */}
            <div className="relative w-full md:w-72 shrink-0">
              <input
                type="text"
                placeholder="Search route or city..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-[#0F766E] focus:bg-white focus:ring-2 focus:ring-[#0F766E]/15 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-20">

        {/* ═════════════════ SECTION 1: POINT-TO-POINT TRANSFERS TABLE ═════════════════ */}
        {(activeTab === 'all' || activeTab === 'airport' || activeTab === 'city' || activeTab === 'beach') && (
          <section id="transfers-table" className="scroll-mt-24 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#0F766E] mb-1">
                  Fixed-Fare Direct Transfers
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102A43]">
                  Transfer Routes &amp; Pricing Table
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  All fares are 100% fixed per vehicle. Matching return routes are grouped into one bidirectional row.
                </p>
              </div>

              <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3.5 py-2 rounded-xl">
                Showing <span className="font-bold text-slate-900">{filteredRoutes.length}</span> transfer options
              </div>
            </div>

            {/* Desktop Table (MD+) */}
            <div className="hidden md:block bg-white rounded-3xl shadow-lg border border-slate-200/80 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <th className="py-4 px-6">Route (From → To)</th>
                    <th className="py-4 px-4 text-center">Distance &amp; Time</th>
                    <th className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Car className="w-4 h-4 text-slate-600" />
                        <span>Sedan (1-4 Pax)</span>
                      </div>
                    </th>
                    <th className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-600" />
                        <span>SUV (1-5 Pax)</span>
                      </div>
                    </th>
                    <th className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-slate-600" />
                        <span>Van (1-7 Pax)</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium">
                  {filteredRoutes.length > 0 ? (
                    filteredRoutes.map((route) => {
                      const sedan = getVehiclePrice(route.pricing, (vehicleType) => vehicleType.includes('sedan'));
                      const suv = getVehiclePrice(route.pricing, (vehicleType) => vehicleType.includes('suv'));
                      const van = getVehiclePrice(route.pricing, (vehicleType) => vehicleType.includes('van') || vehicleType.includes('seater'));
                      const slug = routeToSlug(route.primaryRoute);

                      return (
                        <tr key={route.key} className="hover:bg-slate-50/80 transition-colors">
                          {/* Route Name */}
                          <td className="py-4 px-6">
                            <div className="hidden font-bold text-slate-900 text-base flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#0F766E] shrink-0" />
                              <span>{route.from}</span>
                              <span className="text-slate-300 font-normal">→</span>
                              <span>{route.to}</span>
                            </div>
                            <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#0F766E] shrink-0" />
                              <span>{route.displayFrom}</span>
                              <span className="text-slate-300 font-normal">
                                {route.isBidirectional ? <>&harr;</> : <>&rarr;</>}
                              </span>
                              <span>{route.displayTo}</span>
                            </div>
                            {route.description && (
                              <p className="text-xs text-slate-500 font-normal mt-0.5 max-w-sm line-clamp-1">
                                {route.description}
                              </p>
                            )}
                          </td>

                          {/* Distance / Duration */}
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {route.duration || 'Direct'}
                            </span>
                            {route.distance && (
                              <div className="text-[11px] text-slate-400 mt-1">{route.distance}</div>
                            )}
                          </td>

                          {/* Sedan Price */}
                          <td className="py-4 px-4 text-center">
                            {sedan ? (
                              <span className="font-extrabold text-slate-900 text-base">
                                ${sedan} <span className="text-[11px] text-slate-400 font-normal">AUD</span>
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          {/* SUV Price */}
                          <td className="py-4 px-4 text-center">
                            {suv ? (
                              <span className="font-extrabold text-[#0F766E] text-base">
                                ${suv} <span className="text-[11px] text-slate-400 font-normal">AUD</span>
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          {/* Van Price */}
                          <td className="py-4 px-4 text-center">
                            {van ? (
                              <span className="font-extrabold text-[#102A43] text-base">
                                ${van} <span className="text-[11px] text-slate-400 font-normal">AUD</span>
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          {/* Book CTA */}
                          <td className="py-4 px-6 text-right">
                            <Link
                              href={`/transfers/${slug}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0C5D59] shadow-xs hover:shadow-md transition-all duration-200"
                            >
                              <span>{route.isBidirectional ? 'Book Either Way' : 'Book Route'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                        No transfer routes match &quot;{searchQuery}&quot;. Try a different search keyword.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (SM and smaller) */}
            <div className="grid md:hidden gap-4">
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => {
                  const sedan = getVehiclePrice(route.pricing, (vehicleType) => vehicleType.includes('sedan'));
                  const suv = getVehiclePrice(route.pricing, (vehicleType) => vehicleType.includes('suv'));
                  const van = getVehiclePrice(route.pricing, (vehicleType) => vehicleType.includes('van') || vehicleType.includes('seater'));
                  const slug = routeToSlug(route.primaryRoute);

                  return (
                    <div key={route.key} className="bg-white rounded-2xl p-5 shadow-md border border-slate-200/80 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="hidden text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#0F766E] shrink-0" />
                            <span>{route.from} → {route.to}</span>
                          </div>
                          <div className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#0F766E] shrink-0" />
                            <span>{route.displayFrom}</span>
                            <span className="text-slate-300 font-normal">
                              {route.isBidirectional ? <>&harr;</> : <>&rarr;</>}
                            </span>
                            <span>{route.displayTo}</span>
                          </div>
                          <div className="hidden flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                            <span>⏱ {route.duration || 'Direct'}</span>
                            {route.distance && <span>• 📍 {route.distance}</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                            <span>Time: {route.duration || 'Direct'}</span>
                            {route.distance && <span>Distance: {route.distance}</span>}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                          {route.isBidirectional ? 'Both Ways' : 'Fixed Fare'}
                        </span>
                      </div>

                      {/* Pricing Tier Grid */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Sedan (4 Pax)</div>
                          <div className="text-sm font-extrabold text-slate-900 mt-0.5">{sedan ? `$${sedan}` : '—'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">SUV (5 Pax)</div>
                          <div className="text-sm font-extrabold text-[#0F766E] mt-0.5">{suv ? `$${suv}` : '—'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Van (7 Pax)</div>
                          <div className="text-sm font-extrabold text-[#102A43] mt-0.5">{van ? `$${van}` : '—'}</div>
                        </div>
                      </div>

                      <Link
                        href={`/transfers/${slug}`}
                        className="hidden w-full py-3 rounded-xl text-center text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0C5D59] shadow-sm transition"
                      >
                        Book Route Now →
                      </Link>
                      <Link
                        href={`/transfers/${slug}`}
                        className="block w-full py-3 rounded-xl text-center text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0C5D59] shadow-sm transition"
                      >
                        {route.isBidirectional ? 'Book Either Direction ->' : 'Book Route Now ->'}
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-500 font-medium">
                  No matching routes found.
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═════════════════ SECTION 2: HOURLY HIRE RATES ═════════════════ */}
        {(activeTab === 'all' || activeTab === 'hourly') && (
          <section id="hourly-rates" className="scroll-mt-24 bg-white rounded-3xl p-8 sm:p-12 shadow-lg border border-slate-200/80 space-y-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>CHAUFFEUR HIRE BY THE HOUR</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#102A43]">
                Hourly Hire Rates &amp; Packages
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
                Enjoy complete flexibility with a dedicated private driver and vehicle. Perfect for shopping trips, corporate meetings, wedding shuttles, or custom sightseeing.
              </p>
            </div>

            {/* Rate Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6">

              {/* Sedan Card */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 flex flex-col justify-between hover:border-[#0F766E]/40 hover:shadow-md transition-all">
                <div>
                  <div className="relative h-28 w-full mb-4">
                    <Image src="/vehicles/sedan.png" alt="Executive Sedan" fill className="object-contain" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Executive Sedan</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Up to 4 Passengers • 3 Suitcases</p>

                  <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-medium text-slate-500">Hourly Rate</span>
                      <span className="text-2xl font-extrabold text-[#102A43]">$120 <span className="text-xs text-slate-400 font-normal">AUD/hr</span></span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs text-slate-600">
                      <span>Minimum Booking</span>
                      <span className="font-bold text-slate-800">2 Hours ($240)</span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg mt-2">
                      <span>Full Day (8+ Hours)</span>
                      <span>$820 Flat Rate</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/#booking"
                  className="mt-6 block w-full py-3 rounded-xl text-center text-xs font-bold text-white bg-[#102A43] hover:bg-[#0F766E] transition-all shadow-xs"
                >
                  Book Sedan Hourly →
                </Link>
              </div>

              {/* SUV Card */}
              <div className="rounded-2xl bg-teal-50/50 border-2 border-[#0F766E] p-6 flex flex-col justify-between shadow-md relative">
                <div className="absolute -top-3 right-6 bg-[#0F766E] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs">
                  Most Popular
                </div>
                <div>
                  <div className="relative h-28 w-full mb-4">
                    <Image src="/vehicles/suv.png" alt="Luxury SUV" fill className="object-contain" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Luxury SUV</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Up to 5 Passengers • 3 Large Bags</p>

                  <div className="mt-4 pt-4 border-t border-teal-200/80 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-medium text-slate-500">Hourly Rate</span>
                      <span className="text-2xl font-extrabold text-[#0F766E]">$150 <span className="text-xs text-slate-400 font-normal">AUD/hr</span></span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs text-slate-600">
                      <span>Minimum Booking</span>
                      <span className="font-bold text-slate-800">2 Hours ($300)</span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs text-emerald-800 font-bold bg-emerald-100/70 p-2 rounded-lg mt-2">
                      <span>Full Day (8+ Hours)</span>
                      <span>$1,050 Flat Rate</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/#booking"
                  className="mt-6 block w-full py-3 rounded-xl text-center text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0C5D59] transition-all shadow-md"
                >
                  Book SUV Hourly →
                </Link>
              </div>

              {/* Premium Van Card */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 flex flex-col justify-between hover:border-[#0F766E]/40 hover:shadow-md transition-all">
                <div>
                  <div className="relative h-28 w-full mb-4">
                    <Image src="/vehicles/mercedes-v-class.png" alt="Premium Van" fill className="object-contain" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Premium Van / Mercedes</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Up to 7 Passengers • 4 Large Suitcases</p>

                  <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-medium text-slate-500">Hourly Rate</span>
                      <span className="text-2xl font-extrabold text-[#102A43]">$150 <span className="text-xs text-slate-400 font-normal">AUD/hr</span></span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs text-slate-600">
                      <span>Minimum Booking</span>
                      <span className="font-bold text-slate-800">2 Hours ($300)</span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg mt-2">
                      <span>Full Day (8+ Hours)</span>
                      <span>$1,050 Flat Rate</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/#booking"
                  className="mt-6 block w-full py-3 rounded-xl text-center text-xs font-bold text-white bg-[#102A43] hover:bg-[#0F766E] transition-all shadow-xs"
                >
                  Book Van Hourly →
                </Link>
              </div>
            </div>

            {/* Inclusions Feature Strip */}
            <div className="pt-6 border-t border-slate-200/80 grid sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">✓</span>
                <span>Unlimited Stops &amp; Waypoints</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">✓</span>
                <span>Fuel &amp; Driver Included</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">✓</span>
                <span>Driver Waiting Time Included</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">✓</span>
                <span>Flexible Real-Time Routing</span>
              </div>
            </div>
          </section>
        )}

        {/* ═════════════════ SECTION 3: DAY TRIP CHARTERS BREAKDOWN ═════════════════ */}
        {(activeTab === 'all' || activeTab === 'daytrip') && (
          <section id="day-trips" className="scroll-mt-24 bg-gradient-to-br from-[#102A43] to-[#19324D] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden space-y-8">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#2DD4BF] text-xs font-bold uppercase tracking-wider mb-3">
                <Calendar className="w-3.5 h-3.5" />
                <span>8-HOUR PRIVATE DAY TRIP CHARTERS</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Full-Day Excursion Packages
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
                Discover Tropical North Queensland in luxury. 8 consecutive hours of dedicated private driver service to explore Port Douglas, Daintree Rainforest, Kuranda, or Atherton Tablelands at your speed.
              </p>
            </div>

            {/* Popular Day Trip Destinations Grid */}
            <div className="relative z-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Cairns → Port Douglas & Mossman', desc: 'Coastal drive, Great Barrier Reef gateway & Mossman Gorge.', img: '/routes/cairns-airport-to-port-douglas.jpg' },
                { name: 'Cairns → Daintree & Cape Tribulation', desc: 'Ancient rainforest, scenic river cruises & untouched beaches.', img: '/routes/cairns-airport-to-palm-cove.jpg' },
                { name: 'Cairns → Kuranda Scenic Village', desc: 'Rainforest village, Skyrail lookout & Barron Falls views.', img: '/routes/cairns-city-to-kuranda.jpg' },
                { name: 'Cairns → Atherton Tablelands', desc: 'Waterfalls circuit, crater lakes & local farm tours.', img: '/routes/cairns-city-to-tablelands.jpg' },
              ].map((dest) => (
                <div key={dest.name} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl overflow-hidden flex flex-col justify-between p-4 group hover:bg-white/15 transition-all">
                  <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                    <Image src={dest.img} alt={dest.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{dest.name}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-normal">{dest.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Summary & CTA */}
            <div className="relative z-10 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Day Trip Flat Rates</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  $820 <span className="text-xs font-semibold text-slate-300">(Sedan 4 Pax)</span> • $1,050 <span className="text-xs font-semibold text-slate-300">(SUV/Van 7 Pax)</span>
                </div>
                <div className="text-xs text-[#2DD4BF] mt-1 font-semibold">Includes 8 hours charter • GST &amp; Tolls included</div>
              </div>

              <Link
                href="/#booking"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold text-[#102A43] bg-[#2DD4BF] hover:bg-teal-300 transition-all shadow-lg text-center"
              >
                Book 8-Hour Day Trip Now →
              </Link>
            </div>
          </section>
        )}

        {/* ═════════════════ SECTION 4: VEHICLE FLEET & CAPACITY GUIDE ═════════════════ */}
        <section id="fleet-guide" className="scroll-mt-24 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0F766E] mb-1">
              Luxury Fleet Specification
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#102A43]">
              Vehicle Fleet &amp; Passenger Capacity
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              All vehicles are meticulously maintained, fully insured, and equipped with ice-cold air conditioning for tropical comfort.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Sedan */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200/80 text-center space-y-4">
              <div className="relative h-36 w-full mx-auto">
                <Image src="/vehicles/sedan.png" alt="Executive Sedan" fill className="object-contain" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Executive Sedan</h3>
              <div className="flex justify-center gap-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1"><Users className="w-4 h-4 text-[#0F766E]" /> Up to 4 Pax</span>
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-[#0F766E]" /> 3 Suitcases</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ideal for solo travelers, couples, and small corporate groups seeking a quiet, comfortable private ride.
              </p>
            </div>

            {/* SUV */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200/80 text-center space-y-4">
              <div className="relative h-36 w-full mx-auto">
                <Image src="/vehicles/suv.png" alt="Luxury SUV" fill className="object-contain" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Luxury SUV</h3>
              <div className="flex justify-center gap-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1"><Users className="w-4 h-4 text-[#0F766E]" /> Up to 5 Pax</span>
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-[#0F766E]" /> 3 Large Bags</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Spacious elevated seating with extra legroom, perfect for small families or passengers with bulky luggage.
              </p>
            </div>

            {/* Van */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200/80 text-center space-y-4">
              <div className="relative h-36 w-full mx-auto">
                <Image src="/vehicles/mercedes-v-class.png" alt="Premium Van" fill className="object-contain" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Premium Van / Mercedes</h3>
              <div className="flex justify-center gap-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1"><Users className="w-4 h-4 text-[#0F766E]" /> Up to 7 Pax</span>
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-[#0F766E]" /> 4 Large Suitcases</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Maximum capacity for large families, wedding groups, or travelers carrying oversized luggage, golf bags, or strollers.
              </p>
            </div>
          </div>
        </section>

        {/* ═════════════════ SECTION 5: "WHICH SERVICE DO I NEED?" COMPARISON MATRIX ═════════════════ */}
        <section id="service-comparison" className="scroll-mt-24 bg-gradient-to-br from-[#102A43] to-[#19324D] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden space-y-8">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#2DD4BF] text-xs font-bold uppercase tracking-wider mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>SERVICE COMPARISON GUIDE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Which Service Best Fits Your Journey?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              Compare our 3 primary service formats to choose the right option for your travel plans.
            </p>
          </div>

          {/* Comparison Grid (Matching Day Trip Section Cards) */}
          <div className="relative z-10 grid md:grid-cols-3 gap-6">

            {/* Point-to-Point */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl overflow-hidden flex flex-col justify-between p-6 group hover:bg-white/15 transition-all space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 text-[#2DD4BF] flex items-center justify-center font-bold text-xl">
                  📍
                </div>
                <h3 className="text-lg font-bold text-white">Point-to-Point Transfers</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Best for direct airport-to-hotel or city-to-resort journeys with a fixed pickup and drop-off location.
                </p>

                <ul className="text-xs text-slate-200 space-y-2.5 pt-3 border-t border-white/15">
                  <li className="flex items-center gap-2 font-medium">
                    <span className="text-[#2DD4BF] font-bold">✓</span> Fixed fare per route
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <span className="text-[#2DD4BF] font-bold">✓</span> Flight tracking included
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <span className="text-[#2DD4BF] font-bold">✓</span> Direct door-to-door transit
                  </li>
                </ul>
              </div>

              <Link
                href="/transfers"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold text-[#102A43] bg-white hover:bg-slate-100 transition-all shadow-md"
              >
                <span>Browse Transfer Routes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Hourly Hire */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl overflow-hidden flex flex-col justify-between p-6 group hover:bg-white/15 transition-all space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 text-[#2DD4BF] flex items-center justify-center font-bold text-xl">
                  ⏱
                </div>
                <h3 className="text-lg font-bold text-white">Hourly Chauffeur Hire</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Best for flexible itineraries, business appointments, shopping trips, or multiple intermediate stops.
                </p>

                <ul className="text-xs text-slate-200 space-y-2.5 pt-3 border-t border-white/15">
                  <li className="flex items-center gap-2 font-medium">
                    <span className="text-[#2DD4BF] font-bold">✓</span> Minimum 2 hours booking
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <span className="text-[#2DD4BF] font-bold">✓</span> Unlimited stops within duration
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <span className="text-[#2DD4BF] font-bold">✓</span> Driver remains on standby
                  </li>
                </ul>
              </div>

              <a
                href="#hourly-rates"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0C5D59] transition-all shadow-md"
              >
                <span>View Hourly Rates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Day Trip Charters */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl overflow-hidden flex flex-col justify-between p-6 group hover:bg-white/15 transition-all space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 text-[#2DD4BF] flex items-center justify-center font-bold text-xl">
                  🌴
                </div>
                <h3 className="text-lg font-bold text-white">8-Hour Day Trip Charters</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Best for full-day sightseeing excursions across Tropical North Queensland with custom itineraries.
                </p>

                <ul className="text-xs text-slate-200 space-y-2.5 pt-3 border-t border-white/15">
                  <li className="flex items-center gap-2 font-medium">
                    <span className="text-[#2DD4BF] font-bold">✓</span> 8 consecutive hours charter
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <span className="text-[#2DD4BF] font-bold">✓</span> Explore at your own pace
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <span className="text-[#2DD4BF] font-bold">✓</span> Flat full-day discount pricing
                  </li>
                </ul>
              </div>

              <a
                href="#day-trips"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold text-[#102A43] bg-[#2DD4BF] hover:bg-teal-300 transition-all shadow-md"
              >
                <span>View Day Trip Packages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </section>

        {/* ═════════════════ SECTION 6: FREQUENTLY ASKED QUESTIONS ═════════════════ */}
        <section id="faq" className="scroll-mt-24 space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#102A43]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Everything you need to know about our rates, policies, and vehicle inclusions.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none hover:bg-slate-50/50"
                  >
                    <span className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      <span className="text-[#0F766E] font-extrabold">Q.</span> {item.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#0F766E] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 pl-9">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ═════════════════ SECTION 7: CUSTOM QUOTE BANNER ═════════════════ */}
        <section className="bg-gradient-to-r from-[#102A43] via-[#19324D] to-[#0F766E] text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Need a Custom Pickup or Group Quote?</h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Have a multi-day trip, special event, wedding shuttle, or custom route not listed on our rates page? Our team is available 24/7 to provide a personalized quote.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/contact"
              className="px-6 py-3.5 rounded-xl font-bold text-xs text-[#102A43] bg-white hover:bg-slate-100 transition-all text-center shadow-md"
            >
              Request Custom Quote →
            </Link>
            <a
              href={`tel:${COMPANY_PHONE}`}
              className="px-6 py-3.5 rounded-xl font-bold text-xs text-white border border-white/30 hover:bg-white/10 transition-all text-center flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" /> Call +61 470 032 460
            </a>
          </div>
        </section>

      </div>
    </main>
  );
}
