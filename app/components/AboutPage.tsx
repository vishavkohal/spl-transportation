import Image from 'next/image'
import { Check, ArrowRight } from 'lucide-react'

// Define the custom colors for readability
const PRIMARY_COLOR = '#18234B'; // Dark Navy
const ACCENT_COLOR = '#A61924'; // Deep Red
// Background Color (White) is handled by the default 'bg-white' class

export default function AboutPage() {
  const features = [
    "Professional and experienced drivers",
    "Well-maintained fleet of vehicles",
    "24/7 customer support available"
  ];

  return (
    // Background remains white (default) for light theme
    <section id="about" className="py-20 bg-white transition-colors duration-300 pt-24 md:pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* Image Column */}
          <div className="relative group">
            {/* Decorative Badge */}
            <div 
              // Background set to Primary Color (#18234B), text is white
              className="absolute -top-6 -left-6 z-10 text-white px-6 py-4 rounded-tr-3xl rounded-bl-3xl shadow-xl flex items-center gap-3 animate-bounce-slow"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              <span className="text-4xl font-bold">20+</span>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-sm uppercase tracking-wide">Years of</span>
                <span className="font-bold text-sm uppercase tracking-wide">Experience</span>
              </div>
            </div>

            {/* Main Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="/about.png" 
                alt="Fleet of Vehicles" 
                width={800} 
                height={600}
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>

            {/* Decorative Dot Pattern (Uses light gray for contrast with white background) */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gray-200/50 rounded-full -z-10 blur-2xl"></div>
          </div>

          {/* Content Column */}
          <div>
            <p 
              className="font-bold tracking-wider uppercase text-sm mb-2"
              style={{ color: ACCENT_COLOR }} // Accent Color for "About Us"
            >
              About Us
            </p>
            <h2 
              className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight"
              // Text color changed from text-gray-900 to Primary Color for the main part of the header
              style={{ color: PRIMARY_COLOR }} 
            >
              We Provide Trusted <br />
              <span 
                className="relative"
                style={{ color: ACCENT_COLOR }} // Accent Color for "Cab Service"
              >
                Cab Service
                {/* SVG underline uses a lighter shade of the accent color */}
                <svg className="absolute w-full h-2 -bottom-1 left-0 text-gray-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                   <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
              {" "}In The World
            </h2>
            
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              With over 20 years of experience, we&apos;ve been providing premium car transfer services to our customers. Our commitment to safety, comfort, and punctuality has made us the preferred choice for thousands of riders across the city.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-10">
              {features.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 group">
                  <div 
                    // Background for checkmark circle
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors duration-300"
                    style={{ color: ACCENT_COLOR }} // Checkmark color
                  >
                    <Check className="w-5 h-5 transition-colors" strokeWidth={3} />
                  </div>
                  <p className="text-gray-700 font-medium">{item}</p>
                </div>
              ))}
            </div>

            <button 
              className="group text-white px-8 py-4 rounded-full font-bold shadow-lg hover:brightness-110 transition-all duration-300 flex items-center gap-2"
              // Accent Color for button background and shadow
              style={{ backgroundColor: ACCENT_COLOR, boxShadow: `0 4px 12px ${ACCENT_COLOR}30` }} 
            >
              Discover More
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}