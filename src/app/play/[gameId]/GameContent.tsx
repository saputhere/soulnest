import { connection } from "next/server";
import { notFound } from "next/navigation";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { MemoryGame } from "@/components/games/MemoryGame";
import { QuizGame } from "@/components/games/QuizGame";
import { getViewer } from "@/lib/community/viewer";
import { findGame, isQuizGame, QUIZ_RUN_SIZE } from "@/lib/games/gameCatalog";
import { bestPointsFor } from "@/lib/games/gameRepository";
import { pickRun } from "@/lib/games/questionBank";

interface GameContentProps {
  readonly params: Promise<{ gameId: string }>;
  readonly searchParams: Promise<{ run?: string }>;
}

export async function GameContent({ params, searchParams }: GameContentProps) {
  await connection();

  const { gameId } = await params;
  const game = findGame(gameId);
  if (!game) notFound();

  const viewer = await getViewer();
  if (!viewer) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#241a40]/75 p-8 text-center shadow-xl">
        <p className="font-serif text-2xl text-white">Sign in to play {game.title}.</p>
        <div className="mt-6 flex justify-center">
          <AuthDialog redirectTo={`/play/${game.id}`} />
        </div>
      </div>
    );
  }

  const { run } = await searchParams;
  const best = (await bestPointsFor(viewer.id))[game.id] ?? null;
  const runKey = run ?? "0";

  if (game.kind === "memory") {
    return <MemoryGame key={runKey} best={best} />;
  }

  if (!isQuizGame(game.id)) notFound();

  const questions = pickRun(game.id, QUIZ_RUN_SIZE);
  return <QuizGame key={runKey} game={game} questions={questions} best={best} />;
}