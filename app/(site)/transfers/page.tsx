import type { Metadata } from 'next';
import RoutesPage from '../../components/RoutesPage';
import JsonLd from '@/app/components/JsonLd';

export const metadata: Metadata = {
  title: 'All Transfer Routes Cairns | Private Airport Transfers | SPL Transportation',
  description:
    'Browse all private transfer routes from Cairns Airport to Port Douglas, Palm Cove, Kuranda, Northern Beaches, Atherton Tablelands and more. Fixed pricing, no hidden fees.',
  alternates: {
    canonical: 'https://www.spltransportation.com.au/transfers',
  },
  openGraph: {
    title: 'All Transfer Routes | SPL Transportation',
    description: 'Private transfers across Tropical North Queensland — browse all routes with fixed pricing.',
    url: 'https://www.spltransportation.com.au/transfers',
  },
};

export default function TransfersPage() {
  return (
    <>
      <JsonLd />
      <RoutesPage />
    </>
  );
}
