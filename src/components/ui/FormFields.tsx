"use client";

import { ChevronDown } from "lucide-react";
import { useId, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

export const INPUT_BASE =
  "w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/35 transition hover:border-white/20 focus:border-[#b5f5da]/60 focus:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b5f5da]/40 disabled:cursor-not-allowed disabled:opacity-40 [color-scheme:dark]";

interface FieldLabelProps {
  readonly htmlFor: string;
  readonly label: string;
  readonly required?: boolean;
  readonly hint?: string;
}

/** Label with a visible asterisk for required fields. Screen readers hear "(required)". */
export function FieldLabel({ htmlFor, label, required, hint }: FieldLabelProps) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label htmlFor={htmlFor} className="text-xs font-medium text-white/85">
        {label}
        {required ? (
          <>
            <span className="ml-0.5 text-[#ffb8d6]" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </label>
      {hint ? <span className="text-[11px] text-white/40">{hint}</span> : null}
    </div>
  );
}

export function RequiredNote() {
  return (
    <p className="text-xs text-white/45">
      <span className="text-[#ffb8d6]" aria-hidden="true">
        *
      </span>{" "}
      Required fields
    </p>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  readonly label: string;
  readonly required?: boolean;
  readonly hint?: string;
  readonly wide?: boolean;
};

export function TextField({ label, required, hint, wide, className, ...input }: TextFieldProps) {
  const id = useId();

  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <FieldLabel htmlFor={id} label={label} required={required} hint={hint} />
      <input
        id={id}
        required={required}
        aria-required={required}
        className={`${INPUT_BASE} ${className ?? ""}`}
        {...input}
      />
    </div>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  readonly label: string;
  readonly options: readonly string[];
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly hint?: string;
  readonly wide?: boolean;
};

/** Styled dropdown with a custom chevron and a dark option list. */
export function SelectField({
  label,
  options,
  placeholder,
  required,
  hint,
  wide,
  className,
  ...select
}: SelectFieldProps) {
  const id = useId();

  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <FieldLabel htmlFor={id} label={label} required={required} hint={hint} />
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-required={required}
          className={`${INPUT_BASE} cursor-pointer appearance-none pr-10 ${className ?? ""}`}
          {...select}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option} value={option} className="bg-[#241a40] text-white">
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

interface FormStatusProps {
  readonly status: "idle" | "ok" | "error";
  readonly message?: string;
  readonly idleText?: string;
}

/** Live status line. Errors are red, success is mint, and it's announced to screen readers. */
export function FormStatus({ status, message, idleText }: FormStatusProps) {
  const tone = status === "error" ? "text-rose-300" : "text-[#b5f5da]";
  const text = status === "idle" ? idleText ?? "" : message ?? "";

  return (
    <p role="status" aria-live="polite" className={`min-h-5 text-sm ${tone}`}>
      {text}
    </p>
  );
}