"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const HERO_IMAGES = [
  "/hero-mercedes.webp",
  "/hero-2.webp",
  "/home.webp",
  "/copy.webp",
];

export default function HeroBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 bg-gray-900">
      {HERO_IMAGES.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
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
      ))}
    </div>
  );
}
