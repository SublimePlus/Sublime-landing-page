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
 * Blended seam between a dark brand block and the page background.
 *
 * The earlier version interpolated straight from green to white, which always
 * looked muddy: the midpoint of dark-green → white lands on grey, and the eye
 * reads that grey stripe as a dirty band. This instead lays the dark colour at
 * full strength fading to *transparent* over the page background, so the
 * midtones are washes of the brand green over white (sage), never grey. In dark
 * mode `--background` is night, so the same fade reads as pine settling into
 * night. It works in both themes with no colour maths.
 *
 * `variant` says which way the seam runs:
 *   - "to-light": leaving a dark section (dark at top, page background at bottom)
 *   - "to-dark":  entering a dark section (page background at top, dark at bottom)
 */
export function SectionFade({
  variant,
  color = "var(--color-pine)",
  height = "h-40",
}: {
  variant: "to-light" | "to-dark";
  /** The dark brand colour on the dark side of the seam. */
  color?: string;
  height?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative w-full ${height}`}
      style={{ background: "var(--background)" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === "to-light"
              ? `linear-gradient(to bottom, ${color}, transparent)`
              : `linear-gradient(to bottom, transparent, ${color})`,
        }}
      />
    </div>
  );
}
