import Link from "next/link";
import { connection } from "next/server";
import { LogOut, UserRound } from "lucide-react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { signOutFromHome } from "@/lib/auth/actions";
import { getAccountNames } from "@/lib/community/communityRepository";
import { getViewer } from "@/lib/community/viewer";

const PILL =
  "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export async function HomeAuthChip() {
  await connection();

  const viewer = await getViewer();
  if (!viewer) return <AuthDialog redirectTo="/" />;

  const names = await getAccountNames(viewer.id);
  // Community name first (once chosen), then the name entered at sign-up or from Patreon.
  const label = names.displayName ?? names.fullName?.trim() ?? "Member";

  return (
    <div className="flex items-center gap-2">
      <Link href="/account" className={PILL} title={label}>
        <UserRound className="h-4 w-4" aria-hidden="true" />
        <span className="max-w-[10rem] truncate">{label}</span>
      </Link>
      <form action={signOutFromHome}>
        <button type="submit" className={PILL}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Log out
        </button>
      </form>
    </div>
  );
}