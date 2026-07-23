'use client';
import React from 'react';
import { BusFront, Plane, Car } from 'lucide-react';
// 1. Import the CSS Module
import styles from './PlaceCarousel.module.css';

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
  return (
    <div className="w-full bg-slate-50 py-4 border-y border-slate-200/70 overflow-hidden relative">
      {/* FADE OVERLAYS */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

      {/* 2. Apply the imported class from the CSS module */}
      <div className={`flex flex-nowrap items-center ${styles.infiniteScroll}`}>
        {CAROUSEL_ITEMS.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 mx-4 md:mx-6"
          >
            {/* ITEM CARD */}
            <div className="flex items-center bg-white border border-slate-200/80 rounded-full py-1.5 px-4 shadow-xs transition-all duration-200 hover:border-[#0F766E]/40 hover:shadow-sm cursor-default">
              {item.icon}
              <span className="text-xs md:text-sm font-semibold whitespace-nowrap text-slate-700">
                {item.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}