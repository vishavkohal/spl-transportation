import type { Metadata } from 'next';
import AboutPage from '../../components/AboutPage';
import { BASE_URL } from '@/app/lib/constants';

export const metadata: Metadata = {
  title: 'About SPL Transportation | Trusted Cairns Airport Transfers Since 2004',
  description:
    'Learn about SPL Transportation — 20+ years of professional private airport transfers in Cairns, Port Douglas, Palm Cove and Tropical North Queensland. Licensed drivers, modern fleet, fixed pricing.',
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  openGraph: {
    title: 'About SPL Transportation | Cairns Airport Transfers',
    description: '20+ years of trusted private transfers across Tropical North Queensland.',
    url: `${BASE_URL}/about`,
  },
};

export default function About() {
  return <AboutPage />;
}
