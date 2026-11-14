import Link from "next/link";
import { Suspense } from "react";
import { AccountContent } from "./AccountContent";

const NAV_BUTTON =
  "inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white";

export default function AccountPage() {
  return (
    <div className="dark min-h-dvh bg-canvas text-ink">
      <div className="mx-auto max-w-3xl px-5 pb-16 pt-6 sm:pt-8">
        <nav aria-label="Account" className="flex items-center justify-end gap-2">
          <Link href="/community" className={NAV_BUTTON}>
            Community
          </Link>
          <Link href="/" className={NAV_BUTTON}>
            Home
          </Link>
        </nav>

        <header className="mt-10">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Your SoulNest</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">Plan your moments</h1>
          <p className="mt-3 text-white/65">Your address, the letters you've planned, and the gifts you're looking forward to.</p>
        </header>

        <Suspense fallback={<div className="mt-10 h-64 animate-pulse rounded-3xl bg-white/5" />}>
          <AccountContent />
        </Suspense>
      </div>
    </div>
  );
}