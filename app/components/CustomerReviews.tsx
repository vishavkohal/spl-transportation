'use client';

import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainerSlow, fadeUp } from './ScrollReveal';
import { COLORS } from '../lib/colors';

const HEADING_COLOR = COLORS.heading;
const ACCENT_COLOR = COLORS.primary;

type Review = {
  name: string;
  date: string;
  rating: number;
  route: string;
  comment: string;
};

// Google "G" SVG Icon
function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.2.01 10.04.01 12c0 1.96.46 3.8 1.28 5.42l3.99-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

const CUSTOMER_REVIEWS: Review[] = [
  {
    name: 'Sarah Johnson',
    date: 'Feb 14, 2026',
    rating: 5,
    route: 'Cairns Airport to Port Douglas',
    comment:
      'Our flight was delayed by 45 minutes, but our driver was waiting right at arrivals with a name sign. Smooth, comfortable vehicle and zero stress. Best transfer in Tropical Queensland!',
  },
  {
    name: 'Michael Chen',
    date: 'Jan 28, 2026',
    rating: 5,
    route: 'Cairns Airport to Palm Cove',
    comment:
      'Spotless Mercedes vehicle, crystal clear communication, and fixed transparent pricing with no hidden charges. The online booking process was seamless!',
  },
  {
    name: 'David & Emma Richardson',
    date: 'Jan 12, 2026',
    rating: 5,
    route: 'Cairns City to Kuranda',
    comment:
      'We booked SPL for a day trip to Kuranda. Punctual, courteous driver who shared great local tips. We will definitely use SPL Transportation on every Cairns visit.',
  },
];

const CustomerReviews: React.FC = () => {
  return (
    <section className="w-full bg-[#F8FAFC] py-16 md:py-24 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 mb-3">
              <GoogleIcon className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Google Verified Reviews
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#102A43] tracking-tight">
              Trusted by 1,000+ Happy Travelers
            </h2>
          </div>

          {/* Rating Pill */}
          <div className="inline-flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200">
            <GoogleIcon className="w-6 h-6" />
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-slate-900 text-base">4.9</span>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">Based on 250+ Google Reviews</p>
            </div>
          </div>
        </div>

        {/* Review Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={staggerContainerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {CUSTOMER_REVIEWS.map((review) => {
            const initials = review.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <motion.div
                key={review.name}
                variants={fadeUp}
                whileHover={{
                  y: -6,
                  boxShadow: '0 20px 40px rgba(16, 42, 67, 0.1)',
                  transition: { duration: 0.3 }
                }}
                className="relative rounded-3xl p-7 border border-slate-200/80 bg-white shadow-sm transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Header with Rating & Google Logo */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/50">
                      <GoogleIcon className="w-3.5 h-3.5" />
                      <span>Google</span>
                    </div>
                  </div>

                  {/* Route Pill */}
                  <div className="mb-4">
                    <span className="inline-block text-[11px] font-bold text-[#0F766E] bg-[#0F766E]/10 px-3 py-1 rounded-full">
                      📍 {review.route}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="leading-relaxed mb-6 italic text-slate-700 text-sm font-light">
                    &quot;{review.comment}&quot;
                  </p>
                </div>

                {/* User Info Footer with Avatar */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#102A43] to-[#0F766E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {initials}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm leading-tight">{review.name}</p>
                      <p className="text-[#0F766E] text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified Traveler
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{review.date}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CustomerReviews;

