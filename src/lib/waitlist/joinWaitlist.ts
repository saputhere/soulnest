/** Storage port. The database adapter implements this, so the use case has no database dependency. */
export interface WaitlistRepository {
  /** Returns "added" for a new email, or "already_joined" if it exists. */
  addEmail(email: string): Promise<"added" | "already_joined">;
}

export class WaitlistNotConfiguredError extends Error {
  constructor() {
    super("Waitlist storage is not configured.");
    this.name = "WaitlistNotConfiguredError";
  }
}

export async function joinWaitlist(
  email: string,
  repository: WaitlistRepository,
): Promise<"added" | "already_joined"> {
  return repository.addEmail(email.trim().toLowerCase());
}