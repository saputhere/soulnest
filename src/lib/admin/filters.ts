import { DELIVERY_STATUSES, type DeliveryStatus } from "./deliveryStatus";

export interface DeliveryFilters {
  readonly from: string | null;
  readonly to: string | null;
  readonly status: DeliveryStatus | null;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Accepts only valid dates and known statuses. Anything else is ignored, never passed to the database. */
export function parseFilters(input: {
  readonly from?: string;
  readonly to?: string;
  readonly status?: string;
}): DeliveryFilters {
  const status = (DELIVERY_STATUSES as readonly string[]).includes(input.status ?? "")
    ? (input.status as DeliveryStatus)
    : null;

  return {
    from: input.from && ISO_DATE.test(input.from) ? input.from : null,
    to: input.to && ISO_DATE.test(input.to) ? input.to : null,
    status,
  };
}

/** Turns filters back into a query string, for links such as the CSV export. */
export function filtersToQuery(filters: DeliveryFilters): string {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.status) params.set("status", filters.status);
  return params.toString();
}