import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { siteContent } from "@/content/siteContent";

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 bg-surface py-24">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-strong">FAQ</p>
          <h2 className="mt-4 font-serif text-4xl font-semibold text-ink md:text-5xl">Questions, answered gently</h2>
        </Reveal>

        <div className="mt-12 space-y-4">
          {siteContent.faq.map((item) => (
            <Reveal key={item.question}>
              <details className="group rounded-2xl border border-line bg-raised p-6 open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink marker:hidden">
                  {item.question}
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-ink-muted transition group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-4 leading-relaxed text-ink-muted">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}