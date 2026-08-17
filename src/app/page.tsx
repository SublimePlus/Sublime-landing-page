import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Ugc } from "@/components/sections/Ugc";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { JsonLd, faqSchema, serviceSchema } from "@/components/JsonLd";
import { faqs } from "@/lib/faq";

/**
 * Section order runs: what it is → what we sell → how it works → what it costs
 * → objections → ask. The FAQ sits directly before the final call to action so
 * the last thing a visitor reads before booking is the answer to whatever was
 * holding them back.
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
      <Services />
      <Ugc />
      <HowItWorks />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
