import React from 'react'
import { Car, MapPin, Plane, Users, Briefcase, Clock, ArrowRight } from 'lucide-react'
import Image from 'next/image'

// NOTE: You said you have 6 images in the public folder named service1..service6.
// Place them in `public/service1.jpg` ... `public/service6.jpg` (or .png) so the component can load them.
// Developer-provided uploaded image path (for preview/testing): /mnt/data/f1840dbd-fcb6-47b8-bd32-5da525a85aaf.png

const services = [
  {
    title: 'Online Booking',
    description:
      'Book your ride easily through our platform with real-time availability and instant confirmation.',
    img: '/services1.png',
    icon: Car,
  },
  {
    title: 'City Transport',
    description:
      'Comfortable rides within the city for your daily commute and shopping trips.',
    img: '/services2.png',
    icon: MapPin,
  },
  {
    title: 'Airport Transport',
    description:
      'Reliable airport transfers with flight tracking and meet & greet services.',
    img: '/services3.png',
    icon: Plane,
  },
  {
    title: 'Business Transport',
    description:
      'Professional rides for meetings and corporate travel with top-tier vehicles.',
    img: '/service4.jpg',
    icon: Briefcase,
  },
  {
    title: 'Regular Transport',
    description:
      'Daily ride services for errands, appointments, and regular commutes.',
    img: '/services5.png',
    icon: Users,
  },
  {
    title: 'Tour Transport',
    description:
      'Guided and private tour transport for a comfortable sightseeing experience.',
    img: '/servicess6.png',
    icon: Clock,
  },
]

export function Services() {
  return (
    <section id="service" className="py-20 bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-yellow-500 dark:text-yellow-400 font-bold tracking-wider uppercase text-sm mb-2">
            Our Services
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Best Services For You</h2>
          <div className="w-24 h-1.5 bg-yellow-400 mx-auto mt-4 rounded-full" />
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <article
              key={index}
              className={`group bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-2xl dark:hover:shadow-yellow-900/20 hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col`}
            >
              {/* Image Container */}
              <div className="relative mb-8">
                <div className="overflow-hidden rounded-xl shadow-md aspect-video relative">
                  {/* Next/Image will serve from public/ when src starts with / */}
                  <Image
                    src={service.img}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Floating Icon */}
                <div className="absolute -bottom-6 right-6 bg-yellow-400 text-gray-900 p-4 rounded-full shadow-lg group-hover:bg-yellow-300 transition-colors z-10">
                  {/* render icon component stored on the object */}
                  <service.icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2} />
                </div>
              </div>

              {/* Content */}
              <div className="mt-2 flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{service.description}</p>
              </div>

              {/* Button */}
              <button className="w-full sm:w-auto self-start inline-flex items-center justify-center gap-2 bg-transparent border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-full font-semibold hover:bg-yellow-400 hover:border-yellow-400 dark:hover:bg-yellow-400 dark:hover:text-gray-900 dark:hover:border-yellow-400 transition-all duration-300 group/btn">
                Read More
                <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
