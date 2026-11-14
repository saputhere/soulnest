"use client";

import { Check, Circle, LogIn, ShieldCheck, Sparkles, X } from "lucide-react";
import {
  useActionState,
  useEffect,
  useId,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
} from "react";
import {
  signInWithPassword,
  signInWithPatreonTo,
  signUpWithPassword,
  type AuthFormState,
} from "@/lib/auth/actions";
import { emailSchema, getPasswordChecks, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from "@/lib/auth/schemas";
import { suggestEmailFix } from "@/lib/auth/emailSuggestions";
import { displayNameSchema } from "@/lib/community/postSchema";
import { FormStatus, INPUT_BASE } from "@/components/ui/FormFields";

type Tab = "login" | "signup";

const INITIAL: AuthFormState = { status: "idle" };

const TRIGGER =
  "group inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-1.5 pl-1.5 pr-5 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:border-[#b5f5da]/50 hover:bg-white/15 hover:shadow-[0_10px_30px_-10px_rgba(181,245,218,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const SUBMIT =
  "w-full rounded-full bg-gradient-to-r from-[#c9f7e3] to-[#cfeaff] px-6 py-3 text-sm font-semibold text-[#2a1f4a] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40";

const TAB_BASE = "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition";

/** Thin, subtle scrollbar for small screens, where the dialog scrolls. */
const SCROLLBAR = "[scrollbar-width:thin] [scrollbar-color:rgba(181,245,218,0.35)_transparent]";

interface AuthDialogProps {
  readonly redirectTo: string;
  readonly label?: string;
}

/** Sign-up / log-in. Patreon on the left, email accounts on the right. Stacks on small screens. */
export function AuthDialog({ redirectTo, label = "Sign up / Log in" }: AuthDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("login");
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={TRIGGER}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#c9f7e3] to-[#cfeaff] text-[#2a1f4a] transition group-hover:rotate-12">
          <LogIn className="h-4 w-4" aria-hidden="true" />
        </span>
        {label}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            aria-label="Close sign in"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-[#140f2a]/75 backdrop-blur-sm"
          />

          <div
            className={`relative grid max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#241a40] shadow-2xl md:grid-cols-2 md:overflow-hidden ${SCROLLBAR}`}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Left column: Patreon */}
            <div className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-[#2d2254] via-[#241a40] to-[#1d1636] p-7 sm:p-9">
              <div
                className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#ffd1e5]/15 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-[#cfeaff]/10 blur-3xl"
                aria-hidden="true"
              />

              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">Welcome to SoulNest</p>
                <h2 id={titleId} className="mt-2 font-serif text-3xl font-semibold leading-tight text-white">
                  Sign in to continue
                </h2>

                <ul className="mt-6 space-y-3 text-sm text-white/75">
                  <li className="flex items-start gap-2.5">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#ffd1e5]" aria-hidden="true" />
                    Your membership and planned deliveries sync automatically.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#b5f5da]" aria-hidden="true" />
                    Payments stay on Patreon. We never see your card.
                  </li>
                </ul>

                <form action={signInWithPatreonTo} className="mt-8">
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  <button
                    type="submit"
                    className="w-full rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#2a1f4a] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    Continue with Patreon
                  </button>
                </form>
                <p className="mt-3 text-center text-xs text-white/45">Best for subscribers.</p>
              </div>
            </div>

            {/* Right column: email accounts */}
            <div className="relative border-t border-white/10 p-7 sm:p-9 md:border-l md:border-t-0">
              <div role="tablist" aria-label="Email account" className="flex rounded-full bg-white/5 p-1">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "login"}
                  onClick={() => setTab("login")}
                  className={`${TAB_BASE} ${tab === "login" ? "bg-white/15 text-white" : "text-white/55 hover:text-white"}`}
                >
                  Log in
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "signup"}
                  onClick={() => setTab("signup")}
                  className={`${TAB_BASE} ${tab === "signup" ? "bg-white/15 text-white" : "text-white/55 hover:text-white"}`}
                >
                  Create account
                </button>
              </div>

              <div className="mt-6">
                {tab === "login" ? <LoginForm redirectTo={redirectTo} /> : <SignupForm redirectTo={redirectTo} />}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly error?: string | null;
}

