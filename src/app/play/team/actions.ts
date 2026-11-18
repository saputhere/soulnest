"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSignedIn } from "@/lib/account/access";
import { getMemberName } from "@/lib/community/communityRepository";
import { randomDisplayName } from "@/lib/community/randomDisplayName";
import { QUIZ_GAME_IDS, quizPoints } from "@/lib/games/gameCatalog";
import { checkChoice, pickRun } from "@/lib/games/questionBank";
import * as repo from "@/lib/teams/teamRepository";
import { asQuizGame, TEAM_MAX_SIZE, TEAM_MIN_TO_START, TEAM_ROUND_SIZE, teamNameSchema } from "@/lib/teams/teamRules";

export type TeamResult =
  | { readonly status: "ok"; readonly message: string }
  | { readonly status: "error"; readonly message: string };

type Gate = { readonly ok: true; readonly viewerId: string } | { readonly ok: false; readonly message: string };

const ok = (message: string): TeamResult => ({ status: "ok", message });
const fail = (message: string): TeamResult => ({ status: "error", message });
const uuid = z.uuid();
const inviteNameSchema = z.string().trim().min(2, "Enter a display name.").max(24);

/** Signed in, with a community name chosen. Team play needs a name so teammates can see who is who. */
async function gate(): Promise<Gate> {
  const access = await requireSignedIn();
  if (!access.ok) return { ok: false, message: access.error };

  const name = await getMemberName(access.viewer.id);
  if (!name) {
    return { ok: false, message: "Choose your community name on the Community page first." };
  }
  return { ok: true, viewerId: access.viewer.id };
}

export async function createTeamAction(name: string): Promise<TeamResult> {
  const g = await gate();
  if (!g.ok) return fail(g.message);

  const parsed = teamNameSchema.safeParse(name);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please choose a team name.");

  const id = await repo.createTeamWithMember(parsed.data, g.viewerId);
  if (!id) return fail("You're already in a team. Leave it first.");

  revalidatePath("/play/team");
  return ok("Team created. Invite a friend, or start once a second member joins.");
}

/** Places the member into a team with space. If none has room, opens a new team that waits for others. */
export async function quickJoinAction(): Promise<TeamResult> {
  const g = await gate();
  if (!g.ok) return fail(g.message);

  if (await repo.findTeamIdForUser(g.viewerId)) return fail("You're already in a team.");

  const openTeamId = await repo.findOpenTeamWithSpace();
  if (openTeamId && (await repo.addMemberIfSpace(openTeamId, g.viewerId))) {
    revalidatePath("/play/team");
    return ok("You've been placed in a team that has space.");
  }

  const created = await repo.createTeamWithMember(`Team ${randomDisplayName()}`, g.viewerId);
  if (!created) return fail("You're already in a team.");

  revalidatePath("/play/team");
  return ok("No team had space, so we opened one. It can start once another member joins.");
}

export async function inviteMemberAction(teamId: string, displayName: string): Promise<TeamResult> {
  const g = await gate();
  if (!g.ok) return fail(g.message);

  if (!uuid.safeParse(teamId).success) return fail("That team couldn't be found.");
  const name = inviteNameSchema.safeParse(displayName);
  if (!name.success) return fail(name.error.issues[0]?.message ?? "Enter a display name.");

  if ((await repo.findTeamIdForUser(g.viewerId)) !== teamId) return fail("Only team members can invite.");

  const team = await repo.loadTeam(teamId);
  if (!team) return fail("That team couldn't be found.");
  if (team.playing) return fail("Finish the current round before inviting.");
  if (team.members.length >= TEAM_MAX_SIZE) return fail("This team is full.");

  const invitee = await repo.findUserByDisplayName(name.data);
  if (!invitee) return fail("No member has that display name. Check the spelling.");
  if (invitee.id === g.viewerId) return fail("You can't invite yourself.");
  if (await repo.findTeamIdForUser(invitee.id)) return fail("That member is already in a team.");

  await repo.inviteMember(teamId, g.viewerId, invitee.id);
  revalidatePath("/play/team");
  return ok(`Invite sent to ${invitee.displayName}.`);
}

