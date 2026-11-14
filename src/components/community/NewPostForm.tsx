"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { MAX_POST_LENGTH, POST_KINDS, type PostKind } from "@/lib/community/postSchema";

const KIND_LABELS: Record<PostKind, string> = {
  idea: "Idea",
  thought: "Thought",
  reflection: "Reflection",
};

interface NewPostFormProps {
  readonly displayName: string;
}

/** Form for members who have chosen their name. Posts are published under that name. */
export function NewPostForm({ displayName }: NewPostFormProps) {
  const router = useRouter();
  const [kind, setKind] = useState<PostKind>("thought");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, body }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setMessage({ tone: "error", text: data.error ?? "Something went wrong. Please try again." });
        return;
      }

      setBody("");
      setMessage({ tone: "ok", text: "Shared. Thank you for opening your heart here." });
      router.refresh();
    } catch {
      setMessage({ tone: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const remaining = MAX_POST_LENGTH - body.length;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[2rem] border border-white/10 bg-[#241a40]/80 p-6 shadow-2xl backdrop-blur sm:p-7"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-white/60">
          Posting as <span className="font-semibold text-white">{displayName}</span>
        </p>
        <span className="text-xs text-white/40">{remaining} left</span>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Post type">
        {POST_KINDS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setKind(option)}
            aria-pressed={kind === option}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              kind === option
                ? "bg-[#c9f7e3] font-semibold text-[#2a1f4a]"
                : "border border-white/15 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {KIND_LABELS[option]}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="sr-only">What&apos;s on your heart?</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={MAX_POST_LENGTH}
          rows={4}
          required
          placeholder="What's on your heart today?"
          className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-base leading-relaxed text-white placeholder:text-white/35 focus-visible:outline-2 focus-visible:outline-white"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p role="status" aria-live="polite" className={`text-sm ${message?.tone === "error" ? "text-rose-300" : "text-white/70"}`}>
          {message?.text}
        </p>
        <button
          type="submit"
          disabled={isSubmitting || body.trim().length === 0}
          className="rounded-full bg-gradient-to-r from-[#c9f7e3] to-[#cfeaff] px-7 py-2.5 font-semibold text-[#2a1f4a] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Sharing..." : "Share"}
        </button>
      </div>
    </form>
  );
}