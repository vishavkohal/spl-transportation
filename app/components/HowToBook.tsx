'use client';
import React from 'react';
import { BookOpen, UserCheck, CheckCircle } from 'lucide-react'; // Icons
import { motion } from 'framer-motion';

// Define the custom colors based on user's theme
const PRIMARY_COLOR = '#18234B'; // Dark Navy (Used for Background, Text on Card)
const ACCENT_COLOR = '#A61924'; // Deep Red (Used for Heading, Step Number/Icon)
const CARD_BG = '#FFFFFF'; // Pure White for Card Background
const TEXT_COLOR_DARK = '#18234B'; // Dark Navy for body text on the card
const MUTED_TEXT_COLOR = '#5F6368'; // Medium Gray (Muted Text)

// Material Shadow properties
const CARD_SHADOW = '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)';

// Data structure for the steps
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

// Motion variants
const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      staggerChildren: 0.12,
    },
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
    // Outer container: Using Dark Navy background
    <div className="py-20 px-6" style={{ backgroundColor: PRIMARY_COLOR }}>
      <motion.div
        className="max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
      >
         <p
          className="text-[11px] text-center sm:text-[15px] md:text-xm font-semibold tracking-[0.24em] uppercase mb-1.5"
          style={{ color: ACCENT_COLOR }}
        >
          Easy Booking
        </p>

        {/* Component Header */}
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

        {/* Small description under the heading */}
        <motion.p
          className="mt-4 mb-14 text-center text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
          style={{ color: '#E5E7EB' }} // light gray on navy
        >
          Booking your private airport or city transfer is simple. 
          Just follow these three quick steps and we&apos;ll handle the rest.
        </motion.p>

        {/* Steps Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
        >
          {steps.map(step => (
            <motion.div
              key={step.id}
              whileHover={{
                y: -6,
                scale: 1.02,
                boxShadow: '0 8px 18px rgba(0,0,0,0.25)',
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              // Card styling: White background, rounded corners, shadow
              className="p-8 md:p-10 rounded-xl cursor-default"
              style={{ backgroundColor: CARD_BG, boxShadow: CARD_SHADOW }}
            >
              {/* Step Number/Icon Group */}
              <div className="flex items-center mb-4 space-x-4">
                {/* Step Number - Large, bold, and accented (Deep Red) */}
                <span
                  className="text-4xl font-black"
                  style={{ color: ACCENT_COLOR }}
                >
                  {step.id}
                </span>
                {/* Visual Separator */}
                <span
                  className="text-3xl"
                  style={{ color: MUTED_TEXT_COLOR }}
                >
                  |
                </span>
                {/* Icon */}
                <step.icon
                  className="w-8 h-8"
                  style={{ color: ACCENT_COLOR }}
                />
              </div>

              {/* Step Title */}
              <h3
                className="text-2xl font-bold mb-3 mt-4"
                style={{ color: TEXT_COLOR_DARK }}
              >
                {step.title}
              </h3>

              {/* Step Description */}
              <p
                className="text-base leading-relaxed"
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
