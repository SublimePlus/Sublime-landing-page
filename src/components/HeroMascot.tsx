"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * The Sublime+ mascot for the hero, split into two layers exported from
 * Blender: a static body and a head that turns toward the pointer.
 *
 * Both files are expected to be full-frame exports on the *same* canvas (same
 * dimensions, transparent padding), so stacking them at `inset-0` lines the
 * head up over the neck automatically — no per-asset nudging.
 *
 * Only the head moves: it rotates a few degrees and drifts a couple of pixels
 * toward the cursor, pivoting at the neck (bottom-centre). The whole thing is
 * cropped to roughly half-body by the frame's fixed aspect + overflow, so the
 * legs fall away and the mascot sits neatly at the bottom of the hero.
 *
 * Respects reduced-motion: the head simply stays centred.
 */
const HEAD_SRC = "/mascot/head.webp";
const BODY_SRC = "/mascot/body.webp";

// The layers are trimmed to the figure's shared bounding box (402×740), so
// FRAME_ASPECT is that width/height. CROP is how much of the top of the figure
// stays visible — 0.68 keeps head + hoodie + hips and drops the lower legs and
// shoes for the half-body look.
const FRAME_ASPECT = 0.543; // width / height of the source webp
const CROP = 0.68;

export function HeroMascot({ className }: { className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);

  // Pointer offset from the head, normalised to roughly [-1, 1].
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 140, damping: 18, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 140, damping: 18, mass: 0.4 });

  // Head turn: a little rotation plus a hair of translation for parallax.
  const rotate = useTransform(sx, [-1, 1], [-9, 9]);
  const translateX = useTransform(sx, [-1, 1], [-7, 7]);
  const translateY = useTransform(sy, [-1, 1], [-4, 6]);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const el = frameRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // Head sits near the top-centre of the frame.
      const headX = r.left + r.width / 2;
      const headY = r.top + r.height * 0.42;
      const dx = (e.clientX - headX) / (window.innerWidth / 2);
      const dy = (e.clientY - headY) / (window.innerHeight / 2);
      px.set(Math.max(-1, Math.min(1, dx)));
      py.set(Math.max(-1, Math.min(1, dy)));
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py]);

  return (
    <div
      ref={frameRef}
      className={className}
      style={{
        // Position comes from `className` (the caller anchors it in the hero);
        // an `absolute`/`relative` class makes this a containing block for the
        // absolutely-positioned layers below.
        aspectRatio: `${FRAME_ASPECT} / ${CROP}`,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {/* Inner holds the full-height figure; the frame crops the bottom. */}
      <div style={{ position: "absolute", inset: 0, height: `${100 / CROP}%` }}>
        <Image
          src={BODY_SRC}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 60vw, 420px"
          style={{ objectFit: "contain", objectPosition: "top" }}
        />
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            rotate,
            x: translateX,
            y: translateY,
            transformOrigin: "50% 48%", // neck pivot (collar of the trimmed figure)
          }}
        >
          <Image
            src={HEAD_SRC}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 60vw, 420px"
            style={{ objectFit: "contain", objectPosition: "top" }}
          />
        </motion.div>
      </div>
    </div>
  );
}
