"use client";

import Image from "next/image";
import { PlusMark } from "../PlusMark";

/**
 * Themed card with a coloured glow, a gradient scrim and a parallax zoom on
 * hover. Adapted from the destination-card pattern to this codebase's stack:
 * `next/image` instead of a CSS background (so images are optimised and reserve
 * their own space), an inline arrow instead of pulling in an icon package, and
 * template literals instead of `cn` — this project is not on shadcn, and adding
 * it for one card would not pay for itself.
 *
 * `imageUrl` is optional on purpose. Until real deliverables exist, the card
 * renders a branded panel rather than stock photography: a stock photo sitting
 * under a "here's our work" heading is a fabricated work sample, which SOP-007
 * §4 rules out. The placeholder is designed to look deliberate, not broken.
 *
 * `themeColor` is an HSL triple, e.g. "158 39% 39%" for the brand teal.
 */
export function ShowcaseCard({
  imageUrl,
  category,
  title,
  meta,
  themeColor,
  priority = false,
}: {
  imageUrl?: string;
  /** Small label above the title — the product line this belongs to. */
  category: string;
  title: string;
  meta: string;
  themeColor: string;
  priority?: boolean;
}) {
  return (
    <div
      style={{ "--theme": themeColor } as React.CSSProperties}
      className="group h-full w-full"
    >
      <div
        className="relative block h-full w-full overflow-hidden rounded-2xl transition-all duration-500 ease-out group-hover:scale-[1.03] group-hover:shadow-[0_0_60px_-15px_hsl(var(--theme)/0.7)]"
        style={{ boxShadow: "0 0 40px -18px hsl(var(--theme) / 0.5)" }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 320px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            priority={priority}
          />
        ) : (
          <PlaceholderArt />
        )}

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, hsl(var(--theme) / 0.94), hsl(var(--theme) / 0.6) 34%, hsl(var(--theme) / 0.15) 70%)",
          }}
        />

        <div className="relative flex h-full flex-col justify-end p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
            {category}
          </p>
          <h3 className="mt-1.5 text-2xl font-bold leading-tight tracking-tight">
            {title}
          </h3>
          <p className="mt-1 text-sm font-medium leading-snug text-white/75">
            {meta}
          </p>

          <div className="mt-6 flex items-center justify-between rounded-lg border border-white/25 bg-white/10 px-4 py-3 backdrop-blur-md transition-all duration-300 group-hover:border-white/40 group-hover:bg-white/20">
            <span className="text-sm font-semibold tracking-wide">
              Sample coming soon
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Branded stand-in used until a real deliverable is dropped in. */
function PlaceholderArt() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-110"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, hsl(var(--theme) / 0.55), hsl(var(--theme) / 0.95))",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <PlusMark className="h-28 w-28 text-white/10" strokeWidth={2} />
      </div>
      {/* Scattered marks give the panel some texture so it does not read as an
          image that failed to load. */}
      {[
        { top: "14%", left: "18%", size: 20, rotate: -14 },
        { top: "26%", left: "74%", size: 14, rotate: 22 },
        { top: "44%", left: "12%", size: 12, rotate: 8 },
        { top: "58%", left: "82%", size: 18, rotate: -20 },
      ].map((m, i) => (
        <PlusMark
          key={i}
          className="absolute text-white/15"
          strokeWidth={3}
          style={{
            top: m.top,
            left: m.left,
            width: m.size,
            height: m.size,
            transform: `rotate(${m.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
