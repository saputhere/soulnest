import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { reportPost } from "@/lib/community/communityRepository";
import { postIdSchema, reportSchema } from "@/lib/community/postSchema";

interface RouteContext {
  readonly params: Promise<{ postId: string }>;
}

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Please sign in to report a post." }, { status: 401 });
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

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please choose a reason." }, { status: 400 });
  }

  const recorded = await reportPost(postId, session.user.id, parsed.data.reason);
  if (!recorded) {
    return NextResponse.json(
      { error: "You've already reported this post, or it can't be reported." },
      { status: 409 },
    );
  }

  return NextResponse.json({ status: "reported" });
}