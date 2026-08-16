"use client";

import { useEffect } from "react";
import { motionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Pointer position as a normalised vector in [-1, 1] on both axes, measured
 * from the centre of the viewport.
 *
 * The raw values and the window listener are module-scoped and reference
 * counted, so any number of consumers share a single `pointermove` handler
 * doing a single pair of writes per event. Each consumer still gets its own
 * spring, which is cheap and lets callers tune their own easing.
 *
 * Stays at rest on touch devices and for reduced-motion users, so callers fall
 * back to a neutral, forward-facing pose.
 */
const rawX = motionValue(0);
const rawY = motionValue(0);

let consumers = 0;
let teardown: (() => void) | null = null;

function subscribe() {
  consumers += 1;
  if (consumers > 1 || teardown) return;

  // Coarse pointers (touch) never produce a meaningful hover position.
  if (window.matchMedia("(pointer: coarse)").matches) return;

  function onPointerMove(e: PointerEvent) {
    rawX.set(Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1)));
    rawY.set(Math.max(-1, Math.min(1, (e.clientY / window.innerHeight) * 2 - 1)));
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  teardown = () => window.removeEventListener("pointermove", onPointerMove);
}

function unsubscribe() {
  consumers = Math.max(0, consumers - 1);
  if (consumers === 0 && teardown) {
    teardown();
    teardown = null;
    rawX.set(0);
    rawY.set(0);
  }
}

export function useCursorVector() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    subscribe();
    return unsubscribe;
  }, [reduceMotion]);

  const config = { stiffness: 110, damping: 20, mass: 0.5 };
  return { x: useSpring(rawX, config), y: useSpring(rawY, config) };
}
