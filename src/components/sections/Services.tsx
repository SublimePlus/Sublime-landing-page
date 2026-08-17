"use client";

import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";
import { PlusField } from "../PlusField";
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
      "Threads that rank in search and shift what AI says about you, plus comments and replies inside conversations already happening.",
    icon: EditIcon,
  },
  {
    // SOP-009 §6.1 and SOP-001 §4.1 both list blogs as a deliverable type.
    title: "Blogs & Long-Form",
    description:
      "Long-form articles written from your approved plan, then read line by line before they reach you.",
    icon: DocIcon,
  },
  {
    // SOP-002 §5.1 — the content plan and everything it must contain.
    title: "Content Planning",
    description:
      "Where to post, what to say, when, and in whose voice. Written down and approved before anything is made.",
    icon: CalendarIcon,
  },
  {
    // SOP-001 §5 — the pre-meeting research phase, item by item.
    title: "Brand & Visibility Research",
    description:
      "Your site, socials, reviews and SEO, plus what ChatGPT, Claude, Gemini and Perplexity say about you today.",
    icon: ChartIcon,
  },
  {
    // SOP-004 §5–7 — posting, platform compliance and CM verification.
    title: "Posting & Platform Compliance",
    description:
      "Posted to fit each subreddit's rules and culture, then checked live so nothing sits in a spam filter.",
    icon: ChatIcon,
  },
  {
    // SOP-U01 §4 — the four UGC product lines, detailed in the section below.
    title: "UGC Visual Content",
    description:
      "Product imagery, AI models, brand ambassadors and sponsored creator posts. No photoshoot required.",
    icon: SparkIcon,
  },
];

export function Services() {
  return (
    <AnimatedSection id="services" className="relative flex min-h-svh flex-col justify-center overflow-hidden py-20">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <PlusField density="heavy" className="text-lime/60 dark:text-lime/25" />
      <div className="relative mx-auto max-w-6xl px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-ink">
          What we do
        </p>
        <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
          Everything, handled.
        </h2>
        <p className="mt-3 text-stone dark:text-white/60">
          Six services. Each one a written process, run the same way every time.
        </p>
      </Reveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <Reveal key={service.title} delay={i * 0.08}>
            <ServiceCard service={service} />
          </Reveal>
        ))}
      </div>
      </div>
    </AnimatedSection>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const { x, y, onMouseMove } = useSpotlight();

  return (
    <motion.div
      onMouseMove={onMouseMove}
      whileHover={{ y: -6, rotate: -0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="neon-teal group relative h-full overflow-hidden rounded-2xl border border-pine/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-night/40"
    >
      <SpotlightOverlay x={x} y={y} />
      <div className="relative z-10">
        <motion.span
          whileHover={{ scale: 1.12, rotate: 6 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
          className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal text-white"
        >
          <service.icon className="h-[18px] w-[18px]" />
        </motion.span>
        <h3 className="text-base font-semibold text-pine dark:text-white">
          {service.title}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-stone dark:text-white/60">
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
