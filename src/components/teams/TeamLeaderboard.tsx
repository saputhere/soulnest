"use client";

import { motion } from "framer-motion";
import { containerVariants, itemVariants, PlayCard } from "@/components/play/PlayKit";
import type { LeaderboardRow } from "@/lib/teams/teamRepository";

const MEDALS = ["🥇", "🥈", "🥉"] as const;

/** Team totals from the last 7 days, with display names only. Rows rise in one by one. */
export function TeamLeaderboard({ rows }: { readonly rows: readonly LeaderboardRow[] }) {
  return (
    <PlayCard className="mt-6" delay={0.2}>
      <h2 className="font-serif text-2xl text-white">🌟 Team totals this week</h2>
      <p className="mt-1 text-sm text-white/50">Team scores from the last 7 days. Only display names are shown.</p>

      {rows.length === 0 ? (
        <p className="mt-5 text-sm text-white/55">No finished rounds yet this week. Be the first team on the board 🌱</p>
      ) : (
        <motion.ol variants={containerVariants} initial="hidden" animate="show" className="mt-5 space-y-2">
          {rows.map((row, index) => (
            <motion.li
              key={row.id}
              variants={itemVariants}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.04] px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-7 text-center text-lg" aria-hidden="true">
                  {MEDALS[index] ?? `${index + 1}.`}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{row.name}</p>
                  <p className="mt-0.5 truncate text-xs text-white/50">{row.members.join(" · ")}</p>
                </div>
              </div>
              <p className="rounded-full bg-[#b5f5da]/10 px-3 py-1 text-xs text-[#b5f5da]">
                {row.points} points · {row.rounds} {row.rounds === 1 ? "round" : "rounds"}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      )}
    </PlayCard>
  );
}