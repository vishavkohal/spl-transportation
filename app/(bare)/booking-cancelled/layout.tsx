import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Booking Cancelled | SPL Transportation',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BookingCancelledLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}

