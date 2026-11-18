import Link from "next/link";
import { Suspense } from "react";
import { PlayBackdrop, PlayHeader } from "@/components/play/PlayKit";
import { TeamContent } from "./TeamContent";

const NAV_LINK =
  "inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white";

export default function TeamPlayPage() {
  return (
    <div className="dark relative min-h-dvh overflow-hidden bg-gradient-to-b from-[#241a40] via-[#1e1638] to-[#171230] text-ink">
      <PlayBackdrop />
      <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-6 sm:pt-8">
        <nav aria-label="Team play" className="flex items-center justify-between">
          <Link href="/play" className={NAV_LINK}>
            ← All games
          </Link>
        </nav>

        <PlayHeader
          emoji="🤝"
          eyebrow="Together"
          title="Team play"
          subtitle="Teams of 2 to 4 take turns on a shared round. Every correct answer adds to the team total."
        />

        <Suspense fallback={<div className="mt-10 h-64 animate-pulse rounded-3xl bg-white/5" aria-busy="true" />}>
          <TeamContent />
        </Suspense>
      </div>
    </div>
  );
}