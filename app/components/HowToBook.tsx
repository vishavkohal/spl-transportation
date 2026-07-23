'use client';
import React from 'react';
import { BookOpen, UserCheck, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal, { staggerContainerSlow, fadeUp, scaleIn } from './ScrollReveal';

import { COLORS } from '../lib/colors';

// Theme Colors
const HEADING_COLOR = COLORS.heading;
const ACCENT_COLOR = COLORS.primary;
const MUTED_TEXT_COLOR = COLORS.muted;

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

export default function HowToBookModern() {
  return (
    <section className="w-full bg-white py-16 md:py-24 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tag */}
        <ScrollReveal variant="fadeUpSubtle">
          <p
            className="text-[11px] text-center sm:text-[14px] font-semibold tracking-[0.24em] uppercase mb-1.5"
            style={{ color: ACCENT_COLOR }}
          >
            Easy Booking
          </p>
        </ScrollReveal>

        {/* Heading */}
        <ScrollReveal variant="fadeUp" delay={0.1}>
          <h2
            className="text-4xl md:text-5xl font-extrabold text-center tracking-tight"
            style={{ color: HEADING_COLOR }}
          >
            How to Book Your Transfer
            <div
              className="w-24 h-1.5 mx-auto mt-4 rounded-full"
              style={{ backgroundColor: ACCENT_COLOR }}
            />
          </h2>
        </ScrollReveal>

        {/* Subtitle */}
        <ScrollReveal variant="fadeUpSubtle" delay={0.2}>
          <p className="mt-4 mb-12 text-center text-sm md:text-base max-w-2xl mx-auto leading-relaxed text-slate-600">
            Booking your private airport or city transfer is simple.
            Just follow these quick steps and we&apos;ll handle the rest.
          </p>
        </ScrollReveal>

        {/* Steps Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={staggerContainerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.id}
              variants={scaleIn}
              whileHover={{
                y: -5,
                scale: 1.02,
                boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
              }}
              className="p-5 md:p-6 rounded-xl cursor-default bg-white shadow-md transition-all duration-500"
            >
              {/* Step Icon & Number */}
              <div className="flex items-center mb-3 space-x-3">
                <span
                  className="text-3xl font-black"
                  style={{ color: HEADING_COLOR }}
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
                  style={{ color: HEADING_COLOR }}
                />
              </div>

              {/* Title */}
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: HEADING_COLOR }}
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
      </div>
    </section>
  );
}
