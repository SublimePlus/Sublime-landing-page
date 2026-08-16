"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "../Reveal";
import { PlusMark } from "../PlusMark";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";

type Faq = {
  question: string;
  answer: string;
};

const faqs: Faq[] = [
  {
    question: "How long does it take to see results?",
    answer:
      "You'll see day-one results in engagement and posting consistency. Most clients see meaningful growth in followers and impressions within 4-8 weeks, as we build momentum with your audience and our strategies take hold. We provide monthly reports so you can track progress every step of the way.",
  },
  {
    question: "What if we already have a content creator or in-house team?",
    answer:
      "Sublime+ scales with your needs. We can augment your existing team by handling specific channels, managing your editorial calendar, or focusing purely on community engagement. Many clients use us to free up their in-house team to focus on strategy while we handle execution.",
  },
  {
    question: "How does onboarding work?",
    answer:
      "We start with a deep-dive kickoff call where we learn your brand voice, audience, goals, and content preferences. Then we build your content calendar and create your first batch of posts — all before you see a bill. Most teams are up and running within 1-2 weeks.",
  },
  {
    question: "Can we pause, cancel, or scale our plan up/down?",
    answer:
      "Absolutely. There's no long-term lock-in. You can scale up to handle seasonal campaigns, pause during slower periods, or adjust your posting volume anytime. We'll work with you to find a rhythm that matches your goals and budget.",
  },
  {
    question: "What platforms do you cover?",
    answer:
      "We manage every major platform: Instagram, TikTok, LinkedIn, Twitter/X, YouTube, Facebook, and Pinterest. We recommend which channels make sense for your brand based on your audience, and most plans include 1-3 platforms to start.",
  },
  {
    question: "Who has access to our brand accounts and content?",
    answer:
      "You stay in full control. We manage your accounts through secure, limited-access tokens, and all content is approved by you before posting. Your brand voice and strategy stay yours — we're executing your vision, not making decisions unilaterally.",
  },
  {
    question: "Do you write all content from scratch or use AI?",
    answer:
      "We write thoughtfully for your brand — never generic, never auto-generated. We use our expertise and creativity to craft posts in your voice. We're not a bot; we're a team that gets to know your audience and what moves them.",
  },
  {
    question: "What happens if we need custom work or special projects?",
    answer:
      "That's why we have a Custom plan. Need extra graphics, video editing, paid media strategy, or a one-off campaign? Let's talk. We can scope those projects separately or fold them into your retainer.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <AnimatedSection className="relative overflow-hidden py-28">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <div className="relative mx-auto max-w-3xl px-6">
        <Reveal className="mx-auto text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal">
            Questions
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            Everything you need to know.
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={faq.question} delay={i * 0.05}>
              <FaqItem
                faq={faq}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

function FaqItem({
  faq,
  isOpen,
  onClick,
}: {
  faq: Faq;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="neon-teal overflow-hidden rounded-2xl border border-pine/10 bg-white dark:border-white/10 dark:bg-night/40"
      animate={{ borderColor: isOpen ? "rgba(0, 128, 96, 0.2)" : "rgba(0, 0, 0, 0.1)" }}
    >
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-pine/[0.02] dark:hover:bg-white/[0.02]"
      >
        <span className="font-semibold text-pine dark:text-white">
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <PlusMark
            className="h-5 w-5 text-teal"
            strokeWidth={3}
          />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-pine/10 dark:border-white/10"
          >
            <p className="px-6 py-4 text-sm leading-relaxed text-stone dark:text-white/60">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
