"use client";

import { useEffect, useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

const LIME = "#C9F24E";

/**
 * The mascot's face is a dark screen, so the eyes and mouth are drawn in code
 * rather than baked into the artwork. That lets them track the cursor, blink,
 * and change expression independently of the character render.
 *
 * Coordinates are expressed in a 200x200 viewBox centred on the screen area,
 * so this can be overlaid on the real mascot PNG by positioning the wrapper
 * over the face and matching the box size.
 */
export function MascotFace({
  cursorX,
  cursorY,
  className = "",
}: {
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  className?: string;
}) {
  const blinking = useBlink();

  // Eyes travel a small distance so the character reads as glancing, not
  // as if the features are sliding off the face.
  const eyeX = useTransform(cursorX, [-1, 1], [-20, 20]);
  const eyeY = useTransform(cursorY, [-1, 1], [-12, 12]);
  const mouthX = useTransform(cursorX, [-1, 1], [-9, 9]);
  const mouthY = useTransform(cursorY, [-1, 1], [-5, 5]);

  return (
    <svg
      viewBox="0 0 300 245"
      className={className}
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id="mascot-eye-glow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <motion.g filter="url(#mascot-eye-glow)" style={{ x: eyeX, y: eyeY }}>
        <motion.g
          animate={{ scaleY: blinking ? 0.12 : 1 }}
          transition={{ duration: 0.09, ease: "easeInOut" }}
          style={{ originX: "150px", originY: "108px" }}
        >
          <Eye cx={97} />
          <Eye cx={203} />
        </motion.g>
      </motion.g>

      <motion.path
        d="M122 158 Q150 182 178 158"
        fill="none"
        stroke={LIME}
        strokeWidth={11}
        strokeLinecap="round"
        filter="url(#mascot-eye-glow)"
        style={{ x: mouthX, y: mouthY }}
      />
    </svg>
  );
}

function Eye({ cx }: { cx: number }) {
  // A soft upward arc — the character's default happy expression.
  return (
    <path
      d={`M${cx - 31} 122 Q${cx} 82 ${cx + 31} 122`}
      fill="none"
      stroke={LIME}
      strokeWidth={15}
      strokeLinecap="round"
    />
  );
}

/** Irregular blink timing so it reads as alive rather than metronomic. */
function useBlink() {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    let closeTimer: ReturnType<typeof setTimeout>;
    let nextTimer: ReturnType<typeof setTimeout>;

    function schedule() {
      const delay = 2600 + Math.random() * 3800;
      nextTimer = setTimeout(() => {
        setBlinking(true);
        closeTimer = setTimeout(() => {
          setBlinking(false);
          schedule();
        }, 110);
      }, delay);
    }

    schedule();
    return () => {
      clearTimeout(closeTimer);
      clearTimeout(nextTimer);
    };
  }, []);

  return blinking;
}
