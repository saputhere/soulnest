import { NextResponse } from "next/server";
import { createComment } from "@/lib/community/communityRepository";
import { commentSchema, postIdSchema } from "@/lib/community/postSchema";
import { getViewer } from "@/lib/community/viewer";

interface RouteContext {
  readonly params: Promise<{ postId: string }>;
}

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Please sign in to comment." }, { status: 401 });
  }

  const { postId } = await context.params;
  if (!postIdSchema.safeParse(postId).success) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Comments can be up to 500 characters." }, { status: 400 });
  }

  const result = await createComment(postId, viewer.id, parsed.data.body);

  if (result.status === "no_name") {
    return NextResponse.json({ error: "Choose your community name before commenting." }, { status: 403 });
  }
  if (result.status === "unavailable") {
    return NextResponse.json({ error: "This post is no longer available." }, { status: 404 });
  }

  return NextResponse.json({ id: result.id }, { status: 201 });
}