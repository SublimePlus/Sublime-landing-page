import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Ugc } from "@/components/sections/Ugc";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Differentiators } from "@/components/sections/Differentiators";
import { Pricing } from "@/components/sections/Pricing";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Ugc />
      <HowItWorks />
      <Differentiators />
      <Pricing />
      <BlogPreview />
      <FinalCta />
    </>
  );
}
