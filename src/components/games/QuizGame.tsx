"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveQuizResultAction } from "@/app/play/actions";
import { PlayButton, PlayCard } from "@/components/play/PlayKit";
import type { GameInfo } from "@/lib/games/gameCatalog";
import type { ClientQuestion } from "@/lib/games/questionBank";
import { GameResult } from "./GameResult";

interface QuizGameProps {
  readonly game: GameInfo;
  readonly questions: readonly ClientQuestion[];
  readonly best: number | null;
}

type Phase = "playing" | "saving" | "done";

export function QuizGame({ game, questions, best }: QuizGameProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ id: string; choice: number }[]>([]);
  const [phase, setPhase] = useState<Phase>("playing");
  const [points, setPoints] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const question = questions[index];

  async function handleNext(): Promise<void> {
    if (choice === null || !question) return;

    const updated = [...answers, { id: question.id, choice }];
    if (index + 1 < questions.length) {
      setAnswers(updated);
      setChoice(null);
      setIndex(index + 1);
      return;
    }

    setPhase("saving");
    const result = await saveQuizResultAction({ gameId: game.id, answers: updated });
    if (result.status === "saved") setPoints(result.points);
    else setError(result.message);
    setPhase("done");
  }

  if (phase === "done") {
    return (
      <GameResult
        points={points}
        best={best}
        error={error}
        onAgain={() => router.push(`/play/${game.id}?run=${Date.now()}`)}
      />
    );
  }

  if (!question) return null;

  const progress = ((index + 1) / questions.length) * 100;

  return (
    <PlayCard>
      <div className="flex items-center justify-between text-xs text-white/55">
        <span>🧩 {game.title}</span>
        <span>
          {index + 1} / {questions.length}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#c9f7e3] via-[#cfeaff] to-[#ffd1e5]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <h2 className="mt-8 font-serif text-2xl leading-snug text-white sm:text-3xl">{question.prompt}</h2>

          <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Answer options">
            {question.options.map((option, optionIndex) => {
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
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
                    {selected ? (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
                        ✓
                      </motion.span>
                    ) : (
                      String.fromCharCode(65 + optionIndex)
                    )}
                  </span>
                  {option}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-end">
        <PlayButton onClick={handleNext} disabled={choice === null || phase === "saving"}>
          {index + 1 === questions.length ? "Finish 🎉" : "Next →"}
        </PlayButton>
      </div>
    </PlayCard>
  );
}