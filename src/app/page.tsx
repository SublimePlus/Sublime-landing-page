import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Ugc } from "@/components/sections/Ugc";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { ProofOfConcept } from "@/components/sections/ProofOfConcept";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Ugc />
      <HowItWorks />
      <Pricing />
      <ProofOfConcept />
      <Faq />
      <FinalCta />
    </>
  );
}
