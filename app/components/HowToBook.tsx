'use client';
import React from 'react';
import { BookOpen, UserCheck, CheckCircle } from 'lucide-react'; // Icons

// Define the custom colors based on user's theme
const PRIMARY_COLOR = '#18234B'; // Dark Navy (Used for Background, Text on Card)
const ACCENT_COLOR = '#A61924'; // Deep Red (Used for Heading, Step Number/Icon)
const CARD_BG = '#FFFFFF'; // Pure White for Card Background
const TEXT_COLOR_DARK = '#18234B'; // Dark Navy for body text on the card
const MUTED_TEXT_COLOR = '#5F6368'; // Medium Gray (Muted Text)

// Material Shadow properties
const CARD_SHADOW = '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'; 

// Data structure for the steps
const steps = [
  {
    id: 1,
    title: 'Book Online or Call',
    description: 'Reserve your private transfer in minutes.',
    icon: BookOpen,
  },
  {
    id: 2,
    title: 'Meet Your Driver',
    description: "We'll greet you at the airport with a personalised sign.",
    icon: UserCheck,
  },
  {
    id: 3,
    title: 'Relax & Enjoy',
    description: 'Travel stress-free directly to your destination.',
    icon: CheckCircle,
  },
];

export default function HowToBookModern() {
  return (
    // Outer container: Using Dark Navy background
    <div className="py-20 px-6" style={{ backgroundColor: PRIMARY_COLOR }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Component Header: High contrast (Deep Red on Dark Navy) */}
        <h2 
          className="text-4xl md:text-5xl font-extrabold text-center mb-16 tracking-tight"
          style={{ color: 'white' }} // Heading is Deep Red
        >
          How to Book Your Transfer
            <div
            className="w-24 h-1.5 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
          />
        </h2>
        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.id}
              // Card styling: White background, rounded corners, shadow
              className="p-8 md:p-10 rounded-2xl transition-all hover:-translate-y-1"
              style={{ backgroundColor: CARD_BG, boxShadow: CARD_SHADOW }}
            >
              {/* Step Number/Icon Group */}
              <div className="flex items-center mb-4 space-x-4">
                {/* Step Number - Large, bold, and accented (Deep Red) */}
                <span 
                  className="text-5xl font-black"
                  style={{ color: ACCENT_COLOR }} 
                >
                  {step.id}
                </span>
                {/* Visual Separator - Light Gray on White card */}
                <span className="text-3xl" style={{ color: MUTED_TEXT_COLOR }}>|</span> 
                {/* Icon - Deep Red */}
                <step.icon className="w-8 h-8" style={{ color: ACCENT_COLOR }} />
              </div>
              
              {/* Step Title */}
              <h3 
                className="text-2xl font-bold mb-3 mt-4" 
                style={{ color: TEXT_COLOR_DARK }} // Dark Navy text
              >
                {step.title}
              </h3>

              {/* Step Description */}
              <p 
                className="text-base"
                style={{ color: MUTED_TEXT_COLOR }} // Muted gray text
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}