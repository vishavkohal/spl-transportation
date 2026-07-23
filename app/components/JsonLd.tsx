import React from 'react';

export default function JsonLd() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    name: 'SPL Transportation',
    description: 'Premium private chauffeured transfers, airport pickups, and hourly charters across Sydney and New South Wales.',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://spltransportation.com.au',
    logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://spltransportation.com.au'}/logo_new.png`,
    telephone: '+61 400 000 000',
    priceRange: '$$$',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'New South Wales',
    },
    serviceType: [
      'Airport Transfers',
      'Corporate Chauffeur Service',
      'Private Hourly Charters',
      'Day Trip Charters',
    ],
    provider: {
      '@type': 'LocalBusiness',
      name: 'SPL Transportation',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Sydney',
        addressRegion: 'NSW',
        addressCountry: 'AU',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
