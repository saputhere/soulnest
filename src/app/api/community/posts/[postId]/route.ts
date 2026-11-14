import { NextResponse } from "next/server";
import { deletePost } from "@/lib/community/communityRepository";
import { postIdSchema } from "@/lib/community/postSchema";
import { getViewer } from "@/lib/community/viewer";

interface RouteContext {
  readonly params: Promise<{ postId: string }>;
}

/** Members can delete their own posts. Admins can delete any post. */
export async function DELETE(_request: Request, context: RouteContext): Promise<NextResponse> {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const { postId } = await context.params;
  if (!postIdSchema.safeParse(postId).success) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const deleted = await deletePost(postId, viewer);
  if (!deleted) {
    return NextResponse.json({ error: "This post can't be deleted." }, { status: 404 });
  }

  return NextResponse.json({ status: "deleted" });
}