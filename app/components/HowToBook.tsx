'use client';
import React from 'react';
import { BookOpen, UserCheck, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal, { staggerContainerSlow, fadeUp, scaleIn } from './ScrollReveal';

// Theme Colors
const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';
const TEXT_COLOR_DARK = '#18234B';
const MUTED_TEXT_COLOR = '#5F6368';

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
    <div className="py-6 md:py-12 px-4 md:px-6 mx-3 md:mx-6 mb-6 md:mb-12 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto">
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
            style={{ color: PRIMARY_COLOR }}
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
                  style={{ color: PRIMARY_COLOR }}
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
                  style={{ color: PRIMARY_COLOR }}
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
      </div>
    </div>
  );
}
