import { getSql } from "@/lib/db";

export interface LocalAccount {
  readonly id: string;
  readonly name: string;
  readonly role: "member" | "admin";
  readonly passwordHash: string;
}

interface LocalAccountRow {
  id: string;
  full_name: string | null;
  role: "member" | "admin";
  password_hash: string;
}

export type CreateLocalAccountResult =
  | { readonly status: "created"; readonly id: string }
  | { readonly status: "taken" }
  | { readonly status: "patreon_account_exists" };

/** Finds a local account by email. Patreon-only accounts have no password, so they never match. */
export async function findLocalAccount(email: string): Promise<LocalAccount | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, full_name, role, password_hash
    FROM users
    WHERE lower(login_email) = ${email}::text AND password_hash IS NOT NULL
    LIMIT 1
  `) as LocalAccountRow[];

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    name: row.full_name ?? "",
    role: row.role,
    passwordHash: row.password_hash,
  };
}

/**
 * Creates an email account with a display name. Refuses if the email already belongs to any account,
 * including a Patreon account. A taken display name (unique index) is reported as "taken".
 */
export async function createLocalAccount(input: {
  readonly email: string;
  readonly name: string;
  readonly displayName: string;
  readonly passwordHash: string;
}): Promise<CreateLocalAccountResult> {
  const sql = getSql();

  const existing = (await sql`
    SELECT id, patreon_id
    FROM users
    WHERE lower(coalesce(login_email, email)) = ${input.email}::text
    LIMIT 1
  `) as { id: string; patreon_id: string | null }[];

  if (existing[0]?.patreon_id) {
    return { status: "patreon_account_exists" };
  }
  if (existing[0]) {
    return { status: "taken" };
  }

  try {
    const rows = (await sql`
      INSERT INTO users (login_email, full_name, display_name, password_hash)
      VALUES (
        ${input.email}::text,
        ${input.name}::text,
        ${input.displayName}::text,
        ${input.passwordHash}::text
      )
      RETURNING id
    `) as { id: string }[];

    return { status: "created", id: rows[0].id };
  } catch (error) {
    // 23505 is PostgreSQL's unique-violation code. It covers a taken display name and a race between two sign-ups.
    if (typeof error === "object" && error !== null && (error as { code?: string }).code === "23505") {
      return { status: "taken" };
    }
    throw error;
  }
}