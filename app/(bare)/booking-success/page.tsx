import { Suspense } from 'react';
import BookingSuccessClient from './BookingSuccessClient';

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-600 text-sm">Loading booking…</p>
        </div>
      }
    >
      <BookingSuccessClient />
       {/* Conversion Tracking – fires on success page load */}
      <iframe
        src="https://adflagshipmedia10715581.o18a.com/p?m=27840&t=f&gb=1"
        width="0"
        height="0"
        style={{ display: 'none', border: 0 }}
      />
    </Suspense>
  );
}
