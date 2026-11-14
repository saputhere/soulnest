import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { BackgroundMusic } from "@/components/audio/BackgroundMusic";
import { CopyrightYear } from "@/components/marketing/CopyrightYear";
import { PlanetNav } from "@/components/planets/PlanetNav";
import { UniverseBackground } from "@/components/universe/UniverseBackground";
import { siteContent } from "@/content/siteContent";

export default function HomePage() {
  return (
    <div className="dark relative h-dvh overflow-hidden bg-canvas text-ink">
      <UniverseBackground />

      <div className="relative z-10 flex h-full flex-col">
        <header className="relative flex flex-col items-center gap-5 px-6 pt-6 sm:pt-8">
          <div className="flex flex-col items-center gap-3 sm:absolute sm:right-10 sm:top-8">
            <Logo height={52} />
            <BackgroundMusic />
          </div>

          <PlanetNav />
        </header>

        <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-raised/60 px-4 py-1.5 text-sm font-medium text-ink-muted backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold-strong" aria-hidden="true" />
            {siteContent.hero.badge}
          </span>

          <h1 className="mt-6 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl lg:text-6xl">
            {siteContent.hero.headline}
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            {siteContent.hero.subheadline}
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href={siteContent.subscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-sage-strong px-8 py-4 text-base font-semibold text-on-sage shadow-lg transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {siteContent.hero.primaryCta}
            </a>

            <Link
              href="/community"
              className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Visit the Community
            </Link>
          </div>

          <p className="mt-5 text-sm tracking-wide text-ink-muted">{siteContent.plan.name}</p>
        </main>

        <footer className="flex flex-col items-center gap-1 pb-6 text-xs text-ink-muted">
          <p>{siteContent.footer.tagline}</p>
          <p>
            © <CopyrightYear /> {siteContent.brand.name}
          </p>
        </footer>
      </div>
    </div>
  );
}