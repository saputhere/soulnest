import { getSql } from "@/lib/db";
import { TEAM_MAX_SIZE } from "./teamRules";

export interface TeamMember {
  readonly userId: string;
  readonly displayName: string;
}

export interface TeamInfo {
  readonly id: string;
  readonly name: string;
  readonly playing: boolean;
  readonly members: readonly TeamMember[];
}

export interface RoundAnswer {
  readonly id: string;
  readonly choice: number;
  readonly correct: boolean;
  readonly userId: string;
}

export interface RoundInfo {
  readonly id: string;
  readonly teamId: string;
  readonly gameId: string;
  readonly questionIds: readonly string[];
  readonly answers: readonly RoundAnswer[];
  readonly status: "in_progress" | "finished";
  readonly points: number;
}

export interface PendingInvite {
  readonly id: string;
  readonly teamName: string;
  readonly inviterName: string;
}

export interface LeaderboardRow {
  readonly id: string;
  readonly name: string;
  readonly points: number;
  readonly rounds: number;
  readonly members: readonly string[];
}

interface RoundRow {
  id: string;
  team_id: string;
  game_id: string;
  question_ids: string[];
  answers: RoundAnswer[];
  status: "in_progress" | "finished";
  points: number;
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}

function mapRound(row: RoundRow): RoundInfo {
  return {
    id: row.id,
    teamId: row.team_id,
    gameId: row.game_id,
    questionIds: row.question_ids,
    answers: row.answers,
    status: row.status,
    points: row.points,
  };
}

export async function findTeamIdForUser(userId: string): Promise<string | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT team_id FROM team_members WHERE user_id = ${userId}::uuid LIMIT 1
  `) as { team_id: string }[];
  return rows[0]?.team_id ?? null;
}

/** Creates a team and adds its creator in one statement, so a team never exists without a member. */
export async function createTeamWithMember(name: string, userId: string): Promise<string | null> {
  const sql = getSql();
  try {
    const rows = (await sql`
      WITH created AS (
        INSERT INTO teams (name, created_by)
        VALUES (${name}::text, ${userId}::uuid)
        RETURNING id
      )
      INSERT INTO team_members (team_id, user_id)
      SELECT id, ${userId}::uuid FROM created
      RETURNING team_id
    `) as { team_id: string }[];
    return rows[0]?.team_id ?? null;
  } catch (error) {
    if (isUniqueViolation(error)) return null;
    throw error;
  }
}

/** An open team that is not playing and has room. Oldest first, so teams fill in order. */
export async function findOpenTeamWithSpace(): Promise<string | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT t.id
    FROM teams t
    WHERE (SELECT count(*) FROM team_members m WHERE m.team_id = t.id) < ${TEAM_MAX_SIZE}::int
      AND NOT EXISTS (SELECT 1 FROM team_rounds r WHERE r.team_id = t.id AND r.status = 'in_progress')
    ORDER BY t.created_at ASC
    LIMIT 1
  `) as { id: string }[];
  return rows[0]?.id ?? null;
}

/** Adds the member only if the team still has room and isn't in the middle of a round. */
export async function addMemberIfSpace(teamId: string, userId: string): Promise<boolean> {
  const sql = getSql();
  try {
    const rows = (await sql`
      INSERT INTO team_members (team_id, user_id)
      SELECT ${teamId}::uuid, ${userId}::uuid
      WHERE (SELECT count(*) FROM team_members WHERE team_id = ${teamId}::uuid) < ${TEAM_MAX_SIZE}::int
        AND NOT EXISTS (SELECT 1 FROM team_rounds WHERE team_id = ${teamId}::uuid AND status = 'in_progress')
      RETURNING team_id
    `) as { team_id: string }[];
    return rows.length > 0;
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }
}

/** Removes a member, unless a round is in progress. Deletes the team when it's empty. */
export async function removeMember(teamId: string, userId: string): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    DELETE FROM team_members
    WHERE team_id = ${teamId}::uuid AND user_id = ${userId}::uuid
      AND NOT EXISTS (SELECT 1 FROM team_rounds r WHERE r.team_id = ${teamId}::uuid AND r.status = 'in_progress')
    RETURNING team_id
  `) as { team_id: string }[];

  if (rows.length === 0) return false;

  await sql`
    DELETE FROM teams
    WHERE id = ${teamId}::uuid
      AND NOT EXISTS (SELECT 1 FROM team_members WHERE team_id = ${teamId}::uuid)
  `;
  return true;
}

export async function loadTeam(teamId: string): Promise<TeamInfo | null> {
  const sql = getSql();
  const teams = (await sql`
    SELECT t.id, t.name,
      EXISTS (SELECT 1 FROM team_rounds r WHERE r.team_id = t.id AND r.status = 'in_progress') AS playing
    FROM teams t
    WHERE t.id = ${teamId}::uuid
  `) as { id: string; name: string; playing: boolean }[];

  const team = teams[0];
  if (!team) return null;

  // Join order decides whose turn it is, so it must be stable.
  const members = (await sql`
    SELECT tm.user_id, COALESCE(u.display_name, 'Member') AS display_name
    FROM team_members tm
    JOIN users u ON u.id = tm.user_id
    WHERE tm.team_id = ${teamId}::uuid
    ORDER BY tm.joined_at ASC, tm.user_id ASC
  `) as { user_id: string; display_name: string }[];

  return {
    id: team.id,
    name: team.name,
    playing: team.playing,
    members: members.map((m) => ({ userId: m.user_id, displayName: m.display_name })),
  };
}

/** Finds a member by display name, for invitations. Display names are already public in the community. */
export async function findUserByDisplayName(name: string): Promise<{ id: string; displayName: string } | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, display_name FROM users
    WHERE lower(display_name) = lower(${name}::text)
    LIMIT 1
  `) as { id: string; display_name: string }[];
  return rows[0] ? { id: rows[0].id, displayName: rows[0].display_name } : null;
}

