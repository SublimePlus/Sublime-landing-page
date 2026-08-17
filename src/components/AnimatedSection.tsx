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
  fade?: "both" | "in";
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const fadeOutTo = fade === "in" ? 1 : 0.55;
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    [0.55, 1, 1, fadeOutTo]
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
  to,
  shadow = false,
}: {
  /** CSS colour the seam bleeds down from, e.g. "var(--color-pine)". */
  from?: string;
  /**
   * Colour to land on. When set, the seam is a real ramp between two solid
   * backgrounds and occupies its own height. When omitted it overlaps the
   * section above instead, bleeding `from` away into transparency.
   */
  to?: string;
  /** Adds a soft radial shade across the join. Use on dark-to-light edges. */
  shadow?: boolean;
}) {
  const ramp = to !== undefined;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative h-32 w-full"
      style={ramp ? undefined : { marginTop: "-8rem" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: ramp
            ? `linear-gradient(to bottom, ${from} 0%, ${to} 100%)`
            : `linear-gradient(to bottom, ${from} 0%, color-mix(in srgb, ${from} 55%, transparent) 45%, transparent 100%)`,
        }}
      />
      {shadow && (
        <div
          className="absolute inset-x-0 bottom-0 h-24"
          style={{
            background:
              "radial-gradient(80% 100% at 50% 0%, rgba(14,31,25,0.28), transparent 72%)",
          }}
        />
      )}
    </div>
  );
}
