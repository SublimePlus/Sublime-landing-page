import { PlusMark } from "../PlusMark";
import { Reveal } from "../Reveal";
import { BookMeetingButton } from "../booking/BookMeetingButton";
import { AnimatedSection } from "../AnimatedSection";

export function FinalCta() {
  return (
    <AnimatedSection id="contact" fade="in" className="relative overflow-hidden bg-pine py-28 text-white">
      <PlusTexture />
      <Reveal className="relative mx-auto max-w-2xl px-6 text-center">
        {/* SOP-S01 §5.2 — the qualifying question, asked back to the visitor. */}
        <h2 className="text-3xl font-bold sm:text-4xl">
          Find out what AI says about you.
        </h2>
        {/* SOP-S01 §10 — 30–45 minutes on Google Meet; §10.2–10.4 set the agenda. */}
        <p className="mt-4 text-white/70">
          One 30–45 minute call on Google Meet. We&apos;ll go through your goals,
          show you how Reddit moves your search and AI visibility, and walk you
          through the packages and prices.
        </p>
        <BookMeetingButton className="neon-lime-btn mt-8 inline-flex items-center gap-2 rounded-full bg-lime px-8 py-3.5 font-semibold text-pine transition-transform hover:scale-[1.03]">
          Book a discovery call
          <PlusMark className="h-4 w-4" strokeWidth={3} />
        </BookMeetingButton>
      </Reveal>
    </AnimatedSection>
  );
}

function PlusTexture() {
  const marks = Array.from({ length: 18 });
  return (
    <div className="pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true">
      {marks.map((_, i) => (
        <span
          key={i}
          className="absolute text-3xl font-bold text-lime"
          style={{
            top: `${(i * 41) % 100}%`,
            left: `${(i * 29) % 100}%`,
            transform: `rotate(${(i * 23) % 45}deg)`,
          }}
        >
          +
        </span>
      ))}
    </div>
  );
}
