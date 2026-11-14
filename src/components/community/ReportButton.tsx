"use client";

import { useState } from "react";
import { REPORT_REASONS, type ReportReason } from "@/lib/community/postSchema";

const REASON_LABELS: Record<ReportReason, string> = {
  harmful: "Harmful or unsafe",
  harassment: "Harassment",
  spam: "Spam",
  other: "Something else",
};

interface ReportButtonProps {
  readonly postId: string;
}

export function ReportButton({ postId }: ReportButtonProps) {
  const [reason, setReason] = useState<ReportReason>("other");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleReport(): Promise<void> {
    setStatus("sending");
    setMessage(null);

    try {
      const response = await fetch(`/api/community/posts/${postId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Could not send your report.");
        return;
      }

      setStatus("done");
      setMessage("Thank you. We'll take a look.");
    } catch {
      setStatus("error");
      setMessage("Could not send your report.");
    }
  }

  if (status === "done") {
    return <p className="text-xs text-white/50">{message}</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={reason}
        onChange={(event) => setReason(event.target.value as ReportReason)}
        aria-label="Reason for report"
        className="rounded-full border border-white/15 bg-[#241a40] px-2 py-1 text-xs text-white/80"
      >
        {REPORT_REASONS.map((option) => (
          <option key={option} value={option}>
            {REASON_LABELS[option]}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleReport}
        disabled={status === "sending"}
        className="text-xs text-white/60 underline-offset-4 hover:text-white hover:underline disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Report"}
      </button>
      {message && status === "error" && <span className="text-xs text-rose-300">{message}</span>}
    </div>
  );
}