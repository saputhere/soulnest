export const MEMORY_GAME_ID = "memory-garden" as const;
export const QUIZ_GAME_IDS = ["brain-spark", "pattern-puzzles"] as const;

export type QuizGameId = (typeof QUIZ_GAME_IDS)[number];
export const GAME_IDS = [MEMORY_GAME_ID, ...QUIZ_GAME_IDS] as const;
export type GameId = (typeof GAME_IDS)[number];

export interface GameInfo {
  readonly id: GameId;
  readonly title: string;
  readonly tagline: string;
  readonly description: string;
  readonly kind: "memory" | "quiz";
}

export const GAMES: readonly GameInfo[] = [
  {
    id: MEMORY_GAME_ID,
    title: "Memory Garden",
    tagline: "Relax and match",
    description: "Find the pairs at your own pace. There's no timer, and fewer moves earn more points.",
    kind: "memory",
  },
  {
    id: "brain-spark",
    title: "Brain Spark",
    tagline: "Gentle brain teasers",
    description: "Short everyday puzzles about numbers, logic, and shapes. Eight questions per round.",
    kind: "quiz",
  },
  {
    id: "pattern-puzzles",
    title: "Pattern Puzzles",
    tagline: "Spot what comes next",
    description: "Number patterns to solve for fun. These are entertainment puzzles, not a test of ability.",
    kind: "quiz",
  },
];

export function findGame(id: string): GameInfo | undefined {
  return GAMES.find((game) => game.id === id);
}

export function isQuizGame(id: GameId): id is QuizGameId {
  return (QUIZ_GAME_IDS as readonly string[]).includes(id);
}

export const QUIZ_RUN_SIZE = 8;
export const MEMORY_MIN_MOVES = 8;
export const MEMORY_MAX_MOVES = 200;

/** 10 points per correct answer. */
export function quizPoints(correct: number): number {
  return correct * 10;
}

/** Starts at 100 points for the 8 moves a perfect game needs, and loses 4 points per extra move, never below 10. */
export function memoryPoints(moves: number): number {
  return Math.max(10, 100 - (moves - MEMORY_MIN_MOVES) * 4);
}