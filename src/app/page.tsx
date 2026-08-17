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
 * Section order runs: hook → what we do → what it looks like → how it works →
 * what it costs → objections → ask. The FAQ sits directly before the final call
 * to action so the last thing a visitor reads before booking is the answer to
 * whatever was holding them back.
 *
 * `SectionFade` bleeds each section's background into the next so the seams
 * read as gradients rather than hard lines. Each fade is coloured for the pair
 * it sits between, which is why they are declared here rather than baked into
 * the sections — only the page knows what follows what.
 *
 * The blog preview was removed from this page; /blog and its posts still exist
 * and are still linked from the nav and footer.
 */
export default function Home() {
  return (
    <>
      <JsonLd schema={serviceSchema} />
      <JsonLd schema={faqSchema(faqs)} />

      <Hero />
      {/* Dark hero settling into the light services section. */}
      <SectionFade className="-mt-24 from-pine to-transparent dark:from-pine dark:to-transparent" />

      <Services />
      <SectionFade className="from-transparent to-transparent" />

      <Ugc />
      <SectionFade className="from-transparent to-pine/[0.03] dark:to-white/[0.03]" />

      <HowItWorks />
      <SectionFade className="from-pine/[0.03] to-pine/[0.03] dark:from-white/[0.03] dark:to-white/[0.03]" />

      <Pricing />
      <SectionFade className="from-pine/[0.03] to-pine/[0.03] dark:from-white/[0.03] dark:to-white/[0.03]" />

      <Faq />
      <SectionFade className="from-pine/[0.03] to-pine dark:from-white/[0.03] dark:to-pine" />

      <FinalCta />
    </>
  );
}
