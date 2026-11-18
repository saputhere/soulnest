import Link from "next/link";
import { Suspense } from "react";
import { PlayBackdrop } from "@/components/play/PlayKit";
import { GameContent } from "./GameContent";

interface PageProps {
  readonly params: Promise<{ gameId: string }>;
  readonly searchParams: Promise<{ run?: string }>;
}

const NAV_LINK =
  "inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white";

export default function GamePage({ params, searchParams }: PageProps) {
  return (
    <div className="dark relative min-h-dvh overflow-hidden bg-gradient-to-b from-[#241a40] via-[#1e1638] to-[#171230] text-ink">
      <PlayBackdrop />
      <div className="relative mx-auto max-w-2xl px-5 pb-16 pt-6 sm:pt-8">
        <nav aria-label="Game" className="flex items-center justify-between">
          <Link href="/play" className={NAV_LINK}>
            ← All games
          </Link>
        </nav>

        <div className="mt-8">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/5" aria-busy="true" />}>
            <GameContent params={params} searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}