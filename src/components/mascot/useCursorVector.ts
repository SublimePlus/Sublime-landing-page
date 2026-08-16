"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motionValue, useSpring, useReducedMotion } from "framer-motion";

const COARSE_QUERY = "(pointer: coarse)";

function subscribeToPointerType(onChange: () => void) {
  const mq = window.matchMedia(COARSE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** True when the device has no fine pointer — touch, and hybrid devices in
 *  touch mode. Reads as an external store so it stays correct if the user
 *  switches input method mid-session (detachable keyboards, tablets). */
function useIsCoarsePointer() {
  return useSyncExternalStore(
    subscribeToPointerType,
    () => window.matchMedia(COARSE_QUERY).matches,
    () => false // server render: assume a fine pointer, corrected on hydrate
  );
}

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

/**
 * Idle look-around for devices with no pointer.
 *
 * Without this the mascot's most distinctive behaviour — the eyes following
 * you — is simply invisible to every mobile visitor, leaving a character that
 * stares blankly ahead. The path below is deliberately irregular, with pauses,
 * so it reads as looking at things rather than sweeping on a timer.
 */
const IDLE_PATH: Array<[number, number, number]> = [
  // [x, y, ms to hold]
  [0.45, -0.2, 1900],
  [-0.5, 0.15, 2400],
  [0.15, 0.4, 1500],
  [-0.25, -0.35, 2100],
  [0, 0, 2600],
  [0.55, 0.25, 1700],
  [-0.4, -0.1, 2200],
];

function useIdleGaze(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let step = 0;
    let timer: ReturnType<typeof setTimeout>;

    function advance() {
      const [x, y, hold] = IDLE_PATH[step % IDLE_PATH.length];
      rawX.set(x);
      rawY.set(y);
      step += 1;
      timer = setTimeout(advance, hold);
    }

    // Small delay so the entrance animation lands before the eyes start moving.
    timer = setTimeout(advance, 1200);
    return () => {
      clearTimeout(timer);
      rawX.set(0);
      rawY.set(0);
    };
  }, [enabled]);
}

export function useCursorVector() {
  const reduceMotion = useReducedMotion();
  const isCoarse = useIsCoarsePointer();

  useEffect(() => {
    if (reduceMotion) return;
    subscribe();
    return unsubscribe;
  }, [reduceMotion]);

  // Touch devices get the scripted gaze instead of a pointer they don't have.
  useIdleGaze(!reduceMotion && isCoarse);

  const config = { stiffness: 110, damping: 20, mass: 0.5 };
  return { x: useSpring(rawX, config), y: useSpring(rawY, config) };
}
