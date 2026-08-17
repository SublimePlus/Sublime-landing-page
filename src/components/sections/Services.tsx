"use client";

import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { PlusMark } from "../PlusMark";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";
import { useSpotlight, SpotlightOverlay } from "../SpotlightCard";

type Service = {
  title: string;
  description: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

/**
 * Every card below states a service that is documented in an SOP. Nothing here
 * is aspirational: the SOP reference on each entry is the source of truth, and
 * a service with no SOP behind it does not belong on this page.
 */
const services: Service[] = [
  {
    // SOP-002 §4 — Posts, Comments, Replies as the three content types.
    title: "Reddit Posts, Comments & Replies",
    description:
      "Original threads built to rank in search and shape LLM perception, contextual comments inside existing threads, and follow-up replies that build credibility.",
    icon: EditIcon,
  },
  {
    // SOP-009 §6.1 and SOP-001 §4.1 both list blogs as a deliverable type.
    title: "Blogs & Long-Form",
    description:
      "Long-form articles drafted from your approved content plan and client context, reviewed line by line before they reach you.",
    icon: DocIcon,
  },
  {
    // SOP-002 §5.1 — the content plan and everything it must contain.
    title: "Content Planning",
    description:
      "A written plan covering target subreddits and platforms, topic themes, posting schedule, tone and style notes, and your key messaging points.",
    icon: CalendarIcon,
  },
  {
    // SOP-001 §5 — the pre-meeting research phase, item by item.
    title: "Brand & Visibility Research",
    description:
      "Web research, a social audit, review-site analysis, an SEO snapshot, and an LLM perception check across ChatGPT, Claude, Gemini and Perplexity.",
    icon: ChartIcon,
  },
  {
    // SOP-004 §5–7 — posting, platform compliance and CM verification.
    title: "Posting & Platform Compliance",
    description:
      "Approved content posted so it reads as native to its subreddit, checked against that subreddit's rules, then verified live and logged with its link.",
    icon: ChatIcon,
  },
  {
    // SOP-U01 §4 — the four UGC product lines, detailed in the section below.
    title: "UGC Visual Content",
    description:
      "Four AI-generated visual product lines — faceless content, AI avatar models, brand ambassadors, and sponsored AI influencer posts.",
    icon: SparkIcon,
  },
];

export function Services() {
  return (
    <AnimatedSection id="services" className="relative overflow-hidden py-28">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <div className="relative mx-auto max-w-6xl px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-ink">
          What we do
        </p>
        <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
          What Sublime+ actually delivers.
        </h2>
        <p className="mt-4 text-stone dark:text-white/60">
          Every service below is a documented Sublime+ process. If it is not in
          our SOPs, we do not put it on this page.
        </p>
      </Reveal>
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <Reveal key={service.title} delay={i * 0.08}>
            <ServiceCard service={service} />
          </Reveal>
        ))}
      </div>

      <Commitments />
      </div>
    </AnimatedSection>
  );
}

/**
 * Formerly the standalone "Why Sublime+" section. Merged in here because the
 * two were answering the same question from opposite ends — what we do, and
 * what we promise about how we do it — and reading better as one block.
 *
 * Each point is a commitment written into an SOP, not a marketing claim. The
 * previous version of this list asserted "real engagement from real people",
 * which directly contradicts SOP-009's AI-assisted model.
 */
const commitments = [
  // SOP-001 §6.2.1 and SOP-U01 §3 — one CM owns the relationship.
  "One Customer Manager owns your account end to end — your single point of contact from onboarding onwards",
  // SOP-001 §5.5 — the LLM perception check, run before anything is written.
  "We show you how ChatGPT, Claude, Gemini and Perplexity describe your brand today, before we write a word",
  // SOP-002 §8.3 — the hard approval gate.
  "Nothing is published until you approve it in writing. No exceptions",
  // SOP-009 §4 and §8 — AI drafts, humans are accountable.
  "AI gives us speed; a human reads and verifies every draft before it reaches you, and carries the accountability for it",
  // SOP-007 §4 — the core ethical principles.
  "No fabricated statistics, testimonials or reviews, no astroturfing, and no fake negative feedback about your competitors",
];

function Commitments() {
  return (
    <Reveal delay={0.2} className="mt-20">
      <div className="rounded-3xl border border-pine/10 bg-pine/[0.02] p-8 sm:p-12 dark:border-white/10 dark:bg-white/[0.03]">
        <h3 className="text-2xl font-bold text-pine sm:text-3xl dark:text-white">
          And five things we put in writing.
        </h3>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {commitments.map((point, i) => (
            <li
              key={point}
              // The odd fifth point spans the full width rather than leaving a
              // ragged gap beside it.
              className={`flex items-start gap-3 ${
                i === commitments.length - 1 ? "sm:col-span-2" : ""
              }`}
            >
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal dark:bg-white/10 dark:text-lime">
                <PlusMark className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="text-sm leading-relaxed text-stone dark:text-white/70">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const { x, y, onMouseMove } = useSpotlight();

  return (
    <motion.div
      onMouseMove={onMouseMove}
      whileHover={{ y: -6, rotate: -0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="neon-teal group relative h-full overflow-hidden rounded-2xl border border-pine/10 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-night/40"
    >
      <SpotlightOverlay x={x} y={y} />
      <div className="relative z-10">
        <motion.span
          whileHover={{ scale: 1.12, rotate: 6 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
          className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-teal text-white"
        >
          <service.icon className="h-5 w-5" />
        </motion.span>
        <h3 className="text-lg font-semibold text-pine dark:text-white">
          {service.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-stone dark:text-white/60">
          {service.description}
        </p>
      </div>
    </motion.div>
  );
}

function iconProps(className?: string) {
  return {
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 20h4l11-11-4-4L4 16v4z" />
      <path d="M14.5 5.5l4 4" />
    </svg>
  );
}
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </svg>
  );
}
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
    </svg>
  );
}
function ChartIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M5 20V10M12 20V4M19 20v-7" />
    </svg>
  );
}
function DocIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}
function SparkIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
