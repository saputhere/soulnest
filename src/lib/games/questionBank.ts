import type { QuizGameId } from "./gameCatalog";

export interface Question {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly string[];
  /** Index of the correct option. Never sent to the browser. */
  readonly answer: number;
}

export interface ClientQuestion {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly string[];
}

const BRAIN_SPARK: Question[] = [
  { id: "b1", prompt: "What comes next: 3, 6, 12, 24, ?", options: ["30", "36", "48", "40"], answer: 2 },
  { id: "b2", prompt: "Which one doesn't belong: Apple, Banana, Carrot, Mango?", options: ["Apple", "Banana", "Carrot", "Mango"], answer: 2 },
  { id: "b3", prompt: "If 5 pens cost 60 rupees, how much do 8 pens cost?", options: ["72", "84", "96", "108"], answer: 2 },
  { id: "b4", prompt: "At 3:00, what is the angle between the hour and minute hands?", options: ["60°", "90°", "120°", "180°"], answer: 1 },
  { id: "b5", prompt: "Tom is taller than Sam. Sam is taller than Lee. Who is the shortest?", options: ["Tom", "Sam", "Lee", "Can't tell"], answer: 2 },
  { id: "b6", prompt: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], answer: 1 },
  { id: "b7", prompt: "What is the next prime number after 11?", options: ["12", "13", "15", "17"], answer: 1 },
  { id: "b8", prompt: "If today is Wednesday, what day is it 10 days from now?", options: ["Thursday", "Friday", "Saturday", "Sunday"], answer: 2 },
  { id: "b9", prompt: "A book costs 250 and is 20% off. What is the sale price?", options: ["180", "200", "220", "230"], answer: 1 },
  { id: "b10", prompt: "Which number is the odd one out: 2, 4, 9, 16?", options: ["2", "4", "9", "16"], answer: 2 },
  { id: "b11", prompt: "Halve 46, then add 10. What do you get?", options: ["28", "33", "36", "43"], answer: 1 },
  { id: "b12", prompt: "Which shape has the most sides?", options: ["Triangle", "Square", "Pentagon", "Circle"], answer: 2 },
];

const PATTERN_PUZZLES: Question[] = [
  { id: "p1", prompt: "2, 4, 8, 16, ?", options: ["18", "24", "32", "36"], answer: 2 },
  { id: "p2", prompt: "1, 1, 2, 3, 5, 8, ?", options: ["11", "12", "13", "15"], answer: 2 },
  { id: "p3", prompt: "5, 10, 20, 40, ?", options: ["60", "70", "80", "100"], answer: 2 },
  { id: "p4", prompt: "1, 4, 9, 16, 25, ?", options: ["30", "36", "40", "49"], answer: 1 },
  { id: "p5", prompt: "2, 6, 12, 20, 30, ?", options: ["36", "40", "42", "48"], answer: 2 },
  { id: "p6", prompt: "100, 90, 80, 70, ?", options: ["50", "55", "60", "65"], answer: 2 },
  { id: "p7", prompt: "3, 9, 27, 81, ?", options: ["162", "216", "243", "324"], answer: 2 },
  { id: "p8", prompt: "1, 3, 6, 10, 15, ?", options: ["18", "20", "21", "25"], answer: 2 },
  { id: "p9", prompt: "7, 14, 21, 28, ?", options: ["30", "32", "35", "42"], answer: 2 },
  { id: "p10", prompt: "2, 3, 5, 7, 11, ?", options: ["12", "13", "14", "15"], answer: 1 },
  { id: "p11", prompt: "0, 1, 1, 2, 4, 7, ?", options: ["11", "12", "13", "14"], answer: 2 },
  { id: "p12", prompt: "81, 27, 9, 3, ?", options: ["0", "1", "2", "6"], answer: 1 },
];

const BANKS: Record<QuizGameId, Question[]> = {
  "brain-spark": BRAIN_SPARK,
  "pattern-puzzles": PATTERN_PUZZLES,
};

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** A random round of questions with the answers removed. Server-only: call it from server components. */
export function pickRun(gameId: QuizGameId, size: number): ClientQuestion[] {
  const bank = BANKS[gameId];
  return shuffle(bank)
    .slice(0, Math.min(size, bank.length))
    .map(({ id, prompt, options }) => ({ id, prompt, options }));
}

/** Checks every answer against the bank. Returns null if any question is unknown, repeated, or out of range. */
export function scoreAnswers(
  gameId: QuizGameId,
  answers: readonly { readonly id: string; readonly choice: number }[],
): { correct: number; total: number } | null {
  const byId = new Map(BANKS[gameId].map((question) => [question.id, question]));
  const seen = new Set<string>();
  let correct = 0;

  for (const answer of answers) {
    const question = byId.get(answer.id);
    if (!question || seen.has(answer.id)) return null;
    if (answer.choice < 0 || answer.choice >= question.options.length) return null;
    seen.add(answer.id);
    if (answer.choice === question.answer) correct++;
  }

  return { correct, total: answers.length };
}

/** A question by ID, without its answer. Used to show the current team question. */
export function clientQuestionById(gameId: QuizGameId, id: string): ClientQuestion | null {
  const question = BANKS[gameId].find((item) => item.id === id);
  return question ? { id: question.id, prompt: question.prompt, options: question.options } : null;
}

/** true if the choice is right, false if wrong, null if the question or choice is unknown. */
export function checkChoice(gameId: QuizGameId, id: string, choice: number): boolean | null {
  const question = BANKS[gameId].find((item) => item.id === id);
  if (!question) return null;
  if (choice < 0 || choice >= question.options.length) return null;
  return choice === question.answer;
}