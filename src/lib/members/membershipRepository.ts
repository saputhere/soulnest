import { getSql } from "@/lib/db";
import { NO_MEMBERSHIP, toStatus, type MembershipSnapshot } from "./membership";

export interface StoredMembership extends MembershipSnapshot {
  readonly checkedAt: string | null;
}

interface MembershipRow {
  patron_status: string | null;
  entitled_cents: number | null;
  membership_started_at: string | null;
  next_charge_at: string | null;
  last_charge_at: string | null;
  last_charge_status: string | null;
  membership_checked_at: string | null;
}

/** Saves the latest membership snapshot for a member. Called at each sign-in. */
export async function saveMembership(userId: string, membership: MembershipSnapshot): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users SET
      patron_status = ${membership.status}::text,
      entitled_cents = ${membership.entitledCents}::integer,
      membership_started_at = ${membership.startedAt}::timestamptz,
      next_charge_at = ${membership.nextChargeAt}::timestamptz,
      last_charge_at = ${membership.lastChargeAt}::timestamptz,
      last_charge_status = ${membership.lastChargeStatus}::text,
      membership_checked_at = now()
    WHERE id = ${userId}::uuid
  `;
}

/** Reads the saved membership for a member. Returns "none" if they have never been checked. */
export async function getMembership(userId: string): Promise<StoredMembership> {
  const sql = getSql();
  const rows = (await sql`
    SELECT patron_status, entitled_cents, membership_started_at, next_charge_at,
           last_charge_at, last_charge_status, membership_checked_at
    FROM users WHERE id = ${userId}::uuid
  `) as MembershipRow[];

  const row = rows[0];
  if (!row || !row.patron_status) {
    return { ...NO_MEMBERSHIP, checkedAt: null };
  }

  return {
    status: toStatus(row.patron_status),
    entitledCents: row.entitled_cents,
    startedAt: row.membership_started_at,
    nextChargeAt: row.next_charge_at,
    lastChargeAt: row.last_charge_at,
    lastChargeStatus: row.last_charge_status,
    checkedAt: row.membership_checked_at,
  };
}