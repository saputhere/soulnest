"use client";

import { Lock, RefreshCw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { randomDisplayName } from "@/lib/community/randomDisplayName";
import { DISPLAY_NAME_MIN } from "@/lib/community/postSchema";

const SUGGESTION_COUNT = 3;

function makeSuggestions(): string[] {
  return Array.from({ length: SUGGESTION_COUNT }, () => randomDisplayName());
}

/** One-time name selection. The name is saved only after the member confirms, and then it's locked. */
export function NameSetup() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggestions are random, so they're created after mount to avoid a server/client mismatch.
  useEffect(() => {
    setSuggestions(makeSuggestions());
  }, []);

  function handleReview(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (name.trim().length < DISPLAY_NAME_MIN) {
      setError(`Names need at least ${DISPLAY_NAME_MIN} characters.`);
      return;
    }
    setError(null);
    setIsConfirming(true);
  }

  async function handleConfirm(): Promise<void> {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/community/name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not save your name.");
        setIsConfirming(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not save your name. Please try again.");
      setIsConfirming(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#2d2254]/90 to-[#241a40]/90 p-6 shadow-2xl backdrop-blur sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ffd1e5]/15 text-[#ffd1e5]">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-white">Choose your name</h2>
          <p className="mt-1 text-sm leading-relaxed text-white/70">
            This is how you&apos;ll appear on every post and comment. You choose it once, and it stays the same.
          </p>
        </div>
      </div>

      {isConfirming ? (
        <div className="mt-6 rounded-2xl border border-[#ffd98a]/30 bg-[#ffd98a]/10 p-5">
          <p className="flex items-center gap-2 font-semibold text-[#ffe9b0]">
            <Lock className="h-4 w-4" aria-hidden="true" />
            Lock in &ldquo;{name.trim()}&rdquo;?
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            Once saved, this name can&apos;t be changed. It will be linked to your account.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSaving}
              className="rounded-full bg-[#c9f7e3] px-5 py-2.5 text-sm font-semibold text-[#2a1f4a] transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Yes, lock my name"}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirming(false)}
              disabled={isSaving}
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Go back
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleReview} className="mt-6 space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Suggestions</span>
              <button
                type="button"
                onClick={() => setSuggestions(makeSuggestions())}
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                New ideas
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setName(suggestion)}
                  aria-pressed={name === suggestion}
                  className={`rounded-full border px-4 py-2 text-sm transition hover:-translate-y-0.5 ${
                    name === suggestion
                      ? "border-[#c9f7e3] bg-[#c9f7e3]/20 text-white"
                      : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Or write your own</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={24}
              placeholder="e.g. Gentle Dove"
              className="mt-2 w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-white placeholder:text-white/35 focus-visible:outline-2 focus-visible:outline-white"
            />
          </label>

          {error && (
            <p role="status" className="text-sm text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={name.trim().length < DISPLAY_NAME_MIN}
            className="w-full rounded-full bg-[#c9f7e3] px-6 py-3 font-semibold text-[#2a1f4a] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </form>
      )}
    </div>
  );
}