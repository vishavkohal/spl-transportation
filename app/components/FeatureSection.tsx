'use client';
import React, { useRef, useEffect } from 'react';
import { Tag, Plane, Clock, Award, Users, Star, ShieldCheck, Headset } from 'lucide-react';
import { motion, useInView, useSpring } from 'framer-motion';

const featureHighlights = [
  {
    icon: Tag,
    title: 'Fixed, All-Inclusive Pricing',
    description: 'What you see is what you pay. No hidden fees or unexpected surge charges.',
  },
  {
    icon: Plane,
    title: 'Flight Tracking',
    description: 'We monitor your flight status in real time and adjust pickup times automatically.',
  },
  {
    icon: Clock,
    title: 'Free Waiting Time',
    description: 'Up to 60 minutes free waiting time for airport pickups to clear luggage.',
  },
  {
    icon: Award,
    title: 'Professional Drivers',
    description: 'Experienced, fully licensed, and knowledgeable local chauffeur drivers.',
  },
];

const stats = [
  {
    id: 1,
    label: 'Happy Customers',
    value: '2500+',
    subtext: 'Transfers Completed',
    icon: Users,
    gradient: 'from-blue-500/10 to-teal-500/10',
    iconColor: 'text-[#0F766E]',
  },
  {
    id: 2,
    label: 'Average Rating',
    value: '4.9/5',
    subtext: 'Google & TripAdvisor',
    icon: Star,
    gradient: 'from-amber-500/10 to-yellow-500/10',
    iconColor: 'text-amber-500',
    showStars: true,
  },
  {
    id: 3,
    label: 'Customer Support',
    value: '24/7',
    subtext: 'Always Live & Available',
    icon: Headset,
    gradient: 'from-emerald-500/10 to-teal-500/10',
    iconColor: 'text-emerald-600',
  },
  {
    id: 4,
    label: 'Years Experience',
    value: '10+',
    subtext: 'Licensed & Accredited',
    icon: ShieldCheck,
    gradient: 'from-indigo-500/10 to-blue-500/10',
    iconColor: 'text-indigo-600',
  },
];

const AnimatedCounter = ({ value }: { value: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10px' });

  const match = value.match(/([\d.]+)(.*)/);
  const numericValue = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : '';

  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: 2,
  });

  useEffect(() => {
    if (inView) {
      springValue.set(numericValue);
    }
  }, [inView, numericValue, springValue]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (ref.current) {
        const isFloat = value.includes('.');
        const formattedNum = isFloat
          ? latest.toFixed(1)
          : Math.floor(latest).toLocaleString();
        ref.current.textContent = formattedNum + suffix;
      }
    });
  }, [springValue, suffix, value]);

  return <span ref={ref}>{0 + suffix}</span>;
};

const FeaturesSection: React.FC = React.memo(() => {
  return (
    <>
      {/* 1. DARK NAVY FEATURE STRIP */}
      <section className="w-full bg-[#102A43] text-white py-8 sm:py-14 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 lg:gap-10 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {featureHighlights.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="snap-center shrink-0 w-[52vw] xs:w-[48vw] sm:w-auto bg-white/5 sm:bg-transparent border border-white/10 sm:border-0 rounded-xl sm:rounded-2xl p-3 sm:p-0 flex flex-col items-start text-left group"
                >
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/10 border border-white/15 flex items-center justify-center mb-2 sm:mb-4 text-[#2DD4BF] group-hover:bg-[#0F766E] group-hover:text-white transition-all duration-300">
                    <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-xs sm:text-base font-bold text-white mb-1 sm:mb-2 leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-[10px] sm:text-sm text-slate-300 leading-normal font-light">
                    {feat.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. PREMIUM TRUST & STATS CARDS SHOWCASE */}
      <section className="w-full bg-gradient-to-b from-slate-50 to-slate-100/80 py-8 sm:py-16 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="relative group bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center overflow-hidden hover:-translate-y-1"
                >
                  {/* Top Accent Gradient on Hover */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#102A43] via-[#0F766E] to-[#2DD4BF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Icon Badge Container */}
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} ${stat.iconColor} flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>

                  {/* Stat Value */}
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#102A43] tracking-tight mb-1">
                    {stat.value === '24/7' ? (
                      <span className="flex items-center gap-1.5 justify-center">
                        24/7
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1" />
                          LIVE
                        </span>
                      </span>
                    ) : (
                      <AnimatedCounter value={stat.value} />
                    )}
                  </div>

                  {/* Star Rating Indicator for 4.9/5 */}
                  {stat.showStars && (
                    <div className="flex items-center gap-1 mb-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  )}

                  {/* Label */}
                  <div className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                    {stat.label}
                  </div>

                  {/* Micro Subcaption */}
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                    {stat.subtext}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
});

FeaturesSection.displayName = 'FeaturesSection';

export default FeaturesSection;
