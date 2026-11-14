import Link from "next/link";
import { connection } from "next/server";
import { Home, LogOut } from "lucide-react";
import { getMemberName } from "@/lib/community/communityRepository";
import { getViewer } from "@/lib/community/viewer";
import { signInWithPatreon, signOutOfCommunity } from "./actions";

export const NAV_BUTTON =
  "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white";

/** Shows the signed-in member's name and sign-out, or a sign-in button for visitors. */
export async function AccountChip() {
  await connection();

  const viewer = await getViewer();

  if (!viewer) {
    return (
      <form action={signInWithPatreon}>
        <button type="submit" className={NAV_BUTTON}>
          Sign in
        </button>
      </form>
    );
  }

  const displayName = (await getMemberName(viewer.id)) ?? "New member";

  return (
    <div className="flex items-center gap-2">
      <span className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white sm:inline-block">
        <span className="text-white/50">Signed in as </span>
        <span className="font-semibold">{displayName}</span>
      </span>
      <form action={signOutOfCommunity}>
        <button type="submit" className={NAV_BUTTON}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </form>
    </div>
  );
}