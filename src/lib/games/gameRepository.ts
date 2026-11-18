import { getSql } from "@/lib/db";
import type { GameId } from "./gameCatalog";

export async function insertScore(
  userId: string,
  gameId: GameId,
  points: number,
  detail: Record<string, number>,
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO game_scores (user_id, game_id, points, detail)
    VALUES (${userId}::uuid, ${gameId}::text, ${points}::int, ${JSON.stringify(detail)}::jsonb)
  `;
}

/** The member's own best score per game. Other members' scores are never read here. */
export async function bestPointsFor(userId: string): Promise<Record<string, number>> {
  const sql = getSql();
  const rows = (await sql`
    SELECT game_id, max(points)::int AS best
    FROM game_scores
    WHERE user_id = ${userId}::uuid
    GROUP BY game_id
  `) as { game_id: string; best: number }[];

  return Object.fromEntries(rows.map((row) => [row.game_id, row.best]));
}