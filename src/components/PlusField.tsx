"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Drifting field of brand plus marks.
 *
 * The plus is the one shape carried through the whole identity, so it does the
 * ambient work on every section rather than each one inventing its own texture.
 * Positions are deterministic (derived from the index) rather than random, so
 * the server and client render the same field and hydration stays quiet.
 *
 * The whole field is decorative: it is aria-hidden, non-interactive, and it
 * stops animating whenever it scrolls out of view so it costs nothing to have
 * on six sections at once.
 */
type Density = "light" | "medium" | "heavy";

const COUNT: Record<Density, number> = { light: 8, medium: 14, heavy: 20 };

function markAt(i: number) {
  // Deliberately coprime multipliers: the marks spread across the box instead
  // of falling into a visible grid.
  return {
    top: `${(i * 37 + 11) % 96}%`,
    left: `${(i * 53 + 7) % 96}%`,
    size: 12 + ((i * 7) % 5) * 5,
    rotate: ((i * 29) % 60) - 30,
    drift: 10 + ((i * 13) % 4) * 6,
    duration: 7 + ((i * 11) % 7),
    delay: ((i * 17) % 10) / 2.5,
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
        <motion.svg
          key={i}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          width={m.size}
          height={m.size}
          className="absolute"
          style={{ top: m.top, left: m.left }}
          initial={{ opacity: 0.35, rotate: m.rotate }}
          animate={
            inView
              ? {
                  y: [0, -m.drift, 0],
                  opacity: [0.25, 0.7, 0.25],
                  rotate: [m.rotate, m.rotate + 18, m.rotate],
                }
              : { y: 0, opacity: 0.35, rotate: m.rotate }
          }
          transition={{
            duration: m.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: m.delay,
          }}
        >
          <path d="M12 5v14M5 12h14" />
        </motion.svg>
      ))}
    </div>
  );
}
