'use client';
import React from 'react';
import { Car, MapPin, Plane, Users, Briefcase, Clock, ArrowRight } from 'lucide-react';
import Image from 'next/image';

// Define the custom colors for readability
const PRIMARY_COLOR = '#18234B'; // Dark Navy
const ACCENT_COLOR = '#A61924'; // Deep Red

const services = [
  {
    title: 'Online Booking',
    description:
      'Book your ride easily through our platform with real-time availability and instant confirmation.',
    img: '/services1.png',
    icon: Car,
  },
  {
    title: 'City Transport',
    description:
      'Comfortable rides within the city for your daily commute and shopping trips.',
    img: '/services2.png',
    icon: MapPin,
  },
  {
    title: 'Airport Transport',
    description:
      'Reliable airport transfers with flight tracking and meet & greet services.',
    img: '/services3.png',
    icon: Plane,
  },
  {
    title: 'Business Transport',
    description:
      'Professional rides for meetings and corporate travel with top-tier vehicles.',
    img: '/service4.jpg',
    icon: Briefcase,
  },
  {
    title: 'Regular Transport',
    description:
      'Daily taxi services for errands, appointments, and regular commutes.',
    img: '/services5.png',
    icon: Users,
  },
  {
    title: 'Tour Transport',
    description:
      'Guided and private tour transport for a comfortable sightseeing experience.',
    img: '/servicess6.png',
    icon: Clock,
  },
];

export function Services() {
  return (
    // Background remains white (bg-white), removed dark background class
    <section id="service" className="py-20 bg-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p 
            className="font-bold tracking-wider uppercase text-sm mb-2"
            style={{ color: ACCENT_COLOR }} // Accent Color for "Our Services"
          >
            Our Services
          </p>
          <h2 
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ color: PRIMARY_COLOR }} // Primary Color for main heading
          >
            Best Services For You
          </h2>
          {/* Accent-colored divider */}
          <div 
            className="w-24 h-1.5 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
          />
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <article
              key={index}
              // Removed dark theme classes, subtle light background
              className={`group bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col`}
              // Added subtle shadow hover using Accent Color
              style={{ '--shadow-color': `${ACCENT_COLOR}30` } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 10px 15px -3px var(--shadow-color), 0 4px 6px -4px var(--shadow-color)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Image Container */}
              <div className="relative mb-8">
                <div className="overflow-hidden rounded-xl shadow-md aspect-video relative">
                  <Image
                    src={service.img}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Floating Icon */}
                <div 
                  className="absolute -bottom-6 right-6 text-white p-4 rounded-full shadow-lg transition-colors z-10"
                  style={{ backgroundColor: ACCENT_COLOR }} // Accent Color for icon background
                >
                  <service.icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2} />
                </div>
              </div>

              {/* Content */}
              <div className="mt-2 flex-grow">
                <h3 
                  className="text-2xl font-bold text-gray-900 mb-3"
                  style={{ color: PRIMARY_COLOR }} // Primary Color for service title
                >
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>
              </div>

              {/* Button */}
              <button 
                className="w-full sm:w-auto self-start inline-flex items-center justify-center gap-2 bg-transparent border-2 border-gray-200 text-gray-900 px-6 py-3 rounded-full font-semibold transition-all duration-300 group/btn"
                // Accent Color for hover background and border
                style={{ 
                  '--accent-color': ACCENT_COLOR 
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.backgroundColor = ACCENT_COLOR;
                  target.style.borderColor = ACCENT_COLOR;
                  target.style.color = 'white';
                  target.querySelectorAll('svg').forEach(svg => svg.style.color = 'white');
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.backgroundColor = 'transparent';
                  target.style.borderColor = '#E5E7EB'; // gray-200 equivalent
                  target.style.color = PRIMARY_COLOR; // Primary color on hover out
                  target.querySelectorAll('svg').forEach(svg => svg.style.color = PRIMARY_COLOR);
                }}
              >
                Read More
                <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}