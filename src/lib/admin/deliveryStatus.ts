export const DELIVERY_STATUSES = [
  "scheduled",
  "packed",
  "posted",
  "delivered",
  "delayed",
  "cancelled",
] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const STATUS_LABELS: Record<DeliveryStatus, string> = {
  scheduled: "Scheduled",
  packed: "Packed",
  posted: "Posted",
  delivered: "Delivered",
  delayed: "Delayed in post",
  cancelled: "Cancelled",
};

export const KIND_LABELS: Record<"letter" | "gift", string> = {
  letter: "Letter",
  gift: "Gift",
};

/** Formats a YYYY-MM-DD value without time zone shifts. */
export function formatIsoDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}