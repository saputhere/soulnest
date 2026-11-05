import { NextResponse } from "next/server";
import { z } from "zod";
import { getWaitlistRepository } from "@/lib/waitlist/getWaitlistRepository";
import { joinWaitlist, WaitlistNotConfiguredError } from "@/lib/waitlist/joinWaitlist";

const waitlistRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = waitlistRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const result = await joinWaitlist(parsed.data.email, getWaitlistRepository());
    return NextResponse.json({ status: result }, { status: result === "added" ? 201 : 200 });
  } catch (error) {
    if (error instanceof WaitlistNotConfiguredError) {
      return NextResponse.json(
        { error: "The waitlist is temporarily unavailable." },
        { status: 503 },
      );
    }
    throw error;
  }
}