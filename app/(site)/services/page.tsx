// app/(site)/services/page.tsx — Services & Rate List Page (Server Component)

import React from 'react';
import type { Metadata } from 'next';
import { getRoutes } from '@/app/lib/routesStore';
import ServicesPageClient from './ServicesPageClient';

const BASE_URL = 'https://www.spltransportation.com.au';
export const revalidate = 3600; // Revalidate ISR cache hourly or on tag revalidation

export const metadata: Metadata = {
  title: 'Services & Rates | Private Airport Transfers & Chauffeur Hire | SPL Transportation',
  description:
    'Complete rate list and service guide for private airport transfers, hourly chauffeur hire, and 8-hour day trip charters across Cairns, Port Douglas & Palm Cove. Transparent fixed pricing, no hidden fees.',
  keywords: [
    'Cairns transfer rates',
    'Port Douglas airport transfer price',
    'Palm Cove transfer costs',
    'hourly chauffeur hire Cairns',
    'day trip charter prices Queensland',
    'SPL Transportation pricing list',
    'private driver rates Cairns',
  ],
  alternates: {
    canonical: `${BASE_URL}/services`,
  },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/services`,
    title: 'Services & Rates — SPL Transportation',
    description:
      'Transparent rate list for private transfers, hourly hire, and day trip charters across Tropical North Queensland.',
    siteName: 'SPL Transportation',
    images: [{ url: '/hero-mercedes.webp', width: 1200, height: 630, alt: 'SPL Transportation Rates & Services' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Services & Rates — SPL Transportation',
    description:
      'Fixed pricing and complete rate breakdown for airport transfers, hourly hire, and day tours in Cairns & Port Douglas.',
    images: ['/hero-mercedes.webp'],
  },
};

export default async function ServicesPage() {
  const routes = await getRoutes();

  // Schema.org JSON-LD for Services & Rates page
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `${BASE_URL}/#organization`,
        name: 'SPL Transportation',
        description:
          'Professional private transfers and chauffeur services across Tropical North Queensland.',
        url: BASE_URL,
        telephone: '+61470032460',
        email: 'spltransportation.australia@gmail.com',
        logo: `${BASE_URL}/logo.png`,
        image: `${BASE_URL}/hero-mercedes.webp`,
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Cairns',
          addressRegion: 'Queensland',
          addressCountry: 'AU',
        },
      },
      {
        '@type': 'Service',
        '@id': `${BASE_URL}/services#service`,
        serviceType: 'Chauffeur and Transfer Services',
        name: 'Private Airport Transfers & Chauffeur Services',
        description:
          'Fixed-price private airport transfers, hourly chauffeur hire, and day trip charters across Cairns, Port Douglas, Palm Cove, and Far North Queensland.',
        provider: { '@id': `${BASE_URL}/#organization` },
        areaServed: [
          { '@type': 'City', name: 'Cairns' },
          { '@type': 'City', name: 'Port Douglas' },
          { '@type': 'City', name: 'Palm Cove' },
          { '@type': 'State', name: 'Queensland' },
        ],
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: '55',
          highPrice: '1050',
          priceCurrency: 'AUD',
          offerCount: routes.length.toString(),
          availability: 'https://schema.org/InStock',
          url: `${BASE_URL}/services`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${BASE_URL}/services#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Services & Rates', item: `${BASE_URL}/services` },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${BASE_URL}/services#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Are prices quoted per person or per vehicle?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'All prices are 100% fixed per vehicle, not per passenger. Your fare remains identical whether 1 person or a full group travels in the vehicle.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is included in the Hourly Chauffeur Hire rates?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Hourly Hire includes a dedicated private driver, fuel, unlimited stops within your duration, and waiting time. Minimum booking duration is 2 hours.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does the 8-Hour Day Trip Charter work?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Day Trip charters provide 8 consecutive hours of private vehicle and chauffeur service for exploring destinations like Daintree, Kuranda, Port Douglas, and Atherton Tablelands at your own pace.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is there an after-hours surcharge?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A flat $30 after-hours surcharge applies to pickups scheduled between 9:00 PM and 5:00 AM.',
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServicesPageClient initialRoutes={routes} />
    </>
  );
}
