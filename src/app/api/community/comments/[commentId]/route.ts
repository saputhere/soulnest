import { NextResponse } from "next/server";
import { deleteComment } from "@/lib/community/communityRepository";
import { commentIdSchema } from "@/lib/community/postSchema";
import { getViewer } from "@/lib/community/viewer";

interface RouteContext {
  readonly params: Promise<{ commentId: string }>;
}

/** Members can delete their own comments. Admins can delete any comment. */
export async function DELETE(_request: Request, context: RouteContext): Promise<NextResponse> {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const { commentId } = await context.params;
  if (!commentIdSchema.safeParse(commentId).success) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  const deleted = await deleteComment(commentId, viewer);
  if (!deleted) {
    return NextResponse.json({ error: "This comment can't be deleted." }, { status: 404 });
  }

  return NextResponse.json({ status: "deleted" });
}