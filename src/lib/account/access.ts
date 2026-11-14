import { getViewer, type Viewer } from "@/lib/community/viewer";
import { getMembership } from "@/lib/members/membershipRepository";

export type Access =
  | { readonly ok: true; readonly viewer: Viewer }
  | { readonly ok: false; readonly error: string };

/** Any signed-in member. Used for saving an address and cancelling a delivery. */
export async function requireSignedIn(): Promise<Access> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Please sign in with Patreon first." };
  return { ok: true, viewer };
}

/** Scheduling is for active subscribers. Admins are always allowed. */
export async function requireActiveMember(): Promise<Access> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Please sign in with Patreon first." };
  if (viewer.isAdmin) return { ok: true, viewer };

  const membership = await getMembership(viewer.id);
  if (membership.status !== "active") {
    return {
      ok: false,
      error: "Planned letters and gifts are for active members. Subscribe on Patreon to unlock them.",
    };
  }
  return { ok: true, viewer };
}