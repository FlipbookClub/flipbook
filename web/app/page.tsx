import { Nav } from "@/components/Nav";
import { Comparison } from "@/components/sections/Comparison";
import { CreatorCard } from "@/components/sections/CreatorCard";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";
import { FounderNote } from "@/components/sections/FounderNote";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Marquee } from "@/components/sections/Marquee";
import { Pillars } from "@/components/sections/Pillars";
import { Problem } from "@/components/sections/Problem";
import { ThreeModes } from "@/components/sections/ThreeModes";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Problem />
        <Comparison />
        <Pillars />
        <HowItWorks />
        <ThreeModes />
        <FounderNote />
        <CreatorCard />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
