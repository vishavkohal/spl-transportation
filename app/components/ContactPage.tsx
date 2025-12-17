'use client';
import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react';

// Define the custom colors for readability
const PRIMARY_COLOR = '#18234B'; // Dark Navy
const ACCENT_COLOR = '#A61924'; // Deep Red

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setFormStatus('success');
      // Reset after 3 seconds
      setTimeout(() => setFormStatus('idle'), 3000);
    }, 1500);
  };

  return (
    // Background remains light gray/white (bg-gray-50), removed dark background class
    <section className="py-20 bg-gray-50 transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <p 
            className="font-bold tracking-wider uppercase text-sm mb-2"
            style={{ color: ACCENT_COLOR }} // Accent Color for "Get In Touch"
          >
            Get In Touch
          </p>
          <h1 
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
            style={{ color: PRIMARY_COLOR }} // Primary Color for main heading
          >
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question about a route? Need a custom quote? We are here to help you 24/7.
          </p>
          {/* Accent-colored divider */}
          <div 
            className="w-24 h-1.5 mx-auto mt-6 rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
          ></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Contact Info Cards (Left Column) */}
          <div className="space-y-6 h-full">
            {/* Phone */}
            <ContactCard 
              icon={Phone}
              title="Phone"
              content="+61470032460"
              subtext="Available for bookings"
              action="Call Now"
              href="tel:+61470032460"
              accentColor={ACCENT_COLOR}
            />

            {/* Email */}
            <ContactCard 
              icon={Mail}
              title="Email"
              content="spltransportation.australia@gmail.com"
              subtext="Response within 24 hours"
              action="Send Email"
              href="mailto:spltransportation.australia@gmail.com"
              accentColor={ACCENT_COLOR}
            />

            {/* Location */}
            <ContactCard 
              icon={MapPin}
              title="Service Area"
              content="Queensland, Australia"
              subtext="Cairns, Port Douglas & Palm Cove"
              action="View on Map"
              href="#"
              accentColor={ACCENT_COLOR}
            />
          </div>

          {/* Contact Form (Right Column - Spans 2) */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">
            
            <div className="relative z-10">
              <h2 
                className="text-3xl font-bold text-gray-900 mb-8"
                style={{ color: PRIMARY_COLOR }} // Primary Color for form title
              >
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Your Name" type="text" placeholder="John Doe" accentColor={ACCENT_COLOR} />
                  <InputField label="Your Email" type="email" placeholder="john@example.com" accentColor={ACCENT_COLOR} />
                </div>

                <InputField label="Phone Number" type="tel" placeholder="+61 ..." accentColor={ACCENT_COLOR} />
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tell us about your trip details..."
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 
                             rounded-xl text-gray-900 placeholder-gray-400 
                             focus:ring-2 focus:border-transparent focus:outline-none 
                             transition-all resize-none"
                    style={{ 
                        '--tw-ring-color': ACCENT_COLOR, // Apply Accent Color to focus ring
                        '--tw-ring-offset-width': '0px' 
                    } as React.CSSProperties} 
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={formStatus !== 'idle'}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 text-white
                    ${formStatus === 'success' 
                      ? 'bg-green-600 scale-[1.02]' 
                      : 'hover:-translate-y-1 shadow-lg'
                    }
                  `}
                  // Set background color using inline style, handling success state explicitly
                  style={{
                    backgroundColor: formStatus === 'success' ? '#10B981' : ACCENT_COLOR, // Using bg-green-600 equivalent for success
                    boxShadow: formStatus === 'success' ? 'none' : `0 4px 12px ${ACCENT_COLOR}30`
                  }}
                >
                  {formStatus === 'idle' && (
                    <><span>Send Message</span> <Send className="w-5 h-5" /></>
                  )}
                  {formStatus === 'submitting' && (
                    <span className="animate-pulse">Sending...</span>
                  )}
                  {formStatus === 'success' && (
                    <><span>Message Sent!</span> <CheckCircle className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper Component for Contact Cards
// Props updated to accept accentColor
function ContactCard({ icon: Icon, title, content, subtext, action, href, accentColor }: any) {
  return (
    <a 
      href={href}
      className="flex items-start gap-5 bg-white p-6 rounded-2xl 
                  border border-gray-100 shadow-sm hover:shadow-md 
                  transition-all duration-300 hover:-translate-y-1 group"
    >
      <div 
        className="w-12 h-12 flex items-center justify-center rounded-xl shadow-sm shrink-0 group-hover:scale-110 transition-transform"
        style={{ backgroundColor: accentColor }} // Accent Color for icon background
      >
        <Icon className="w-6 h-6 text-white" strokeWidth={2} /> {/* Changed icon color to white for contrast */}
      </div>
      <div>
        <h3 className="font-bold text-lg text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 font-medium mb-1">{content}</p>
        <p className="text-sm text-gray-400 mb-3">{subtext}</p>
        <span 
          className="text-sm font-bold group-hover:underline"
          style={{ color: accentColor }} // Accent Color for action link
        >
          {action}
        </span>
      </div>
    </a>
  );
}

// Helper Component for Inputs
// Props updated to accept accentColor
function InputField({ label, type, placeholder, accentColor }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700 ml-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        required
        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 
                  rounded-xl text-gray-900 placeholder-gray-400 
                  focus:ring-2 focus:border-transparent focus:outline-none 
                  transition-all"
        style={{ 
            '--tw-ring-color': accentColor, // Apply Accent Color to focus ring
            '--tw-ring-offset-width': '0px' 
        } as React.CSSProperties} 
      />
    </div>
  );
}