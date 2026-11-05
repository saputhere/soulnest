import { Gift, Heart, Mail, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { siteContent } from "@/content/siteContent";

const { hero } = siteContent;

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 -z-10 h-[28rem] w-[28rem] rounded-[45%] bg-rose/30 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 -z-10 h-[30rem] w-[30rem] rounded-[55%] bg-sage/30 blur-3xl" aria-hidden="true" />

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-24 md:grid-cols-2 md:py-32">
        <div className="text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-raised px-4 py-1.5 text-sm font-medium text-ink-muted">
            <span className="h-2 w-2 rounded-full bg-sage-strong" aria-hidden="true" />
            {hero.badge}
          </span>

          <h1 className="mt-8 font-serif text-5xl font-semibold leading-[1.05] text-ink md:text-7xl">
            {hero.headline}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-muted md:mx-0">
            {hero.subheadline}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
            <a
              href="#waitlist"
              className="rounded-full bg-sage-strong px-8 py-4 text-base font-semibold text-on-sage shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              {hero.primaryCta}
            </a>
            <a
              href="#features"
              className="rounded-full border border-line bg-raised px-8 py-4 text-base font-semibold text-ink transition hover:-translate-y-0.5 hover:border-sage-strong"
            >
              {hero.secondaryCta}
            </a>
          </div>
        </div>

        <div className="relative mx-auto h-[26rem] w-full max-w-md" aria-hidden="true">
          <div className="absolute inset-6 rounded-[2.5rem] bg-gradient-to-br from-raised to-surface shadow-xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <LogoMark className="h-40 w-40 text-sage-strong" />
          </div>

          <span className="absolute left-2 top-10 flex h-16 w-16 animate-float items-center justify-center rounded-2xl bg-raised text-rose-strong shadow-lg">
            <Mail className="h-7 w-7" />
          </span>
          <span className="absolute right-0 top-4 flex h-14 w-14 animate-float items-center justify-center rounded-full bg-raised text-gold-strong shadow-lg">
            <Sparkles className="h-6 w-6" />
          </span>
          <span className="absolute bottom-10 left-6 flex h-14 w-14 animate-float items-center justify-center rounded-full bg-raised text-rose-strong shadow-lg">
            <Heart className="h-6 w-6" />
          </span>
          <span className="absolute -bottom-2 right-8 flex h-16 w-16 animate-float items-center justify-center rounded-2xl bg-raised text-sage-strong shadow-lg">
            <Gift className="h-7 w-7" />
          </span>

          <span className="absolute right-20 top-28 h-2 w-2 animate-glow rounded-full bg-gold" />
          <span className="absolute left-16 bottom-28 h-1.5 w-1.5 animate-glow rounded-full bg-gold" />
        </div>
      </div>
    </section>
  );
}