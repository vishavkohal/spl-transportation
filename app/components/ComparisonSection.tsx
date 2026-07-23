'use client';
import React from 'react';
import { Check, X, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const comparisonData = [
  {
    feature: 'Fixed All-Inclusive Price',
    spl: 'Yes — Guaranteed',
    splHighlight: true,
    uber: 'Surge Pricing',
    taxi: 'Metered Estimate',
    shuttle: 'Per Person Rate',
  },
  {
    feature: 'Real-Time Flight Tracking',
    spl: 'Automatic',
    splHighlight: true,
    uber: 'No',
    taxi: 'No',
    shuttle: 'Limited',
  },
  {
    feature: 'Private Dedicated Vehicle',
    spl: 'Always',
    splHighlight: true,
    uber: 'Yes',
    taxi: 'Yes',
    shuttle: 'Shared Ride',
  },
  {
    feature: 'Arrival Name Board Meet & Greet',
    spl: 'Included Free',
    splHighlight: true,
    uber: 'No',
    taxi: 'No',
    shuttle: 'No',
  },
  {
    feature: 'Long-Distance & Regional Access',
    spl: 'Specialist Service',
    splHighlight: true,
    uber: 'Driver Varies',
    taxi: 'High Meter Rate',
    shuttle: 'Fixed Stops Only',
  },
  {
    feature: '24/7 Pre-Booked Reliability',
    spl: 'Guaranteed 24/7',
    splHighlight: true,
    uber: 'Limited Availability',
    taxi: 'Rank Queue Wait',
    shuttle: 'Fixed Timetable',
  },
  {
    feature: 'Child & Infant Safety Seats',
    spl: 'Available on Request ($20)',
    splHighlight: true,
    uber: 'Varies by Driver',
    taxi: 'Request Only',
    shuttle: 'Usually No',
  },
];

export default function ComparisonSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-y border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F766E]/10 border border-[#0F766E]/20 text-[#0F766E] text-xs font-bold uppercase tracking-wider">
              <span>TRANSPARENT COMPARISON</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102A43] tracking-tight leading-tight">
              Private Transfer vs Uber vs Taxi — <span className="text-[#0F766E]">Which Is Best?</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-light leading-relaxed">
              When arriving at the airport, you have several options: rideshare apps with unpredictable surge rates, rank queues for metered taxis, or shared shuttle counters.
            </p>

            <p className="text-sm text-slate-500 font-light leading-relaxed">
              Here is a side-by-side comparison — especially important when traveling to regional destinations, where price consistency and guaranteed reliability make all the difference.
            </p>
          </motion.div>

          {/* Key Differentiator Summary Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-7 bg-[#102A43] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
          >
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#2DD4BF]/10 rounded-full blur-2xl" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-[#2DD4BF]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-teal-300 tracking-wider">WHY CHOOSE SPL</div>
                <div className="text-lg font-bold text-white">Guaranteed Peace of Mind</div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 font-light leading-relaxed mb-4">
              Unlike rideshares that surge during peak airport arrival hours or metered taxis with running timers in traffic, SPL offers fixed upfront pricing, free flight delay waiting time, and personal driver arrival meet-and-greet.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-teal-200 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#2DD4BF]" />
                <span>Zero Surge Pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#2DD4BF]" />
                <span>Complimentary Waiting Time</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#2DD4BF]" />
                <span>Door-to-Door Privacy</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#2DD4BF]" />
                <span>Fixed Luggage Allowance</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Responsive Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200">
                  <th className="py-4 px-5 sm:px-6 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/4">
                    Feature
                  </th>
                  {/* Highlighted SPL Column */}
                  <th className="py-4 px-5 sm:px-6 text-xs font-bold uppercase tracking-wider bg-[#102A43] text-white w-1/4 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[#2DD4BF] font-black text-sm">SPL Transfer</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#0F766E] text-white uppercase tracking-normal">
                        Best Choice
                      </span>
                    </div>
                  </th>
                  <th className="py-4 px-5 sm:px-6 text-xs font-bold uppercase tracking-wider text-slate-600 w-1/6">
                    Uber / DiDi
                  </th>
                  <th className="py-4 px-5 sm:px-6 text-xs font-bold uppercase tracking-wider text-slate-600 w-1/6">
                    Metered Taxi
                  </th>
                  <th className="py-4 px-5 sm:px-6 text-xs font-bold uppercase tracking-wider text-slate-600 w-1/6">
                    Shared Shuttle
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Feature Title */}
                    <td className="py-4 px-5 sm:px-6 font-semibold text-slate-800">
                      {row.feature}
                    </td>

                    {/* SPL Column (Highlighted) */}
                    <td className="py-4 px-5 sm:px-6 font-bold text-[#102A43] bg-teal-50/50 border-x border-teal-100">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#0F766E] flex items-center justify-center text-white shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-900">{row.spl}</span>
                      </div>
                    </td>

                    {/* Uber */}
                    <td className="py-4 px-5 sm:px-6 text-slate-600">
                      {row.uber.startsWith('No') ? (
                        <div className="flex items-center gap-1.5 text-rose-500 font-medium">
                          <X className="w-4 h-4 shrink-0" />
                          <span>{row.uber}</span>
                        </div>
                      ) : (
                        <span>{row.uber}</span>
                      )}
                    </td>

                    {/* Taxi */}
                    <td className="py-4 px-5 sm:px-6 text-slate-600">
                      {row.taxi.startsWith('No') ? (
                        <div className="flex items-center gap-1.5 text-rose-500 font-medium">
                          <X className="w-4 h-4 shrink-0" />
                          <span>{row.taxi}</span>
                        </div>
                      ) : (
                        <span>{row.taxi}</span>
                      )}
                    </td>

                    {/* Shuttle */}
                    <td className="py-4 px-5 sm:px-6 text-slate-600">
                      {row.shuttle.startsWith('No') ? (
                        <div className="flex items-center gap-1.5 text-rose-500 font-medium">
                          <X className="w-4 h-4 shrink-0" />
                          <span>{row.shuttle}</span>
                        </div>
                      ) : (
                        <span>{row.shuttle}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Note inside card */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
            <span>
              For short inner-city trips, any transport option works. For airport arrivals, long-distance routes, or group travel with luggage, SPL Private Transfer guarantees your driver is waiting at the terminal without surge price penalties.
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
