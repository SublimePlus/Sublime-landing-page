import { PlusMark } from "../PlusMark";
import { Reveal } from "../Reveal";
import { PlusField } from "../PlusField";
import { TopoBackground } from "../TopoBackground";
import { BookMeetingButton } from "../booking/BookMeetingButton";
import { AnimatedSection } from "../AnimatedSection";
import { siteContent } from "@/lib/site-content";

export function FinalCta() {
  return (
    <AnimatedSection
      id="contact"
      className="relative overflow-hidden py-24 text-center"
    >
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <PlusField density="heavy" className="text-lime/60 dark:text-lime/25" />
      <Reveal className="relative mx-auto max-w-2xl px-6">
        {/* SOP-S01 §5.2 — the qualifying question, asked back to the visitor. */}
        <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
          {siteContent.finalCta.heading}
        </h2>
        {/* SOP-S01 §10 — 30–45 minutes on Google Meet; §10.2–10.4 set the agenda. */}
        <p className="mt-4 text-stone dark:text-white/60">
          {siteContent.finalCta.text}
        </p>
        <BookMeetingButton className="neon-lime-btn mt-8 inline-flex items-center gap-2 rounded-full bg-lime px-8 py-3.5 font-semibold text-pine transition-transform hover:scale-[1.03]">
          {siteContent.finalCta.button}
          <PlusMark className="h-4 w-4" strokeWidth={3} />
        </BookMeetingButton>
      </Reveal>
    </AnimatedSection>
  );
}
