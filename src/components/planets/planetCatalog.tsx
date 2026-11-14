import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { FaqList } from "@/components/planets/FaqList";
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
      <StaggerGroup as="ol" className="space-y-8">
        {siteContent.steps.map((step, index) => (
          <StaggerItem key={step.title} as="li" className="relative flex gap-5">
            {index < siteContent.steps.length - 1 ? (
              <motion.span
                aria-hidden="true"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.7 + index * 0.15, duration: 0.7, ease: "easeOut" }}
                className="absolute left-5 top-11 -bottom-8 w-px origin-top bg-gradient-to-b from-[#b5f5da]/70 to-transparent"
              />
            ) : null}

            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.25 + index * 0.15 }}
              className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint font-serif text-xl font-semibold text-[#3d2a52] shadow-[0_0_18px_rgba(181,245,218,0.45)]"
            >
              {index + 1}
            </motion.span>

            <div>
              <h3 className="font-serif text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 leading-relaxed text-ink-muted">{step.description}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    ),
  },
  {
    id: "features",
    label: "Features",
    title: "Features",
    palette: { light: "#ffd1e5", dark: "#f7a3c9", hasRing: true },
    content: (
      <StaggerGroup as="ul" className="grid gap-4">
        {siteContent.features.map((feature) => (
          <StaggerItem
            key={feature.title}
            as="li"
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
          >
            <h3 className="font-serif text-xl font-semibold text-ink">{feature.title}</h3>
            <p className="mt-1.5 leading-relaxed text-ink-muted">{feature.description}</p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    ),
  },
  {
    id: "plans",
    label: "Plans",
    title: siteContent.plan.name,
    palette: { light: "#fff3b8", dark: "#ffd98a", hasRing: false },
    content: (
      <StaggerGroup className="space-y-6">
        <StaggerItem>
          <p className="text-lg leading-relaxed text-ink">{siteContent.plan.tagline}</p>
        </StaggerItem>

        <StaggerItem>
          <motion.article
            initial={{ scale: 0.94 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 160, damping: 20, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6"
          >
            <motion.span
              aria-hidden="true"
              initial={{ left: "-60%" }}
              animate={{ left: "160%" }}
              transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 3.5, delay: 1 }}
              className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            />

            <p className="relative text-sm font-semibold uppercase tracking-[0.2em] text-gold-strong">
              {siteContent.plan.priceLabel}
            </p>

            <StaggerGroup as="ul" className="relative mt-4 space-y-2 text-ink">
              {siteContent.plan.includes.map((item) => (
                <StaggerItem key={item} as="li" className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-strong" aria-hidden="true" />
                  <span>{item}</span>
                </StaggerItem>
              ))}
            </StaggerGroup>

            <motion.a
              href={siteContent.subscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="relative mt-6 inline-block rounded-full bg-sage-strong px-6 py-3 font-semibold text-on-sage shadow-lg"
            >
              {siteContent.plan.cta}
            </motion.a>
          </motion.article>
        </StaggerItem>
      </StaggerGroup>
    ),
  },
  {
    id: "faq",
    label: "FAQ",
    title: "Questions, answered gently",
    palette: { light: "#e3d7ff", dark: "#b9a2f5", hasRing: false },
    content: <FaqList items={siteContent.faq} />,
  },
];