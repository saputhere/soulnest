import { Reveal } from "@/components/motion/Reveal";
import { siteContent } from "@/content/siteContent";
import { WaitlistForm } from "@/components/marketing/WaitlistForm";

export function WaitlistSection() {
  return (
    <section id="waitlist" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] border border-line bg-raised px-8 py-16 text-center shadow-xl md:px-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rose/30 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-sage/30 blur-3xl" aria-hidden="true" />

          <div className="relative">
            <h2 className="font-serif text-4xl font-semibold text-ink md:text-5xl">
              {siteContent.waitlist.headline}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">
              {siteContent.waitlist.description}
            </p>
            <WaitlistForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}