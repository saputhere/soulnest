import Link from "next/link";
import { Suspense } from "react";
import { AdminContent } from "./AdminContent";

interface PageProps {
  readonly searchParams: Promise<{ from?: string; to?: string; status?: string }>;
}

const NAV_LINK =
  "inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white";

export default function AdminPage({ searchParams }: PageProps) {
  return (
    <div className="dark min-h-dvh bg-canvas text-ink">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-6 sm:pt-8">
        <nav aria-label="Admin" className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Admin</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/packing" className={NAV_LINK}>
              Packing list
            </Link>
            <Link href="/" className={NAV_LINK}>
              Home
            </Link>
          </div>
        </nav>

        <Suspense fallback={<div className="mt-10 h-64 animate-pulse rounded-3xl bg-white/5" aria-busy="true" />}>
          <AdminContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}