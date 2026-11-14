"use client";

import { Check, Ellipsis, MessageCircle, Share2, ThumbsUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FeedPost } from "@/lib/community/communityRepository";
import { CommentSection, avatarGradient, commentInputId } from "./CommentSection";
import { ReportButton } from "./ReportButton";

const KIND_STYLES: Record<FeedPost["kind"], { label: string; className: string }> = {
  idea: { label: "Idea", className: "bg-[#c9f7e3]/15 text-[#b5f5da]" },
  thought: { label: "Thought", className: "bg-[#e3d7ff]/15 text-[#e3d7ff]" },
  reflection: { label: "Reflection", className: "bg-[#ffd1e5]/15 text-[#ffd1e5]" },
};

const ACTION_BUTTON =
  "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium text-white/65 transition hover:bg-white/10 hover:text-white";

interface PostCardProps {
  readonly post: FeedPost;
  readonly isSignedIn: boolean;
}

/** Compact card for the feed grid. The chat sits inside the card. */
export function PostCard({ post, isSignedIn }: PostCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLiked(post.likedByMe);
    setLikeCount(post.likeCount);
  }, [post.likedByMe, post.likeCount]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const date = new Date(post.createdAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Colombo",
  });

  const kind = KIND_STYLES[post.kind];
  const hasMenu = post.canDelete || post.canReport;

  function focusReplyBox(): void {
    document.getElementById(commentInputId(post.id))?.focus();
  }

  async function handleLike(): Promise<void> {
    if (!isSignedIn) {
      setError("Sign in to like posts.");
      return;
    }

    const previous = { liked, likeCount };
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    setError(null);

    try {
      const response = await fetch(`/api/community/posts/${post.id}/like`, { method: "POST" });
      if (!response.ok) throw new Error("Like failed");
      const data = (await response.json()) as { liked: boolean; likeCount: number };
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      setLiked(previous.liked);
      setLikeCount(previous.likeCount);
      setError("Could not update your like.");
    }
  }

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(post.body);
      setCopied(true);
    } catch {
      setError("Copying isn't available in this browser.");
    }
  }

  async function handleDelete(): Promise<void> {
    setMenuOpen(false);
    if (!window.confirm("Delete this post? This can't be undone.")) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/community/posts/${post.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Could not delete this post.");
        setIsDeleting(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not delete this post.");
      setIsDeleting(false);
    }
  }

  if (isDeleting) return null;

  return (
    <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#2a2050]/70 p-5 shadow-xl backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl">
      <header className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-[#2a1f4a] ${avatarGradient(post.displayName)}`}
          aria-hidden="true"
        >
          {post.displayName.charAt(0).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-white">{post.displayName}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/45">
            <span className={`rounded-full px-2 py-0.5 font-medium ${kind.className}`}>{kind.label}</span>
            <span>{date}</span>
          </div>
        </div>

        {hasMenu && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Post options"
              aria-expanded={menuOpen}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <Ellipsis className="h-5 w-5" aria-hidden="true" />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-10 cursor-default"
                />
                <div className="absolute right-0 top-9 z-20 w-56 rounded-xl border border-white/10 bg-[#30265a] p-1.5 shadow-2xl">
                  {post.canDelete && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-rose-200 hover:bg-white/10"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete post
                    </button>
                  )}
                  {post.canReport && (
                    <div className="px-2 py-2">
                      <ReportButton postId={post.id} />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </header>

      <p className="mt-4 line-clamp-6 whitespace-pre-line break-words text-sm leading-relaxed text-white/90">
        {post.body}
      </p>

      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt="Image shared by a member"
          loading="lazy"
          className="mt-3 h-40 w-full rounded-2xl object-cover"
        />
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-white/55">
        <span className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#cfeaff] text-[#2a1f4a]">
            <ThumbsUp className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
          </span>
          {likeCount}
        </span>
        <button type="button" onClick={focusReplyBox} className="hover:underline">
          {post.comments.length} {post.comments.length === 1 ? "message" : "messages"}
        </button>
      </div>

      <div className="mt-3 flex gap-1 border-t border-white/10 pt-2">
        <button
          type="button"
          onClick={handleLike}
          aria-pressed={liked}
          className={`${ACTION_BUTTON} ${liked ? "text-[#b5f5da]" : ""}`}
        >
          <ThumbsUp className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} aria-hidden="true" />
          Like
        </button>

        <button type="button" onClick={focusReplyBox} className={ACTION_BUTTON}>
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Comment
        </button>

        <button type="button" onClick={handleCopy} className={ACTION_BUTTON}>
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Share2 className="h-3.5 w-3.5" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {error && (
        <p role="status" className="mt-2 text-xs text-rose-300">
          {error}
        </p>
      )}

      <div className="mt-4">
        <CommentSection postId={post.id} comments={post.comments} isSignedIn={isSignedIn} />
      </div>
    </article>
  );
}