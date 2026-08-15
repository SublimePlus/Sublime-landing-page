"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PlusMark } from "../PlusMark";
import { Magnetic } from "../CursorReactive";
import { BookMeetingButton } from "../booking/BookMeetingButton";
import { Mascot3D } from "../Mascot3D";
import { ScrambleIn } from "../ScrambleIn";

export function Hero() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-pine via-pine to-teal pt-36 pb-20 text-white md:pb-28 min-h-[100dvh] flex flex-col justify-center">
      <AmbientGlow />
      <DotGrid />
      <Watermark />
      <FloatingPlusField />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 md:flex-row md:gap-8 lg:gap-14">
        {/* Text content */}
        <div className="flex-1 text-center md:text-left">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={entered ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-lime"
          >
            <PlusMark className="h-3.5 w-3.5" strokeWidth={3} />
            Content &amp; social marketing, done with a little extra
          </motion.p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            <ScrambleIn
              text="Your content and socials,"
              delay={200}
              triggered={entered}
            />
            <br />
            <ScrambleIn
              text="handled like a creative partner."
              delay={600}
              triggered={entered}
            />
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={entered ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.9,
              delay: 0.2,
              ease: [0.215, 0.61, 0.355, 1.0],
            }}
            className="mt-6 max-w-2xl text-lg text-white/70 md:mx-0"
          >
            Sublime+ writes, schedules, and grows your content across every
            channel — fast, sharp, and a little more thoughtful than you&apos;d
            expect from an agency.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={entered ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row md:justify-start"
          >
            <Magnetic strength={14}>
              <BookMeetingButton className="neon-lime-btn inline-flex items-center gap-2 rounded-full bg-lime px-7 py-3.5 font-semibold text-pine transition-transform hover:scale-[1.03]">
                Book a free consult
                <PlusMark className="h-4 w-4" strokeWidth={3} />
              </BookMeetingButton>
            </Magnetic>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-white/80 underline underline-offset-4 hover:text-white"
            >
              See how it works
            </Link>
          </motion.div>
        </div>

        {/* 3D Mascot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={entered ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0"
        >
          <Mascot3D />
        </motion.div>
      </div>
    </section>
  );
}

function DotGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        opacity: 0.05,
      }}
    />
  );
}

function Watermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[0] flex items-center justify-center overflow-hidden"
    >
      <span
        className="select-none font-bold uppercase"
        style={{
          fontSize: "clamp(80px, 20vw, 360px)",
          letterSpacing: "-4px",
          lineHeight: 1,
          opacity: 0.06,
          background:
            "radial-gradient(circle, rgba(201,242,78,0) 0%, rgba(201,242,78,0.6) 70%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        SUBLIME+
      </span>
    </div>
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
    <div className="pointer-events-none absolute inset-0 z-[2]" aria-hidden="true">
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