export async function inviteMember(teamId: string, inviterId: string, inviteeId: string): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO team_invites (team_id, invitee_id, invited_by)
    VALUES (${teamId}::uuid, ${inviteeId}::uuid, ${inviterId}::uuid)
    ON CONFLICT (team_id, invitee_id)
    DO UPDATE SET status = 'pending', invited_by = EXCLUDED.invited_by, created_at = now()
    WHERE team_invites.status <> 'accepted'
  `;
}

export async function listPendingInvites(userId: string): Promise<PendingInvite[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT i.id, t.name AS team_name, COALESCE(u.display_name, 'Member') AS inviter_name
    FROM team_invites i
    JOIN teams t ON t.id = i.team_id
    JOIN users u ON u.id = i.invited_by
    WHERE i.invitee_id = ${userId}::uuid AND i.status = 'pending'
    ORDER BY i.created_at DESC
  `) as { id: string; team_name: string; inviter_name: string }[];

  return rows.map((row) => ({ id: row.id, teamName: row.team_name, inviterName: row.inviter_name }));
}

export async function loadPendingInvite(inviteId: string, userId: string): Promise<{ teamId: string } | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT team_id FROM team_invites
    WHERE id = ${inviteId}::uuid AND invitee_id = ${userId}::uuid AND status = 'pending'
  `) as { team_id: string }[];
  return rows[0] ? { teamId: rows[0].team_id } : null;
}

export async function setInviteStatus(inviteId: string, status: "accepted" | "declined"): Promise<void> {
  const sql = getSql();
  await sql`UPDATE team_invites SET status = ${status}::text WHERE id = ${inviteId}::uuid`;
}

/** Creates a round with a fixed list of question IDs. Returns null if the team already has one in progress. */
export async function createRound(teamId: string, gameId: string, questionIds: string[]): Promise<string | null> {
  const sql = getSql();
  try {
    const rows = (await sql`
      INSERT INTO team_rounds (team_id, game_id, question_ids)
      VALUES (${teamId}::uuid, ${gameId}::text, ${questionIds}::text[])
      RETURNING id
    `) as { id: string }[];
    return rows[0]?.id ?? null;
  } catch (error) {
    if (isUniqueViolation(error)) return null;
    throw error;
  }
}

export async function loadRound(roundId: string): Promise<RoundInfo | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, team_id, game_id, question_ids, answers, status, points
    FROM team_rounds WHERE id = ${roundId}::uuid
  `) as RoundRow[];
  return rows[0] ? mapRound(rows[0]) : null;
}

export async function loadOpenRound(teamId: string): Promise<RoundInfo | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, team_id, game_id, question_ids, answers, status, points
    FROM team_rounds WHERE team_id = ${teamId}::uuid AND status = 'in_progress'
  `) as RoundRow[];
  return rows[0] ? mapRound(rows[0]) : null;
}

export async function loadLastFinishedRound(teamId: string): Promise<{ points: number } | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT points FROM team_rounds
    WHERE team_id = ${teamId}::uuid AND status = 'finished'
    ORDER BY finished_at DESC
    LIMIT 1
  `) as { points: number }[];
  return rows[0] ? { points: rows[0].points } : null;
}

/**
 * Adds one answer, but only if exactly `expectedCount` answers exist. Two simultaneous
 * requests can't both use the same turn, because the second one finds the count has moved on.
 */
export async function appendAnswer(
  roundId: string,
  answer: RoundAnswer,
  expectedCount: number,
): Promise<RoundAnswer[] | null> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE team_rounds
    SET answers = answers || ${JSON.stringify([answer])}::jsonb
    WHERE id = ${roundId}::uuid
      AND status = 'in_progress'
      AND jsonb_array_length(answers) = ${expectedCount}::int
    RETURNING answers
  `) as { answers: RoundAnswer[] }[];
  return rows[0]?.answers ?? null;
}

export async function finishRound(roundId: string, points: number): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE team_rounds
    SET status = 'finished', points = ${points}::int, finished_at = now()
    WHERE id = ${roundId}::uuid AND status = 'in_progress'
  `;
}

/** Team totals from the last 7 days, with display names only. */
export async function loadLeaderboard(): Promise<LeaderboardRow[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT
      t.id,
      t.name,
      COALESCE(sum(r.points), 0)::int AS points,
      count(r.id)::int AS rounds,
      (
        SELECT array_agg(COALESCE(u.display_name, 'Member') ORDER BY tm.joined_at, tm.user_id)
        FROM team_members tm
        JOIN users u ON u.id = tm.user_id
        WHERE tm.team_id = t.id
      ) AS members
    FROM teams t
    JOIN team_rounds r
      ON r.team_id = t.id
     AND r.status = 'finished'
     AND r.finished_at > now() - interval '7 days'
    GROUP BY t.id, t.name
    ORDER BY points DESC
    LIMIT 10
  `) as { id: string; name: string; points: number; rounds: number; members: string[] | null }[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    points: row.points,
    rounds: row.rounds,
    members: row.members ?? [],
  }));
}