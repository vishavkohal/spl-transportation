'use client';
import React from 'react';
import { Clock, Shield, Truck, type LucideIcon } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

// Define the custom colors
const PRIMARY_COLOR = '#18234B'; // Dark Navy (New Background)
const ACCENT_COLOR = '#A61924'; // Deep Red
const TEXT_LIGHT = '#FFFFFF';    // White
const TEXT_MUTED = '#E0E0E0';    // Light Gray

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const featureData: Feature[] = [
  {
    title: '24/7 Availability',
    description: 'Round-the-clock service for early flights and late arrivals.',
    icon: Clock,
  },
  {
    title: 'Fully Licensed & Insured',
    description: 'Professional drivers with full commercial insurance coverage.',
    icon: Shield,
  },
  {
    title: 'Premium Fleet',
    description: 'Clean, comfortable, and air-conditioned vehicles for all group sizes.',
    icon: Truck,
  },
];

// Variants for fade-up animation
const fadeUpParent: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const fadeUpStaggerParent: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeUpChild: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20" style={{ backgroundColor: PRIMARY_COLOR }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          variants={fadeUpParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <p
            className="font-bold tracking-wider uppercase text-sm mb-2"
            style={{ color: ACCENT_COLOR }}
          >
            Our Commitment
          </p>
          <h2
            className="text-3xl md:text-4xl font-extrabold"
            style={{ color: TEXT_LIGHT }}
          >
            Why Choose Our Service?
          </h2>
          <div
            className="w-24 h-1.5 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
          />
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={fadeUpStaggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {featureData.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeUpChild}
                className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon Circle */}
                <div
                  className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full transition-colors"
                  style={{
                    backgroundColor: `${ACCENT_COLOR}10`,
                    color: ACCENT_COLOR,
                  }}
                >
                  <Icon className="w-8 h-8" strokeWidth={2} />
                </div>

                {/* Content */}
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: TEXT_LIGHT }}
                >
                  {feature.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: TEXT_MUTED }}
                >
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
