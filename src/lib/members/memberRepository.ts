import { getSql } from "@/lib/db";
import type { MemberRole } from "@/types/next-auth";

export interface SavedMember {
  readonly id: string;
  readonly role: MemberRole;
}

/** Creates or updates the member for a Patreon ID. Called on each Patreon sign-in. */
export async function saveMember(
  patreonId: string,
  fullName: string | null,
  email: string | null,
): Promise<SavedMember> {
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO users (patreon_id, full_name, email)
    VALUES (${patreonId}::text, ${fullName}::text, ${email}::text)
    ON CONFLICT (patreon_id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      last_seen_at = now()
    RETURNING id, role
  `) as SavedMember[];

  return rows[0];
}

/**
 * Finds or creates the member for a Patreon sign-in.
 * 1. An account already linked to this Patreon ID wins.
 * 2. Otherwise, an email account with the same email gets the Patreon ID attached.
 * 3. Otherwise, a new account is created.
 */
export async function linkPatreonMember(
  patreonId: string,
  fullName: string | null,
  email: string | null,
): Promise<SavedMember> {
  const sql = getSql();

  const byPatreon = (await sql`
    SELECT id, role FROM users WHERE patreon_id = ${patreonId}::text LIMIT 1
  `) as SavedMember[];
  if (byPatreon[0]) return saveMember(patreonId, fullName, email);

  const normalized = email?.trim().toLowerCase() ?? null;

  if (normalized) {
    const matches = (await sql`
      SELECT id, role FROM users
      WHERE lower(login_email) = ${normalized}::text
      LIMIT 1
    `) as SavedMember[];

    if (matches[0]) {
      const linked = (await sql`
        UPDATE users
        SET patreon_id = ${patreonId}::text,
            full_name = COALESCE(full_name, ${fullName}::text),
            email = ${normalized}::text,
            last_seen_at = now()
        WHERE id = ${matches[0].id}::uuid AND patreon_id IS NULL
        RETURNING id, role
      `) as SavedMember[];

      if (linked[0]) return linked[0];
    }
  }

  return saveMember(patreonId, fullName, email);
}