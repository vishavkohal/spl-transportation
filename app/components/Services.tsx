'use client';
import React from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const featuredServices = [
  {
    id: 'airport',
    title: 'Airport Transfers',
    tagline: 'Flight-aware meet & greet',
    description:
      'Door-to-door private transfers with automatic flight tracking, driver arrival meet & greet, and free waiting time.',
    img: '/services3.png',
    badge: 'Popular',
    features: ['Flight Tracking', 'Free Waiting Time', 'Name Sign Meet & Greet'],
  },
  {
    id: 'city',
    title: 'City & Regional Transfers',
    tagline: 'Fixed-price local journeys',
    description:
      'Seamless point-to-point transport between hotels, resorts, and city destinations with transparent upfront pricing.',
    img: '/services2.png',
    badge: 'Fixed Fare',
    features: ['No Surge Rates', 'Direct Door-to-Door', 'Local Drivers'],
  },
  {
    id: 'hourly',
    title: 'Hourly Private Charter',
    tagline: 'Your vehicle & driver on standby',
    description:
      'Flexible hourly hire for multiple stops, shopping, business meetings, or custom excursions with your private driver.',
    img: '/services1.png',
    badge: 'Flexible Hire',
    features: ['Dedicated Driver', 'Unlimited Stops', 'Custom Itinerary'],
  },
  {
    id: 'corporate',
    title: 'Corporate & Executive',
    tagline: 'Chauffeur service for business',
    description:
      'Premium fleet options, priority dispatching, and automated invoices for corporate travelers and executive events.',
    img: '/service4.jpg',
    badge: 'Executive',
    features: ['Corporate Invoicing', 'Priority Support', 'Premium Fleet'],
  },
];

export function Services() {
  const scrollToBooking = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="service" className="w-full bg-slate-50/70 py-16 md:py-24 border-b border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F766E]/10 border border-[#0F766E]/20 text-[#0F766E] text-xs font-bold uppercase tracking-wider mb-3">
              <span>OUR SERVICES</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#102A43] tracking-tight leading-tight">
              Tailored Private Transport Solutions
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-light mt-3">
              Experience seamless chauffeured travel with upfront fixed pricing, flight monitoring, and premium vehicle comfort.
            </p>
          </motion.div>
        </div>

        {/* 4-Card Grid on Desktop, Horizontal Touch Carousel on Mobile */}
        <div className="flex md:grid md:grid-cols-2 gap-6 lg:gap-10 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-6 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {featuredServices.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onClick={scrollToBooking}
              className="snap-center shrink-0 w-[84vw] md:w-auto group cursor-pointer bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:border-teal-500/30 transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1"
            >
              {/* Image Header with Badge Overlay */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-100">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102A43]/70 via-[#102A43]/20 to-transparent" />
                
                {/* Badge Overlay */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full bg-[#102A43]/80 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-md">
                    {item.badge}
                  </span>
                </div>

                {/* Overlaid Title on Image */}
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <h3 className="text-xl font-extrabold tracking-tight group-hover:text-[#2DD4BF] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-teal-200 font-semibold uppercase tracking-wider">
                    {item.tagline}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
                  {item.description}
                </p>

                {/* Feature Check Pills */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {item.features.map((feat, fIdx) => (
                      <span
                        key={fIdx}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg"
                      >
                        <CheckCircle2 className="w-3 h-3 text-[#0F766E]" />
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Clean Text Action Link */}
                  <div className="flex items-center text-xs font-bold text-[#0F766E] group-hover:translate-x-1 transition-transform">
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
