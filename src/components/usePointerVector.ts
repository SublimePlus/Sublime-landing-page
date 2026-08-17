"use client";

import { useEffect } from "react";
import { motionValue, useReducedMotion } from "framer-motion";

/**
 * Pointer position as a normalised vector in [-1, 1] on both axes, measured
 * from the centre of the viewport.
 *
 * The raw values and the window listener are module-scoped and reference
 * counted, so any number of consumers share a single `pointermove` handler
 * doing a single pair of writes per event. That matters here: the plus fields
 * mount dozens of subscribers across the page, and one listener each would be
 * dozens of handlers running on every mouse move.
 *
 * Stays at rest on touch devices, which never produce a meaningful hover
 * position, and for reduced-motion users.
 */
const rawX = motionValue(0);
const rawY = motionValue(0);

let consumers = 0;
let teardown: (() => void) | null = null;

function subscribe() {
  consumers += 1;
  if (consumers > 1 || teardown) return;
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

export function usePointerVector() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    subscribe();
    return unsubscribe;
  }, [reduceMotion]);

  return { x: rawX, y: rawY };
}
