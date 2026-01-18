'use client';

import React, { useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, ArrowRight } from 'lucide-react';
import type { Route } from '../types';
import { routeToSlug } from '../lib/routeSlug';
import { useBooking } from '../providers/BookingProvider';

// Minimal Motion Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 40,
      damping: 20
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

const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';

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
    subtitle: 'A smooth ride to one of Tropical North Queenslands most scenic beach towns.',
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
  if (!route.pricing || !route.pricing.length) return 'Contact for price';
  const min = Math.min(...route.pricing.map((p) => p.price));
  return `From $${min}`;
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
    <section className="py-20 mx-4 md:mx-6 mb-16 md:mb-24 rounded-[2.5rem] bg-[#F8F9FA] overflow-hidden shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          {/* STATIC TITLE (Always Visible) */}
          <div className="text-center flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-base font-semibold tracking-wide uppercase mb-2" style={{ color: ACCENT_COLOR }}>
                Popular Routes
              </h2>
              <p className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: PRIMARY_COLOR }}>
                Top Destinations
              </p>
              <div
                className="w-24 h-1.5 mt-4 rounded-full mx-auto"
                style={{ backgroundColor: ACCENT_COLOR }}
              />
            </motion.div>
          </div>

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
                bg-white rounded-2xl 
                shadow-md hover:shadow-2xl transition-all duration-300
                group relative hover:-translate-y-1
                flex flex-col overflow-hidden border border-gray-100
              "
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Link href={`/transfers/${item.slug}`} className="absolute inset-0 z-10" aria-label={`Book ${item.title}`} />

                {/* IMAGE CONTAINER */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/90 text-slate-800 shadow-sm backdrop-blur-sm">
                      <MapPin className="w-3 h-3 mr-1" />
                      Popular
                    </span>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#A61924] transition-colors" style={{ color: PRIMARY_COLOR }}>
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-500 mb-6 leading-relaxed line-clamp-2">
                    {item.subtitle}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-100 w-full flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wide mb-0.5">Starting from</p>
                      <p className="text-lg font-bold" style={{ color: PRIMARY_COLOR }}>{item.price}</p>
                    </div>

                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-slate-600 group-hover:bg-[#A61924] group-hover:text-white transition-all shadow-sm">
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
