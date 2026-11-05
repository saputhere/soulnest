import type { ReactNode } from "react";
import { siteContent } from "@/content/siteContent";
import type { PlanetPalette } from "./Planet";

export interface PlanetSection {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly palette: PlanetPalette;
  readonly content: ReactNode;
}

export const planetSections: readonly PlanetSection[] = [
  {
    id: "how-it-works",
    label: "How it works",
    title: "How it works",
    palette: { light: "#bfe6d4", dark: "#4c8a72", hasRing: false },
    content: (
      <ol className="space-y-8">
        {siteContent.steps.map((step, index) => (
          <li key={step.title} className="flex gap-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint font-serif text-xl font-semibold text-[#3d2a52]">
              {index + 1}
            </span>
            <div>
              <h3 className="font-serif text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 leading-relaxed text-ink-muted">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    ),
  },
  {
    id: "features",
    label: "Features",
    title: "Features",
    palette: { light: "#f2c4c0", dark: "#a4645f", hasRing: true },
    content: (
      <ul className="space-y-8">
        {siteContent.features.map((feature) => (
          <li key={feature.title}>
            <h3 className="font-serif text-xl font-semibold text-ink">{feature.title}</h3>
            <p className="mt-1 leading-relaxed text-ink-muted">{feature.description}</p>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "plans",
    label: "Plans",
    title: siteContent.plan.name,
    palette: { light: "#f5e6c4", dark: "#a88a4f", hasRing: false },
    content: (
      <div className="space-y-6">
        <p className="text-lg leading-relaxed text-ink">{siteContent.plan.tagline}</p>
        <article className="rounded-3xl border border-line bg-surface p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-strong">
            {siteContent.plan.priceLabel}
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-ink">
            {siteContent.plan.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <a
            href="#waitlist"
            className="mt-6 inline-block rounded-full bg-sage-strong px-6 py-3 font-semibold text-on-sage"
          >
            {siteContent.plan.cta}
          </a>
        </article>
      </div>
    ),
  },
  {
    id: "faq",
    label: "FAQ",
    title: "Questions, answered gently",
    palette: { light: "#c9bdf0", dark: "#5d4a9a", hasRing: false },
    content: (
      <div className="space-y-6">
        {siteContent.faq.map((item) => (
          <article key={item.question}>
            <h3 className="font-serif text-xl font-semibold text-ink">{item.question}</h3>
            <p className="mt-2 leading-relaxed text-ink-muted">{item.answer}</p>
          </article>
        ))}
      </div>
    ),
  },
];