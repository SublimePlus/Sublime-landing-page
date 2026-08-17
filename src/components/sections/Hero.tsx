"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useTransform } from "framer-motion";
import { PlusMark } from "../PlusMark";
import { Magnetic } from "../CursorReactive";
import { BookMeetingButton } from "../booking/BookMeetingButton";
import { Mascot } from "../mascot/Mascot";
import { useCursorVector } from "../mascot/useCursorVector";

export function Hero() {
  const { x, y } = useCursorVector();

  // Layers travel at different rates so the composition reads as depth:
  // the wordmark sits furthest back, the foreground copy closest.
  const wordmarkX = useTransform(x, [-1, 1], [26, -26]);
  const wordmarkY = useTransform(y, [-1, 1], [14, -14]);
  const copyX = useTransform(x, [-1, 1], [-12, 12]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-night via-pine to-pine pt-32 pb-24 text-white">
      <AmbientGlow />
      <FloatingPlusField />
      <BackdropWordmark x={wordmarkX} y={wordmarkY} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-[1fr_minmax(280px,420px)_1fr] lg:gap-6">
        {/* Left column — badge + headline */}
        <motion.div style={{ x: copyX }} className="order-2 text-center lg:order-1 lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-lime"
          >
            <PlusMark className="h-3.5 w-3.5" strokeWidth={3} />
            Content &amp; social marketing, done with a little extra
          </motion.p>
          {/* SOP-S01 §5.2 — the core qualifying question, stated as the promise. */}
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            <WordReveal text="Visible on Reddit." startDelay={0.1} />
            <br />
            <WordReveal text="In search results." startDelay={0.4} />
            <br />
            <WordReveal text="In what AI says about you." startDelay={0.7} />
          </h1>
        </motion.div>

        {/* Centre — the mascot */}
        <div className="order-1 lg:order-2">
          <Mascot />
        </div>

        {/* Right column — supporting copy + calls to action */}
        <motion.div
          style={{ x: copyX }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="order-3 text-center lg:text-right"
        >
          {/* SOP-002 §4 (posts, comments, replies) + SOP-001 §4.1 (campaign
              improves SEO rankings and LLM perception of the brand). */}
          <p className="mx-auto text-lg text-white/70 lg:ml-auto lg:mr-0 lg:max-w-sm">
            We plan, write and post Reddit content — posts, comments and
            replies — to improve your SEO rankings and shape how AI language
            models describe your brand.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-end">
            <Magnetic strength={14}>
              <BookMeetingButton className="neon-lime-btn inline-flex items-center gap-2 rounded-full bg-lime px-7 py-3.5 font-semibold text-pine transition-transform hover:scale-[1.03]">
                Book a discovery call
                <PlusMark className="h-4 w-4" strokeWidth={3} />
              </BookMeetingButton>
            </Magnetic>
            {/* A secondary route for visitors not ready to book. Styled as a
                real button so the two CTAs read as a pair rather than a button
                beside an afterthought. */}
            <Link
              href="/#plans"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-lime hover:text-lime"
            >
              View plans
            </Link>
          </div>
        </motion.div>
      </div>

      <ScrollCue />
    </section>
  );
}

/** Oversized brand wordmark sitting behind the mascot, which partly occludes it. */
function BackdropWordmark({
  x,
  y,
}: {
  x: ReturnType<typeof useTransform<number, number>>;
  y: ReturnType<typeof useTransform<number, number>>;
}) {
  return (
    <motion.span
      aria-hidden="true"
      style={{ x, y }}
      initial={{ opacity: 0, scale: 1.08 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[22vw] font-bold leading-none tracking-[0.08em] text-white/[0.045] lg:text-[15vw]"
    >
      SUBLIME
    </motion.span>
  );
}

function WordReveal({ text, startDelay = 0 }: { text: string; startDelay?: number }) {
  const words = text.split(" ");
  return (
    <span className="inline-block">
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

function ScrollCue() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center sm:flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 1.4 }}
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-9 w-6 items-start justify-center rounded-full border border-white/25 pt-1.5"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
      </motion.div>
    </motion.div>
  );
}

function AmbientGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/25 blur-[130px]"
      animate={inView ? { opacity: [0.5, 0.85, 0.5], scale: [1, 1.12, 1] } : { opacity: 0.5, scale: 1 }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function FloatingPlusField() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const marks = [
    { top: "18%", left: "8%", size: 28, rotate: -12, delay: 0 },
    { top: "65%", left: "14%", size: 18, rotate: 20, delay: 0.4 },
    { top: "28%", left: "88%", size: 22, rotate: 8, delay: 0.2 },
    { top: "72%", left: "84%", size: 32, rotate: -18, delay: 0.6 },
    { top: "45%", left: "50%", size: 16, rotate: 30, delay: 0.8 },
  ];
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0" aria-hidden="true">
      {marks.map((m, i) => (
        <motion.div
          key={i}
          className="absolute text-lime/25"
          style={{ top: m.top, left: m.left }}
          animate={
            inView
              ? { y: [0, -14, 0], rotate: [m.rotate, m.rotate + 10, m.rotate] }
              : { y: 0, rotate: m.rotate }
          }
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
