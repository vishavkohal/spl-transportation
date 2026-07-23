"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const HERO_IMAGES = [
  "/homehero.png",
  "/hero-mercedes.webp",
  "/hero-2.webp",
  "/home.webp",
  "/copy.webp",
];

export default function HeroBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Make the first image (/homehero.png) stay longer (12s) than other images (6s)
    const duration = currentIndex === 0 ? 52000 : 6000;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className="absolute inset-0 bg-gray-900">
      {HERO_IMAGES.map((src, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={src}
            className="absolute inset-0"
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 10 : 0,
              transition: 'opacity 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 8s cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
            >
              <Image
                src={src}
                alt="SPL Transportation Luxury Fleet"
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
