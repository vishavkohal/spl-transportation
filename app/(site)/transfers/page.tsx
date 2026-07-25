import type { Metadata } from 'next';
import RoutesPage from '../../components/RoutesPage';
import JsonLd from '@/app/components/JsonLd';
import { BASE_URL } from '@/app/lib/constants';

export const metadata: Metadata = {
  title: 'All Transfer Routes Cairns | Private Airport Transfers | SPL Transportation',
  description:
    'Browse all private transfer routes from Cairns Airport to Port Douglas, Palm Cove, Kuranda, Northern Beaches, Atherton Tablelands and more. Fixed pricing, no hidden fees.',
  keywords: [
    'all transfer routes Cairns',
    'Cairns airport transfer directory',
    'Port Douglas private transfer',
    'Palm Cove airport transfer',
    'Kuranda transfer routes',
    'fixed price airport transfer Queensland',
  ],
  alternates: {
    canonical: `${BASE_URL}/transfers`,
    languages: {
      'en-AU': `${BASE_URL}/transfers`,
      'x-default': `${BASE_URL}/transfers`,
    },
  },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/transfers`,
    title: 'All Private Transfer Routes | SPL Transportation',
    description: 'Private airport and regional transfers across Tropical North Queensland — browse all routes with fixed pricing.',
    siteName: 'SPL Transportation',
    locale: 'en_AU',
    images: [
      {
        url: `${BASE_URL}/hero-mercedes.webp`,
        width: 1200,
        height: 630,
        alt: 'SPL Transportation Private Transfer Routes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Private Transfer Routes | SPL Transportation',
    description: 'Browse all private airport transfer routes with fixed pricing across Cairns & Port Douglas.',
    images: [`${BASE_URL}/hero-mercedes.webp`],
  },
};

const transfersSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${BASE_URL}/transfers#webpage`,
    url: `${BASE_URL}/transfers`,
    name: 'All Private Transfer Routes | SPL Transportation',
    description:
      'Browse all private airport & regional transfer routes across Cairns, Port Douglas, Palm Cove, Kuranda, Northern Beaches & Tablelands.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'SPL Transportation',
      url: BASE_URL,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Transfers', item: `${BASE_URL}/transfers` },
      ],
    },
  },
];

export default function TransfersPage() {
  return (
    <>
      <JsonLd />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(transfersSchema) }}
      />
      <RoutesPage />
    </>
  );
}

