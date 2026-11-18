"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

const BLOBS = [
  { size: 340, left: "-8%", top: "-10%", color: "#c9f7e3", duration: 18, delay: 0 },
  { size: 280, left: "72%", top: "-4%", color: "#ffd1e5", duration: 22, delay: 2 },
  { size: 320, left: "24%", top: "55%", color: "#cfeaff", duration: 20, delay: 4 },
  { size: 240, left: "80%", top: "68%", color: "#fff3b8", duration: 24, delay: 1 },
] as const;

const SPARKS = Array.from({ length: 14 }, (_, index) => ({
  left: `${(index * 41) % 100}%`,
  top: `${(index * 29) % 100}%`,
  delay: `${(index % 6) * 0.5}s`,
}));

const BACKDROP_CSS = `
@keyframes pk-float {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(28px, -36px, 0) scale(1.07); }
}
@keyframes pk-twinkle {
  0%, 100% { opacity: 0.15; transform: scale(0.8); }
  50% { opacity: 0.9; transform: scale(1.25); }
}
.pk-blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(70px);
  opacity: 0.3;
  will-change: transform;
  animation: pk-float var(--pk-d) ease-in-out var(--pk-dl) infinite;
}
.pk-spark {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #ffffff;
  animation: pk-twinkle 3.2s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .pk-blob, .pk-spark { animation: none; }
}
`;

/** Floating colour blobs and twinkling sparks behind the play pages. Place inside a relative container. */
export function PlayBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: BACKDROP_CSS }} />
      {BLOBS.map((blob, index) => (
        <span
          key={index}
          className="pk-blob"
          style={
            {
              width: blob.size,
              height: blob.size,
              left: blob.left,
              top: blob.top,
              background: blob.color,
              ["--pk-d" as string]: `${blob.duration}s`,
              ["--pk-dl" as string]: `${blob.delay}s`,
            } as CSSProperties
          }
        />
      ))}
      {SPARKS.map((spark, index) => (
        <span
          key={index}
          className="pk-spark"
          style={{ left: spark.left, top: spark.top, animationDelay: spark.delay }}
        />
      ))}
    </div>
  );
}

export const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

interface PlayHeaderProps {
  readonly emoji: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle?: string;
}

/** Page heading with a gently bobbing emoji and a soft gradient title. */
export function PlayHeader({ emoji, eyebrow, title, subtitle }: PlayHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10 text-center sm:text-left"
    >
      <motion.p
        aria-hidden="true"
        className="text-5xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {emoji}
      </motion.p>
      <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/50">{eyebrow}</p>
      <h1 className="mt-2 bg-gradient-to-r from-[#c9f7e3] via-[#cfeaff] to-[#ffd1e5] bg-clip-text font-serif text-4xl font-semibold text-transparent sm:text-5xl">
        {title}
      </h1>
      {subtitle ? <p className="mx-auto mt-3 max-w-xl text-white/65 sm:mx-0">{subtitle}</p> : null}
    </motion.header>
  );
}

interface PlayCardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
}

/** Glass card that rises gently into view. Pass a delay to stagger several cards. */
export function PlayCard({ children, className = "", delay = 0 }: PlayCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-[#241a40]/80 p-6 shadow-xl backdrop-blur sm:p-7 ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface PlayButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "ghost";
}

/** Pill button with a soft lift on hover and a squish on press. */
export function PlayButton({ variant = "primary", className = "", children, ...rest }: PlayButtonProps) {
  const style =
    variant === "primary"
      ? "bg-gradient-to-r from-[#c9f7e3] to-[#cfeaff] text-[#2a1f4a] shadow-lg hover:shadow-xl"
      : "border border-white/15 text-white/85 hover:bg-white/10";

  return (
    <button
      type="button"
      className={`rounded-full px-6 py-2.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:scale-95 disabled:translate-y-0 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-40 ${style} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

interface NoticeProps {
  readonly status: "idle" | "ok" | "error";
  readonly message?: string | null;
}

/** Status line that fades and slides in each time the message changes. */
export function Notice({ status, message }: NoticeProps) {
  return (
    <AnimatePresence mode="wait">
      {status !== "idle" && message ? (
        <motion.p
          key={message}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className={`text-sm ${status === "error" ? "text-rose-300" : "text-[#b5f5da]"}`}
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

const CONFETTI_COLORS = ["#b5f5da", "#ffd1e5", "#cfeaff", "#fff3b8", "#e3d7ff"];

/** A one-off shower of confetti. Place inside a relative container. Skipped for reduced motion. */
export function Confetti({ count = 30 }: { readonly count?: number }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, index) => {
        const left = (index * 37) % 100;
        const drift = ((index * 53) % 60) - 30;
        const size = 6 + (index % 4) * 2;
        const spin = (index % 2 === 0 ? 1 : -1) * 720;
        return (
          <motion.span
            key={index}
            className="absolute top-0 rounded-sm"
            style={{ left: `${left}%`, width: size, height: size * 0.5, background: CONFETTI_COLORS[index % CONFETTI_COLORS.length] }}
            initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
            animate={{ y: 380, x: drift, rotate: spin, opacity: [1, 1, 0] }}
            transition={{ duration: 2.2 + (index % 5) * 0.3, delay: (index % 8) * 0.06, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}