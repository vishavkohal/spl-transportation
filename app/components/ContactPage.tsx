'use client';
import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react';

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
    <section className="py-20 bg-gray-50 pt-24 md:pt-32 dark:bg-gray-950 transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-yellow-500 dark:text-yellow-400 font-bold tracking-wider uppercase text-sm mb-2">
            Get In Touch
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have a question about a route? Need a custom quote? We are here to help you 24/7.
          </p>
          <div className="w-24 h-1.5 bg-yellow-400 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Contact Info Cards (Left Column) */}
          <div className="space-y-6 h-full">
            {/* Phone */}
            <ContactCard 
              icon={Phone}
              title="Phone"
              content="+61470032460"
              subtext="Available 24/7 for bookings"
              action="Call Now"
              href="tel:+61470032460"
            />

            {/* Email */}
            <ContactCard 
              icon={Mail}
              title="Email"
              content="spltransportation.australia@gmail.com"
              subtext="Response within 24 hours"
              action="Send Email"
              href="mailto:spltransportation.australia@gmail.com"
            />

            {/* Location */}
            <ContactCard 
              icon={MapPin}
              title="Service Area"
              content="Queensland, Australia"
              subtext="Cairns, Port Douglas & Palm Cove"
              action="View on Map"
              href="#"
            />
          </div>

          {/* Contact Form (Right Column - Spans 2) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl shadow-xl dark:shadow-yellow-900/5 p-8 md:p-12 border border-gray-100 dark:border-gray-800 relative overflow-hidden">
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Your Name" type="text" placeholder="John Doe" />
                  <InputField label="Your Email" type="email" placeholder="john@example.com" />
                </div>

                <InputField label="Phone Number" type="tel" placeholder="+61 ..." />
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tell us about your trip details..."
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                             rounded-xl text-gray-900 dark:text-white placeholder-gray-400 
                             focus:ring-2 focus:ring-yellow-400 focus:border-transparent focus:outline-none 
                             transition-all resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={formStatus !== 'idle'}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300
                    ${formStatus === 'success' 
                      ? 'bg-green-500 text-white scale-[1.02]' 
                      : 'bg-yellow-400 text-gray-900 hover:bg-yellow-300 hover:-translate-y-1 shadow-lg hover:shadow-yellow-400/30'
                    }
                  `}
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
function ContactCard({ icon: Icon, title, content, subtext, action, href }: any) {
  return (
    <a 
      href={href}
      className="flex items-start gap-5 bg-white dark:bg-gray-900 p-6 rounded-2xl 
                 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md 
                 transition-all duration-300 hover:-translate-y-1 group"
    >
      <div className="bg-yellow-400 w-12 h-12 flex items-center justify-center rounded-xl shadow-sm shrink-0 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-gray-900" strokeWidth={2} />
      </div>
      <div>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">{content}</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">{subtext}</p>
        <span className="text-yellow-600 dark:text-yellow-500 text-sm font-bold group-hover:underline">
          {action}
        </span>
      </div>
    </a>
  );
}

// Helper Component for Inputs
function InputField({ label, type, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        required
        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 
                 focus:ring-2 focus:ring-yellow-400 focus:border-transparent focus:outline-none 
                 transition-all"
      />
    </div>
  );
}