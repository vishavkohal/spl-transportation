import Image from 'next/image';
import Link from 'next/link';
import { Check, ArrowRight, Shield, Clock, Star, Users, MapPin, Phone } from 'lucide-react';

// Define the custom colors for readability
const PRIMARY_COLOR = '#18234B'; // Dark Navy
const ACCENT_COLOR = '#A61924'; // Deep Red

const FEATURES: string[] = [
  'Licensed, professional local drivers',
  'Fixed, upfront pricing in AUD – no surge',
  'Flight monitoring & meet-and-greet at Cairns Airport',
  'Clean, well-maintained vehicles sized for your group',
];

const STATS = [
  { value: '20+', label: 'Years Experience', icon: Star },
  { value: '15K+', label: 'Happy Passengers', icon: Users },
  { value: '15+', label: 'Routes Covered', icon: MapPin },
  { value: '24/7', label: 'Support Available', icon: Phone },
];

const VALUES = [
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Every vehicle is regularly serviced and inspected. All drivers are fully licensed with current Blue Cards and police checks.'
  },
  {
    icon: Clock,
    title: 'Always On Time',
    description: 'We monitor all flight arrivals in real-time. Your driver will always be there when you land, even if your flight is delayed.'
  },
  {
    icon: Star,
    title: 'Premium Comfort',
    description: 'Travel in clean, air-conditioned vehicles with complimentary water and Wi-Fi. Luggage assistance included on every trip.'
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section
        id="about"
        aria-labelledby="about-heading"
        className="py-20 bg-white transition-colors duration-300 pt-15 mt-10 md:pt-15"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Image Column */}
            <div className="relative group">
              {/* Decorative Badge */}
              <div
                className="absolute -top-6 -left-6 z-10 text-white px-6 py-4 rounded-tr-3xl rounded-bl-3xl shadow-xl flex items-center gap-3"
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
                style={{ color: PRIMARY_COLOR }}
              >
                About Us
              </p>

              <h1
                id="about-heading"
                className="text-4xl font-extrabold mb-6 leading-tight"
                style={{ color: PRIMARY_COLOR }}
              >
                Trusted Private Transfers
                <br />
                <span
                  className="relative"
                  style={{ color: PRIMARY_COLOR }}
                >
                  Across Cairns & Tropical North Queensland
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
              </h1>

              <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                For more than two decades we&apos;ve helped visitors and locals travel
                between <Link href="/transfers" className="text-blue-700 hover:underline"><strong>Cairns Airport</strong></Link>, Cairns City, Port Douglas,
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
                      style={{ color: PRIMARY_COLOR }}
                    >
                      <Check className="w-5 h-5" strokeWidth={3} />
                    </div>
                    <p className="text-gray-700 font-medium">{item}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/book"
                className="group inline-flex text-white px-8 py-4 rounded-full font-bold shadow-lg hover:brightness-110 transition-all duration-300 items-center gap-2"
                style={{
                  backgroundColor: PRIMARY_COLOR,
                  boxShadow: `0 4px 12px ${PRIMARY_COLOR}30`,
                }}
                aria-label="Book a Cairns private transfer"
              >
                Book Your Transfer
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16" style={{ backgroundColor: PRIMARY_COLOR }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-4">
                  <stat.icon className="w-6 h-6 text-white/80" />
                </div>
                <p className="text-3xl md:text-4xl font-extrabold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-white/60 font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p
              className="text-sm font-bold tracking-[0.2em] uppercase mb-2"
              style={{ color: ACCENT_COLOR }}
            >
              Why Choose Us
            </p>
            <h2
              className="text-3xl md:text-4xl font-extrabold"
              style={{ color: PRIMARY_COLOR }}
            >
              Our Promise to You
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {VALUES.map((value, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${PRIMARY_COLOR}10`, color: PRIMARY_COLOR }}
                >
                  <value.icon className="w-7 h-7" />
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: PRIMARY_COLOR }}
                >
                  {value.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p
              className="text-sm font-bold tracking-[0.2em] uppercase mb-2"
              style={{ color: ACCENT_COLOR }}
            >
              Our Fleet
            </p>
            <h2
              className="text-3xl md:text-4xl font-extrabold mb-4"
              style={{ color: PRIMARY_COLOR }}
            >
              Modern, Comfortable Vehicles
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              From sedans for couples to spacious minibuses for groups, we match the perfect vehicle to your party size.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sedan', pax: '1-3 passengers', desc: 'Perfect for couples and small groups. Comfortable leather seating with climate control.', image: '/hero-mercedes.webp' },
              { name: 'Van', pax: '4-7 passengers', desc: 'Ideal for families and mid-size groups. Spacious with plenty of luggage room.', image: '/hero-2.webp' },
              { name: 'Minibus', pax: '8-13 passengers', desc: 'Great for large groups and tour parties. Everyone travels together in comfort.', image: '/home.webp' },
            ].map((vehicle, i) => (
              <div
                key={i}
                className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={vehicle.image}
                    alt={`${vehicle.name} - ${vehicle.pax}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full bg-white/90 text-slate-800 backdrop-blur-sm">
                      {vehicle.pax}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2" style={{ color: PRIMARY_COLOR }}>
                    {vehicle.name}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {vehicle.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 mx-4 md:mx-8 mb-16 rounded-3xl relative overflow-hidden" style={{ backgroundColor: PRIMARY_COLOR }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, rgba(166,25,36,0.4) 0%, transparent 50%),
                             radial-gradient(circle at 70% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)`
          }} />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to Book Your Transfer?
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Fixed pricing, professional drivers, and door-to-door service across Tropical North Queensland.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white shadow-lg hover:brightness-110 transition-all"
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              Book Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/transfers"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-all"
            >
              View All Routes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
