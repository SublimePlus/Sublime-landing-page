"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export function useSpotlight() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }

  return { x, y, onMouseMove };
}

export function SpotlightOverlay({
  x,
  y,
  color = "60, 134, 107",
}: {
  x: ReturnType<typeof useMotionValue<number>>;
  y: ReturnType<typeof useMotionValue<number>>;
  color?: string;
}) {
  const background = useMotionTemplate`radial-gradient(200px circle at ${x}px ${y}px, rgba(${color}, 0.16), transparent 70%)`;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{ background }}
      aria-hidden="true"
    />
  );
}
