"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { checkEmailDomain, suggestEmailFix } from "@/lib/auth/emailDomain";
import { createLocalAccount } from "@/lib/auth/localAccounts";
import { hashPassword } from "@/lib/auth/passwords";
import { loginSchema, signupSchema } from "@/lib/auth/schemas";

export type AuthFormState =
  | { readonly status: "idle" }
  | { readonly status: "error"; readonly message: string };

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Only paths on this site are allowed, so the sign-in flow can't be used to send people elsewhere. */
function safeRedirect(formData: FormData): string {
  const target = text(formData, "redirectTo");
  return target.startsWith("/") && !target.startsWith("//") ? target : "/";
}

async function signInLocal(email: string, password: string, redirectTo: string): Promise<AuthFormState> {
  try {
    await signIn("local", { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", message: "That email or password isn't right." };
    }
    throw error;
  }
  return { status: "idle" };
}

export async function signInWithPatreonTo(formData: FormData): Promise<void> {
  await signIn("patreon", { redirectTo: safeRedirect(formData) });
}

export async function signInWithPassword(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: text(formData, "email"),
    password: text(formData, "password"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  return signInLocal(parsed.data.email, parsed.data.password, safeRedirect(formData));
}

export async function signUpWithPassword(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    name: text(formData, "name"),
    displayName: text(formData, "displayName"),
    email: text(formData, "email"),
    password: text(formData, "password"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const suggestion = suggestEmailFix(parsed.data.email);
  if (suggestion) {
    return { status: "error", message: `Did you mean ${suggestion}?` };
  }

  const domain = await checkEmailDomain(parsed.data.email);
  if (domain.status === "invalid") {
    return { status: "error", message: domain.message };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const created = await createLocalAccount({
    email: parsed.data.email,
    name: parsed.data.name,
    displayName: parsed.data.displayName,
    passwordHash,
  });

  if (created.status === "patreon_account_exists") {
    return {
      status: "error",
      message: "This email already has a Patreon account. Continue with Patreon instead.",
    };
  }

  if (created.status === "taken") {
    return { status: "error", message: "That email or display name is already taken." };
  }

  return signInLocal(parsed.data.email, parsed.data.password, safeRedirect(formData));
}

export async function signOutFromHome(): Promise<void> {
  await signOut({ redirectTo: "/" });
}