import { neon } from "@neondatabase/serverless";
import type { WaitlistRepository } from "./joinWaitlist";
import { WaitlistNotConfiguredError } from "./joinWaitlist";

/**
 * Neon-backed waitlist repository.
 * Uses one parameterized INSERT. The UNIQUE constraint on email decides whether
 * the row is new, so duplicate signups are handled by the database, not by app code.
 */
export function getWaitlistRepository(): WaitlistRepository {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new WaitlistNotConfiguredError();
  }

  const sql = neon(databaseUrl);

  return {
    async addEmail(email: string): Promise<"added" | "already_joined"> {
      const rows = await sql`
        INSERT INTO waitlist_entries (email)
        VALUES (${email})
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `;
      return rows.length > 0 ? "added" : "already_joined";
    },
  };
}