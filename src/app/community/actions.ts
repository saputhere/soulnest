"use server";

import { signIn, signOut } from "@/auth";

export async function signInWithPatreon(): Promise<void> {
  await signIn("patreon", { redirectTo: "/community" });
}

/** Signs in again to pull the latest membership status from Patreon. */
export async function refreshMembership(): Promise<void> {
  await signIn("patreon", { redirectTo: "/community" });
}

export async function signOutOfCommunity(): Promise<void> {
  await signOut({ redirectTo: "/community" });
}