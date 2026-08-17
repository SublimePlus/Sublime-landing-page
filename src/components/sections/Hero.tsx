"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PlusMark } from "../PlusMark";
import { PlusField } from "../PlusField";
import { Magnetic } from "../CursorReactive";
import { BookMeetingButton } from "../booking/BookMeetingButton";

/**
 * The hero leads with the hook rather than the service description.
 *
 * The hook is a question the visitor cannot answer, which is the point: SOP-001
 * §5.5 makes "ask the models what they say about this brand" the first thing we
 * actually do for a client, so the page opens on the same move. Everything
 * beneath it is deliberately short — the sections below have room to explain,
 * the hero only has to earn the scroll.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-night via-pine to-pine px-6 pb-20 pt-28 text-white">
      <AmbientGlow />
      <PlusField density="heavy" className="text-lime/25" />
      <BackdropWordmark />

      <div className="relative mx-auto w-full max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-lime"
        >
          <PlusMark className="h-3.5 w-3.5" strokeWidth={3} />
          Content &amp; social marketing, done with a little extra
        </motion.p>

        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          <WordReveal text="Be the brand" startDelay={0.15} />
          <br />
          <WordReveal text="AI recommends." startDelay={0.4} className="text-lime" />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85 }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
        >
          We plan, write and create content that shapes how AI describes you,
          and moves you up in search.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3 }}
          className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Magnetic strength={14}>
            <BookMeetingButton className="neon-lime-btn inline-flex items-center gap-2 rounded-full bg-lime px-8 py-4 font-semibold text-pine transition-transform hover:scale-[1.03]">
              See what AI says about you
              <PlusMark className="h-4 w-4" strokeWidth={3} />
            </BookMeetingButton>
          </Magnetic>
          {/* Secondary CTA. Every button on the page routes to the booking
              modal, so this opens it too, styled as an outline pair. */}
          <BookMeetingButton className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-sm font-semibold text-white transition-colors hover:border-lime hover:text-lime">
            Book a call
          </BookMeetingButton>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.5 }}
          className="mt-5 text-sm text-white/50"
        >
          Free 30–45 minute call. Nothing gets published without your approval.
        </motion.p>
      </div>
    </section>
  );
}

/** Oversized brand wordmark sitting behind the headline. */
function BackdropWordmark() {
  return (
    <motion.span
      aria-hidden="true"
      initial={{ opacity: 0, scale: 1.08 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[22vw] font-bold leading-none tracking-[0.08em] text-white/[0.035] lg:text-[15vw]"
    >
      SUBLIME
    </motion.span>
  );
}

function WordReveal({
  text,
  startDelay = 0,
  className = "",
}: {
  text: string;
  startDelay?: number;
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, i) => (
        <span
          key={i}
          // The clipping wrapper collapses trailing whitespace, so word spacing
          // is restored with a margin rather than a literal space character.
          className={`inline-block overflow-hidden pb-1 align-bottom ${
            i < words.length - 1 ? "mr-[0.26em]" : ""
          }`}
        >
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: "0%" }}
            transition={{
              duration: 0.55,
              delay: startDelay + i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function AmbientGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/20 blur-[140px]"
      animate={
        inView
          ? { opacity: [0.5, 0.85, 0.5], scale: [1, 1.12, 1] }
          : { opacity: 0.5, scale: 1 }
      }
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
