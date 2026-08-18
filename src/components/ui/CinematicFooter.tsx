"use client";

import Link from "next/link";
import { Logo } from "../PlusMark";
import { Magnetic } from "../CursorReactive";
import { site, socialLinks } from "@/lib/site";

/**
 * Compact footer.
 *
 * The earlier version was a full-height curtain reveal, which left large empty
 * bands above and below the content. This is sized to its content instead: a
 * slim animated marquee, one centred block of brand line, quick links, socials
 * and contact, then a bottom bar. It keeps the dark treatment, the glass pills
 * and the breathing glow, without the dead space.
 */
const MARQUEE_PHRASES = [
  // Each phrase restates something the page already commits to, all SOP-backed.
  "Your approval before anything posts",
  "One Customer Manager, start to finish",
  "Every AI draft read by a human",
  "No fabricated stats or testimonials",
  "Live in 7 to 10 business days",
];

const QUICK_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#ugc", label: "UGC" },
  { href: "/#plans", label: "Plans" },
  { href: "/#faq", label: "FAQ" },
];

export function CinematicFooter() {
  return (
    <footer className="relative overflow-hidden bg-night text-white">
      <AmbientGlow />
      <GridBackdrop />
      <Marquee />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pb-10 pt-24 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
          Content &amp; social marketing,
          <br />
          <span className="text-lime">done with a little extra.</span>
        </h2>

        <nav className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {QUICK_LINKS.map((link) => (
            <Magnetic key={link.href} strength={8}>
              <Link href={link.href} className="glass-pill px-5 py-2.5 text-sm font-semibold">
                {link.label}
              </Link>
            </Magnetic>
          ))}
        </nav>

        <div className="mt-5 flex items-center gap-3">
          {socialLinks.map((s) => (
            <Magnetic key={s.href} strength={8}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="glass-pill flex h-11 w-11 items-center justify-center"
              >
                <SocialIcon name={s.label} />
              </a>
            </Magnetic>
          ))}
        </div>

        <Magnetic strength={10}>
          <a
            href={`mailto:${site.email}?subject=${encodeURIComponent(
              "Enquiry for Sublime+"
            )}&body=${encodeURIComponent(
              "Hi Sublime+,\n\nI'd like to know more about working with you.\n\n"
            )}`}
            className="glass-pill mt-5 inline-flex px-6 py-3 text-sm font-bold text-lime"
          >
            {site.email}
          </a>
        </Magnetic>

        {/* Centred back-to-top, then a balanced credit row underneath. */}
        <div className="mt-10 flex w-full flex-col items-center gap-6 border-t border-white/10 pt-8">
          <Magnetic strength={8}>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="glass-pill group flex h-11 w-11 items-center justify-center"
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

          <div className="flex w-full flex-col items-center justify-between gap-3 sm:flex-row">
            <Logo variant="light" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              © {new Date().getFullYear()} Sublime+. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  const cls = "h-5 w-5";
  if (name === "Instagram") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "Facebook") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 22v-8H16l.5-3h-3V9.2c0-.9.3-1.5 1.6-1.5H16.6V5c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2V11H7.6v3h2.6v8z" />
      </svg>
    );
  }
  // TikTok
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 8.6a6.6 6.6 0 0 1-4.5-1.8v7.9a5.6 5.6 0 1 1-5.6-5.6c.35 0 .69.04 1 .1v2.95a2.65 2.65 0 1 0 1.85 2.53V2h2.8A6.6 6.6 0 0 0 21 5.7z" />
    </svg>
  );
}

function AmbientGlow() {
  return (
    <div
      aria-hidden="true"
      className="footer-breathe pointer-events-none absolute left-1/2 top-1/3 z-0 h-[40vh] w-[70vw] rounded-[50%] blur-[90px]"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(201,242,78,0.14) 0%, rgba(60,134,107,0.12) 42%, transparent 70%)",
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
        maskImage: "linear-gradient(to bottom, transparent, black 40%, black 80%, transparent)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent, black 40%, black 80%, transparent)",
      }}
    />
  );
}

function Marquee() {
  return (
    <div className="relative z-10 w-full overflow-hidden border-b border-white/10 bg-night/60 py-3 backdrop-blur-md">
      <div className="marquee-track flex w-max text-[11px] font-bold uppercase tracking-[0.3em] text-white/40 sm:text-xs">
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
