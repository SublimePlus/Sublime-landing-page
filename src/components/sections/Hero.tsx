"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { PlusMark } from "../PlusMark";
import { Magnetic } from "../CursorReactive";
import { BookMeetingButton } from "../booking/BookMeetingButton";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-pine via-pine to-teal pt-36 pb-28 text-white">
      <AmbientGlow />
      <FloatingPlusField />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-lime"
        >
          <PlusMark className="h-3.5 w-3.5" strokeWidth={3} />
          Content &amp; social marketing, done with a little extra
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
        >
          Your content and socials,
          <br />
          handled like a creative partner.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-white/70"
        >
          Sublime+ writes, schedules, and grows your content across every
          channel — fast, sharp, and a little more thoughtful than you&apos;d
          expect from an agency.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Magnetic strength={14}>
            <BookMeetingButton className="neon-lime-btn inline-flex items-center gap-2 rounded-full bg-lime px-7 py-3.5 font-semibold text-pine transition-transform hover:scale-[1.03]">
              Book a free consult
              <PlusMark className="h-4 w-4" strokeWidth={3} />
            </BookMeetingButton>
          </Magnetic>
          <Link
            href="/#plans"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10"
          >
            View plans
          </Link>
        </motion.div>
      </div>
      <ScrollIndicator />
    </section>
  );
}

function ScrollIndicator() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.a
      href="/#services"
      aria-label="Scroll to services"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.9 }}
      className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 text-white/50 transition-colors hover:text-white sm:block"
    >
      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M6 9l6 6 6-6" />
      </motion.svg>
    </motion.a>
  );
}

function AmbientGlow() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/20 blur-[120px]"
      animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.12, 1] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function FloatingPlusField() {
  const marks = [
    { top: "18%", left: "8%", size: 28, rotate: -12, delay: 0 },
    { top: "65%", left: "14%", size: 18, rotate: 20, delay: 0.4 },
    { top: "28%", left: "88%", size: 22, rotate: 8, delay: 0.2 },
    { top: "72%", left: "84%", size: 32, rotate: -18, delay: 0.6 },
    { top: "45%", left: "50%", size: 16, rotate: 30, delay: 0.8 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {marks.map((m, i) => (
        <motion.div
          key={i}
          className="absolute text-lime/25"
          style={{ top: m.top, left: m.left }}
          animate={{ y: [0, -14, 0], rotate: [m.rotate, m.rotate + 10, m.rotate] }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: m.delay,
          }}
        >
          <PlusMark style={{ width: m.size, height: m.size }} strokeWidth={2.5} />
        </motion.div>
      ))}
    </div>
  );
}
