import Image from 'next/image'
import { Check, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  const features = [
    "Professional and experienced drivers",
    "Well-maintained fleet of vehicles",
    "24/7 customer support available"
  ];

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-950 transition-colors duration-300 pt-24 md:pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* Image Column */}
          <div className="relative group">
            {/* Decorative Badge */}
            <div className="absolute -top-6 -left-6 z-10 bg-gray-900 dark:bg-yellow-400 text-white dark:text-gray-900 px-6 py-4 rounded-tr-3xl rounded-bl-3xl shadow-xl flex items-center gap-3 animate-bounce-slow">
              <span className="text-4xl font-bold">20+</span>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-sm uppercase tracking-wide">Years of</span>
                <span className="font-bold text-sm uppercase tracking-wide">Experience</span>
              </div>
            </div>

            {/* Main Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl dark:shadow-yellow-900/20">
              <Image 
                src="/car.jpg" 
                alt="Yellow Taxi Fleet" 
                width={800} 
                height={600}
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              {/* Gradient Overlay for Dark Mode */}
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent dark:from-black/60"></div>
            </div>

            {/* Decorative Dot Pattern */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-yellow-400/20 rounded-full -z-10 blur-2xl"></div>
          </div>

          {/* Content Column */}
          <div>
            <p className="text-yellow-500 dark:text-yellow-400 font-bold tracking-wider uppercase text-sm mb-2">
              About Us
            </p>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              We Provide Trusted <br />
              <span className="text-yellow-500 relative">
                Cab Service
                <svg className="absolute w-full h-2 -bottom-1 left-0 text-yellow-200 dark:text-yellow-800 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                   <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
              {" "}In The World
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
              With over 20 years of experience, we&apos;ve been providing reliable taxi services to our customers. Our commitment to safety, comfort, and punctuality has made us the preferred choice for thousands of riders across the city.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-10">
              {features.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 group">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-400 transition-colors duration-300">
                    <Check className="w-5 h-5 text-yellow-600 dark:text-yellow-400 group-hover:text-gray-900 transition-colors" strokeWidth={3} />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">{item}</p>
                </div>
              ))}
            </div>

            <button className="group bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-yellow-400/30 transition-all duration-300 flex items-center gap-2">
              Discover More
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}