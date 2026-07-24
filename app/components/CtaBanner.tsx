'use client';

import React from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import { BASE_URL, BUSINESS_PHONE_RAW } from '../lib/constants';

export default function CtaBanner() {
  const scrollToForm = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="w-full bg-gradient-to-r from-[#0D2137] via-[#102A43] to-[#0F766E] text-white py-16 border-t border-teal-500/20 relative overflow-hidden shadow-2xl">
      {/* Background glow accents */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-80 h-80 bg-[#2DD4BF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-96 h-96 bg-[#0F766E]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-3">
              <span>INSTANT CONFIRMATION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
              Ready to experience effortless transfers?
            </h2>
            <p className="text-sm sm:text-base text-slate-200 font-light leading-relaxed">
              Book online in under 2 minutes with zero surge pricing, free flight tracking, and personal chauffeur arrival meet & greet.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <a
              href={`tel:${BUSINESS_PHONE_RAW || '+61470032460'}`}
              className="
                inline-flex items-center justify-center gap-2.5
                px-6 py-3.5 rounded-xl
                bg-white/10 hover:bg-white/20 border border-white/20
                text-white font-bold text-sm sm:text-base
                shadow-md hover:shadow-lg
                transition-all duration-200
                whitespace-nowrap backdrop-blur-md
              "
            >
              <Phone className="w-4 h-4 text-[#2DD4BF]" />
              <span>Call Us Direct</span>
            </a>

            <button
              onClick={scrollToForm}
              className="
                inline-flex items-center justify-center gap-2.5
                px-7 py-3.5 rounded-xl
                bg-[#0F766E] hover:bg-[#0C5D59]
                text-white font-bold text-sm sm:text-base
                shadow-xl hover:shadow-2xl
                transform hover:-translate-y-0.5
                transition-all duration-200
                whitespace-nowrap border border-teal-400/30
              "
            >
              <span>Book Your Transfer</span>
              <ArrowRight className="w-5 h-5 text-teal-200" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
