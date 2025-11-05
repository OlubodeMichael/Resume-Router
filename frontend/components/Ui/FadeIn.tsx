"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
}

export default function FadeIn({ 
  children, 
  delay = 0,
  duration = 0.6,
  yOffset = 20
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, // Only trigger once when element enters viewport
    margin: "-50px" // Start animation slightly before element enters viewport
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1] // Custom easing curve
      }}
    >
      {children}
    </motion.div>
  );
}