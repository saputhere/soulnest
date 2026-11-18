import { connection } from "next/server";
import { AuthDialog } from "@/components/auth/AuthDialog";
import type { RoundView } from "@/components/teams/TeamRound";
import { TeamLeaderboard } from "@/components/teams/TeamLeaderboard";
import { TeamPlay, type TeamView } from "@/components/teams/TeamPlay";
import { TeamSetup } from "@/components/teams/TeamSetup";
import { findGame, quizPoints } from "@/lib/games/gameCatalog";
import { clientQuestionById } from "@/lib/games/questionBank";
import { getViewer } from "@/lib/community/viewer";
import * as repo from "@/lib/teams/teamRepository";
import { asQuizGame } from "@/lib/teams/teamRules";

/** Builds what the current player sees. Answers stay on the server, and only the current question is sent. */
function buildRoundView(round: repo.RoundInfo, team: repo.TeamInfo, viewerId: string): RoundView | null {
  const gameId = asQuizGame(round.gameId);
  if (!gameId) return null;

  const index = round.answers.length;
  const questionId = round.questionIds[index];
  const question = questionId ? clientQuestionById(gameId, questionId) : null;
  const turnMember = team.members[index % team.members.length];
  const nameOf = (userId: string) => team.members.find((m) => m.userId === userId)?.displayName ?? "Member";

  return {
    roundId: round.id,
    index,
    total: round.questionIds.length,
    gameTitle: findGame(gameId)?.title ?? "Team round",
    prompt: question?.prompt ?? "",
    options: question?.options ?? [],
    turnName: turnMember?.displayName ?? "",
    isMyTurn: turnMember?.userId === viewerId,
    history: round.answers.map((answer) => ({ name: nameOf(answer.userId), correct: answer.correct })),
    points: round.answers.filter((answer) => answer.correct).length * quizPoints(1),
  };
}

export async function TeamContent() {
  await connection();

  const viewer = await getViewer();

  if (!viewer) {
    return (
      <div className="mt-10 rounded-3xl border border-white/10 bg-[#241a40]/75 p-8 text-center shadow-xl">
        <p className="font-serif text-2xl text-white">Sign in to play together.</p>
        <p className="mt-2 text-sm text-white/55">You'll need a community name, which you choose once.</p>
        <div className="mt-6 flex justify-center">
          <AuthDialog redirectTo="/play/team" />
        </div>
      </div>
    );
  }

  const [teamId, invites, leaderboard] = await Promise.all([
    repo.findTeamIdForUser(viewer.id),
    repo.listPendingInvites(viewer.id),
    repo.loadLeaderboard(),
  ]);

  if (!teamId) {
    return (
      <>
        <TeamSetup invites={invites} />
        <TeamLeaderboard rows={leaderboard} />
      </>
    );
  }

  const team = await repo.loadTeam(teamId);
  if (!team) {
    return (
      <>
        <TeamSetup invites={invites} />
        <TeamLeaderboard rows={leaderboard} />
      </>
    );
  }

  const [openRound, lastRound] = await Promise.all([
    repo.loadOpenRound(team.id),
    repo.loadLastFinishedRound(team.id),
  ]);

  const teamView: TeamView = {
    id: team.id,
    name: team.name,
    playing: team.playing,
    members: team.members,
  };

  return (
    <>
      <TeamPlay
        team={teamView}
        viewerId={viewer.id}
        round={openRound ? buildRoundView(openRound, team, viewer.id) : null}
        lastPoints={lastRound?.points ?? null}
      />
      <TeamLeaderboard rows={leaderboard} />
    </>
  );
}