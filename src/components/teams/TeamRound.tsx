"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { answerRoundAction, type TeamResult } from "@/app/play/team/actions";
import { Notice, PlayButton, PlayCard } from "@/components/play/PlayKit";

export interface RoundView {
  readonly roundId: string;
  readonly index: number;
  readonly total: number;
  readonly gameTitle: string;
  readonly prompt: string;
  readonly options: readonly string[];
  readonly turnName: string;
  readonly isMyTurn: boolean;
  readonly history: readonly { readonly name: string; readonly correct: boolean }[];
  readonly points: number;
}

/** One turn of a team round. Only the member whose turn it is can answer. Others see the room refresh on its own. */
export function TeamRound({ view }: { readonly view: RoundView }) {
  const router = useRouter();
  const [choice, setChoice] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<TeamResult | null>(null);

  useEffect(() => {
    if (view.isMyTurn) return;
    const timer = window.setInterval(() => router.refresh(), 10_000);
    return () => window.clearInterval(timer);
  }, [view.isMyTurn, router]);

  async function submit(): Promise<void> {
    if (choice === null) return;
    setSending(true);
    setNotice(null);
    try {
      const result = await answerRoundAction(view.roundId, choice);
      setNotice(result);
      if (result.status === "ok") router.refresh();
    } catch {
      setNotice({ status: "error", message: "Something went wrong. Please try again." });
    } finally {
      setSending(false);
    }
  }

  const progress = (view.index / view.total) * 100;

  return (
    <PlayCard delay={0.1}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/55">
        <span>
          🧩 {view.gameTitle} · Question {view.index + 1} of {view.total}
        </span>
        <span className="rounded-full bg-[#b5f5da]/10 px-3 py-1 text-[#b5f5da]">⭐ Team total: {view.points}</span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#c9f7e3] via-[#cfeaff] to-[#ffd1e5]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {view.history.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Answers so far">
          {view.history.map((entry, position) => (
            <motion.li
              key={position}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 16 }}
              className={`rounded-full px-3 py-1 text-xs ${
                entry.correct ? "bg-[#b5f5da]/15 text-[#b5f5da]" : "bg-white/5 text-white/55"
              }`}
            >
              {entry.correct ? "✓" : "✗"} {entry.name}
            </motion.li>
          ))}
        </ul>
      ) : null}

      {view.isMyTurn ? (
        <>
          <div className="mt-6 flex items-center gap-2">
            <motion.span
              className="h-2.5 w-2.5 rounded-full bg-[#b5f5da]"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            <p className="text-xs uppercase tracking-[0.2em] text-[#b5f5da]">Your turn</p>
          </div>

          <motion.h3
            key={view.prompt}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 font-serif text-2xl leading-snug text-white sm:text-3xl"
          >
            {view.prompt}
          </motion.h3>

          <div className="mt-5 grid gap-3" role="radiogroup" aria-label="Answer options">
            {view.options.map((option, optionIndex) => {
              const selected = choice === optionIndex;
              return (
                <motion.button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setChoice(optionIndex)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-left text-sm transition-colors ${
                    selected
                      ? "border-[#b5f5da]/60 bg-[#b5f5da]/15 text-white shadow-[0_0_24px_-6px_rgba(181,245,218,0.6)]"
                      : "border-white/10 bg-white/[0.04] text-white/80 hover:border-white/20 hover:bg-white/[0.07]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                      selected ? "border-[#b5f5da] bg-[#b5f5da] text-[#2a1f4a]" : "border-white/20 text-white/60"
                    }`}
                  >
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  {option}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Notice status={notice?.status ?? "idle"} message={notice?.message} />
            <PlayButton onClick={submit} disabled={choice === null || sending}>
              {sending ? "Sending..." : "Submit answer ✨"}
            </PlayButton>
          </div>
        </>
      ) : (
        <div className="mt-8 flex flex-col items-center text-center">
          <div className="flex gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="h-2.5 w-2.5 rounded-full bg-[#b5f5da]"
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
              />
            ))}
          </div>
          <p className="mt-4 font-serif text-xl text-white/85">Waiting for {view.turnName}</p>
          <p className="mt-2 text-sm text-white/50">It&apos;s their turn. This page updates on its own.</p>
        </div>
      )}
    </PlayCard>
  );
}