import { Logo } from "@/components/brand/Logo";
import { CopyrightYear } from "@/components/marketing/CopyrightYear";
import { WaitlistForm } from "@/components/marketing/WaitlistForm";
import { PlanetNav } from "@/components/planets/PlanetNav";
import { UniverseBackground } from "@/components/universe/UniverseBackground";
import { siteContent } from "@/content/siteContent";

export default function HomePage() {
  return (
    <div className="dark relative h-dvh overflow-hidden bg-canvas text-ink">
      <UniverseBackground />

      <div className="relative z-10 flex h-full flex-col">
        <header className="flex flex-col items-center gap-5 px-6 pt-6 sm:pt-8">
          <Logo />
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

          <div className="mt-8 w-full max-w-md">
            <WaitlistForm />
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