"use client";

import { Copy, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { FeedComment } from "@/lib/community/communityRepository";
import { MAX_COMMENT_LENGTH } from "@/lib/community/postSchema";

const AVATAR_GRADIENTS = [
  "from-[#ffd1e5] to-[#ffb8d6]",
  "from-[#cfeaff] to-[#a9dcff]",
  "from-[#c9f7e3] to-[#8fe3c0]",
  "from-[#fff3b8] to-[#ffd98a]",
  "from-[#e3d7ff] to-[#b9a2f5]",
];

/** Stable gradient per name, so each person keeps the same avatar color. */
export function avatarGradient(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

/** The input's DOM id, so the post's Comment button can focus it. */
export function commentInputId(postId: string): string {
  return `comment-input-${postId}`;
}

interface CommentSectionProps {
  readonly postId: string;
  readonly comments: readonly FeedComment[];
  readonly isSignedIn: boolean;
}

/** A chat panel under each post: message history on top, reply box at the bottom. */
export function CommentSection({ postId, comments, isSignedIn }: CommentSectionProps) {
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep the newest message in view whenever the thread changes.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [comments.length]);

  async function sendComment(): Promise<void> {
    if (body.trim().length === 0 || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Could not send your message.");
        return;
      }

      setBody("");
      router.refresh();
    } catch {
      setError("Could not send your message.");
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void sendComment();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendComment();
    }
  }

  async function handleDelete(commentId: string): Promise<void> {
    if (!window.confirm("Delete this message?")) return;

    setDeletingId(commentId);
    setError(null);

    try {
      const response = await fetch(`/api/community/comments/${commentId}`, { method: "DELETE" });
      if (!response.ok) {
        setError("Could not delete this message.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not delete this message.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCopy(commentId: string, text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(commentId);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      setError("Copying isn't available in this browser.");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-xs text-white/50">
        <span className="font-medium uppercase tracking-[0.2em]">Chat</span>
        <span>
          {comments.length} {comments.length === 1 ? "message" : "messages"}
        </span>
      </div>

      <div ref={listRef} className="max-h-96 min-h-24 space-y-3 overflow-y-auto px-4 py-4">
        {comments.length === 0 && (
          <p className="py-6 text-center text-sm text-white/45">No messages yet. Start the conversation gently.</p>
        )}

        {comments.map((comment) =>
          comment.isMine ? (
            <div key={comment.id} className="group flex flex-col items-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#b5f5da] px-3.5 py-2 text-[#2a1f4a]">
                <p className="whitespace-pre-line break-words text-sm leading-relaxed">{comment.body}</p>
              </div>
              <div className="mt-1 flex items-center gap-3 pr-1 text-[11px] font-medium text-white/40 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleCopy(comment.id, comment.body)}
                  className="flex items-center gap-1 hover:text-white"
                >
                  <Copy className="h-3 w-3" aria-hidden="true" />
                  {copiedId === comment.id ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  className="flex items-center gap-1 hover:text-rose-300 disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                  {deletingId === comment.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ) : (
            <div key={comment.id} className="group flex items-start gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-[#2a1f4a] ${avatarGradient(comment.displayName)}`}
                aria-hidden="true"
              >
                {comment.displayName.charAt(0).toUpperCase()}
              </span>

              <div className="flex min-w-0 max-w-[80%] flex-col items-start">
                <div className="flex flex-wrap items-center gap-2 px-1">
                  <span className="text-xs font-semibold text-white/80">{comment.displayName}</span>
                  {comment.realName && (
                    <span className="rounded-full bg-[#ffd98a]/20 px-2 py-0.5 text-[10px] text-[#ffe9b0]">
                      Admin view: {comment.realName}
                    </span>
                  )}
                </div>

                <div className="mt-0.5 rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2 text-white/90">
                  <p className="whitespace-pre-line break-words text-sm leading-relaxed">{comment.body}</p>
                </div>

                <div className="mt-1 flex items-center gap-3 px-1 text-[11px] font-medium text-white/40 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleCopy(comment.id, comment.body)}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <Copy className="h-3 w-3" aria-hidden="true" />
                    {copiedId === comment.id ? "Copied" : "Copy"}
                  </button>
                  {comment.canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="flex items-center gap-1 hover:text-rose-300 disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                      {deletingId === comment.id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-white/10 bg-white/5 p-3">
          <div className="flex min-w-0 flex-1 items-end rounded-2xl bg-white/10 px-3.5 py-1.5">
            <textarea
              id={commentInputId(postId)}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={MAX_COMMENT_LENGTH}
              rows={1}
              placeholder="Write a message..."
              aria-label="Write a message"
              className="max-h-28 min-h-7 flex-1 resize-none bg-transparent py-1 text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSending || body.trim().length === 0}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c9f7e3] text-[#2a1f4a] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      ) : (
        <p className="border-t border-white/10 bg-white/5 px-4 py-3 text-sm text-white/55">
          Sign in to join the conversation.
        </p>
      )}

      {error && (
        <p role="status" className="px-4 pb-3 text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}