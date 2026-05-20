import type { Metadata } from 'next';
import Terms from '../../components/TermsPage';

export const metadata: Metadata = {
  title: 'Terms & Conditions | SPL Transportation',
  description:
    'Read the terms and conditions for SPL Transportation private transfer services. Covers rates, payment, cancellation policy, luggage allowance, and conduct guidelines.',
  alternates: {
    canonical: 'https://www.spltransportation.com.au/terms',
  },
};

export default function TermsPage() {
  return <Terms />;
}
