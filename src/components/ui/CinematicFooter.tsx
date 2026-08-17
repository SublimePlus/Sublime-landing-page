"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Logo } from "../PlusMark";
import { Magnetic } from "../CursorReactive";
import { site } from "@/lib/site";

/**
 * Curtain-reveal footer: the page scrolls up and away to uncover a full-height
 * footer sitting underneath it.
 *
 * The mechanism is a `clip-path` wrapper holding a `position: sticky` child.
 * The wrapper occupies real height in the flow, and the clip means the sticky
 * footer is only ever painted inside that box, so it appears to be revealed
 * rather than to slide in.
 *
 * Adapted from the cinematic-footer pattern to this codebase's stack. The
 * original drives everything with GSAP and ScrollTrigger; framer-motion is
 * already here and `useScroll` does the same parallax in a few lines, so the
 * extra dependency would be paying ~50KB for a duplicate of something we ship
 * already. The magnetic hover uses the `Magnetic` component this project
 * already has, for the same reason.
 *
 * Sticky rather than fixed: a fixed child escapes the clip in Safari, which
 * leaves the footer painted over the whole page.
 */
const MARQUEE_PHRASES = [
  // Each phrase restates something the page already commits to, all SOP-backed.
  "Your approval before anything posts",
  "One Customer Manager, start to finish",
  "Every AI draft read by a human",
  "No fabricated stats or testimonials",
  "Live in 7 to 10 business days",
];

const FOOTER_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#ugc", label: "UGC" },
  { href: "/#plans", label: "Plans" },
  { href: "/#faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
];

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start end", "end end"],
  });

  // The giant wordmark rises and settles as the footer is uncovered.
  const wordmarkY = useTransform(scrollYProgress, [0, 1], ["12vh", "0vh"]);
  const wordmarkOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  return (
    <div
      ref={wrapperRef}
      className="relative h-svh w-full"
      style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
    >
      <footer className="sticky top-0 flex h-svh w-full flex-col justify-between overflow-hidden bg-night text-white">
        <AmbientGlow />
        <GridBackdrop />

        <motion.span
          aria-hidden="true"
          style={{ y: wordmarkY, opacity: wordmarkOpacity }}
          className="pointer-events-none absolute -bottom-[4vh] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap text-[26vw] font-bold leading-[0.75] tracking-tighter text-white/[0.045]"
        >
          SUBLIME
        </motion.span>

        <Marquee />

        {/* Entrance is whileInView rather than scroll-linked. Scroll progress
            over a sticky element is unreliable at the very end of the document,
            and getting it wrong leaves the footer's content invisible. */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6"
        >
          <h2 className="mb-10 text-center text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Content &amp; social marketing,
            <br />
            <span className="text-lime">done with a little extra.</span>
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {FOOTER_LINKS.map((link) => (
              <Magnetic key={link.href} strength={10}>
                <Link href={link.href} className="glass-pill px-6 py-3 text-sm font-semibold">
                  {link.label}
                </Link>
              </Magnetic>
            ))}
          </div>

          <Magnetic strength={12}>
            <a
              href={`mailto:${site.email}`}
              className="glass-pill mt-5 inline-flex px-8 py-4 text-sm font-bold text-lime"
            >
              {site.email}
            </a>
          </Magnetic>
        </motion.div>

        <div className="relative z-20 flex w-full flex-col items-center justify-between gap-5 px-6 pb-8 md:flex-row md:px-12">
          <Logo variant="light" />

          <p className="order-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40 md:order-2">
            © {new Date().getFullYear()} Sublime+. All rights reserved.
          </p>

          <Magnetic strength={10}>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="glass-pill group order-2 flex h-12 w-12 items-center justify-center md:order-3"
            >
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </Magnetic>
        </div>
      </footer>
    </div>
  );
}

function Marquee() {
  return (
    <div className="absolute top-14 z-10 w-full -rotate-2 scale-110 border-y border-white/10 bg-night/60 py-4 backdrop-blur-md">
      <div className="marquee-track flex w-max text-[11px] font-bold uppercase tracking-[0.3em] text-white/45 sm:text-xs">
        {/* Duplicated so the loop has a seamless second half to scroll into. */}
        <MarqueeRun />
        <MarqueeRun />
      </div>
    </div>
  );
}

function MarqueeRun() {
  return (
    <div className="flex items-center gap-10 px-5">
      {MARQUEE_PHRASES.map((phrase) => (
        <span key={phrase} className="flex items-center gap-10 whitespace-nowrap">
          {phrase}
          <span className="text-lime/60" aria-hidden="true">
            +
          </span>
        </span>
      ))}
    </div>
  );
}

function AmbientGlow() {
  return (
    <div
      aria-hidden="true"
      className="footer-breathe pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vh] w-[80vw] rounded-[50%] blur-[90px]"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(201,242,78,0.16) 0%, rgba(60,134,107,0.16) 42%, transparent 70%)",
      }}
    />
  );
}

function GridBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundSize: "60px 60px",
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        maskImage:
          "linear-gradient(to bottom, transparent, black 28%, black 72%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 28%, black 72%, transparent)",
      }}
    />
  );
}
