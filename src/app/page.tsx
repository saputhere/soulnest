import { Features } from "@/components/marketing/Features";
import { Footer } from "@/components/marketing/Footer";
import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Faq } from "@/components/marketing/Faq";
import { Tiers } from "@/components/marketing/Tiers";
import { WaitlistSection } from "@/components/marketing/WaitlistSection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Tiers />
        <Faq />
        <WaitlistSection />
      </main>
      <Footer />
    </>
  );
}