/** Labelled input that shows its error beneath it and links it for screen readers. */
function Field({ label, error, id: idProp, ...input }: FieldProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-white/85">
        {label}
        <span className="ml-0.5 text-[#ffb8d6]" aria-hidden="true">
          *
        </span>
        <span className="sr-only"> (required)</span>
      </label>
      <input
        id={id}
        required
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${INPUT_BASE} ${error ? "border-rose-300/60 focus:border-rose-300/60" : ""}`}
        {...input}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Live list of password rules. Each rule turns green as it's met. */
function PasswordChecklist({ password, email }: { readonly password: string; readonly email: string }) {
  if (password.length === 0) return null;
  const checks = getPasswordChecks(password, email);

  return (
    <ul aria-label="Password requirements" className="grid grid-cols-1 gap-1.5 rounded-xl bg-white/[0.04] p-3 sm:grid-cols-2">
      {checks.map((check) => (
        <li
          key={check.id}
          className={`flex items-center gap-2 text-xs transition-colors ${check.passed ? "text-[#b5f5da]" : "text-white/50"}`}
        >
          {check.passed ? (
            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <Circle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          <span>{check.label}</span>
          <span className="sr-only">{check.passed ? "(met)" : "(not met)"}</span>
        </li>
      ))}
    </ul>
  );
}

function LoginForm({ redirectTo }: { readonly redirectTo: string }) {
  const [state, formAction, isPending] = useActionState(signInWithPassword, INITIAL);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const emailCheck = emailSchema.safeParse(email);
  const showEmailError = !emailCheck.success && (submitAttempted || (emailTouched && email.length > 0));
  const emailError = showEmailError ? emailCheck.error?.issues[0]?.message ?? null : null;

  const canSubmit = emailCheck.success && password.length > 0 && !isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    if (!canSubmit) {
      event.preventDefault();
      setSubmitAttempted(true);
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        autoFocus
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        onBlur={() => setEmailTouched(true)}
        error={emailError}
      />

      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
        maxLength={MAX_PASSWORD_LENGTH}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={submitAttempted && password.length === 0 ? "Please enter your password." : null}
      />

      <FormStatus status={state.status} message={state.status === "error" ? state.message : undefined} />

      <button
        type="submit"
        aria-disabled={!canSubmit}
        disabled={isPending}
        className={`${SUBMIT} aria-disabled:translate-y-0 aria-disabled:cursor-not-allowed aria-disabled:opacity-40`}
      >
        {isPending ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}

function SignupForm({ redirectTo }: { readonly redirectTo: string }) {
  const [state, formAction, isPending] = useActionState(signUpWithPassword, INITIAL);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ name: false, displayName: false, email: false, password: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const emailCheck = emailSchema.safeParse(email);
  const nameValid = name.trim().length >= 2;
  const displayCheck = displayNameSchema.safeParse({ name: displayName });
  const passwordValid = getPasswordChecks(password, email).every((check) => check.passed);
  const isValid = nameValid && displayCheck.success && emailCheck.success && passwordValid;

  const nameError =
    !nameValid && name.length > 0 && (touched.name || submitAttempted)
      ? "Please enter your name (at least 2 characters)."
      : submitAttempted && name.length === 0
        ? "Please enter your name."
        : null;

  const displayError =
    !displayCheck.success && displayName.length > 0 && (touched.displayName || submitAttempted)
      ? displayCheck.error?.issues[0]?.message ?? null
      : submitAttempted && displayName.length === 0
        ? "Please choose a display name."
        : null;

  const emailError =
    !emailCheck.success && email.length > 0 && (touched.email || submitAttempted)
      ? emailCheck.error?.issues[0]?.message ?? null
      : submitAttempted && email.length === 0
        ? "Please enter your email address."
        : null;

  const passwordError =
    !passwordValid && password.length > 0 && (touched.password || submitAttempted)
      ? "Your password doesn't meet every requirement yet."
      : submitAttempted && password.length === 0
        ? "Please create a password."
        : null;

  const typoSuggestion = email ? suggestEmailFix(email) : null;

  /** Blocks submission while the form is invalid, and reveals every error. */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    if (!isValid || isPending) {
      event.preventDefault();
      setSubmitAttempted(true);
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <Field
        label="Your name"
        name="name"
        autoComplete="name"
        maxLength={80}
        placeholder="Your full name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
        error={nameError}
      />

      <Field
        label="Display name"
        name="displayName"
        autoComplete="nickname"
        maxLength={24}
        placeholder="How you'll appear in the community"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, displayName: true }))}
        error={displayError}
      />

      <div className="space-y-1.5">
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={emailError}
        />
        {typoSuggestion && !emailError ? (
          <button
            type="button"
            onClick={() => setEmail(typoSuggestion)}
            className="text-xs text-[#b5f5da] underline-offset-4 hover:underline"
          >
            Did you mean {typoSuggestion}? Tap to fix
          </button>
        ) : null}
      </div>

      <div className="space-y-2">
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          maxLength={MAX_PASSWORD_LENGTH}
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={passwordError}
        />
        <PasswordChecklist password={password} email={email} />
      </div>

      <FormStatus status={state.status} message={state.status === "error" ? state.message : undefined} />

      <button
        type="submit"
        aria-disabled={!isValid}
        disabled={isPending}
        className={`${SUBMIT} aria-disabled:translate-y-0 aria-disabled:cursor-not-allowed aria-disabled:opacity-40`}
      >
        {isPending ? "Creating account..." : "Create account"}
      </button>

      {!isValid && (name || displayName || email || password) ? (
        <p className="text-center text-xs text-white/45">Complete the fields above to create your account.</p>
      ) : null}
    </form>
  );
}