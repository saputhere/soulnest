"use client";

import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Planet } from "./Planet";
import type { PlanetSection } from "./planetCatalog";

/* Fast, smooth tweens. Springs take longer to settle, which is what made the popup feel slow. */
const OPEN_EASE = [0.22, 1, 0.36, 1] as const;
const OPEN_TRANSITION = { duration: 0.42, ease: OPEN_EASE } as const;
const CLOSE_TRANSITION = { duration: 0.28, ease: [0.4, 0, 1, 1] } as const;
const BACKDROP_TRANSITION = { duration: 0.25, ease: "easeOut" } as const;
const CONTENT_TRANSITION = { delay: 0.12, duration: 0.3, ease: "easeOut" } as const;

interface PlanetModalProps {
  readonly section: PlanetSection;
  readonly onClose: () => void;
}

/**
 * Popup that opens from its planet with a short spin. Each instance tracks its own closing state,
 * so a fresh open always starts able to close.
 */
export function PlanetModal({ section, onClose }: PlanetModalProps) {
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);
  const [isClosing, setIsClosing] = useState(false);
  const { id, label, title, palette, content } = section;
  const titleId = useId();

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setIsClosing(true);
    onClose();
  }, [onClose]);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [requestClose]);

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 ${
        isClosing ? "pointer-events-none" : ""
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={BACKDROP_TRANSITION}
    >
      <motion.button
        type="button"
        aria-label="Close"
        onClick={requestClose}
        className="absolute inset-0 cursor-default bg-canvas/70 backdrop-blur-[2px]"
      />

      <motion.section
        layoutId={`planet-${id}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={reduceMotion ? { opacity: 0 } : { rotate: -120, scale: 0.6, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={
          reduceMotion
            ? { opacity: 0, transition: CLOSE_TRANSITION }
            : { rotate: 120, scale: 0.6, opacity: 0, transition: CLOSE_TRANSITION }
        }
        transition={OPEN_TRANSITION}
        className="relative flex max-h-[85dvh] w-full max-w-xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#241a40] text-[#f5eefc] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)]"
      >
        <header
          className="relative shrink-0 overflow-hidden px-7 pb-8 pt-9 md:px-9"
          style={{
            background: `radial-gradient(120% 140% at 0% 0%, ${palette.light}40, transparent 60%), linear-gradient(160deg, ${palette.dark}55 0%, #241a40 85%)`,
          }}
        >
          <div className="relative flex items-center gap-6">
            <Planet palette={palette} className="h-20 w-20 shrink-0" />
            <div className="min-w-0 pr-12">
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/60">{label}</p>
              <h2 id={titleId} className="mt-2 font-serif text-3xl font-semibold leading-tight text-white md:text-4xl">
                {title}
              </h2>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={CONTENT_TRANSITION}
          className="min-h-0 overflow-y-auto px-7 py-7 text-white/85 md:px-9 md:py-9"
        >
          {content}
        </motion.div>
      </motion.section>
    </motion.div>
  );
}