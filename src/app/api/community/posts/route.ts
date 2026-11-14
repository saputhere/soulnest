import { NextResponse } from "next/server";
import { createPost } from "@/lib/community/communityRepository";
import { createPostSchema } from "@/lib/community/postSchema";
import { getViewer } from "@/lib/community/viewer";

export async function POST(request: Request): Promise<NextResponse> {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Please sign in to share a thought." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your message and try again." }, { status: 400 });
  }

  const id = await createPost(viewer.id, parsed.data);
  if (!id) {
    return NextResponse.json({ error: "Choose your community name before sharing." }, { status: 403 });
  }

  return NextResponse.json({ id }, { status: 201 });
}