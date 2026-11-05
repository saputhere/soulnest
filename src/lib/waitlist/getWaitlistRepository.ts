import { WaitlistNotConfiguredError, type WaitlistRepository } from "./joinWaitlist";

/**
 * Returns the configured waitlist repository.
 *
 * Until the database adapter is added (next step, using Neon and Prisma), this
 * throws so the API returns 503 instead of pretending the email was saved.
 */
export function getWaitlistRepository(): WaitlistRepository {
  throw new WaitlistNotConfiguredError();
}