"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  inviteMemberAction,
  leaveTeamAction,
  startRoundAction,
  type TeamResult,
} from "@/app/play/team/actions";
import { Notice, PlayButton, PlayCard } from "@/components/play/PlayKit";
import { INPUT_BASE } from "@/components/ui/FormFields";
import { GAMES } from "@/lib/games/gameCatalog";
import { TEAM_MAX_SIZE, TEAM_MIN_TO_START } from "@/lib/teams/teamRules";
import { TeamRound, type RoundView } from "./TeamRound";

export interface TeamView {
  readonly id: string;
  readonly name: string;
  readonly playing: boolean;
  readonly members: readonly { readonly userId: string; readonly displayName: string }[];
}

interface TeamPlayProps {
  readonly team: TeamView;
  readonly viewerId: string;
  readonly round: RoundView | null;
  readonly lastPoints: number | null;
}

const AVATAR = [
  "from-[#ffd1e5] to-[#ffb8d6]",
  "from-[#cfeaff] to-[#a9dcff]",
  "from-[#c9f7e3] to-[#8fe3c0]",
  "from-[#fff3b8] to-[#ffd98a]",
];

const QUIZ_GAMES = GAMES.filter((game) => game.kind === "quiz");

export function TeamPlay({ team, viewerId, round, lastPoints }: TeamPlayProps) {
  const router = useRouter();
  const [inviteName, setInviteName] = useState("");
  const [gameId, setGameId] = useState<string>(QUIZ_GAMES[0].id);
  const [notice, setNotice] = useState<TeamResult | null>(null);
  const [busy, setBusy] = useState(false);

  const memberCount = team.members.length;
  const isFull = memberCount >= TEAM_MAX_SIZE;
  const canStart = memberCount >= TEAM_MIN_TO_START && !team.playing;

  async function run(action: () => Promise<TeamResult>, onSuccess?: () => void): Promise<void> {
    setBusy(true);
    setNotice(null);
    try {
      const result = await action();
      setNotice(result);
      if (result.status === "ok") {
        onSuccess?.();
        router.refresh();
      }
    } catch {
      setNotice({ status: "error", message: "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-10 space-y-6">
      <PlayCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">Your team</p>
            <h2 className="mt-1 font-serif text-3xl text-white">🏡 {team.name}</h2>
            <div className="mt-3 flex items-center gap-1.5" aria-label={`${memberCount} of ${TEAM_MAX_SIZE} members`}>
              {Array.from({ length: TEAM_MAX_SIZE }, (_, index) => (
                <motion.span
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 16, delay: 0.1 + index * 0.06 }}
                  className={`h-2.5 w-2.5 rounded-full ${index < memberCount ? "bg-[#b5f5da]" : "bg-white/15"}`}
                />
              ))}
              <span className="ml-2 text-xs text-white/50">
                {memberCount} of {TEAM_MAX_SIZE} {team.playing ? "· round in progress" : ""}
              </span>
            </div>
          </div>

          {lastPoints !== null ? (
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-full border border-[#b5f5da]/25 bg-[#b5f5da]/10 px-4 py-1.5 text-xs text-[#b5f5da]"
            >
              🏆 Last round: {lastPoints} points
            </motion.p>
          ) : null}
        </div>

        <ul className="mt-6 flex flex-wrap gap-3">
          {team.members.map((member, index) => {
            const isMe = member.userId === viewerId;
            return (
              <motion.li
                key={member.userId}
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 + index * 0.08 }}
                className={`flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 text-sm ${
                  isMe ? "border-[#b5f5da]/50 bg-[#b5f5da]/10 text-white" : "border-white/10 bg-white/5 text-white/80"
                }`}
              >
                <motion.span
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.4 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-[#2a1f4a] ${AVATAR[index % AVATAR.length]}`}
                  aria-hidden="true"
                >
                  {member.displayName.charAt(0).toUpperCase()}
                </motion.span>
                {member.displayName}
                {isMe ? <span className="text-xs text-white/50">(you)</span> : null}
              </motion.li>
            );
          })}
        </ul>
      </PlayCard>

      {round ? (
        <TeamRound key={`${round.roundId}-${round.index}`} view={round} />
      ) : (
        <PlayCard delay={0.1}>
          <h2 className="font-serif text-2xl text-white">🎮 Start a round</h2>
          <p className="mt-1 text-sm text-white/55">
            {canStart
              ? "Pick a game. Each member answers in turn, and the team total is shared."
              : `A team needs at least ${TEAM_MIN_TO_START} members to start.`}
          </p>

          <div role="radiogroup" aria-label="Choose a game" className="mt-5 flex flex-wrap gap-2">
            {QUIZ_GAMES.map((game) => {
              const active = gameId === game.id;
              return (
                <button
                  key={game.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={!canStart || busy}
                  onClick={() => setGameId(game.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition duration-200 hover:-translate-y-0.5 disabled:opacity-40 ${
                    active
                      ? "border-[#b5f5da]/60 bg-[#b5f5da]/15 text-white"
                      : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10"
                  }`}
                >
                  {game.title}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <PlayButton disabled={!canStart || busy} onClick={() => run(() => startRoundAction(team.id, gameId))}>
              Start round 🚀
            </PlayButton>
          </div>
        </PlayCard>
      )}

      {!team.playing && !isFull ? (
        <PlayCard delay={0.15}>
          <h2 className="font-serif text-2xl text-white">💌 Invite a friend</h2>
          <p className="mt-1 text-sm text-white/55">Enter the display name of a member you know.</p>
          <form
            className="mt-5 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void run(() => inviteMemberAction(team.id, inviteName), () => setInviteName(""));
            }}
          >
            <label className="sr-only" htmlFor="invite-name">
              Display name
            </label>
            <input
              id="invite-name"
              value={inviteName}
              onChange={(event) => setInviteName(event.target.value)}
              maxLength={24}
              placeholder="Their display name"
              className={`${INPUT_BASE} sm:flex-1`}
            />
            <PlayButton type="submit" disabled={busy || inviteName.trim().length < 2}>
              Send invite
            </PlayButton>
          </form>
        </PlayCard>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Notice status={notice?.status ?? "idle"} message={notice?.message} />
        <PlayButton variant="ghost" disabled={busy || team.playing} onClick={() => run(() => leaveTeamAction(team.id))}>
          Leave team
        </PlayButton>
      </div>
    </div>
  );
}