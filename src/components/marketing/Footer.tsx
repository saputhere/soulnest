import { Logo } from "@/components/brand/Logo";
import { CopyrightYear } from "@/components/marketing/CopyrightYear";
import { siteContent } from "@/content/siteContent";

export function Footer() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <Logo className="text-xl" />
          <p className="mt-2 text-sm text-ink-muted">{siteContent.footer.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center justify-center gap-6 text-sm text-ink-muted">
            {siteContent.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="transition hover:text-ink">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-sm text-ink-muted">
          © <CopyrightYear /> {siteContent.brand.name}
        </p>
      </div>
    </footer>
  );
}