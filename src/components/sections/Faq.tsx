"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { PlusMark } from "../PlusMark";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";
import { PlusField } from "../PlusField";
import { faqs, type FaqItem } from "@/lib/faq";

export function Faq() {
  return (
    <AnimatedSection
      id="faq"
      className="relative overflow-hidden py-20"
    >
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <PlusField density="heavy" className="text-lime/60 dark:text-lime/25" />
      <div className="relative mx-auto max-w-3xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-ink">
            Questions
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            What people ask before they book.
          </h2>
          <p className="mt-4 text-stone dark:text-white/60">
            Straight answers, taken from the processes we actually follow.
          </p>
        </Reveal>

        <dl className="mt-10 space-y-3">
          {faqs.map((item, i) => (
            <Reveal key={item.question} delay={Math.min(i, 6) * 0.05}>
              <FaqRow item={item} />
            </Reveal>
          ))}
        </dl>
      </div>
    </AnimatedSection>
  );
}

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="neon-teal overflow-hidden rounded-2xl border border-pine/10 bg-white dark:border-white/10 dark:bg-night/40">
      <dt>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        >
          <span className="text-base font-semibold text-pine dark:text-white">
            {item.question}
          </span>
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal dark:bg-white/10 dark:text-lime"
          >
            <PlusMark className="h-3.5 w-3.5" strokeWidth={3} />
          </motion.span>
        </button>
      </dt>
      <AnimatePresence initial={false}>
        {open && (
          <motion.dd
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm leading-relaxed text-stone dark:text-white/70">
              {item.answer}
            </p>
          </motion.dd>
        )}
      </AnimatePresence>
    </div>
  );
}
