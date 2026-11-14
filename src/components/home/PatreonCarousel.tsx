"use client";

import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import type { PatreonPost } from "@/lib/patreon/patreonPosts";

const AUTO_ADVANCE_MS = 6000;
const PER_PAGE = 5;
const STAGGER_MS = 120;

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };

/** Constant CSS only. Nothing from Patreon is interpolated here. */
const ANIMATION_CSS = `
@keyframes pc-enter {
  0% { opacity: 0; transform: translateY(32px) scale(0.94); filter: blur(8px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
@keyframes pc-orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes pc-planet-glow {
  0%, 100% { box-shadow: 0 0 6px 1px rgba(255, 209, 229, 0.7); }
  50% { box-shadow: 0 0 14px 3px rgba(207, 234, 255, 0.9); }
}

.pc-card {
  position: relative;
  opacity: 0;
  animation: pc-enter 800ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--enter-delay);
  transition: transform 350ms ease, box-shadow 350ms ease;
}
.pc-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 60px -18px rgba(255, 183, 210, 0.4);
}
/* Faint orbit path drawn just inside the border. */
.pc-orbit-path {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px dashed rgba(255, 255, 255, 0.08);
  pointer-events: none;
}
/* Rotating track that carries the planet around the card. */
.pc-orbit-track {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  pointer-events: none;
  animation: pc-orbit 9s linear infinite;
  animation-delay: var(--orbit-delay);
}
/* The planet sits on the top edge; the track rotation moves it around the perimeter. */
.pc-planet {
  position: absolute;
  top: -4px;
  left: 50%;
  width: 8px;
  height: 8px;
  margin-left: -4px;
  border-radius: 9999px;
  background: radial-gradient(circle at 35% 35%, #ffffff, #ffd1e5 55%, #cfeaff);
  animation: pc-planet-glow 2.4s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .pc-card { opacity: 1; animation: none; }
  .pc-orbit-track, .pc-planet { animation: none; }
  .pc-card:hover { transform: none; }
}
`;

interface PatreonCarouselProps {
  readonly posts: readonly PatreonPost[];
}

/** Public Patreon posts, five per row. Each card has a planet orbiting its border. */
export function PatreonCarousel({ posts }: PatreonCarouselProps) {
  const pageCount = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (isPaused || reduceMotion || pageCount < 2) return;
    const timer = setInterval(() => setPage((current) => (current + 1) % pageCount), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [isPaused, reduceMotion, pageCount]);

  function go(delta: number): void {
    setPage((current) => (current + delta + pageCount) % pageCount);
  }

  const visible = posts.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section
      aria-label="Latest from Patreon"
      className="mx-auto w-full max-w-7xl px-5 pb-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <style dangerouslySetInnerHTML={{ __html: ANIMATION_CSS }} />

      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold text-white">Latest from the circle</h2>
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous posts"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next posts"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Changing the key replays the entrance animation when the page changes. */}
      <div key={page} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {visible.map((post, index) => (
          <article
            key={post.id}
            className="pc-card flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#241a40]/75 p-5 text-left backdrop-blur"
            style={{ "--enter-delay": `${index * STAGGER_MS}ms` } as CSSProperties}
          >
            <span className="pc-orbit-path" aria-hidden="true" />
            <span
              className="pc-orbit-track"
              style={{ "--orbit-delay": `${-index * 1.8}s` } as CSSProperties}
              aria-hidden="true"
            >
              <span className="pc-planet" />
            </span>

            {post.publishedAt && (
              <p className="relative text-[11px] uppercase tracking-[0.2em] text-white/45">
                {new Date(post.publishedAt).toLocaleDateString("en-GB", DATE_FORMAT)}
              </p>
            )}

            <h3 className="relative font-serif text-lg font-semibold leading-snug text-white">{post.title}</h3>

            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-auto inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[#b5f5da] transition hover:text-white"
            >
              Read on Patreon
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="Choose a page of posts">
          {Array.from({ length: pageCount }, (_, pageIndex) => (
            <button
              key={pageIndex}
              type="button"
              role="tab"
              aria-selected={pageIndex === page}
              aria-label={`Show page ${pageIndex + 1}`}
              onClick={() => setPage(pageIndex)}
              className={`h-2 rounded-full transition-all ${pageIndex === page ? "w-6 bg-[#b5f5da]" : "w-2 bg-white/30 hover:bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}