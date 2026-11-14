"use client";

import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import type { PatreonPost } from "@/lib/patreon/patreonPosts";

const AUTO_ADVANCE_MS = 6000;

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };

interface PatreonCarouselProps {
  readonly posts: readonly PatreonPost[];
}

/** Auto-advancing carousel of public Patreon posts. Pauses on hover and focus, and respects reduced motion. */
export function PatreonCarousel({ posts }: PatreonCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const count = posts.length;

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (isPaused || reduceMotion || count < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % count), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [isPaused, reduceMotion, count]);

  function go(delta: number): void {
    setIndex((current) => (current + delta + count) % count);
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Latest from Patreon"
      className="mx-auto w-full max-w-5xl px-5 pb-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold text-white">Latest from the circle</h2>
        {count > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous post"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next post"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#241a40]/70 shadow-2xl backdrop-blur">
        <div
          className="flex transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {posts.map((post, slideIndex) => (
            <article
              key={post.id}
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} of ${count}`}
              aria-hidden={slideIndex !== index}
              className="flex w-full shrink-0 flex-col md:flex-row"
            >
              {post.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-52 w-full object-cover md:h-auto md:w-2/5"
                />
              )}
              <div className="flex flex-1 flex-col justify-center gap-3 p-7 text-left md:p-10">
                {post.publishedAt && (
                  <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                    {new Date(post.publishedAt).toLocaleDateString("en-GB", DATE_FORMAT)}
                  </p>
                )}
                <h3 className="font-serif text-2xl font-semibold leading-tight text-white md:text-3xl">{post.title}</h3>
                {post.teaser && <p className="line-clamp-3 text-sm leading-relaxed text-white/70">{post.teaser}</p>}
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={slideIndex === index ? 0 : -1}
                  className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-[#c9f7e3] to-[#cfeaff] px-5 py-2 text-sm font-semibold text-[#2a1f4a] transition hover:-translate-y-0.5"
                >
                  Read on Patreon
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      {count > 1 && (
        <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Choose a post">
          {posts.map((post, dotIndex) => (
            <button
              key={post.id}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={`Show post ${dotIndex + 1}`}
              onClick={() => setIndex(dotIndex)}
              className={`h-2 rounded-full transition-all ${dotIndex === index ? "w-6 bg-[#b5f5da]" : "w-2 bg-white/30 hover:bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}