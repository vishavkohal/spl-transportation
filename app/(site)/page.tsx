import type { Metadata } from 'next';
import Script from 'next/script';
import HomePageClient from './HomePageClient';

const BASE_URL = 'https://www.spltransportation.com.au';

export const metadata: Metadata = {
  title: 'Private Airport Transfers Cairns | From $55 | SPL Transportation',
  description:
    'Book private airport transfers in Cairns from $55. Professional drivers, fixed pricing, meet & greet at Cairns Airport. Transfers to Port Douglas, Palm Cove, Kuranda & Tropical North Queensland.',
  keywords: [
    'Cairns airport transfer',
    'private transfer Cairns',
    'Cairns to Port Douglas transfer',
    'Cairns airport shuttle',
    'Palm Cove transfer',
    'Cairns airport taxi',
    'Port Douglas shuttle',
    'Cairns private car',
    'airport transfer Cairns Queensland',
    'SPL Transportation',
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    title: 'Private Airport Transfers Cairns | From $55 | SPL Transportation',
    description:
      'Professional private transfers from Cairns Airport to Port Douglas, Palm Cove, Kuranda & all Tropical North Queensland destinations. Fixed pricing, no surge, door-to-door.',
    siteName: 'SPL Transportation',
    locale: 'en_AU',
    images: [
      {
        url: `${BASE_URL}/hero-mercedes.webp`,
        width: 1200,
        height: 630,
        alt: 'SPL Transportation private transfer vehicle at Cairns Airport',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Private Airport Transfers Cairns | SPL Transportation',
    description:
      'Book private Cairns airport transfers from $55. Meet & greet, professional drivers, fixed pricing.',
    images: [`${BASE_URL}/hero-mercedes.webp`],
  },
};

// Structured data for the homepage
const homepageJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SPL Transportation',
    url: BASE_URL,
    description:
      'Professional private airport and regional transfers in Cairns and Tropical North Queensland.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/transfers/{search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'TransportService',
    name: 'SPL Transportation - Cairns Airport Transfers',
    url: BASE_URL,
    description:
      'Private airport transfer service from Cairns Airport to Port Douglas, Palm Cove, Kuranda, Cairns City and all Tropical North Queensland destinations.',
    provider: {
      '@type': 'Organization',
      name: 'SPL Transportation',
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      telephone: '+61470032460',
      email: 'spltransportation.australia@gmail.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Cairns',
        addressRegion: 'QLD',
        addressCountry: 'AU',
      },
    },
    areaServed: [
      { '@type': 'City', name: 'Cairns' },
      { '@type': 'City', name: 'Port Douglas' },
      { '@type': 'City', name: 'Palm Cove' },
      { '@type': 'City', name: 'Kuranda' },
      { '@type': 'Place', name: 'Atherton Tablelands' },
      { '@type': 'Place', name: 'Cairns Airport' },
      { '@type': 'Place', name: 'Northern Beaches' },
    ],
    serviceType: 'Private Airport Transfer',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'AUD',
      lowPrice: '55',
      offerCount: '15',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '250',
      bestRating: '5',
      worstRating: '1',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How much does a private transfer from Cairns Airport cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Private transfers from Cairns Airport start from $55 AUD for a sedan to Cairns City. Prices vary by destination and vehicle type, with fixed pricing and no surge charges.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I get from Cairns Airport to Port Douglas?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SPL Transportation offers private door-to-door transfers from Cairns Airport to Port Douglas. The journey takes approximately 1 hour in a comfortable, air-conditioned vehicle with a professional driver.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer meet and greet at Cairns Airport?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, all airport transfers include a complimentary meet and greet service. Your driver will be waiting for you at arrivals with a name sign, and will assist with your luggage.',
        },
      },
      {
        '@type': 'Question',
        name: 'What areas do you service from Cairns Airport?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We service all major destinations in Tropical North Queensland including Cairns City, Port Douglas, Palm Cove, Northern Beaches, Kuranda, Mission Beach, Atherton Tablelands, and more.',
        },
      },
    ],
  },
];

export default function Home() {
  return (
    <>
      <Script
        id="homepage-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageJsonLd),
        }}
      />
      <HomePageClient />
    </>
  );
}
