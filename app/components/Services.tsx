'use client';
import React from 'react';
import {
  Car,
  MapPin,
  Plane,
  Users,
  Briefcase,
  Clock,
  ArrowRight,
  // Check - removed for minimal design
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import Image from 'next/image';

const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';
const CARD_TEXT_LIGHT = '#0f172a';
const MUTED = '#475569';

// Minimal Motion Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 40,
      damping: 20
    }
  }
};

type ServiceItem = {
  title: string;
  tagline: string;
  description: string;
  img: string;
  icon: React.ComponentType<any>;
  highlights: string[]; // quick bullets
  trust?: string[]; // trust badges/mini-features
};

const services: ServiceItem[] = [
  {
    title: 'Online Booking',
    tagline: 'Fast, secure and instant confirmation',
    description:
      'Search live availability, compare vehicle options and confirm your ride in under a minute. Transparent pricing and instant receipts.',
    img: '/services1.png',
    icon: Car,
    highlights: [
      'Instant confirmation',
      'Transparent pricing',
      'Secure payments'
    ],
    trust: ['24/7 support', 'Free cancellation', 'Instant e-receipt']
  },
  {
    title: 'City Transport',
    tagline: 'Comfortable & punctual local rides',
    description:
      'Door-to-door city travel in modern vehicles. Ideal for airport transfers, shopping trips, and appointments.',
    img: '/services2.png',
    icon: MapPin,
    highlights: ['Fixed fares', 'Clean vehicles', 'Professional drivers'],
    trust: ['On-time guarantee', 'GPS tracking']
  },
  {
    title: 'Airport Transport',
    tagline: 'Flight-aware meet & greet',
    description:
      'We track your flight and meet you at arrivals — no waiting, no guessing. Choose meet & greet or curbside pickup.',
    img: '/services3.png',
    icon: Plane,
    highlights: ['Flight tracking', 'Meet & greet', 'Luggage friendly'],
    trust: ['Flight monitoring', 'Driver contact details']
  },
  {
    title: 'Business Transport',
    tagline: 'Executive vehicles for corporate travel',
    description:
      'Professional drivers, invoices & priority service for business travellers and meetings. Book one-off or recurring transfers.',
    img: '/service4.jpg',
    icon: Briefcase,
    highlights: ['Corporate invoicing', 'Premium vehicles', 'Priority support'],
    trust: ['Account management', 'Flexible billing']
  },
  {
    title: 'Regular Transport',
    tagline: 'Reliable rides for everyday needs',
    description:
      'On-demand rides for errands, appointments and commuting — simple booking, reliable drivers and consistent pricing.',
    img: '/services5.png',
    icon: Users,
    highlights: ['Repeat bookings', 'Driver ratings', 'Comfort options'],
    trust: ['Driver ratings', 'Track your ride']
  },
  {
    title: 'Tours & Sightseeing',
    tagline: 'Private, customised sightseeing',
    description:
      'Tailored multi-stop tours with comfortable vehicles and local drivers who know the best spots — you set the pace.',
    img: '/servicess6.png',
    icon: Clock,
    highlights: ['Custom itineraries', 'Flexible timings', 'Local tips'],
    trust: ['Private vehicle', 'Guided options']
  }
];

export function Services() {
  return (
    <section id="service" className="py-6 md:py-12 bg-[#F8F9FA] mx-3 md:mx-6 mb-6 md:mb-12 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h2
              className="text-base font-semibold tracking-wide uppercase mb-2"
              style={{ color: ACCENT_COLOR }}
            >
              Our Services
            </h2>
            <p
              className="text-3xl md:text-4xl font-extrabold tracking-tight"
              style={{ color: PRIMARY_COLOR }}
            >
              Premium Transport Solutions
            </p>
            <div
              className="w-20 h-1.5 mx-auto mt-4 rounded-full"
              style={{ backgroundColor: ACCENT_COLOR }}
            />
          </motion.div>
        </div>

        {/* Services Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {services.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.article
                key={idx}
                variants={itemVariants}
                className="group relative flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
              >
                {/* Media - Full width top */}
                <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
                  <Image
                    src={s.img}
                    alt={s.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Floating Icon */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-sm z-10 border border-white/50">
                    <Icon className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                  </div>
                </div>

                {/* Content - With padding */}
                <div className="flex-1 flex flex-col p-6">
                  {/* Title & Tagline */}
                  <div className="mb-4">
                    <h3
                      className="text-xl font-bold mb-1 tracking-tight"
                      style={{ color: PRIMARY_COLOR }}
                    >
                      {s.title}
                    </h3>
                    <p className="text-xs font-bold tracking-wide uppercase opacity-80" style={{ color: ACCENT_COLOR }}>
                      {s.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {s.description}
                  </p>

                  {/* Minimal List */}
                  <ul className="space-y-2 mb-8">
                    {s.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-xs font-medium text-slate-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#A61924] transition-colors" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Single Clean Link CTA */}
                  <div className="mt-auto pt-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="
                        w-full py-3 rounded-xl
                        font-bold text-sm text-white
                        shadow-md hover:shadow-lg
                        transform hover:-translate-y-0.5
                        transition-all duration-200
                        flex items-center justify-center gap-2
                      "
                      style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                      Book Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
