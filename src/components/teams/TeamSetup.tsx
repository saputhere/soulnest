"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createTeamAction,
  quickJoinAction,
  respondToInviteAction,
  type TeamResult,
} from "@/app/play/team/actions";
import { containerVariants, itemVariants, Notice, PlayButton, PlayCard } from "@/components/play/PlayKit";
import { INPUT_BASE } from "@/components/ui/FormFields";

export interface InviteItem {
  readonly id: string;
  readonly teamName: string;
  readonly inviterName: string;
}

export function TeamSetup({ invites }: { readonly invites: readonly InviteItem[] }) {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [notice, setNotice] = useState<TeamResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<TeamResult>): Promise<void> {
    setBusy(true);
    setNotice(null);
    try {
      const result = await action();
      setNotice(result);
      if (result.status === "ok") router.refresh();
    } catch {
      setNotice({ status: "error", message: "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-10 space-y-6">
      {invites.length > 0 ? (
        <PlayCard>
          <h2 className="font-serif text-2xl text-white">💌 You have invitations</h2>
          <motion.ul variants={containerVariants} initial="hidden" animate="show" className="mt-4 space-y-3">
            {invites.map((invite) => (
              <motion.li
                key={invite.id}
                variants={itemVariants}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.04] p-4"
              >
                <p className="text-sm text-white/80">
                  <span className="font-semibold text-white">{invite.inviterName}</span> invited you to{" "}
                  <span className="font-semibold text-[#b5f5da]">{invite.teamName}</span>
                </p>
                <div className="flex gap-2">
                  <PlayButton disabled={busy} onClick={() => run(() => respondToInviteAction(invite.id, true))}>
                    Join 🎉
                  </PlayButton>
                  <PlayButton variant="ghost" disabled={busy} onClick={() => run(() => respondToInviteAction(invite.id, false))}>
                    Not now
                  </PlayButton>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </PlayCard>
      ) : null}

      <PlayCard delay={0.1}>
        <h2 className="font-serif text-2xl text-white">🌱 Start a team</h2>
        <p className="mt-1 text-sm text-white/55">Name your team, then invite members by their display name.</p>
        <form
          className="mt-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void run(() => createTeamAction(teamName));
          }}
        >
          <label className="sr-only" htmlFor="team-name">
            Team name
          </label>
          <input
            id="team-name"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            maxLength={24}
            placeholder="e.g. Sunny Puzzlers"
            className={`${INPUT_BASE} sm:flex-1`}
          />
          <PlayButton type="submit" disabled={busy || teamName.trim().length < 2}>
            Create team
          </PlayButton>
        </form>
      </PlayCard>

      <PlayCard delay={0.2}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <motion.span
            aria-hidden="true"
            className="text-5xl"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            🎲
          </motion.span>
          <div className="flex-1">
            <h2 className="font-serif text-2xl text-white">No friends to invite yet?</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/55">
              We&apos;ll place you in a team with space. If none has room, we&apos;ll open one, and it can start once
              another member joins.
            </p>
          </div>
          <PlayButton disabled={busy} onClick={() => run(() => quickJoinAction())}>
            Find me a team ✨
          </PlayButton>
        </div>
      </PlayCard>

      <Notice status={notice?.status ?? "idle"} message={notice?.message} />
    </div>
  );
}