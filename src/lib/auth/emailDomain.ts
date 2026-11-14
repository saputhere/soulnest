import { resolveMx, resolve4 } from "node:dns/promises";

export { suggestEmailFix } from "./emailSuggestions";

const DNS_TIMEOUT_MS = 3000;

/** Services that issue throwaway addresses. Not exhaustive, but it blocks the most common ones. */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
]);

export function isDisposableDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return DISPOSABLE_DOMAINS.has(domain);
}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("DNS_TIMEOUT")), DNS_TIMEOUT_MS)),
  ]);
}

export type DomainResult =
  | { readonly status: "ok" }
  | { readonly status: "invalid"; readonly message: string };

/**
 * Checks that the domain exists and can receive email. It looks for MX records first, and falls back to
 * an A record. If DNS is slow or unavailable, sign-up is allowed, so a DNS outage doesn't lock out members.
 */
export async function checkEmailDomain(email: string): Promise<DomainResult> {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (!domain) return { status: "invalid", message: "Please enter a valid email address." };

  if (isDisposableDomain(email)) {
    return { status: "invalid", message: "Please use a permanent email address, not a temporary one." };
  }

  try {
    const mx = await withTimeout(resolveMx(domain));
    if (mx.length > 0) return { status: "ok" };
  } catch (error) {
    if (!isNotFound(error)) return { status: "ok" };
  }

  try {
    await withTimeout(resolve4(domain));
    return { status: "ok" };
  } catch (error) {
    if (isNotFound(error)) {
      return {
        status: "invalid",
        message: `We couldn't find a mail server for ${domain}. Please check the address.`,
      };
    }
    return { status: "ok" };
  }
}

function isNotFound(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  return code === "ENOTFOUND" || code === "ENODATA";
}