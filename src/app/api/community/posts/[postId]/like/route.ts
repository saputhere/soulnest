import { NextResponse } from "next/server";
import { toggleLike } from "@/lib/community/communityRepository";
import { postIdSchema } from "@/lib/community/postSchema";
import { getViewer } from "@/lib/community/viewer";

interface RouteContext {
  readonly params: Promise<{ postId: string }>;
}

export async function POST(_request: Request, context: RouteContext): Promise<NextResponse> {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Please sign in to like posts." }, { status: 401 });
  }

  const { postId } = await context.params;
  if (!postIdSchema.safeParse(postId).success) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const result = await toggleLike(postId, viewer.id);
  return NextResponse.json(result);
}