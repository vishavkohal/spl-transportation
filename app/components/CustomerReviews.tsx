'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal, { staggerContainerSlow, fadeUp } from './ScrollReveal';

import { COLORS } from '../lib/colors';

// Custom colors
const HEADING_COLOR = COLORS.heading;
const ACCENT_COLOR = COLORS.primary;

// Types
type Review = {
  name: string;
  date: string;
  rating: number;
  comment: string;
};

// Temporary mock data
const CUSTOMER_REVIEWS: Review[] = [
  {
    name: 'Sarah Johnson',
    date: 'Oct 12, 2025',
    rating: 5,
    comment:
      'The driver was incredibly professional and arrived exactly on time. The car was spotless. Highly recommended!',
  },
  {
    name: 'Michael Chen',
    date: 'Sep 28, 2025',
    rating: 5,
    comment:
      'Best airport transfer I have ever used. The flight tracking feature is a lifesaver. Will definitely book again.',
  },
  {
    name: 'Emily Davis',
    date: 'Nov 05, 2025',
    rating: 4,
    comment:
      'Great service for city commuting. Very comfortable ride, though traffic was a bit heavy. Driver knew all the shortcuts!',
  },
];

const CustomerReviews: React.FC = () => {
  return (
    <section className="w-full bg-[#F8FAFC] py-16 md:py-24 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#0F766E] mb-1">
              Customer Reviews
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#102A43] tracking-tight">
              Trusted by thousands
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500">
            <span>Rated 4.9/5 from 250+ Google reviews</span>
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
          {CUSTOMER_REVIEWS.map((review) => (
            <motion.div
              key={review.name}
              variants={fadeUp}
              whileHover={{
                y: -6,
                scale: 1.02,
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
                transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
              }}
              className="relative rounded-2xl p-8 border border-gray-100 bg-white shadow-sm transition-all duration-500"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-8 opacity-10">
                <Quote
                  className="w-12 h-12"
                  style={{ color: HEADING_COLOR }}
                />
              </div>

              {/* Rating Stars */}
              <div className="flex items-center mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5"
                    style={{
                      color: i < review.rating
                        ? ACCENT_COLOR
                        : '#e2e8f0', // lighter gray for empty stars
                    }}
                    fill={i < review.rating ? ACCENT_COLOR : 'none'}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="leading-relaxed mb-8 italic text-slate-600 relative z-10">
                &quot;{review.comment}&quot;
              </p>

              {/* Divider */}
              <div className="w-full h-px mb-6 bg-gray-100" />

              {/* User Info */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-bold text-lg" style={{ color: HEADING_COLOR }}>{review.name}</p>
                  <p
                    className="text-sm font-medium"
                    style={{ color: ACCENT_COLOR }}
                  >
                    Verified Client
                  </p>
                </div>
                <p className="text-sm text-slate-400">{review.date}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CustomerReviews;
