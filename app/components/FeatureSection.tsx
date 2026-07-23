'use client';
import React, { useRef, useEffect } from 'react';
import { Tag, Plane, Clock, Award, Users, Star, ShieldCheck, CalendarCheck, type LucideIcon } from 'lucide-react';
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
  { id: 1, label: 'Happy Customers', value: '2,500+', icon: Users },
  { id: 2, label: 'Average Rating', value: '4.9/5', icon: Star },
  { id: 3, label: 'Customer Support', value: '24/7', icon: CalendarCheck },
  { id: 4, label: 'Years Experience', value: '10+', icon: ShieldCheck },
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
        ref.current.textContent = isFloat
          ? latest.toFixed(1) + suffix
          : Math.floor(latest) + suffix;
      }
    });
  }, [springValue, suffix, value]);

  return <span ref={ref}>{0 + suffix}</span>;
};

const FeaturesSection: React.FC = React.memo(() => {
  return (
    <>
      {/* 1. DARK NAVY FEATURE STRIP */}
      <section className="w-full bg-[#102A43] text-white py-14 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {featureHighlights.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex flex-col items-start text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center mb-4 text-[#2DD4BF] group-hover:bg-[#0F766E] group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 leading-tight">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                    {feat.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. FULL WIDTH LIGHT STATS BAR */}
      <section className="w-full bg-slate-50 py-10 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
            {stats.map((stat, idx) => (
              <div key={stat.id} className={`pt-4 sm:pt-0 ${idx !== 0 ? 'sm:pl-6' : ''}`}>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102A43] tracking-tight mb-1">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
});

FeaturesSection.displayName = 'FeaturesSection';

export default FeaturesSection;
