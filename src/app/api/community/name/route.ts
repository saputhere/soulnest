import { NextResponse } from "next/server";
import { setMemberName } from "@/lib/community/communityRepository";
import { displayNameSchema } from "@/lib/community/postSchema";
import { getViewer } from "@/lib/community/viewer";

/** Saves the member's name once. Later attempts are rejected. */
export async function POST(request: Request): Promise<NextResponse> {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = displayNameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please choose a valid name." },
      { status: 400 },
    );
  }

  const result = await setMemberName(viewer.id, parsed.data.name);

  if (result.status === "already_set") {
    return NextResponse.json(
      { error: "Your name is already chosen and can't be changed." },
      { status: 409 },
    );
  }
  if (result.status === "taken") {
    return NextResponse.json(
      { error: "That name is already taken. Please choose another." },
      { status: 409 },
    );
  }

  return NextResponse.json({ name: parsed.data.name }, { status: 201 });
}