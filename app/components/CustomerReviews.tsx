'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

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

// Animations
const sectionHeaderVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const reviewsContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const reviewCardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const CustomerReviews: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Title */}
        <motion.div
          className="text-center mb-16"
          variants={sectionHeaderVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <p
            className="font-bold tracking-wider uppercase text-sm mb-2"
            style={{ color: ACCENT_COLOR }}
          >
            Testimonials
          </p>

          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: PRIMARY_COLOR }}
          >
            What Our Customers Say
          </h2>

          <div
            className="w-24 h-1.5 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
          />
        </motion.div>

        {/* Review Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={reviewsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {CUSTOMER_REVIEWS.map((review) => (
            <motion.div
              key={review.name}
              variants={reviewCardVariants}
              whileHover={{
                y: -6,
                scale: 1.02,
                boxShadow: '0 18px 45px rgba(0, 0, 0, 0.25)',
              }}
              className="relative rounded-2xl p-8 border shadow-xl transition-all duration-300"
              style={{
                backgroundColor: PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
              }}
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-8 opacity-15">
                <Quote
                  className="w-12 h-12"
                  style={{ color: ACCENT_COLOR }}
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
                        : 'rgba(255,255,255,0.25)',
                    }}
                    fill={i < review.rating ? ACCENT_COLOR : 'none'}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="leading-relaxed mb-8 italic text-white relative z-10">
                &quot;{review.comment}&quot;
              </p>

              {/* Divider */}
              <div className="w-full h-px mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} />

              {/* User Info */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-bold text-lg text-white">{review.name}</p>
                  <p
                    className="text-sm font-medium"
                    style={{ color: ACCENT_COLOR }}
                  >
                    Verified Client
                  </p>
                </div>
                <p className="text-sm text-white/60">{review.date}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CustomerReviews;
