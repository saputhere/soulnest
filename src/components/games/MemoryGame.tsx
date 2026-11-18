"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { saveMemoryResultAction } from "@/app/play/actions";
import { PlayCard } from "@/components/play/PlayKit";
import { MEMORY_GAME_ID } from "@/lib/games/gameCatalog";
import { GameResult } from "./GameResult";

const SYMBOLS = ["🌙", "⭐", "🌸", "🍃", "🕊️", "🎈", "🌊", "🍀"] as const;
const FLIP_BACK_MS = 800;
const FLIP_EASE = [0.22, 1, 0.36, 1] as const;

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface MemoryGameProps {
  readonly best: number | null;
}

/** Calm matching game with 3D card flips. No timer. The deck is shuffled after mount, so server and browser match. */
export function MemoryGame({ best }: MemoryGameProps) {
  const router = useRouter();
  const [deck, setDeck] = useState<string[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [phase, setPhase] = useState<"playing" | "saving" | "done">("playing");
  const [points, setPoints] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lockRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setDeck(shuffle([...SYMBOLS, ...SYMBOLS]));
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (deck.length === 0 || matched.length !== deck.length || phase !== "playing") return;

    setPhase("saving");
    saveMemoryResultAction({ gameId: MEMORY_GAME_ID, moves }).then((result) => {
      if (result.status === "saved") setPoints(result.points);
      else setError(result.message);
      setPhase("done");
    });
  }, [matched.length, deck.length, phase, moves]);

  function flip(index: number): void {
    if (lockRef.current || phase !== "playing" || open.includes(index) || matched.includes(index)) return;

    const next = [...open, index];
    setOpen(next);
    if (next.length < 2) return;

    lockRef.current = true;
    setMoves((count) => count + 1);
    const [first, second] = next;

    if (deck[first] === deck[second]) {
      setMatched((current) => [...current, first, second]);
      setOpen([]);
      lockRef.current = false;
    } else {
      timerRef.current = window.setTimeout(() => {
        setOpen([]);
        lockRef.current = false;
      }, FLIP_BACK_MS);
    }
  }

  if (phase === "done") {
    return (
      <GameResult
        points={points}
        best={best}
        error={error}
        onAgain={() => router.push(`/play/${MEMORY_GAME_ID}?run=${Date.now()}`)}
      />
    );
  }

  return (
    <PlayCard>
      <div className="flex items-center justify-between text-xs text-white/55">
        <span>🌷 Moves: {moves}</span>
        <span>
          💫 {matched.length / 2} of {SYMBOLS.length} pairs
        </span>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2.5 sm:gap-3" role="group" aria-label="Memory cards">
        {deck.length === 0
          ? Array.from({ length: 16 }, (_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-2xl bg-white/5" />
            ))
          : deck.map((symbol, index) => {
              const isRevealed = open.includes(index) || matched.includes(index);
              const isMatched = matched.includes(index);

              return (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => flip(index)}
                  whileHover={isRevealed ? undefined : { y: -3 }}
                  whileTap={isRevealed ? undefined : { scale: 0.95 }}
                  aria-label={isRevealed ? `Card showing ${symbol}` : "Hidden card"}
                  className="relative aspect-square [perspective:800px] focus-visible:outline-2 focus-visible:outline-white"
                >
                  <motion.div
                    className="relative h-full w-full [transform-style:preserve-3d]"
                    animate={{ rotateY: isRevealed ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: FLIP_EASE }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-[#c9f7e3]/25 to-[#cfeaff]/10 text-lg text-white/70 [backface-visibility:hidden]">
                      ✦
                    </span>
                    <motion.span
                      animate={isMatched ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className={`absolute inset-0 flex items-center justify-center rounded-2xl border text-3xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                        isMatched ? "border-[#b5f5da]/60 bg-[#b5f5da]/20" : "border-white/20 bg-white/10"
                      }`}
                    >
                      {symbol}
                    </motion.span>
                  </motion.div>
                </motion.button>
              );
            })}
      </div>

      <p className="mt-6 text-center text-xs text-white/40">No timer. Go at your own pace 🌿</p>
    </PlayCard>
  );
}   