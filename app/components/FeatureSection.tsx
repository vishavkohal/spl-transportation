'use client';
import React from 'react';
import { Clock, Shield, Truck, Users, Car, Star, type LucideIcon } from 'lucide-react';
import { motion, type Variants, useInView, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

// Define the custom colors
const PRIMARY_COLOR = '#18234B'; // Dark Navy
const ACCENT_COLOR = '#A61924';  // Deep Red

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const featureData: Feature[] = [
  {
    title: 'Full Availability',
    description: 'Book for early flights and late arrivals.',
    icon: Clock,
  },
  {
    title: 'Fully Licensed & Insured',
    description: 'Professional drivers with full commercial insurance coverage.',
    icon: Shield,
  },
  {
    title: 'Premium Fleet',
    description: 'Clean, comfortable, and air-conditioned vehicles.',
    icon: Truck,
  },
];

const stats = [
  {
    id: 1,
    label: 'Happy Passengers',
    value: '15k+',
    icon: Users,
  },
  {
    id: 2,
    label: 'On-Time Rate',
    value: '99%',
    icon: Clock,
  },
  {
    id: 3,
    label: 'Fleet Size',
    value: '50+',
    icon: Car,
  },
  {
    id: 4,
    label: '5-Star Reviews',
    value: '4.9',
    icon: Star,
  }
];

// Variants
const fadeUpParent: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 40, damping: 20 }
  },
};

const fadeUpStaggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUpChild: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 40, damping: 20 },
  },
};

const AnimatedCounter = ({ value }: { value: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10px" });

  const match = value.match(/([\d.]+)(.*)/);
  const numericValue = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : "";

  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: 2
  });

  useEffect(() => {
    if (inView) {
      springValue.set(numericValue);
    }
  }, [inView, numericValue, springValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        const isFloat = value.includes('.');
        ref.current.textContent = isFloat ? latest.toFixed(1) + suffix : Math.floor(latest) + suffix;
      }
    });
  }, [springValue, suffix, value]);

  return <span ref={ref}>{0 + suffix}</span>;
};

const FeaturesSection: React.FC = React.memo(() => {
  return (
    <section className="py-6 md:py-12 mx-3 md:mx-6 mb-6 md:mb-12 rounded-[2.5rem] bg-[#F8F9FA] text-slate-800 overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* TITLE SECTION */}
        <motion.div
          variants={fadeUpStaggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-12 lg:mb-16"
        >
          <motion.p variants={fadeUpChild} className="font-bold tracking-wider uppercase text-sm mb-2" style={{ color: ACCENT_COLOR }}>
            Our Commitment
          </motion.p>
          <motion.h2 variants={fadeUpChild} className="text-3xl md:text-4xl font-extrabold text-[#18234B] mb-4">
            Why Choose Us?
          </motion.h2>
          <motion.div variants={fadeUpChild} className="w-16 h-1 mx-auto rounded-full" style={{ backgroundColor: ACCENT_COLOR }} />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* LEFT: Content & Features List */}
          <motion.div
            variants={fadeUpStaggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Title Block Removed from here */}

            <div className="space-y-8">
              {featureData.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={fadeUpChild}
                    className="flex items-start gap-4"
                  >
                    <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 border border-slate-200 mt-1">
                      <Icon className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#18234B] mb-1">{feature.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* RIGHT: Compact Metrics Grid */}
          <motion.div
            className="grid grid-cols-2 gap-4 sm:gap-6 lg:mt-16"
            variants={fadeUpStaggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.id}
                variants={fadeUpChild}
                className="bg-[#18234B] rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-transparent"
              >
                <div className="text-3xl sm:text-4xl font-extrabold mb-1 text-white">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="text-xs sm:text-sm font-medium text-blue-100 uppercase tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = 'FeaturesSection';

export default FeaturesSection;
