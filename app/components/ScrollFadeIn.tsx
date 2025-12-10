"use client";

import React from "react";
import { motion } from "framer-motion";

type ScrollFadeInProps = {
  children: React.ReactNode;
  delay?: number;
};

export const ScrollFadeIn: React.FC<ScrollFadeInProps> = ({
  children,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};
