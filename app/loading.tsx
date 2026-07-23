import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#102A43] border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-semibold text-[#102A43] tracking-widest uppercase animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
