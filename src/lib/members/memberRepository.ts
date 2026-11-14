import { getSql } from "@/lib/db";
import type { MemberRole } from "@/types/next-auth";

interface SavedMember {
  readonly id: string;
  readonly role: MemberRole;
}

/** Creates or updates the member on each sign-in. Returns the internal ID and role. */
export async function saveMember(
  patreonId: string,
  fullName: string | null,
  email: string | null,
): Promise<SavedMember> {
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO users (patreon_id, full_name, email)
    VALUES (${patreonId}, ${fullName}, ${email})
    ON CONFLICT (patreon_id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      last_seen_at = now()
    RETURNING id, role
  `) as { id: string; role: MemberRole }[];

  return rows[0];
}