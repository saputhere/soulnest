"use server";

import { z } from "zod";
import { requireSignedIn } from "@/lib/account/access";
import {
  MEMORY_GAME_ID,
  MEMORY_MAX_MOVES,
  MEMORY_MIN_MOVES,
  QUIZ_GAME_IDS,
  memoryPoints,
  quizPoints,
} from "@/lib/games/gameCatalog";
import { insertScore } from "@/lib/games/gameRepository";
import { scoreAnswers } from "@/lib/games/questionBank";

export type SaveResult =
  | { readonly status: "saved"; readonly points: number }
  | { readonly status: "error"; readonly message: string };

const quizSchema = z.object({
  gameId: z.enum(QUIZ_GAME_IDS),
  answers: z
    .array(z.object({ id: z.string().min(1).max(10), choice: z.number().int().min(0).max(3) }))
    .min(1)
    .max(20),
});

const memorySchema = z.object({
  gameId: z.literal(MEMORY_GAME_ID),
  moves: z.number().int().min(MEMORY_MIN_MOVES).max(MEMORY_MAX_MOVES),
});

/** Scores a finished quiz round on the server, so the browser never decides the points. */
export async function saveQuizResultAction(input: unknown): Promise<SaveResult> {
  const access = await requireSignedIn();
  if (!access.ok) return { status: "error", message: access.error };

  const parsed = quizSchema.safeParse(input);
  if (!parsed.success) return { status: "error", message: "Something about that round didn't look right." };

  const scored = scoreAnswers(parsed.data.gameId, parsed.data.answers);
  if (!scored) return { status: "error", message: "Those answers don't match this game." };

  const points = quizPoints(scored.correct);
  await insertScore(access.viewer.id, parsed.data.gameId, points, {
    correct: scored.correct,
    total: scored.total,
  });

  return { status: "saved", points };
}

/** Scores a finished memory round from the number of moves. */
export async function saveMemoryResultAction(input: unknown): Promise<SaveResult> {
  const access = await requireSignedIn();
  if (!access.ok) return { status: "error", message: access.error };

  const parsed = memorySchema.safeParse(input);
  if (!parsed.success) return { status: "error", message: "Something about that round didn't look right." };

  const points = memoryPoints(parsed.data.moves);
  await insertScore(access.viewer.id, MEMORY_GAME_ID, points, { moves: parsed.data.moves });

  return { status: "saved", points };
}