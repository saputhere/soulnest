import { Reveal } from "@/components/motion/Reveal";
import { siteContent } from "@/content/siteContent";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-strong">How it works</p>
          <h2 className="mt-4 font-serif text-4xl font-semibold text-ink md:text-5xl">
            Three gentle steps to happier days
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {siteContent.steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.1} className="h-full">
              <article className="h-full text-center">
                <span
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line bg-raised font-serif text-2xl font-semibold text-sage-strong"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <h3 className="mt-6 font-serif text-2xl font-semibold text-ink">{step.title}</h3>
                <p className="mx-auto mt-3 max-w-xs leading-relaxed text-ink-muted">{step.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}