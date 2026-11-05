import { Gift, Heart, Hourglass, Lock, Mail, Sparkles, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { siteContent, type FeatureIcon } from "@/content/siteContent";

const iconByName: Record<FeatureIcon, LucideIcon> = {
  mail: Mail,
  sparkles: Sparkles,
  hourglass: Hourglass,
  lock: Lock,
  heart: Heart,
  gift: Gift,
};

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-strong">Features</p>
          <h2 className="mt-4 font-serif text-4xl font-semibold text-ink md:text-5xl">
            Everything that keeps your heart close
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {siteContent.features.map((feature, index) => {
            const Icon = iconByName[feature.icon];
            return (
              <Reveal key={feature.title} delay={index * 0.05} className="h-full">
                <article className="group h-full rounded-[2rem] border border-line bg-raised p-8 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-sage-strong transition group-hover:scale-105">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 font-serif text-2xl font-semibold text-ink">{feature.title}</h3>
                  <p className="mt-3 leading-relaxed text-ink-muted">{feature.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}