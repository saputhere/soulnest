import { getViewer, type Viewer } from "@/lib/community/viewer";

/** Returns the viewer only if they are an admin. Every admin page, action, and download calls this. */
export async function getAdminViewer(): Promise<Viewer | null> {
  const viewer = await getViewer();
  return viewer?.isAdmin ? viewer : null;
}