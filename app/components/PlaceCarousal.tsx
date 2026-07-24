'use client';
import React from 'react';
import { BusFront, Plane, Car } from 'lucide-react';
import styles from './PlaceCarousel.module.css';
import { useBooking } from '../providers/BookingProvider';

const DESTINATIONS = [
  { name: 'Cairns Airport', icon: <Plane className="w-5 h-5 mr-2 text-[#0F766E]" /> },
  { name: 'Port Douglas', icon: <Car className="w-5 h-5 mr-2 text-[#0F766E]" /> },
  { name: 'Cairns City', icon: <BusFront className="w-5 h-5 mr-2 text-[#0F766E]" /> },
  { name: 'Palm Cove', icon: <Car className="w-5 h-5 mr-2 text-[#0F766E]" /> },
  { name: 'Mission Beach', icon: <BusFront className="w-5 h-5 mr-2 text-[#0F766E]" /> },
  { name: 'Kuranda', icon: <Car className="w-5 h-5 mr-2 text-[#0F766E]" /> },
  { name: 'Sky Rail', icon: <BusFront className="w-5 h-5 mr-2 text-[#0F766E]" /> },
  { name: 'Daintrees', icon: <Car className="w-5 h-5 mr-2 text-[#0F766E]" /> },
  { name: 'Cape Tribulation', icon: <BusFront className="w-5 h-5 mr-2 text-[#0F766E]" /> },
];

const CAROUSEL_ITEMS = [...DESTINATIONS, ...DESTINATIONS];

export default function PlaceCarousel() {
  let handleInputChange: any = null;
  try {
    const booking = useBooking();
    handleInputChange = booking.handleInputChange;
  } catch {
    // optional fallback if rendered outside provider
  }

  const handlePillClick = (destinationName: string) => {
    if (handleInputChange) {
      if (destinationName === 'Cairns Airport') {
        handleInputChange('pickupLocation', 'Cairns Airport');
        handleInputChange('dropoffLocation', 'Port Douglas');
      } else {
        handleInputChange('pickupLocation', 'Cairns Airport');
        handleInputChange('dropoffLocation', destinationName);
      }
    }
    const formElement = document.getElementById('booking-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full bg-slate-50 py-4 border-y border-slate-200/70 overflow-hidden relative">
      {/* FADE OVERLAYS */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

      {/* INFINITE SCROLL TRACK */}
      <div className={`flex flex-nowrap items-center ${styles.infiniteScroll}`}>
        {CAROUSEL_ITEMS.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 mx-3 md:mx-4"
          >
            {/* ITEM CARD BUTTON */}
            <button
              type="button"
              onClick={() => handlePillClick(item.name)}
              className="flex items-center bg-white border border-slate-200/80 hover:border-[#0F766E] rounded-full py-1.5 px-4 shadow-xs hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer active:scale-95 group"
            >
              {item.icon}
              <span className="text-xs md:text-sm font-semibold whitespace-nowrap text-slate-700 group-hover:text-[#0F766E] transition-colors">
                {item.name}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}