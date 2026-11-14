export type MembershipStatus = "active" | "declined" | "former" | "none";

export interface MembershipSnapshot {
  readonly status: MembershipStatus;
  readonly entitledCents: number | null;
  readonly startedAt: string | null;
  readonly nextChargeAt: string | null;
  readonly lastChargeAt: string | null;
  readonly lastChargeStatus: string | null;
}

export const NO_MEMBERSHIP: MembershipSnapshot = {
  status: "none",
  entitledCents: null,
  startedAt: null,
  nextChargeAt: null,
  lastChargeAt: null,
  lastChargeStatus: null,
};

interface IncludedResource {
  readonly type?: string;
  readonly id?: string;
  readonly attributes?: Record<string, unknown>;
  readonly relationships?: { readonly campaign?: { readonly data?: { readonly id?: string } | null } };
}

/** The parts of Patreon's identity response this code reads. */
export interface PatreonIdentityPayload {
  readonly included?: readonly IncludedResource[];
}

const STATUS_BY_PATREON_VALUE: Record<string, MembershipStatus> = {
  active_patron: "active",
  declined_patron: "declined",
  former_patron: "former",
};

export function toStatus(value: unknown): MembershipStatus {
  return typeof value === "string" && value in STATUS_BY_PATREON_VALUE
    ? STATUS_BY_PATREON_VALUE[value]
    : "none";
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/**
 * Finds this site's membership in Patreon's response. Returns null when the campaign ID
 * isn't configured, so the caller can skip saving instead of erasing a valid status.
 */
export function parseMembership(
  payload: PatreonIdentityPayload,
  campaignId: string | undefined,
): MembershipSnapshot | null {
  if (!campaignId) return null;

  const member = payload.included?.find(
    (resource) => resource.type === "member" && resource.relationships?.campaign?.data?.id === campaignId,
  );
  if (!member) return NO_MEMBERSHIP;

  const attributes = member.attributes ?? {};
  const cents = attributes.currently_entitled_amount_cents;

  return {
    status: toStatus(attributes.patron_status),
    entitledCents: typeof cents === "number" ? cents : null,
    startedAt: asString(attributes.pledge_relationship_start),
    nextChargeAt: asString(attributes.next_charge_date),
    lastChargeAt: asString(attributes.last_charge_date),
    lastChargeStatus: asString(attributes.last_charge_status),
  };
}