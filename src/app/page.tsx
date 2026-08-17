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
 * `SectionFade` only appears where a real colour change happens, and only there.
 * The dark hero into the light services section is the one hard edge on the
 * page, so it gets a tall bleed plus a soft shade to keep it from reading as a
 * drawn line. Sections that already share a background need nothing between
 * them; adding a seam there was what produced the visible band before.
 */
export default function Home() {
  return (
    <>
      <JsonLd schema={serviceSchema} />
      <JsonLd schema={faqSchema(faqs)} />

      <Hero />
      <SectionFade from="var(--color-pine)" shadow />

      <Services />
      <Ugc />
      <HowItWorks />
      <Pricing />
      <Faq />
      {/* Light FAQ background ramping into the dark closing section, so the
          page does not end on a hard band above the footer. */}
      <SectionFade
        from="color-mix(in srgb, var(--color-pine) 3%, var(--background))"
        to="var(--color-pine)"
      />

      <FinalCta />
    </>
  );
}
