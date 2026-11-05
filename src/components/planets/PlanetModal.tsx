"use client";

import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Planet } from "./Planet";
import type { PlanetSection } from "./planetCatalog";

const OPEN_TRANSITION = { duration: 0.75, ease: [0.22, 1, 0.36, 1] } as const;

interface PlanetModalProps {
  readonly section: PlanetSection;
  readonly onClose: () => void;
}

/**
 * Popup that spins and zooms out of its planet, like an app opening.
 * The shared layoutId links it to the planet button, so closing shrinks it back into place.
 */
export function PlanetModal({ section, onClose }: PlanetModalProps) {
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { id, title, palette, content } = section;
  const titleId = `planet-title-${id}`;

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-canvas/75 backdrop-blur-md"
      />

      <motion.section
        layoutId={`planet-${id}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={reduceMotion ? { opacity: 0 } : { rotate: -360, scale: 0.3, opacity: 0.6 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { rotate: 360, scale: 0.3, opacity: 0 }}
        transition={OPEN_TRANSITION}
        className="relative flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-line bg-raised shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-5 md:px-8">
          <div className="flex items-center gap-4">
            <Planet palette={palette} className="h-11 w-11" />
            <h2 id={titleId} className="font-serif text-2xl font-semibold text-ink">
              {title}
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-muted transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 md:px-8 md:py-8">{content}</div>
      </motion.section>
    </motion.div>
  );
}