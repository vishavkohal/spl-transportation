import React from 'react';

export default function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['LimoService', 'TaxiService', 'LocalBusiness'],
    name: 'SPL Transportation',
    image: 'https://spltransportation.com.au/logo_new.png',
    '@id': 'https://spltransportation.com.au/#organization',
    url: 'https://spltransportation.com.au',
    telephone: '+61470032460',
    email: 'spltransportation.australia@gmail.com',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Cairns Region',
      addressLocality: 'Cairns',
      addressRegion: 'QLD',
      postalCode: '4870',
      addressCountry: 'AU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -16.9186,
      longitude: 145.7781,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Cairns',
      },
      {
        '@type': 'City',
        name: 'Port Douglas',
      },
      {
        '@type': 'City',
        name: 'Palm Cove',
      },
      {
        '@type': 'City',
        name: 'Mission Beach',
      },
      {
        '@type': 'City',
        name: 'Cape Tribulation',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '2500',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
