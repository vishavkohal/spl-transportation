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
  Check
} from 'lucide-react';
import Image from 'next/image';

const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';
const CARD_TEXT_LIGHT = '#0f172a';
const MUTED = '#475569';

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
    <section id="service" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-semibold tracking-wider uppercase text-sm" style={{ color: ACCENT_COLOR }}>
            Our Services
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-3" style={{ color: PRIMARY_COLOR }}>
            Services that make travel effortless
          </h2>
          <div
            className="w-24 h-1.5 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
          />
          <p className="mt-4 text-sm text-gray-600 max-w-2xl mx-auto">
            Choose the service that suits your journey — from quick airport transfers to customised private tours. Transparent pricing, reliable drivers and 24/7 support.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {services.map((s, idx) => {
            const Icon = s.icon;
            return (
              <article
                key={idx}
                className="group relative rounded-2xl overflow-hidden bg-white/90 border border-gray-100 shadow-sm hover:shadow-2xl transform transition-all duration-300"
                aria-labelledby={`service-${idx}-title`}
              >
                <div className="flex flex-col h-full">
                  {/* top: media */}
                  <div className="relative h-36 sm:h-44 md:h-40 lg:h-44 overflow-hidden">
                    <Image
                      src={s.img}
                      alt={s.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Accent icon circle */}
                    <div className="absolute -bottom-6 right-6 bg-white rounded-full p-2 shadow-md">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full" style={{ backgroundColor: ACCENT_COLOR }}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 id={`service-${idx}-title`} className="text-lg font-semibold" style={{ color: PRIMARY_COLOR }}>
                      {s.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1 mb-3">{s.tagline}</p>

                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{s.description}</p>

                    {/* quick highlights */}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {s.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="mt-0.5 text-green-600"><Check className="w-4 h-4" /></span>
                          <span className="truncate">{h}</span>
                        </li>
                      ))}
                    </ul>

                    {/* trust badges small row */}
                    {s.trust && (
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {s.trust.map((t, i) => (
                          <span
                            key={i}
                            className="text-xs inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700"
                            title={t}
                          >
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA area - stacked for clarity */}
                    <div className="mt-auto pt-2">
                      <div className="flex flex-col sm:flex-row items-stretch gap-3">
                        <a
                          href="/"
                          aria-label={`Book ${s.title}`}
                          className="inline-flex items-center justify-center gap-2 bg-[color:var(--accent)]"
                          style={{
                            backgroundColor: PRIMARY_COLOR,
                            color: 'white',
                            padding: '0.65rem 1rem',
                            borderRadius: '0.75rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            flex: '1'
                          }}
                        >
                          Book now
                          <ArrowRight className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            // keep small client-side handler for "learn more"
                            const el = document.getElementById(`service-${idx}-more`);
                            el?.classList.toggle('hidden');
                          }}
                          className="inline-flex items-center justify-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 bg-white"
                        >
                          Learn more
                        </button>
                      </div>

                      {/* expandable details (hidden by default) */}
                      <div id={`service-${idx}-more`} className="hidden mt-3 text-sm text-gray-600">
                        <strong>What to expect:</strong> {s.highlights.join(', ')}. If you'd like personalised help, call us at <a href="tel:+61470032460" className="underline">+61 470 032 460</a>.
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
