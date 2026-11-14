import { HELP_ENTRIES, FALLBACK_ANSWER, type HelpEntry } from "@/content/helpKnowledge";

export interface HelpResult {
  readonly answer: string;
  readonly matched: HelpEntry | null;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s']/g, " ").replace(/\s+/g, " ").trim();
}

/** Scores each entry by how many of its keywords appear. Longer keywords count for more. */
export function answerQuestion(input: string): HelpResult {
  const query = ` ${normalize(input)} `;
  if (query.trim().length === 0) return { answer: FALLBACK_ANSWER, matched: null };

  let best: HelpEntry | null = null;
  let bestScore = 0;

  for (const entry of HELP_ENTRIES) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (query.includes(` ${normalize(keyword)} `) || query.includes(normalize(keyword))) {
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }

  return best ? { answer: best.answer, matched: best } : { answer: FALLBACK_ANSWER, matched: null };
}

/** Questions to suggest: the one just answered is left out, and the rest are shown in order. */
export function suggestionsAfter(matched: HelpEntry | null, count = 4): HelpEntry[] {
  return HELP_ENTRIES.filter((entry) => entry.id !== matched?.id && entry.id !== "crisis")
    .slice(0, count);
}