"use client";

import { CalendarDays, Gift, Lock, Mail } from "lucide-react";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { scheduleDeliveryAction, type ActionState } from "@/app/account/actions";
import { FormStatus, INPUT_BASE, RequiredNote, TextField } from "@/components/ui/FormFields";

const MAX_DETAILS = 2000;
const INITIAL: ActionState = { status: "idle" };

const KINDS = [
  {
    value: "letter",
    label: "A letter to myself",
    description: "Written by you, posted on the day you choose.",
    Icon: Mail,
  },
  {
    value: "gift",
    label: "A gift for a milestone",
    description: "Tell us what you'd love to receive.",
    Icon: Gift,
  },
] as const;

type Kind = (typeof KINDS)[number]["value"];

interface PlanDeliveryFormProps {
  readonly canSchedule: boolean;
  readonly minDate: string;
  readonly leadDays: number;
  readonly blockedReason: string | null;
}

/** Formats a YYYY-MM-DD value for display, without time zone shifts. */
function formatIsoDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PlanDeliveryForm({ canSchedule, minDate, leadDays, blockedReason }: PlanDeliveryFormProps) {
  const [state, formAction, isPending] = useActionState(scheduleDeliveryAction, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);
  const detailsId = useId();
  const [kind, setKind] = useState<Kind>("letter");
  const [detailsLength, setDetailsLength] = useState(0);

  // Reset the form after a successful booking.
  useEffect(() => {
    if (state.status === "ok") {
      formRef.current?.reset();
      setKind("letter");
      setDetailsLength(0);
    }
  }, [state]);

  const remaining = MAX_DETAILS - detailsLength;

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {blockedReason ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[#ffd98a]/25 bg-[#ffd98a]/10 p-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#ffe9b0]" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-[#ffe9b0]">{blockedReason}</p>
        </div>
      ) : null}

      <RequiredNote />

      <fieldset disabled={!canSchedule} className="min-w-0 space-y-6 border-0 p-0 disabled:opacity-60">
        <legend className="mb-3 text-xs font-medium text-white/85">
          What would you like to send yourself?
          <span className="ml-0.5 text-[#ffb8d6]" aria-hidden="true">
            *
          </span>
          <span className="sr-only"> (required)</span>
        </legend>

        <div className="grid gap-3 sm:grid-cols-2">
          {KINDS.map(({ value, label, description, Icon }) => {
            const selected = kind === value;
            return (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition focus-within:ring-2 focus-within:ring-[#b5f5da]/50 ${
                  selected
                    ? "border-[#b5f5da]/60 bg-[#b5f5da]/10"
                    : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
                }`}
              >
                <input
                  type="radio"
                  name="kind"
                  value={value}
                  checked={selected}
                  onChange={() => setKind(value)}
                  required
                  className="sr-only"
                />
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    selected ? "bg-[#b5f5da]/20 text-[#b5f5da]" : "bg-white/10 text-white/60"
                  }`}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white">{label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-white/55">{description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset disabled={!canSchedule} className="grid min-w-0 gap-5 border-0 p-0 disabled:opacity-60 sm:grid-cols-2">
        <legend className="sr-only">Delivery details</legend>

        <TextField
          label="Occasion"
          name="occasion"
          maxLength={80}
          placeholder="Birthday, graduation, first job..."
          hint="Optional"
        />

        <TextField
          label="Post on"
          name="sendOn"
          type="date"
          required
          min={minDate}
          className="cursor-pointer"
          hint={`Earliest ${formatIsoDate(minDate)}`}
        />

        <div className="sm:col-span-2">
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <label htmlFor={detailsId} className="text-xs font-medium text-white/85">
              Your letter or gift request
              <span className="ml-0.5 text-[#ffb8d6]" aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </label>
            <span className={`text-[11px] ${remaining < 100 ? "text-[#ffd98a]" : "text-white/40"}`}>
              {remaining} characters left
            </span>
          </div>
          <textarea
            id={detailsId}
            name="details"
            required
            aria-required="true"
            rows={6}
            maxLength={MAX_DETAILS}
            onChange={(event) => setDetailsLength(event.target.value.length)}
            placeholder={
              kind === "letter"
                ? "Write the letter you want us to post to yourself."
                : "Describe the gift you'd like, and any details we should know."
            }
            className={`${INPUT_BASE} resize-y leading-relaxed`}
          />
          <p className="mt-2 text-[11px] text-white/40">
            We post on the date you choose. Postal delays of a day or two can happen, and we'll keep you informed.
          </p>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-white/40" aria-hidden="true" />
          <FormStatus
            status={state.status}
            message={state.status === "idle" ? undefined : state.message}
            idleText={`Choose a date at least ${leadDays} days from today.`}
          />
        </div>
        <button
          type="submit"
          disabled={!canSchedule || isPending}
          className="rounded-full bg-gradient-to-r from-[#c9f7e3] to-[#cfeaff] px-7 py-2.5 text-sm font-semibold text-[#2a1f4a] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:opacity-40"
        >
          {isPending ? "Scheduling..." : "Schedule"}
        </button>
      </div>
    </form>
  );
}