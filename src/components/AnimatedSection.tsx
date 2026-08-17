"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * A page section that fades itself in and out at the viewport edges.
 *
 * Two things are happening. The `whileInView` transition is the entrance — the
 * section rises and settles the first time it comes into view, and again if you
 * scroll back to it. On top of that, scroll progress drives a continuous
 * opacity curve so that a section is fully solid only while it owns the middle
 * of the screen, and softens as it leaves. The result is that neighbouring
 * sections cross-fade into each other rather than butting up hard.
 *
 * The curve bottoms out at 0.35 rather than 0: a section that fades to nothing
 * while still partly on screen reads as broken rather than as a transition.
 *
 * Both effects are motion, so both are disabled for reduced-motion users by the
 * global `MotionConfig reducedMotion="user"` in the root layout.
 */
export function AnimatedSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const fade = useTransform(
    scrollYProgress,
    [0, 0.22, 0.78, 1],
    [0.35, 1, 1, 0.35]
  );

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      style={{ opacity: fade }}
      initial={{ y: 64, scale: 0.98 }}
      whileInView={{ y: 0, scale: 1 }}
      viewport={{ once: false, margin: "-120px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

/**
 * Soft blended seam between two sections.
 *
 * Sits between sections in the page composition and bleeds the colour of the
 * one above into the one below, so the boundary reads as a gradient rather than
 * a line. Purely decorative.
 */
export function SectionFade({
  className = "from-transparent to-transparent",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none h-24 w-full bg-gradient-to-b ${className}`}
    />
  );
}
