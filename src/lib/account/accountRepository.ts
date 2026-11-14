import { getSql } from "@/lib/db";
import type { AddressInput, DeliveryInput } from "./accountSchemas";

export interface SavedAddress extends AddressInput {
  readonly isDomestic: boolean;
}

export interface DeliveryRecord {
  readonly id: string;
  readonly kind: "letter" | "gift";
  readonly occasion: string;
  readonly details: string;
  readonly sendOn: string;
  readonly leadDays: number;
  readonly status: string;
}

interface AddressRow {
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  postal_code: string | null;
  country: string;
  is_domestic: boolean;
}

interface DeliveryRow {
  id: string;
  kind: "letter" | "gift";
  occasion: string;
  details: string;
  send_on: string;
  lead_days: number;
  status: string;
}

export async function getAddress(userId: string): Promise<SavedAddress | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT full_name, phone, line1, line2, city, postal_code, country, is_domestic
    FROM member_addresses
    WHERE user_id = ${userId}::uuid
  `) as AddressRow[];

  const row = rows[0];
  if (!row) return null;

  return {
    fullName: row.full_name,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2 ?? "",
    city: row.city,
    postalCode: row.postal_code ?? "",
    country: row.country,
    isDomestic: row.is_domestic,
  };
}

export async function upsertAddress(userId: string, input: AddressInput, isDomestic: boolean): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO member_addresses
      (user_id, full_name, phone, line1, line2, city, postal_code, country, is_domestic)
    VALUES
      (${userId}::uuid, ${input.fullName}, ${input.phone}, ${input.line1},
       ${input.line2 || null}, ${input.city}, ${input.postalCode || null}, ${input.country}, ${isDomestic})
    ON CONFLICT (user_id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      line1 = EXCLUDED.line1,
      line2 = EXCLUDED.line2,
      city = EXCLUDED.city,
      postal_code = EXCLUDED.postal_code,
      country = EXCLUDED.country,
      is_domestic = EXCLUDED.is_domestic,
      updated_at = now()
  `;
}

export async function createDelivery(
  userId: string,
  input: DeliveryInput,
  leadDays: number,
  shipTo: AddressInput,
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO scheduled_deliveries (user_id, kind, occasion, details, send_on, lead_days, ship_to)
    VALUES (
      ${userId}::uuid, ${input.kind}, ${input.occasion}, ${input.details},
      ${input.sendOn}::date, ${leadDays}, ${JSON.stringify(shipTo)}::jsonb
    )
  `;
}

export async function listDeliveries(userId: string): Promise<DeliveryRecord[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, kind, occasion, details,
           to_char(send_on, 'YYYY-MM-DD') AS send_on,
           lead_days, status
    FROM scheduled_deliveries
    WHERE user_id = ${userId}::uuid
    ORDER BY send_on ASC
  `) as DeliveryRow[];

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    occasion: row.occasion,
    details: row.details,
    sendOn: row.send_on,
    leadDays: row.lead_days,
    status: row.status,
  }));
}

/** Cancels only the member's own deliveries, and only before they're packed. */
export async function cancelDelivery(userId: string, deliveryId: string): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE scheduled_deliveries
    SET status = 'cancelled', updated_at = now()
    WHERE id = ${deliveryId}::uuid AND user_id = ${userId}::uuid AND status = 'scheduled'
    RETURNING id
  `) as { id: string }[];

  return rows.length > 0;
}