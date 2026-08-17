import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Ugc } from "@/components/sections/Ugc";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { SectionFade } from "@/components/AnimatedSection";
import { JsonLd, faqSchema, serviceSchema } from "@/components/JsonLd";
import { faqs } from "@/lib/faq";

/**
 * Section order runs: hook, what we do, what it looks like, how it works, what
 * it costs, objections, ask. The FAQ sits directly before the final call to
 * action so the last thing a visitor reads before booking is the answer to
 * whatever was holding them back.
 *
 * The middle sections carry no background of their own, so there is nothing to
 * seam between them: they sit on the page background and the boundaries simply
 * do not exist. Only the two dark blocks need a transition, and each gets one.
 */
export default function Home() {
  return (
    <>
      <JsonLd schema={serviceSchema} />
      <JsonLd schema={faqSchema(faqs)} />

      <Hero />
      <SectionFade from="var(--color-pine)" to="var(--background)" />

      <Services />
      <Ugc />
      <HowItWorks />
      <Pricing />
      <Faq />
      {/* Light page background ramping into the dark closing block, so the
          page does not end on a hard band. */}
      <SectionFade from="var(--background)" to="var(--color-pine)" />

      <FinalCta />
    </>
  );
}
