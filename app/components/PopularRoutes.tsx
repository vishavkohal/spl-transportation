'use client';
import React from 'react';
import Image from 'next/image';

interface Route {
  badge: string;
  title: string;
  subtitle: string;
  vehicles: {
    type: string;
    icon: string;
    price: string;
  }[];
}

const routes: Route[] = [
  {
    badge: 'Route',
    title: 'Cairns to Port Douglas & Return',
    subtitle: 'Easy airport transfers',
    vehicles: [
      { type: '4 Seater', icon: '🚗', price: '$160' },
      { type: '7 Seater', icon: '🚙', price: '$180' },
      { type: '8 Seater', icon: '🚐', price: '$200' },
    ],
  },
  {
    badge: 'Popular',
    title: 'Cairns City To Cairns Airport',
    subtitle: 'Interstate express service',
    vehicles: [
      { type: '4 Seater', icon: '🚗', price: '$320' },
      { type: '7 Seater', icon: '🚙', price: '$380' },
      { type: '8 Seater', icon: '🚐', price: '$420' },
    ],
  },
  {
    badge: 'Route',
    title: 'Palm Cove to Cairns Airport',
    subtitle: 'Coastal route transfers',
    vehicles: [
      { type: '4 Seater', icon: '🚗', price: '$140' },
      { type: '7 Seater', icon: '🚙', price: '$160' },
      { type: '8 Seater', icon: '🚐', price: '$190' },
    ],
  },
  {
    badge: 'New',
    title: 'Mission Beach to Cairns',
    subtitle: 'Western Australia route',
    vehicles: [
      { type: '4 Seater', icon: '🚗', price: '$110' },
      { type: '7 Seater', icon: '🚙', price: '$135' },
      { type: '8 Seater', icon: '🚐', price: '$160' },
    ],
  },
  {
    badge: 'Route',
    title: 'Kuranda to Cairns',
    subtitle: 'Wine region tours available',
    vehicles: [
      { type: '4 Seater', icon: '🚗', price: '$130' },
      { type: '7 Seater', icon: '🚙', price: '$150' },
      { type: '8 Seater', icon: '🚐', price: '$180' },
    ],
  },
  {
    badge: 'Popular',
    title: 'Sky Rail to Cairns',
    subtitle: 'Tasmania express transfer',
    vehicles: [
      { type: '4 Seater', icon: '🚗', price: '$220' },
      { type: '7 Seater', icon: '🚙', price: '$250' },
      { type: '8 Seater', icon: '🚐', price: '$290' },
    ],
  },
];

export default function PopularRoutes() {
  const handleBookNow = (routeTitle: string) => {
    alert(`Booking initiated for ${routeTitle}`);
  };

  const getVehicleImage = (type: string): string => {
    const imageMap: Record<string, string> = {
      '4 Seater': '/sedan.png',
      '7 Seater': '/suv.png',
      '8 Seater': '/van.png',
    };
    return imageMap[type] || '/sedan.png';
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-yellow-500 dark:text-yellow-400 font-bold tracking-wider uppercase text-sm mb-2">
            Popular Routes
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Fast Reliable Transport Services
          </h2>
          <div className="w-24 h-1.5 bg-yellow-400 mx-auto rounded-full" />
        </div>

        {/* Routes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {routes.map((route, index) => (
            <div
              key={index}
              className="group bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-2xl dark:hover:shadow-yellow-900/20 hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                  {route.badge}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {route.title}
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {route.vehicles.map((vehicle, vIndex) => (
                    <div
                      key={vIndex}
                      className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-yellow-400 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-between min-h-[200px]"
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-center mb-3 h-16">
                          <Image
                            src={getVehicleImage(vehicle.type)}
                            alt={vehicle.type}
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                        </div>
                        <div className="font-bold text-black text-sm mb-2">
                          {vehicle.type}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-black">
                        {vehicle.price}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="w-full bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-400 dark:hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 uppercase tracking-wide text-sm"
                  onClick={() => handleBookNow(route.title)}
                >
                  BOOK NOW
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

