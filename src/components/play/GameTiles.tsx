"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { GameInfo } from "@/lib/games/gameCatalog";
import { containerVariants, itemVariants } from "./PlayKit";

const EMOJI: Record<string, string> = {
  "memory-garden": "🌷",
  "brain-spark": "✨",
  "pattern-puzzles": "🔮",
};

const TONE: Record<string, string> = {
  "memory-garden": "from-[#c9f7e3]/30 to-[#cfeaff]/5",
  "brain-spark": "from-[#fff3b8]/30 to-[#ffd1e5]/5",
  "pattern-puzzles": "from-[#e3d7ff]/30 to-[#cfeaff]/5",
};

interface GameTilesProps {
  readonly games: readonly GameInfo[];
  readonly bests: Record<string, number>;
}

/** The game tiles and the Team play tile, arriving one after another. */
export function GameTiles({ games, bests }: GameTilesProps) {
  return (
    <motion.ul variants={containerVariants} initial="hidden" animate="show" className="mt-10 grid gap-5 sm:grid-cols-3">
      {games.map((game) => {
        const best = bests[game.id];
        return (
          <motion.li key={game.id} variants={itemVariants} whileHover={{ y: -6 }} className="h-full">
            <Link
              href={`/play/${game.id}`}
              className={`group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b ${TONE[game.id] ?? ""} bg-[#241a40]/80 p-6 shadow-xl transition hover:border-white/25`}
            >
              <motion.span
                aria-hidden="true"
                className="text-4xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              >
                {EMOJI[game.id] ?? "🎈"}
              </motion.span>
              <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/45">{game.tagline}</p>
              <h2 className="mt-1 font-serif text-2xl text-white">{game.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/60">{game.description}</p>
              <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-[#b5f5da] transition group-hover:bg-white/15">
                {best !== undefined ? `⭐ Your best: ${best}` : "Play your first round →"}
              </span>
            </Link>
          </motion.li>
        );
      })}

      <motion.li variants={itemVariants} whileHover={{ y: -6 }} className="h-full sm:col-span-3">
        <Link
          href="/play/team"
          className="group flex flex-col items-start gap-4 overflow-hidden rounded-3xl border border-[#b5f5da]/25 bg-gradient-to-r from-[#b5f5da]/10 via-[#cfeaff]/5 to-[#ffd1e5]/10 p-6 shadow-xl transition hover:border-[#b5f5da]/45 sm:flex-row sm:items-center sm:justify-between sm:p-7"
        >
          <div className="flex items-center gap-4">
            <motion.span
              aria-hidden="true"
              className="text-4xl"
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              🤝
            </motion.span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Together</p>
              <h2 className="mt-1 font-serif text-2xl text-white">Team play</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
                Form a team of 2 to 4 members, take turns on a shared round, and see the team total on the weekly board.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white transition group-hover:bg-white/15">
            Open team room →
          </span>
        </Link>
      </motion.li>
    </motion.ul>
  );
}