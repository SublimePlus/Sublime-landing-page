"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Scroll-snap carousel.
 *
 * Built on native overflow scrolling rather than a carousel library, because
 * the browser already gives us momentum, touch, trackpad and keyboard scrolling
 * for free — and gets them right on every device. The arrows and dots drive
 * `scrollTo` on the same container, so mouse users and touch users are moving
 * the identical thing.
 *
 * Accessibility: the track is a labelled, focusable region so keyboard users
 * can reach it and arrow-key through, and the buttons disable at the ends
 * instead of silently doing nothing.
 */
export function Carousel({
  children,
  label,
}: {
  children: React.ReactNode[];
  label: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const slide = el.scrollWidth / children.length;
    setActive(Math.round(el.scrollLeft / slide));
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, [children.length]);

  useEffect(() => {
    sync();
  }, [sync]);

  const scrollTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const slide = el.scrollWidth / children.length;
    el.scrollTo({ left: slide * index, behavior: "smooth" });
  };

  const step = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={sync}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, i) => (
          <div
            key={i}
            className="h-[420px] w-[280px] flex-shrink-0 snap-start sm:h-[460px] sm:w-[320px]"
          >
            {child}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <ArrowButton
          direction="prev"
          onClick={() => step(-1)}
          disabled={atStart}
        />
        <div className="flex items-center gap-2">
          {children.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1} of ${children.length}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === active
                  ? "w-6 bg-teal dark:bg-lime"
                  : "w-2 bg-pine/20 hover:bg-pine/40 dark:bg-white/25 dark:hover:bg-white/50"
              }`}
            />
          ))}
        </div>
        <ArrowButton direction="next" onClick={() => step(1)} disabled={atEnd} />
      </div>
    </div>
  );
}

function ArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous slides" : "Next slides"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-pine/15 text-pine transition-all hover:border-teal hover:text-teal disabled:opacity-30 disabled:hover:border-pine/15 disabled:hover:text-pine dark:border-white/20 dark:text-white dark:hover:border-lime dark:hover:text-lime dark:disabled:hover:border-white/20 dark:disabled:hover:text-white"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-4 w-4 ${direction === "prev" ? "rotate-180" : ""}`}
        aria-hidden="true"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}
