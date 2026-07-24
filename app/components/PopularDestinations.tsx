'use client';

import React, { useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, ArrowRight } from 'lucide-react';
import type { Route } from '../types';
import { routeToSlug } from '../lib/routeSlug';
import { useBooking } from '../providers/BookingProvider';

// Apple-style Motion Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

type DestinationCard = {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  slug: string;
  image: string;
};

import { COLORS } from '../lib/colors';

const HEADING_COLOR = COLORS.heading;
const ACCENT_COLOR = COLORS.primary;

// Map “marketing cards” to real DB routes via from/to
const popularRouteConfigs = [
  {
    key: 'cairns-airport-cairns-city',
    from: 'Cairns Airport',
    to: 'Cairns City',
    label: 'Cairns Airport Shuttle',
    subtitle: 'Fast, comfortable transfers connecting the airport with hotels and the city.',
    image: '/routes/cairns-airport-to-cairns-city.jpg'
  },
  {
    key: 'cairns-airport-port-douglas',
    from: 'Cairns Airport',
    to: 'Port Douglas',
    label: 'Port Douglas Getaway',
    subtitle: 'Seamless travel to the gateway of the world-famous Daintree Rainforest.',
    image: '/routes/cairns-airport-to-port-douglas.jpg'
  },
  {
    key: 'cairns-airport-palm-cove',
    from: 'Cairns Airport',
    to: 'Palm Cove',
    label: 'Palm Cove Coastal Transfer',
    subtitle: 'A smooth ride to one of Tropical North Queensland\'s most scenic beach towns.',
    image: '/routes/cairns-airport-to-palm-cove.jpg'
  },
  {
    key: 'cairns-airport-palm-cove-return',
    from: 'Palm Cove',
    to: 'Cairns Airport',
    label: 'Palm Cove to Airport',
    subtitle: 'Stress-free return transfer back to Cairns Airport.',
    image: '/routes/palm-cove-to-cairns-airport.jpg'
  },
  {
    key: 'cairns-city-tablelands',
    from: 'Cairns City',
    to: 'Tablelands',
    label: 'Atherton Tablelands',
    subtitle: 'Journey through lush highlands, crater lakes, and stunning waterfalls.',
    image: '/routes/cairns-city-to-tablelands.jpg'
  },
  {
    key: 'cairns-city-kuranda',
    from: 'Cairns City',
    to: 'Kuranda',
    label: 'Kuranda Experience',
    subtitle: 'Perfect for exploring the Kuranda markets, Skyrail and scenic mountain railway.',
    image: '/routes/cairns-city-to-kuranda.jpg'
  },
];

function getFromPrice(route: Route): string {
  if (!route.pricing || !route.pricing.length) return 'Contact us';
  const min = Math.min(...route.pricing.map((p) => p.price));
  return `$${min}`;
}

export default function PopularDestinations() {
  const { routes, routesLoading } = useBooking(); // ensure property name matches provider
  const scrollRef = useRef<HTMLDivElement>(null);

  const loading = routesLoading;

  const cards: DestinationCard[] = useMemo(() => {
    if (!routes || !routes.length) return [];
    return popularRouteConfigs
      .map((cfg) => {
        const match = routes.find(
          (r) =>
            r.from && r.to && // Safety check
            r.from.trim().toLowerCase() === cfg.from.toLowerCase() &&
            r.to.trim().toLowerCase() === cfg.to.toLowerCase()
        );
        if (!match) return null;
        return {
          id: match.id,
          title: cfg.label,
          subtitle: cfg.subtitle,
          price: getFromPrice(match),
          slug: routeToSlug(match), // Correctly calling with the Route object
          image: cfg.image
        };
      })
      .filter(Boolean) as DestinationCard[];
  }, [routes]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Determine if we should show the section
  const showSection = loading || cards.length > 0;

  if (!showSection) return null;

  return (
    <section className="w-full bg-[#F8FAFC] py-16 md:py-24 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          {/* TITLE SECTION */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs font-bold tracking-widest uppercase text-[#0F766E] mb-1">
                Popular Routes
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#102A43] tracking-tight">
                Popular Private Routes
              </h2>
            </motion.div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/transfers"
              className="hidden sm:inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0F766E] hover:text-[#0C5D59] transition-colors"
            >
              View all routes
              <ArrowRight className="w-4 h-4" />
            </Link>

            {!loading && (
              <div className="hidden md:flex gap-3">
                <button
                  onClick={() => scroll('left')}
                  className="p-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm text-slate-600"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="p-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm text-slate-600"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          /* SKELETON LOADING STATE */
          <div className="flex gap-6 overflow-hidden pb-8 px-4 md:px-0">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="w-[85vw] sm:w-[320px] h-[420px] shrink-0 rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 animate-pulse" />
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* REAL CAROUSEL CONTENT */
          <div
            ref={scrollRef}
            className="
            flex gap-6 overflow-x-auto snap-x snap-mandatory 
            pb-12 -mx-4 px-4 md:mx-0 md:px-0
            scrollbar-hide
          "
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {cards.map((item) => (
              <motion.div
                key={item.id}
                className="
                snap-center shrink-0 
                w-[85vw] sm:w-[340px]
                bg-white rounded-3xl 
                shadow-sm hover:shadow-2xl transition-all duration-300
                group relative hover:-translate-y-1.5
                flex flex-col overflow-hidden border border-slate-200/80 hover:border-[#0F766E]/30
              "
              initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={`/transfers/${item.slug}`} className="absolute inset-0 z-10" aria-label={`Book ${item.title}`} />

                {/* IMAGE CONTAINER */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 85vw, 340px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102A43]/70 via-transparent to-black/20 opacity-80" />

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 text-slate-800 shadow-sm backdrop-blur-md">
                      <MapPin className="w-3 h-3 mr-1 text-[#0F766E]" />
                      Popular
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-[#0F766E]/90 shadow-sm backdrop-blur-md">
                      Fixed Price
                    </span>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-extrabold mb-2 group-hover:text-[#0F766E] transition-colors tracking-tight" style={{ color: HEADING_COLOR }}>
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed line-clamp-2 font-light">
                    {item.subtitle}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-100 w-full flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-0.5">Starting from</p>
                      <p className="text-xl font-extrabold" style={{ color: HEADING_COLOR }}>{item.price}</p>
                    </div>

                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700 group-hover:bg-[#0F766E] group-hover:text-white transition-all shadow-xs group-hover:scale-105">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Mobile Nav Hint */}
        <div className="flex md:hidden justify-center gap-2 mt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
        </div>

      </div>
    </section>
  );
}
