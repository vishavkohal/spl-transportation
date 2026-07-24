import React from 'react';
import {
  BASE_URL,
  BUSINESS_PHONE,
  BUSINESS_EMAIL,
  SITE_NAME,
  SERVICED_AREAS,
  BUSINESS_ADDRESS
} from '../lib/constants';

export default function JsonLd() {
  const schemaData = [
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/#organization`,
      name: SITE_NAME,
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      image: `${BASE_URL}/hero-mercedes.webp`,
      description:
        'Professional private airport transfers and chauffeur services across Cairns, Port Douglas, Palm Cove and Tropical North Queensland.',
      telephone: BUSINESS_PHONE,
      email: BUSINESS_EMAIL,
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        addressLocality: BUSINESS_ADDRESS.addressLocality,
        addressRegion: BUSINESS_ADDRESS.addressRegion,
        postalCode: BUSINESS_ADDRESS.postalCode,
        addressCountry: BUSINESS_ADDRESS.addressCountry,
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '-16.9186',
        longitude: '145.7781',
      },
      areaServed: SERVICED_AREAS.map((area) => ({
        '@type': 'City',
        name: area,
      })),
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
      '@type': 'TaxiService',
      '@id': `${BASE_URL}/#taxiservice`,
      name: `${SITE_NAME} - Private Airport Transfers`,
      description:
        'Door-to-door private transfers from Cairns Airport to Port Douglas, Palm Cove, Kuranda and Tropical North Queensland.',
      url: BASE_URL,
      provider: {
        '@id': `${BASE_URL}/#organization`,
      },
      areaServed: SERVICED_AREAS,
      serviceType: [
        'Private Airport Transfers',
        'Cairns Airport Shuttle',
        'Port Douglas Transfers',
        'Palm Cove Transfers',
        'Hotel & Resort Chauffeur',
      ],
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'AUD',
        lowPrice: '55',
        highPrice: '350',
        offerCount: '15',
        availability: 'https://schema.org/InStock',
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}

