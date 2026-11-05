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
    palette: { light: "#c9f7e3", dark: "#8fe3c0", hasRing: false },
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
    palette: { light: "#ffd1e5", dark: "#f7a3c9", hasRing: true },
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
    title: "Plans",
    palette: { light: "#fff3b8", dark: "#ffd98a", hasRing: false },
    content: (
      <div className="space-y-6">
        <p className="text-ink-muted">{siteContent.tiers.priceLabel}.</p>
        {siteContent.tiers.items.map((tier) => (
          <article key={tier.name} className="rounded-3xl border border-line bg-surface p-6">
            <h3 className="font-serif text-2xl font-semibold text-ink">{tier.name}</h3>
            <p className="mt-1 text-ink-muted">{tier.tagline}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-ink">
              {tier.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    ),
  },
  {
    id: "faq",
    label: "FAQ",
    title: "Questions, answered gently",
    palette: { light: "#e3d7ff", dark: "#b9a2f5", hasRing: false },
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