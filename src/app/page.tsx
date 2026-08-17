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
      {/* Leaving the dark hero into the light page: pine fades to transparent
          over the page background, so the midtones are sage, not grey. */}
      <SectionFade variant="to-light" />

      <Services />
      <Ugc />
      <HowItWorks />
      <Pricing />
      <Faq />
      {/* Entering the dark closing block from the light page. */}
      <SectionFade variant="to-dark" />

      <FinalCta />
    </>
  );
}
