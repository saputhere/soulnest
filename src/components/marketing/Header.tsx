import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { siteContent } from "@/content/siteContent";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label={`${siteContent.brand.name} home`} className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage-strong">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-8 text-sm font-medium text-ink-muted md:flex">
          {siteContent.nav.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="transition hover:text-ink">
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="#waitlist"
            className="rounded-full bg-sage-strong px-5 py-2.5 text-sm font-semibold text-on-sage shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Join the waitlist
          </a>
        </div>
      </nav>
    </header>
  );
}