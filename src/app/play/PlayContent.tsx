import { connection } from "next/server";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { GameTiles } from "@/components/play/GameTiles";
import { getViewer } from "@/lib/community/viewer";
import { GAMES } from "@/lib/games/gameCatalog";
import { bestPointsFor } from "@/lib/games/gameRepository";

/** The game tiles with the viewer's own best scores. Signed-out visitors see a gentle sign-in card. */
export async function PlayContent() {
  await connection();

  const viewer = await getViewer();

  if (!viewer) {
    return (
      <div className="mt-10 rounded-3xl border border-white/10 bg-[#241a40]/75 p-8 text-center shadow-xl">
        <p className="text-4xl">🌙</p>
        <p className="mt-3 font-serif text-2xl text-white">Sign in to play.</p>
        <p className="mt-2 text-sm text-white/55">Your scores are kept private to your account.</p>
        <div className="mt-6 flex justify-center">
          <AuthDialog redirectTo="/play" />
        </div>
      </div>
    );
  }

  const bests = await bestPointsFor(viewer.id);

  return <GameTiles games={GAMES} bests={bests} />;
}