"use client";

import { useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { usePointerVector } from "./usePointerVector";

/**
 * Drifting field of brand plus marks that also leans toward the cursor.
 *
 * Two motions are layered. Each mark floats on its own slow loop, and the whole
 * field translates against pointer movement — marks nearer the "front" travel
 * further, so moving the mouse gives the background a shallow sense of depth
 * rather than a flat slide.
 *
 * Positions are deterministic (derived from the index) rather than random, so
 * the server and client render the same field and hydration stays quiet.
 *
 * The whole field is decorative: aria-hidden, non-interactive, and it stops
 * animating whenever it scrolls out of view, so it costs nothing to have on
 * every section at once.
 */
type Density = "light" | "medium" | "heavy";

const COUNT: Record<Density, number> = { light: 10, medium: 16, heavy: 24 };

function markAt(i: number) {
  // Deliberately coprime multipliers: the marks spread across the box instead
  // of falling into a visible grid.
  const depth = 0.35 + ((i * 7) % 5) / 5; // 0.35 to 1.15, drives parallax reach
  return {
    top: `${(i * 37 + 11) % 96}%`,
    left: `${(i * 53 + 7) % 96}%`,
    size: 12 + ((i * 7) % 5) * 5,
    rotate: ((i * 29) % 60) - 30,
    drift: 10 + ((i * 13) % 4) * 6,
    duration: 7 + ((i * 11) % 7),
    delay: ((i * 17) % 10) / 2.5,
    depth,
  };
}

export function PlusField({
  density = "medium",
  className = "text-lime/20",
}: {
  density?: Density;
  /** Tailwind text colour for the marks. Defaults to a soft brand lime. */
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const marks = Array.from({ length: COUNT[density] }, (_, i) => markAt(i));

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {marks.map((m, i) => (
        <Mark key={i} mark={m} inView={inView} />
      ))}
    </div>
  );
}

function Mark({
  mark,
  inView,
}: {
  mark: ReturnType<typeof markAt>;
  inView: boolean;
}) {
  const { x, y } = usePointerVector();
  const spring = { stiffness: 60, damping: 20, mass: 0.6 };
  const reach = 34 * mark.depth;
  const px = useSpring(useTransform(x, [-1, 1], [reach, -reach]), spring);
  const py = useSpring(useTransform(y, [-1, 1], [reach, -reach]), spring);

  return (
    <motion.div className="absolute" style={{ top: mark.top, left: mark.left, x: px, y: py }}>
      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        width={mark.size}
        height={mark.size}
        initial={{ opacity: 0.35, rotate: mark.rotate }}
        animate={
          inView
            ? {
                y: [0, -mark.drift, 0],
                opacity: [0.25, 0.7, 0.25],
                rotate: [mark.rotate, mark.rotate + 18, mark.rotate],
              }
            : { y: 0, opacity: 0.35, rotate: mark.rotate }
        }
        transition={{
          duration: mark.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: mark.delay,
        }}
      >
        <path d="M12 5v14M5 12h14" />
      </motion.svg>
    </motion.div>
  );
}
