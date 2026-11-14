import { getSql } from "@/lib/db";
import type { DeliveryStatus } from "./deliveryStatus";
import type { DeliveryFilters } from "./filters";

export interface ShipTo {
  readonly fullName: string;
  readonly phone: string;
  readonly line1: string;
  readonly line2: string;
  readonly city: string;
  readonly postalCode: string;
  readonly country: string;
}

export interface AdminDelivery {
  readonly id: string;
  readonly kind: "letter" | "gift";
  readonly occasion: string;
  readonly details: string;
  readonly sendOn: string;
  readonly status: DeliveryStatus;
  readonly memberName: string;
  readonly memberEmail: string;
  readonly ship: ShipTo;
}

interface DeliveryRow {
  id: string;
  kind: "letter" | "gift";
  occasion: string;
  details: string;
  send_on: string;
  status: DeliveryStatus;
  member_name: string | null;
  member_email: string | null;
  ship_to: ShipTo;
}

/** Deliveries matching the filters, earliest post-on date first. Capped to keep pages responsive. */
export async function listAdminDeliveries(filters: DeliveryFilters): Promise<AdminDelivery[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT
      d.id,
      d.kind,
      d.occasion,
      d.details,
      to_char(d.send_on, 'YYYY-MM-DD') AS send_on,
      d.status,
      COALESCE(u.display_name, u.full_name) AS member_name,
      COALESCE(u.login_email, u.email) AS member_email,
      d.ship_to
    FROM scheduled_deliveries d
    JOIN users u ON u.id = d.user_id
    WHERE (${filters.from}::date IS NULL OR d.send_on >= ${filters.from}::date)
      AND (${filters.to}::date IS NULL OR d.send_on <= ${filters.to}::date)
      AND (${filters.status}::text IS NULL OR d.status = ${filters.status}::text)
    ORDER BY d.send_on ASC, d.created_at ASC
    LIMIT 500
  `) as DeliveryRow[];

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    occasion: row.occasion,
    details: row.details,
    sendOn: row.send_on,
    status: row.status,
    memberName: row.member_name ?? "Unknown member",
    memberEmail: row.member_email ?? "",
    ship: row.ship_to,
  }));
}

/** Updates any delivery's status. Only called from admin-checked actions. */
export async function setDeliveryStatus(deliveryId: string, status: DeliveryStatus): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE scheduled_deliveries
    SET status = ${status}::text, updated_at = now()
    WHERE id = ${deliveryId}::uuid
    RETURNING id
  `) as { id: string }[];

  return rows.length > 0;
}