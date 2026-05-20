'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';

/**
 * Apple-style scroll reveal animations.
 *
 * Performance-optimized: uses ONLY opacity + transform (GPU-composited).
 * NO filter:blur() — avoids expensive repaints that hurt PageSpeed.
 */

// Apple's signature easing curves
const appleSlow = [0.16, 1, 0.3, 1] as const;
const appleEase = [0.25, 0.1, 0.25, 1.0] as const;

// ── Preset Variants (no blur — GPU-composited only) ──────────

export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: appleSlow,
    },
  },
};

export const fadeUpSubtle: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: appleEase,
    },
  },
};

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: appleSlow,
    },
  },
};

export const slideFromLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.9,
      ease: appleSlow,
    },
  },
};

export const slideFromRight: Variants = {
  hidden: {
    opacity: 0,
    x: 60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.9,
      ease: appleSlow,
    },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.15,
    },
  },
};

// ── ScrollReveal Component ───────────────────────────────────

type ScrollRevealProps = {
  children: React.ReactNode;
  variant?: 'fadeUp' | 'fadeUpSubtle' | 'scaleIn' | 'slideLeft' | 'slideRight';
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
  threshold?: number;
};

const variantMap = {
  fadeUp,
  fadeUpSubtle,
  scaleIn,
  slideLeft: slideFromLeft,
  slideRight: slideFromRight,
};

export default function ScrollReveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  className = '',
  as = 'div',
  threshold = 0.15,
}: ScrollRevealProps) {
  const Component = motion[as] as any;
  const variants = variantMap[variant];

  // If there's a custom delay, override the transition
  const customVariants: Variants = delay > 0
    ? {
        ...variants,
        visible: {
          ...variants.visible,
          transition: {
            ...(variants.visible as any).transition,
            delay,
          },
        },
      }
    : variants;

  return (
    <Component
      variants={customVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      className={className}
    >
      {children}
    </Component>
  );
}
