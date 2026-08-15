"use client";

import { motion, useTransform } from "framer-motion";
import { MascotFace } from "./MascotFace";
import { useCursorVector } from "./useCursorVector";

/**
 * The hero mascot.
 *
 * `src` should point at the cut-out character render (transparent PNG). Until
 * that asset lands, a code-drawn stand-in keeps the layout and all of the
 * motion behaviour testable — the tracking, tilt and blink are identical
 * either way, so swapping the artwork in is a one-line change.
 *
 * `facePosition` describes where the character's screen sits inside the image,
 * as percentages, so the animated face can be registered over it.
 */
export function Mascot({
  src = "/mascot-hero.png",
  // Measured from the artwork: the screen's centre, top edge and width as a
  // percentage of the image box.
  facePosition = { left: 49.55, top: 17.71, width: 54.55 },
}: {
  src?: string;
  facePosition?: { left: number; top: number; width: number };
}) {
  const { x, y } = useCursorVector();

  const rotateY = useTransform(x, [-1, 1], [-9, 9]);
  const rotateX = useTransform(y, [-1, 1], [6, -6]);
  const driftX = useTransform(x, [-1, 1], [-14, 14]);
  const driftY = useTransform(y, [-1, 1], [-10, 10]);

  return (
    <div style={{ perspective: 1200 }} className="relative w-full">
      <motion.div
        style={{ rotateX, rotateY, x: driftX, y: driftY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, scale: 0.88, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="flex w-full justify-center"
      >
        <FloatWrapper>
          {src ? (
            // inline-block so the wrapper hugs the image, keeping the
            // percentage-positioned face registered at any size.
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="Sublime+ mascot"
                className="max-h-[62vh] w-auto max-w-[300px] select-none sm:max-w-[340px]"
                draggable={false}
              />
              <div
                className="pointer-events-none absolute"
                style={{
                  left: `${facePosition.left - facePosition.width / 2}%`,
                  top: `${facePosition.top}%`,
                  width: `${facePosition.width}%`,
                }}
              >
                <MascotFace cursorX={x} cursorY={y} className="w-full" />
              </div>
            </div>
          ) : (
            <PlaceholderMascot cursorX={x} cursorY={y} />
          )}
        </FloatWrapper>
      </motion.div>
    </div>
  );
}

/** Slow vertical bob so the character never sits perfectly still. */
function FloatWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

function PlaceholderMascot({
  cursorX,
  cursorY,
}: {
  cursorX: ReturnType<typeof useCursorVector>["x"];
  cursorY: ReturnType<typeof useCursorVector>["y"];
}) {
  return (
    <div className="relative">
      <svg viewBox="0 0 200 260" className="w-full" aria-label="Sublime+ mascot" role="img">
        <defs>
          <linearGradient id="shell" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F6F6EF" />
            <stop offset="100%" stopColor="#DFDFD4" />
          </linearGradient>
          <linearGradient id="hoodie" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1F4D38" />
            <stop offset="100%" stopColor="#16382A" />
          </linearGradient>
        </defs>

        {/* leaf tufts */}
        <g fill="#4E9E63">
          <path d="M92 34 C86 12 96 2 104 0 C110 12 106 28 98 38 Z" />
          <path d="M108 36 C112 14 126 6 134 8 C134 24 124 36 114 40 Z" transform="rotate(6 120 24)" />
          <path d="M78 44 C70 26 74 12 80 8 C90 18 90 34 84 46 Z" transform="rotate(-8 80 26)" />
        </g>

        {/* hoodie body */}
        <path
          d="M62 150 C62 128 80 118 100 118 C120 118 138 128 138 150 L142 232 C142 240 136 244 128 244 L72 244 C64 244 58 240 58 232 Z"
          fill="url(#hoodie)"
        />
        <text
          x="100"
          y="186"
          textAnchor="middle"
          fill="#F2F5F3"
          fontFamily="var(--font-script), cursive"
          fontSize="26"
        >
          Sublime
        </text>

        {/* helmet */}
        <rect x="34" y="42" width="132" height="106" rx="46" fill="url(#shell)" />
        {/* screen */}
        <rect x="50" y="58" width="100" height="76" rx="30" fill="#0B0F0D" />

        {/* headphones */}
        <circle cx="34" cy="98" r="19" fill="url(#shell)" />
        <circle cx="166" cy="98" r="19" fill="url(#shell)" />
        <circle cx="166" cy="98" r="11" fill="#3C866B" />
        <path d="M166 92v12M160 98h12" stroke="#C9F24E" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <MascotFace
        cursorX={cursorX}
        cursorY={cursorY}
        className="pointer-events-none absolute left-[25%] top-[22%] w-[50%]"
      />
    </div>
  );
}
