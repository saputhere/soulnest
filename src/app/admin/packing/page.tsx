import Link from "next/link";
import { Suspense } from "react";
import { PrintButton } from "@/components/admin/PrintButton";
import { PackingContent } from "./PackingContent";

interface PageProps {
  readonly searchParams: Promise<{ from?: string; to?: string }>;
}

/** Hides the dark theme and controls when printing, so the page prints as plain black text on white. */
const PRINT_CSS = `
@media print {
  .packing-page, .packing-page * {
    background: #fff !important;
    color: #000 !important;
    border-color: #999 !important;
    box-shadow: none !important;
  }
  .packing-page { min-height: auto !important; }
  .packing-section { break-inside: avoid; }
  @page { margin: 12mm; }
}
`;

export default function PackingPage({ searchParams }: PageProps) {
  return (
    <div className="dark packing-page min-h-dvh bg-canvas text-ink">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="mx-auto max-w-4xl px-5 pb-16 pt-6 sm:pt-8">
        <nav className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href="/admin" className="text-sm text-white/60 hover:text-white">
            ← Back to deliveries
          </Link>
          <PrintButton />
        </nav>

        <Suspense fallback={<div className="mt-10 h-64 animate-pulse rounded-3xl bg-white/5" aria-busy="true" />}>
          <PackingContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}