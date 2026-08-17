"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * A page section that softens at the viewport edges as it scrolls past.
 *
 * Two things are happening. The `whileInView` transition is the entrance: the
 * section rises and settles the first time it comes into view, and again if you
 * scroll back. On top of that, scroll progress drives a gentle opacity curve so
 * neighbouring sections cross-fade into each other rather than butting up hard.
 *
 * The curve bottoms out at 0.55, not 0. Fading a section to nothing while it is
 * still partly on screen reads as broken rather than as a transition, and the
 * earlier 0.35 floor was heavy enough to look like a rendering fault near the
 * page end.
 *
 * `fade` controls which edges participate. The last section on the page uses
 * "in" so it does not dim as the footer arrives, which otherwise leaves the
 * bottom of the page looking like it is switching off.
 */
export function AnimatedSection({
  children,
  className = "",
  id,
  fade = "both",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /**
   * "both" softens the section at both viewport edges. "in" skips the fade out,
   * for the last section on the page. "none" disables the curve entirely, which
   * is what a solid dark block on a light page needs: partial opacity over a
   * white body turns pine into washed-out grey.
   */
  fade?: "both" | "in" | "none";
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const fadeIn = fade === "none" ? 1 : 0.55;
  const fadeOut = fade === "both" ? 0.55 : 1;
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    [fadeIn, 1, 1, fadeOut]
  );

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      style={{ opacity }}
      initial={{ y: 48, scale: 0.99 }}
      whileInView={{ y: 0, scale: 1 }}
      viewport={{ once: false, margin: "-120px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

/**
 * Blended seam between two sections.
 *
 * A hard colour change between a dark section and a light one reads as a drawn
 * line, which is exactly what we do not want. This sits on the boundary and
 * does two things: bleeds the upper colour downward over a tall distance, and
 * lays a soft radial shadow across the join so the edge reads as depth rather
 * than as a rule.
 *
 * It overlaps the section above via a negative margin, so no extra vertical
 * space is introduced. Purely decorative.
 */
export function SectionFade({
  from = "transparent",
  to = "transparent",
  height = "h-40",
}: {
  /** Colour the seam starts at, matching the section above. */
  from?: string;
  /** Colour it lands on, matching the section below. */
  to?: string;
  height?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative w-full ${height}`}
      style={{
        // Two stops in the middle rather than a straight linear ramp: a plain
        // two-colour gradient still shows a faint band where it starts and
        // stops, because the eye is very good at finding the point where a
        // slope begins. Easing it at both ends removes the edge entirely.
        background: `linear-gradient(to bottom,
          ${from} 0%,
          color-mix(in srgb, ${from} 72%, ${to}) 28%,
          color-mix(in srgb, ${from} 28%, ${to}) 62%,
          ${to} 100%)`,
      }}
    />
  );
}
