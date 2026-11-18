"use client";

import { motion } from "framer-motion";
import { Confetti, PlayButton } from "@/components/play/PlayKit";

interface GameResultProps {
  readonly points: number | null;
  readonly best: number | null;
  readonly error: string | null;
  readonly onAgain: () => void;
}

/** End-of-round celebration. Confetti appears for a new personal best. */
export function GameResult({ points, best, error, onAgain }: GameResultProps) {
  const isNewBest = points !== null && points > 0 && points >= (best ?? 0);
  const shownBest = Math.max(best ?? 0, points ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#241a40]/85 p-8 text-center shadow-2xl"
    >
      {isNewBest && !error ? <Confetti /> : null}

      <motion.p
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}
        className="text-6xl"
        aria-hidden="true"
      >
        {error ? "🌙" : isNewBest ? "🎉" : "🌿"}
      </motion.p>

      <p className="mt-3 text-xs uppercase tracking-[0.25em] text-white/45">Round complete</p>

      {error ? (
        <p role="status" className="mt-4 text-sm text-rose-300">
          {error}
        </p>
      ) : (
        <>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="mt-3 font-serif text-6xl text-white"
          >
            {points ?? "—"}
          </motion.p>
          <p className="mt-1 text-sm text-white/55">points this round</p>
          <p className="mt-4 text-sm text-[#b5f5da]">
            {isNewBest ? "New personal best. Lovely work!" : `Your best so far: ${shownBest}`}
          </p>
        </>
      )}

      <div className="mt-8 flex justify-center">
        <PlayButton onClick={onAgain}>Play again ✨</PlayButton>
      </div>
    </motion.div>
  );
}