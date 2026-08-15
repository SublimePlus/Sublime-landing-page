"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Tracks the pointer as a normalised vector in the range [-1, 1] on both axes,
 * measured from the centre of the viewport. Spring-smoothed so consumers get
 * eased motion rather than raw jitter.
 *
 * On touch devices (no pointer) and for reduced-motion users the vector stays
 * at rest, so callers fall back to a neutral, forward-facing pose.
 */
export function useCursorVector() {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    // Coarse pointers (touch) never produce a meaningful hover position.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    function onPointerMove(e: PointerEvent) {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      x.set(Math.max(-1, Math.min(1, nx)));
      y.set(Math.max(-1, Math.min(1, ny)));
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [x, y, reduceMotion]);

  const config = { stiffness: 110, damping: 20, mass: 0.5 };
  return { x: useSpring(x, config), y: useSpring(y, config) };
}