export async function respondToInviteAction(inviteId: string, accept: boolean): Promise<TeamResult> {
  const g = await gate();
  if (!g.ok) return fail(g.message);

  if (!uuid.safeParse(inviteId).success) return fail("This invite is no longer available.");
  const invite = await repo.loadPendingInvite(inviteId, g.viewerId);
  if (!invite) return fail("This invite is no longer available.");

  if (!accept) {
    await repo.setInviteStatus(inviteId, "declined");
    revalidatePath("/play/team");
    return ok("Invite declined.");
  }

  if (await repo.findTeamIdForUser(g.viewerId)) return fail("Leave your current team first.");

  const team = await repo.loadTeam(invite.teamId);
  if (!team) return fail("That team no longer exists.");
  if (team.playing) return fail("That team is playing a round. Try again when it finishes.");

  const joined = await repo.addMemberIfSpace(invite.teamId, g.viewerId);
  if (!joined) return fail("That team is full.");

  await repo.setInviteStatus(inviteId, "accepted");
  revalidatePath("/play/team");
  return ok(`You joined ${team.name}.`);
}

export async function leaveTeamAction(teamId: string): Promise<TeamResult> {
  const g = await gate();
  if (!g.ok) return fail(g.message);

  if (!uuid.safeParse(teamId).success) return fail("That team couldn't be found.");

  const removed = await repo.removeMember(teamId, g.viewerId);
  if (!removed) return fail("You can't leave while a round is in progress.");

  revalidatePath("/play/team");
  return ok("You've left the team.");
}

export async function startRoundAction(teamId: string, gameId: string): Promise<TeamResult> {
  const g = await gate();
  if (!g.ok) return fail(g.message);

  if (!uuid.safeParse(teamId).success) return fail("That team couldn't be found.");
  const game = z.enum(QUIZ_GAME_IDS).safeParse(gameId);
  if (!game.success) return fail("Choose a game to start.");

  if ((await repo.findTeamIdForUser(g.viewerId)) !== teamId) return fail("Only team members can start a round.");

  const team = await repo.loadTeam(teamId);
  if (!team) return fail("That team couldn't be found.");
  if (team.members.length < TEAM_MIN_TO_START) {
    return fail(`A team needs at least ${TEAM_MIN_TO_START} members to start a round.`);
  }

  const questionIds = pickRun(game.data, TEAM_ROUND_SIZE).map((question) => question.id);
  const roundId = await repo.createRound(teamId, game.data, questionIds);
  if (!roundId) return fail("A round is already in progress.");

  revalidatePath("/play/team");
  return ok("Round started. Take turns, and good luck.");
}

export async function answerRoundAction(roundId: string, choice: number): Promise<TeamResult> {
  const g = await gate();
  if (!g.ok) return fail(g.message);

  const parsed = z
    .object({ roundId: z.uuid(), choice: z.number().int().min(0).max(3) })
    .safeParse({ roundId, choice });
  if (!parsed.success) return fail("That answer couldn't be recorded.");

  const round = await repo.loadRound(parsed.data.roundId);
  if (!round || round.status !== "in_progress") return fail("This round is over.");

  const gameId = asQuizGameOrNull(round.gameId);
  if (!gameId) return fail("This round can't be played.");

  const team = await repo.loadTeam(round.teamId);
  if (!team || !team.members.some((m) => m.userId === g.viewerId)) {
    return fail("Only team members can play this round.");
  }

  const expected = round.answers.length;
  const turnMember = team.members[expected % team.members.length];
  if (turnMember.userId !== g.viewerId) return fail(`It's ${turnMember.displayName}'s turn.`);

  const questionId = round.questionIds[expected];
  const correct = checkChoice(gameId, questionId, parsed.data.choice);
  if (correct === null) return fail("That answer isn't valid.");

  const answers = await repo.appendAnswer(
    round.id,
    { id: questionId, choice: parsed.data.choice, correct, userId: g.viewerId },
    expected,
  );
  if (!answers) return fail("Someone just answered. Refresh to see the next question.");

  if (answers.length >= TEAM_ROUND_SIZE) {
    const points = answers.filter((a) => a.correct).length * quizPoints(1);
    await repo.finishRound(round.id, points);
  }

  revalidatePath("/play/team");
  return ok(correct ? "Correct!" : "Not this time. The next turn is coming up.");
}

function asQuizGameOrNull(value: string) {
  return asQuizGame(value);
}