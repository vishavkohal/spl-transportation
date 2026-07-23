'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CtaBanner() {
  const scrollToForm = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="w-full bg-[#102A43] text-white py-14 border-t border-white/10 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-[#0F766E]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
              Ready to book your transfer?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-light">
              Book online in less than 2 minutes. Fixed prices, instant confirmation.
            </p>
          </div>

          <div>
            <button
              onClick={scrollToForm}
              className="
                inline-flex items-center justify-center gap-2.5
                px-7 py-3.5 rounded-xl
                bg-[#0F766E] hover:bg-[#0C5D59]
                text-white font-bold text-sm sm:text-base
                shadow-lg hover:shadow-xl
                transform hover:-translate-y-0.5
                transition-all duration-200
                whitespace-nowrap
              "
            >
              <span>Book Your Transfer</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
