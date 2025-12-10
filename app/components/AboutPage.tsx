import Image from 'next/image';
import { Check, ArrowRight } from 'lucide-react';

// Define the custom colors for readability
const PRIMARY_COLOR = '#18234B'; // Dark Navy
const ACCENT_COLOR = '#A61924'; // Deep Red

const FEATURES: string[] = [
  'Licensed, professional local drivers',
  'Fixed, upfront pricing in AUD – no surge',
  'Flight monitoring & meet-and-greet at Cairns Airport',
  'Clean, well-maintained vehicles sized for your group',
];

export default function AboutPage() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="py-20 bg-white transition-colors duration-300 pt-24 mt-10 md:pt-32"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image Column */}
          <div className="relative group">
            {/* Decorative Badge */}
            <div
              className="absolute -top-6 -left-6 z-10 text-white px-6 py-4 rounded-tr-3xl rounded-bl-3xl shadow-xl flex items-center gap-3 animate-bounce-slow"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              <span className="text-4xl font-bold">20+</span>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-sm uppercase tracking-wide">
                  Years of
                </span>
                <span className="font-bold text-sm uppercase tracking-wide">
                  Local Experience
                </span>
              </div>
            </div>

            {/* Main Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/about.png"
                alt="Private transfer vehicles ready at Cairns Airport"
                width={800}
                height={600}
                className="object-cover hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Decorative Glow */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gray-200/50 rounded-full -z-10 blur-2xl" />
          </div>

          {/* Content Column */}
          <div>
            <p
              className="font-bold tracking-wider uppercase text-sm mb-2"
              style={{ color: ACCENT_COLOR }}
            >
              About Us
            </p>

            <h2
              id="about-heading"
              className="text-4xl font-extrabold mb-6 leading-tight"
              style={{ color: PRIMARY_COLOR }}
            >
              Trusted Private Transfers
              <br />
              <span
                className="relative"
                style={{ color: ACCENT_COLOR }}
              >
                Across Cairns &amp; Tropical North Queensland
                <svg
                  className="absolute w-full h-2 -bottom-1 left-0 text-gray-200 -z-10"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 50 10 100 5"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                  />
                </svg>
              </span>
            </h2>

            <p className="text-gray-600 mb-4 text-lg leading-relaxed">
              For more than two decades we&apos;ve helped visitors and locals travel
              between <strong>Cairns Airport</strong>, Cairns City, Port Douglas,
              Palm Cove, Kuranda and the Atherton Tablelands with ease. Our focus
              is simple: <strong>safe, comfortable and on-time private transfers</strong>{' '}
              with a friendly local driver who knows the region.
            </p>

            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              Every journey is door-to-door, with help for your luggage and flexible
              pickup times. We monitor flights, communicate clearly with you before
              arrival and make sure your first impression of Tropical North Queensland
              is relaxed – not stressful.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-10">
              {FEATURES.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 group">
                  <div
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors duration-300"
                    style={{ color: ACCENT_COLOR }}
                  >
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </div>
                  <p className="text-gray-700 font-medium">{item}</p>
                </div>
              ))}
            </div>

            <button
              className="group text-white px-8 py-4 rounded-full font-bold shadow-lg hover:brightness-110 transition-all duration-300 flex items-center gap-2"
              style={{
                backgroundColor: ACCENT_COLOR,
                boxShadow: `0 4px 12px ${ACCENT_COLOR}30`,
              }}
              aria-label="Learn more about our Cairns private transfer service"
            >
              Learn More About Our Service
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
