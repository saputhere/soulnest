import Link from "next/link";
import { Suspense } from "react";
import { PlayBackdrop, PlayHeader } from "@/components/play/PlayKit";
import { PlayContent } from "./PlayContent";

const NAV_LINK =
  "inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white";

export default function PlayPage() {
  return (
    <div className="dark relative min-h-dvh overflow-hidden bg-gradient-to-b from-[#241a40] via-[#1e1638] to-[#171230] text-ink">
      <PlayBackdrop />
      <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-6 sm:pt-8">
        <nav aria-label="Play" className="flex items-center justify-between">
          <Link href="/" className={NAV_LINK}>
            🏡 Home
          </Link>
        </nav>

        <PlayHeader
          emoji="🌈"
          eyebrow="A quiet corner"
          title="Play"
          subtitle="Small games to rest your mind. Play at your own pace. Only you can see your own scores."
        />

        <Suspense fallback={<div className="mt-10 h-48 animate-pulse rounded-3xl bg-white/5" aria-busy="true" />}>
          <PlayContent />
        </Suspense>
      </div>
    </div>
  );
}