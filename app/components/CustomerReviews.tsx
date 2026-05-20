'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal, { staggerContainerSlow, fadeUp } from './ScrollReveal';

// Custom colors
const PRIMARY_COLOR = '#18234B'; // Dark Navy (now card background)
const ACCENT_COLOR = '#A61924'; // Deep Red (stars + highlights)

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
    <section className="py-6 md:py-12 bg-[#F8F9FA] transition-colors duration-300 mx-3 md:mx-6 mb-6 md:mb-12 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Title */}
        <div className="text-center mb-16">
          <ScrollReveal variant="fadeUpSubtle">
            <p
              className="font-bold tracking-wider uppercase text-sm mb-2"
              style={{ color: ACCENT_COLOR }}
            >
              Testimonials
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fadeUp" delay={0.1}>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: PRIMARY_COLOR }}
            >
              What Our Customers Say
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="fadeUpSubtle" delay={0.2}>
            <div
              className="w-24 h-1.5 mt-4 rounded-full mx-auto"
              style={{ backgroundColor: ACCENT_COLOR }}
            />
          </ScrollReveal>
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
                  style={{ color: PRIMARY_COLOR }}
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
                  <p className="font-bold text-lg" style={{ color: PRIMARY_COLOR }}>{review.name}</p>
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
