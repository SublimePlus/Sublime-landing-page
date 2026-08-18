"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PlusMark } from "../PlusMark";

/**
 * Split carousel: a vertical list of titles on the left that scrolls the
 * active one into the centre, and a stacked card deck on the right that swaps
 * as the selection changes.
 *
 * Adapted from the feature-carousel pattern to this codebase's stack. The
 * original pulls in `motion/react`, `@hugeicons/react` and a `cn` helper; this
 * project already has framer-motion, ships its own icons and is not on shadcn,
 * so bringing in three packages for one component would not pay for itself.
 *
 * `image` is optional on every slide. Without one, the card renders a branded
 * panel: presenting stock photography under a "what we make" heading would be
 * a fabricated work sample, which SOP-007 §4 rules out.
 */
export type Feature = {
  id: string;
  label: string;
  description: string;
  image?: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

const AUTOPLAY_MS = 4200;
const ITEM_HEIGHT = 64;

/** Shortest signed distance from `index` to the active item on a ring. */
function ringOffset(index: number, active: number, length: number) {
  let d = index - active;
  if (d > length / 2) d -= length;
  if (d < -length / 2) d += length;
  return d;
}

export function FeatureCarousel({ features }: { features: Feature[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(
    () => setActive((i) => (i + 1) % features.length),
    [features.length]
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [next, paused]);

  return (
    <div
      className="glass-panel relative flex min-h-[560px] flex-col overflow-hidden rounded-[2rem] lg:min-h-[480px] lg:flex-row"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Left: the title rail */}
      <div className="relative flex min-h-[280px] w-full items-center justify-center overflow-hidden bg-pine px-8 lg:w-[42%] lg:justify-start lg:px-12">
        {/* Feathered top and bottom so items enter and leave rather than clip. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-pine to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-pine to-transparent" />

        <div className="relative flex h-full w-full items-center justify-center lg:justify-start">
          {features.map((feature, i) => {
            const offset = ringOffset(i, active, features.length);
            const isActive = offset === 0;
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.id}
                className="absolute flex items-center"
                style={{ height: ITEM_HEIGHT }}
                animate={{
                  y: offset * ITEM_HEIGHT,
                  opacity: 1 - Math.min(Math.abs(offset) * 0.3, 0.75),
                }}
                transition={{ type: "spring", stiffness: 90, damping: 22 }}
              >
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={isActive}
                  className={`flex items-center gap-3 rounded-full border px-6 py-3.5 text-left transition-colors duration-500 ${
                    isActive
                      ? "border-lime bg-lime text-pine"
                      : "border-white/20 bg-transparent text-white/60 hover:border-white/45 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap text-sm font-semibold uppercase tracking-wide">
                    {feature.label}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Right: the card deck */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-14 lg:px-10">
        <div className="relative flex aspect-[4/5] w-full max-w-[340px] items-center justify-center">
          {features.map((feature, i) => {
            const offset = ringOffset(i, active, features.length);
            const isActive = offset === 0;
            const isNeighbour = Math.abs(offset) === 1;

            return (
              <motion.div
                key={feature.id}
                initial={false}
                animate={{
                  x: isActive ? 0 : offset < 0 ? -90 : 90,
                  scale: isActive ? 1 : isNeighbour ? 0.86 : 0.7,
                  opacity: isActive ? 1 : isNeighbour ? 0.35 : 0,
                  rotate: isActive ? 0 : offset < 0 ? -3 : 3,
                  zIndex: isActive ? 20 : isNeighbour ? 10 : 0,
                }}
                transition={{ type: "spring", stiffness: 240, damping: 26 }}
                className="absolute inset-0 overflow-hidden rounded-[1.75rem] bg-pine"
              >
                {feature.image ? (
                  <Image
                    src={feature.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 80vw, 340px"
                    className={`object-cover transition-all duration-700 ${
                      isActive ? "grayscale-0 blur-0" : "grayscale blur-[2px]"
                    }`}
                  />
                ) : (
                  <PlaceholderArt index={i} />
                )}

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-night/95 via-night/50 to-transparent p-7 pt-28"
                    >
                      <span className="mb-3 w-fit rounded-full bg-lime px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-pine">
                        {i + 1} · {feature.label}
                      </span>
                      <p className="text-lg font-semibold leading-snug tracking-tight text-white">
                        {feature.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Branded stand-in used until a real deliverable is dropped in. */
function PlaceholderArt({ index }: { index: number }) {
  const tints = [
    "158 39% 34%",
    "168 34% 27%",
    "146 45% 23%",
    "174 32% 20%",
  ];
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        background: `radial-gradient(120% 90% at 50% 0%, hsl(${
          tints[index % tints.length]
        } / 0.7), hsl(${tints[index % tints.length]}))`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <PlusMark className="h-24 w-24 text-white/10" strokeWidth={2} />
      </div>
    </div>
  );
}
