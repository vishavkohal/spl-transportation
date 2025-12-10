'use client';
import React from 'react';
import { BookOpen, UserCheck, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Theme Colors
const PRIMARY_COLOR = '#18234B'; 
const ACCENT_COLOR = '#A61924';
const CARD_BG = '#FFFFFF';
const TEXT_COLOR_DARK = '#18234B';
const MUTED_TEXT_COLOR = '#5F6368';

// Shadow
const CARD_SHADOW =
  '0 3px 6px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.18)';

// Data
const steps = [
  {
    id: 1,
    title: 'Book Online or Call',
    description: 'Reserve your private transfer in minutes.',
    icon: BookOpen,
  },
  {
    id: 2,
    title: 'Meet Your Driver',
    description: "We'll greet you at the airport with a personalised sign.",
    icon: UserCheck,
  },
  {
    id: 3,
    title: 'Relax & Enjoy',
    description: 'Travel stress-free directly to your destination.',
    icon: CheckCircle,
  },
];

// Motion Variants
const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

export default function HowToBookModern() {
  return (
    <div className="py-20 px-6" style={{ backgroundColor: PRIMARY_COLOR }}>
      <motion.div
        className="max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
      >
        {/* Tag */}
        <p
          className="text-[11px] text-center sm:text-[14px] font-semibold tracking-[0.24em] uppercase mb-1.5"
          style={{ color: ACCENT_COLOR }}
        >
          Easy Booking
        </p>

        {/* Heading */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center tracking-tight"
          style={{ color: 'white' }}
        >
          How to Book Your Transfer
          <div
            className="w-24 h-1.5 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
          />
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="mt-4 mb-12 text-center text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
          style={{ color: '#E5E7EB' }}
        >
          Booking your private airport or city transfer is simple.
          Just follow these quick steps and we&apos;ll handle the rest.
        </motion.p>

        {/* Steps Grid */}
        <motion.div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <motion.div
              key={step.id}
              whileHover={{
                y: -5,
                scale: 1.02,
                boxShadow: '0 8px 20px rgba(0,0,0,0.20)',
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="p-5 md:p-6 rounded-lg cursor-default bg-white"
              style={{ boxShadow: CARD_SHADOW }}
            >
              {/* Step Icon & Number */}
              <div className="flex items-center mb-3 space-x-3">
                <span
                  className="text-3xl font-black"
                  style={{ color: ACCENT_COLOR }}
                >
                  {step.id}
                </span>
                <span
                  className="text-2xl"
                  style={{ color: MUTED_TEXT_COLOR }}
                >
                  |
                </span>
                <step.icon
                  className="w-6 h-6"
                  style={{ color: ACCENT_COLOR }}
                />
              </div>

              {/* Title */}
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: TEXT_COLOR_DARK }}
              >
                {step.title}
              </h3>

              {/* Description */}
              <p
                className="text-sm leading-relaxed"
                style={{ color: MUTED_TEXT_COLOR }}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
