// app/(site)/book/page.tsx — SEO-optimized ad landing page (Server Component)

import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import LandingBookingForm from '../../components/LandingBookingForm';
import CustomerReviews from '../../components/CustomerReviews';
import FaqSection from '../../components/FaqSection';

const BASE_URL = 'https://www.spltransportation.com.au';
const PRIMARY_COLOR = '#18234B';
const ACCENT_COLOR = '#A61924';

/* ─── Metadata (server-rendered for SEO) ─── */

export const metadata: Metadata = {
  title: 'Book Private Airport Transfers in Cairns | From $55 | SPL Transportation',
  description:
    'Book a private airport transfer in Cairns, Port Douglas, Palm Cove & Far North Queensland. Fixed pricing, no hidden fees, professional drivers. Instant confirmation.',
  keywords: [
    'Cairns airport transfer',
    'Port Douglas transfer',
    'Palm Cove airport shuttle',
    'private transfer Cairns',
    'airport taxi Cairns',
    'Cairns to Port Douglas transfer',
    'book airport transfer Queensland',
  ],
  alternates: {
    canonical: `${BASE_URL}/book`,
  },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/book`,
    title: 'Book Private Airport Transfers — SPL Transportation',
    description:
      'Fixed-price private airport transfers across Cairns, Port Douglas & Palm Cove. Book online in under 60 seconds.',
    siteName: 'SPL Transportation',
    images: [{ url: '/logo.png', width: 600, height: 600, alt: 'SPL Transportation' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Private Airport Transfers — SPL Transportation',
    description:
      'Fixed-price transfers across Cairns & Port Douglas. Professional drivers, modern vehicles.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

/* ─── Data ─── */

const WHY_CHOOSE = [
  {
    title: 'Fixed, Transparent Pricing',
    desc: 'Know your fare upfront. No surge pricing, no meter anxiety — just a fixed quote before you book.',
  },
  {
    title: 'Professional Local Drivers',
    desc: 'Fully licensed, insured drivers who know every shortcut and scenic route in Tropical North Queensland.',
  },
  {
    title: 'Flight-Aware Pickups',
    desc: 'We track your flight in real-time. If your flight is delayed, your driver adjusts automatically — no extra charge.',
  },
  {
    title: 'Modern, Air-Conditioned Fleet',
    desc: 'Travel in clean, comfortable vehicles. Sedans, SUVs, and vans available for groups of up to 7 passengers.',
  },
];

/* ─── Page ─── */

export default function BookLandingPage() {
  return (
    <main className="bg-neutral-50">

      {/* ═══════════ HERO + BOOKING FORM (Above the Fold) ═══════════ */}
      <section className="relative overflow-hidden" id="booking">
        {/* Background image — fills entire hero */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-mercedes.webp"
            alt="Premium private transfer vehicle — SPL Transportation"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Gradient overlay — heavier on left for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f24]/90 via-[#0a0f24]/70 to-[#0a0f24]/40 lg:to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* LEFT — Headline + Trust Signals */}
            <div className="lg:col-span-5 xl:col-span-5 text-white pt-4 lg:pt-8">
              <p
                className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase mb-3"
                style={{ color: '#ff8a94' }}
              >
                Private Airport Transfers
              </p>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight">
                Cairns Airport &amp; City Transfers
              </h1>

              <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-md leading-relaxed">
                Fixed pricing, professional drivers, modern vehicles.
                Book in under 60 seconds.
              </p>

              {/* Trust badges */}
              <div className="mt-6 flex flex-wrap gap-2">
                {['Fixed Price', 'No Hidden Fees', 'Flight Tracking', '24/7 Service'].map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1.5 text-xs font-semibold rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white"
                  >
                    ✓ {t}
                  </span>
                ))}
              </div>

              {/* Social proof strip */}
              <div className="mt-8 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: i % 2 === 0 ? '#2a3a6b' : '#3a4a7b' }}
                      >
                        {['SJ', 'MC', 'ED', 'AK'][i - 1]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">4.9 ★</div>
                    <div className="text-[10px] text-gray-400">15,000+ rides</div>
                  </div>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <div className="text-sm font-bold text-white">99%</div>
                  <div className="text-[10px] text-gray-400">On-time rate</div>
                </div>
              </div>

              {/* Phone CTA — desktop only */}
              <a
                href="tel:+61470032460"
                className="hidden lg:inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl text-sm font-bold border border-white/30 text-white hover:bg-white/10 transition-all"
              >
                📞 Call +61 470 032 460
              </a>
            </div>

            {/* RIGHT — Booking Form */}
            <div className="lg:col-span-7 xl:col-span-7">
              <LandingBookingForm />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ WHY CHOOSE US ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-bold tracking-widest uppercase mb-2" style={{ color: ACCENT_COLOR }}>
            Why Choose SPL
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: PRIMARY_COLOR }}>
            Trusted by Thousands of Travellers
          </h2>
          <div className="w-20 h-1.5 mx-auto mt-4 rounded-full" style={{ backgroundColor: ACCENT_COLOR }} />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_CHOOSE.map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${ACCENT_COLOR}15` }}>
                <span className="text-lg font-bold" style={{ color: ACCENT_COLOR }}>✓</span>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: PRIMARY_COLOR }}>{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
          {[
            { value: '15,000+', label: 'Happy Passengers' },
            { value: '99%', label: 'On-Time Rate' },
            { value: '4.9★', label: 'Average Rating' },
            { value: '24/7', label: 'Availability' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5 text-center shadow-lg" style={{ backgroundColor: PRIMARY_COLOR }}>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{s.value}</div>
              <div className="text-xs sm:text-sm font-medium text-blue-100 uppercase tracking-wide mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ POPULAR ROUTES ═══════════ */}
      <section className="bg-neutral-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-bold tracking-widest uppercase mb-2" style={{ color: ACCENT_COLOR }}>
              Popular Routes
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: PRIMARY_COLOR }}>
              Where We Operate
            </h2>
            <div className="w-20 h-1.5 mx-auto mt-4 rounded-full" style={{ backgroundColor: ACCENT_COLOR }} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Cairns Airport → Cairns City', slug: 'cairns-airport-to-cairns-city', price: '$55', img: '/routes/cairns-airport-to-cairns-city.jpg' },
              { name: 'Cairns Airport → Port Douglas', slug: 'cairns-airport-to-port-douglas', price: '$249', img: '/routes/cairns-airport-to-port-douglas.jpg' },
              { name: 'Cairns Airport → Palm Cove', slug: 'cairns-airport-to-palm-cove', price: '$99', img: '/routes/cairns-airport-to-palm-cove.jpg' },
              { name: 'Palm Cove → Cairns Airport', slug: 'palm-cove-to-cairns-airport', price: '$99', img: '/routes/palm-cove-to-cairns-airport.jpg' },
              { name: 'Cairns City → Kuranda', slug: 'cairns-city-to-kuranda', price: '$79', img: '/routes/cairns-city-to-kuranda.jpg' },
              { name: 'Cairns City → Tablelands', slug: 'cairns-city-to-tablelands', price: '$149', img: '/routes/cairns-city-to-tablelands.jpg' },
            ].map((route) => (
              <Link
                key={route.slug}
                href={`/transfers/${route.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={route.img}
                    alt={route.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md">
                    <span className="text-xs font-bold" style={{ color: PRIMARY_COLOR }}>From {route.price}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-base group-hover:text-[#A61924] transition-colors" style={{ color: PRIMARY_COLOR }}>
                    {route.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ REVIEWS ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <CustomerReviews />
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <FaqSection />
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-16" style={{ backgroundColor: PRIMARY_COLOR }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Book Your Transfer?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Fixed prices, instant confirmation, and professional drivers.
            Book in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#booking"
              className="inline-flex items-center justify-center rounded-full px-8 py-4 text-lg font-semibold shadow-lg hover:opacity-90 transition text-white"
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              Book Now →
            </a>
            <a
              href="tel:+61470032460"
              className="inline-flex items-center justify-center rounded-full px-8 py-4 text-lg font-semibold border-2 border-white/40 text-white hover:bg-white/10 transition"
            >
              Call +61 470 032 460
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════ MOBILE STICKY CTA ═══════════ */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl" />
        <div className="relative p-4">
          <a
            href="#booking"
            className="block w-full rounded-full py-4 text-center text-lg font-semibold text-white shadow"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            Book Transfer Now
          </a>
        </div>
      </div>

      {/* ═══════════ SCHEMA.ORG JSON-LD ═══════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'LocalBusiness',
                '@id': `${BASE_URL}/#organization`,
                name: 'SPL Transportation',
                description:
                  'Professional private transfers across Queensland. Elevating your journey with safety, punctuality, and premium comfort.',
                url: BASE_URL,
                telephone: '+61470032460',
                email: 'spltransportation.australia@gmail.com',
                logo: `${BASE_URL}/logo.png`,
                image: `${BASE_URL}/logo.png`,
                priceRange: '$$',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Cairns',
                  addressRegion: 'Queensland',
                  addressCountry: 'AU',
                },
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: '-16.9186',
                  longitude: '145.7781',
                },
                areaServed: [
                  { '@type': 'City', name: 'Cairns' },
                  { '@type': 'City', name: 'Port Douglas' },
                  { '@type': 'City', name: 'Palm Cove' },
                  { '@type': 'State', name: 'Queensland' },
                ],
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.9',
                  reviewCount: '324',
                  bestRating: '5',
                  worstRating: '1',
                },
              },
              {
                '@type': 'Service',
                '@id': `${BASE_URL}/book#service`,
                serviceType: 'Airport Transfer Service',
                name: 'Cairns Airport & City Transfers',
                description:
                  'Premium private airport transfers across Cairns, Port Douglas, Palm Cove and Far North Queensland with fixed pricing.',
                provider: { '@id': `${BASE_URL}/#organization` },
                areaServed: [
                  { '@type': 'City', name: 'Cairns' },
                  { '@type': 'City', name: 'Port Douglas' },
                  { '@type': 'City', name: 'Palm Cove' },
                ],
                offers: {
                  '@type': 'AggregateOffer',
                  lowPrice: '55',
                  highPrice: '499',
                  priceCurrency: 'AUD',
                  offerCount: '12',
                  availability: 'https://schema.org/InStock',
                  url: `${BASE_URL}/book`,
                },
              },
              {
                '@type': 'WebPage',
                '@id': `${BASE_URL}/book#webpage`,
                url: `${BASE_URL}/book`,
                name: 'Book Private Airport Transfers in Cairns | SPL Transportation',
                description:
                  'Book a private airport transfer in Cairns, Port Douglas, Palm Cove & Far North Queensland. Fixed pricing, instant confirmation.',
                inLanguage: 'en-AU',
                isPartOf: { '@id': `${BASE_URL}/#website` },
                breadcrumb: { '@id': `${BASE_URL}/book#breadcrumb` },
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${BASE_URL}/book#breadcrumb`,
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
                  { '@type': 'ListItem', position: 2, name: 'Book Transfer', item: `${BASE_URL}/book` },
                ],
              },
            ],
          }),
        }}
      />
    </main>
  );
}
