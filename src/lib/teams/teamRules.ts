import { z } from "zod";
import { QUIZ_GAME_IDS, type QuizGameId } from "@/lib/games/gameCatalog";

export const TEAM_MIN_TO_START = 2;
export const TEAM_MAX_SIZE = 4;
export const TEAM_ROUND_SIZE = 8;

export const teamNameSchema = z
  .string({ error: "Please choose a team name." })
  .trim()
  .min(2, "Team names need at least 2 characters.")
  .max(24, "Team names can be up to 24 characters.");

/** Narrows a stored game ID to a quiz game. Team rounds only use quiz games. */
export function asQuizGame(value: string): QuizGameId | null {
  return (QUIZ_GAME_IDS as readonly string[]).includes(value) ? (value as QuizGameId) : null;
}