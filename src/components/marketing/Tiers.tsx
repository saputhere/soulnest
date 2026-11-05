import { Check } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { siteContent } from "@/content/siteContent";

export function Tiers() {
  return (
    <section id="plans" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-strong">Plans</p>
          <h2 className="mt-4 font-serif text-4xl font-semibold text-ink md:text-5xl">
            Choose the amount of love that fits you
          </h2>
          <p className="mt-4 text-ink-muted">{siteContent.tiers.priceLabel}.</p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {siteContent.tiers.items.map((tier, index) => (
            <Reveal key={tier.name} delay={index * 0.1} className="h-full">
              <article className="flex h-full flex-col rounded-[2rem] border border-line bg-raised p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <h3 className="font-serif text-3xl font-semibold text-ink">{tier.name}</h3>
                <p className="mt-2 text-ink-muted">{tier.tagline}</p>

                <ul className="mt-8 flex-1 space-y-3">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-ink">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-sage-strong" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#waitlist"
                  className="mt-8 block rounded-full border border-sage-strong px-6 py-3 text-center font-semibold text-sage-strong transition hover:bg-sage-strong hover:text-on-sage"
                >
                  Join the waitlist for {tier.name}
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}