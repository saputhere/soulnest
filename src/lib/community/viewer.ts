import { auth } from "@/auth";

export interface Viewer {
  readonly id: string;
  readonly isAdmin: boolean;
}

/** Returns the signed-in member, or null for visitors. Runs on the server only. */
export async function getViewer(): Promise<Viewer | null> {
  const session = await auth();
  if (!session?.user.id) return null;
  return { id: session.user.id, isAdmin: session.user.role === "admin" };
}