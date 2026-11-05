"use client";

import { useId, useState, type FormEvent } from "react";
import { siteContent } from "@/content/siteContent";

type FormState =
  | { readonly kind: "idle" }
  | { readonly kind: "submitting" }
  | { readonly kind: "success"; readonly message: string }
  | { readonly kind: "error"; readonly message: string };

const { waitlist } = siteContent;

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const inputId = useId();
  const messageId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setState({ kind: "submitting" });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.status === 400) {
        setState({ kind: "error", message: waitlist.invalidEmailMessage });
        return;
      }
      if (response.status === 503) {
        setState({ kind: "error", message: waitlist.unavailableMessage });
        return;
      }
      if (!response.ok) {
        setState({ kind: "error", message: waitlist.genericErrorMessage });
        return;
      }

      const body = (await response.json()) as { status: "added" | "already_joined" };
      setState({
        kind: "success",
        message: body.status === "added" ? waitlist.successMessage : waitlist.alreadyJoinedMessage,
      });
      setEmail("");
    } catch {
      setState({ kind: "error", message: waitlist.genericErrorMessage });
    }
  }

  const isSubmitting = state.kind === "submitting";
  const statusMessage = state.kind === "success" || state.kind === "error" ? state.message : null;

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-md" noValidate>
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={waitlist.placeholder}
          aria-describedby={statusMessage ? messageId : undefined}
          aria-invalid={state.kind === "error"}
          className="flex-1 rounded-full border border-line bg-raised px-6 py-4 text-ink placeholder:text-ink-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-sage-strong px-8 py-4 font-semibold text-on-sage shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Joining..." : waitlist.cta}
        </button>
      </div>

      <p
        id={messageId}
        role="status"
        aria-live="polite"
        className={`mt-4 min-h-6 text-center text-sm ${state.kind === "error" ? "text-rose-strong" : "text-ink-muted"}`}
      >
        {statusMessage}
      </p>
    </form>
  );
}