"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { PlusMark } from "../PlusMark";
import { RedditIcon } from "../RedditIcon";
import { Magnetic } from "../CursorReactive";
import { BookMeetingButton } from "../booking/BookMeetingButton";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-pine via-pine to-teal pt-36 pb-28 text-white"
    >
      <FloatingPlusField />
      <FloatingRedditBadge scrollYProgress={scrollYProgress} />
      <FloatingBlogWidget scrollYProgress={scrollYProgress} />
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
            <BookMeetingButton className="inline-flex items-center gap-2 rounded-full bg-lime px-7 py-3.5 font-semibold text-pine transition-transform hover:scale-[1.03]">
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
    </section>
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

function FloatingRedditBadge({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const y = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <motion.div
      className="pointer-events-none absolute right-[8%] top-[16%] hidden md:block"
      style={{ y, opacity }}
      aria-hidden="true"
    >
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [-4, 4, -4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-full shadow-lg shadow-black/20"
      >
        <RedditIcon className="h-11 w-11" />
      </motion.div>
    </motion.div>
  );
}

function FloatingBlogWidget({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const y = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <motion.div
      className="pointer-events-none absolute bottom-[16%] left-[6%] hidden md:block"
      style={{ y, opacity }}
      aria-hidden="true"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center gap-2"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 shadow-lg shadow-black/10 backdrop-blur-sm">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-lime text-pine">
            <PlusMark className="h-4 w-4" strokeWidth={3} />
          </span>
          <div className="text-left leading-tight">
            <p className="text-xs font-semibold text-white">New blog post</p>
            <p className="text-[11px] text-white/60">Just published</p>
          </div>
        </div>
        <span className="text-2xl" role="img" aria-hidden="true">
          💬
        </span>
        <span className="text-2xl" role="img" aria-hidden="true">
          ✨
        </span>
      </motion.div>
    </motion.div>
  );
}
