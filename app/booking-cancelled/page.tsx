'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft } from 'lucide-react';

const PRIMARY_COLOR = '#18234B';

export default function BookingCancelledPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/');
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
        </div>
        <h1 className="text-xl md:text-2xl font-bold mb-2" style={{ color: PRIMARY_COLOR }}>
          Payment cancelled
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Your booking has not been confirmed. You can try again or contact us if you need help.
        </p>

        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to booking
        </button>

        <p className="mt-3 text-[11px] text-gray-400">
          Redirecting to homepage in {countdown}s…
        </p>
      </div>
    </div>
  );
}
