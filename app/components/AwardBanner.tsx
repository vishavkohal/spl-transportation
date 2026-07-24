'use client';
import React from 'react';
import { Award, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AwardBanner() {
  return (
    <section className="w-full relative overflow-hidden bg-gradient-to-r from-[#0D2137] via-[#102A43] to-[#0A4F4B] text-white py-12 md:py-16 border-y border-teal-500/20 shadow-xl">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-72 h-72 bg-[#2DD4BF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-80 h-80 bg-[#0F766E]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* Left Column: Laurel Wreath + Headline + Metric Paragraph */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-center lg:text-left space-y-4 max-w-2xl"
          >
            {/* Laurel Wreath Badge Header */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-widest shadow-sm">
              <Award className="w-4 h-4 text-[#2DD4BF]" />
              <span>EXCELLENCE IN PRIVATE TRANSPORT 2026</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              #1 Rated Chauffeur Service <span className="text-[#2DD4BF]">2026</span>
            </h2>

            {/* Description with Custom Metric */}
            <p className="text-sm sm:text-base text-slate-200 font-light leading-relaxed">
              Recognized as the premier private transfer & luxury charter service in Cairns & Tropical North Queensland, achieving a <strong className="text-white font-semibold">99.4% On-Time Reliability Score</strong> across over <strong className="text-[#2DD4BF] font-semibold">10,000+ completed transfers</strong>.
            </p>

            {/* Citation Label */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
              <span>Australian Transport Excellence Standards — 2026</span>
            </div>
          </motion.div>

          {/* Right Column: Circular Winner Seal Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="shrink-0 relative flex items-center justify-center"
          >
            {/* Outer Decorative Ring */}
            <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full border-2 border-dashed border-teal-400/40 animate-[spin_40s_linear_infinite] absolute" />

            {/* Badge Container */}
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-[#102A43] via-[#0F766E] to-[#0A4F4B] border-4 border-white/20 shadow-2xl p-3 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              {/* Top Accent Curve */}
              <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-teal-200 mb-1">
                2026 WINNER
              </div>

              {/* Star Rating Row */}
              <div className="flex items-center gap-1 text-amber-400 my-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>

              {/* Center Highlight */}
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none my-0.5">
                99.4%
              </div>
              <div className="text-[9px] sm:text-[10px] font-bold text-teal-200 uppercase tracking-wider">
                RELIABILITY RATE
              </div>

              {/* Bottom Shield */}
              <div className="mt-1.5 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-xs text-[9px] font-semibold text-slate-200">
                Top 1% Australia
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
