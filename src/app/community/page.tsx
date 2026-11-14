import Link from "next/link";
import { Suspense } from "react";
import { Home, Heart, ShieldCheck } from "lucide-react";
import { AccountChip, NAV_BUTTON } from "./AccountChip";
import { CommunityBackground } from "./CommunityBackground";
import { CommunityContent } from "./CommunityContent";

export default function CommunityPage() {
  return (
    <div className="dark relative min-h-dvh text-ink">
      <CommunityBackground />

      <div className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:pt-8">
        <nav aria-label="Community" className="flex items-center justify-end gap-2">
          <Link href="/" className={NAV_BUTTON}>
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>Home</span>
          </Link>
          <Suspense
            fallback={<div className="h-9 w-28 animate-pulse rounded-full bg-white/5" aria-hidden="true" />}
          >
            <AccountChip />
          </Suspense>
        </nav>

        <header className="mx-auto mt-10 max-w-2xl text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">A circle of care</p>
          <h1 className="mt-3 bg-gradient-to-r from-[#ffd1e5] via-[#e3d7ff] to-[#cfeaff] bg-clip-text font-serif text-4xl font-semibold text-transparent sm:text-5xl">
            Welcome Homies
          </h1>
          <p className="mt-4 flex items-start gap-2 text-white/70">
            <Heart className="mt-1 h-4 w-4 shrink-0 text-[#ffb8d6]" aria-hidden="true" />
            Share ideas and thoughts with people who understand.
          </p>
        </header>

        <aside className="mx-auto mt-8 flex max-w-2xl gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/70 backdrop-blur">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#c9f7e3]" aria-hidden="true" />
          <p>
            This community is for connection, not crisis support. If you&apos;re struggling or thinking about harming
            yourself, please reach out to someone you trust or a local helpline. In Sri Lanka, Sumithrayo can be reached
            on 1333 (please verify current hours before launch).
          </p>
        </aside>

        <Suspense
          fallback={
            <div className="mx-auto mt-10 grid max-w-7xl gap-5 md:grid-cols-3 xl:grid-cols-4" aria-busy="true">
              <div className="h-64 animate-pulse rounded-3xl bg-white/5" />
              <div className="h-64 animate-pulse rounded-3xl bg-white/5" />
              <div className="h-64 animate-pulse rounded-3xl bg-white/5" />
            </div>
          }
        >
          <CommunityContent />
        </Suspense>
      </div>
    </div>
  );
}