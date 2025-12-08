'use client';
import React from 'react';
import { BusFront, Plane, Car } from 'lucide-react';
// 1. Import the CSS Module
import styles from './PlaceCarousel.module.css'; 

const DESTINATIONS = [
  { name: 'Cairns Airport', icon: <Plane className="w-5 h-5 mr-2 text-red-600" /> },
  { name: 'Port Douglas', icon: <Car className="w-5 h-5 mr-2 text-red-600" /> },
  { name: 'Cairns City', icon: <BusFront className="w-5 h-5 mr-2 text-red-600" /> },
  { name: 'Palm Cove', icon: <Car className="w-5 h-5 mr-2 text-red-600" /> },
  { name: 'Mission Beach', icon: <BusFront className="w-5 h-5 mr-2 text-red-600" /> },
  { name: 'Kuranda', icon: <Car className="w-5 h-5 mr-2 text-red-600" /> },
  { name: 'Sky Rail', icon: <BusFront className="w-5 h-5 mr-2 text-red-600" /> },
  { name: 'Daintrees', icon: <Car className="w-5 h-5 mr-2 text-red-600" /> },
  { name: 'Cape Tribulation', icon: <BusFront className="w-5 h-5 mr-2 text-red-600" /> },
];

const CAROUSEL_ITEMS = [...DESTINATIONS, ...DESTINATIONS];

export default function PlaceCarousel() {
  return (
    <div className="bg-white py-4 border-y border-gray-100 overflow-hidden relative shadow-inner">
      {/* FADE OVERLAYS */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* 2. Apply the imported class from the CSS module */}
      <div className={`flex flex-nowrap ${styles.infiniteScroll}`}>
        {CAROUSEL_ITEMS.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 mx-8 md:mx-10 lg:mx-12 p-2"
          >
            {/* ITEM CARD */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full py-2 px-5 transition-all duration-300 hover:shadow-md cursor-default">
              {item.icon}
              <span className="text-lg md:text-xl font-semibold whitespace-nowrap text-gray-800">
                {item.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}