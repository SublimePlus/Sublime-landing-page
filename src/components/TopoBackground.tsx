"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const CONTOUR_PATHS = [
  "M-50,80 C150,40 300,140 500,90 C650,55 750,110 850,70",
  "M-50,160 C120,120 280,210 480,170 C640,140 760,190 850,150",
  "M-50,260 C160,220 320,300 500,255 C660,220 770,270 850,235",
  "M-50,350 C140,310 300,390 480,345 C650,310 760,360 850,320",
  "M-50,440 C150,400 310,470 500,430 C660,395 770,440 850,405",
  "M-50,520 C130,485 290,555 470,515 C640,480 760,520 850,490",
];

const MARKS = [
  { x: 70, y: 55, size: 9, opacity: 0.7 },
  { x: 240, y: 30, size: 13, opacity: 0.45 },
  { x: 420, y: 100, size: 8, opacity: 0.6 },
  { x: 630, y: 45, size: 11, opacity: 0.5 },
  { x: 60, y: 260, size: 12, opacity: 0.4 },
  { x: 300, y: 220, size: 8, opacity: 0.65 },
  { x: 540, y: 300, size: 10, opacity: 0.5 },
  { x: 730, y: 240, size: 14, opacity: 0.35 },
  { x: 130, y: 460, size: 10, opacity: 0.55 },
  { x: 380, y: 420, size: 8, opacity: 0.6 },
  { x: 620, y: 480, size: 12, opacity: 0.4 },
  { x: 760, y: 400, size: 9, opacity: 0.55 },
];

export function TopoBackground({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // This drift renders on four sections at once. Left running unconditionally
  // it keeps the compositor busy for backgrounds nobody is looking at, which
  // costs battery on mobile for no visual benefit.
  const inView = useInView(ref, { margin: "200px" });

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <motion.svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        initial={{ x: 0, y: 0 }}
        animate={inView ? { x: [0, -18, 0], y: [0, 12, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      >
        <g stroke="currentColor" strokeWidth="1" fill="none">
          {CONTOUR_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {/* The scattered marks are the "stars". They take their own colour
            rather than the faint contour-line colour: brand lime in light mode,
            and the section's own subtle tone in dark mode (unchanged). Setting
            `color` here means the children's `stroke="currentColor"` resolves
            to lime without touching the contour lines above. */}
        <g
          className="text-lime dark:text-white/[0.05]"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {MARKS.map((m, i) => (
            <g key={i} transform={`translate(${m.x} ${m.y}) rotate(45)`} opacity={m.opacity}>
              <line x1={-m.size} y1="0" x2={m.size} y2="0" />
              <line x1="0" y1={-m.size} x2="0" y2={m.size} />
            </g>
          ))}
        </g>
      </motion.svg>
    </div>
  );
}
