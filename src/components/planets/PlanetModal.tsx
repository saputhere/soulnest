"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart, Star, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Planet } from "./Planet";
import type { PlanetSection } from "./planetCatalog";

const OPEN_SPRING = { type: "spring", stiffness: 75, damping: 20, mass: 1.1 } as const;
const CLOSE_TRANSITION = { duration: 0.8, ease: [0.45, 0, 0.55, 1] } as const;
const BACKDROP_TRANSITION = { duration: 0.6 } as const;
const CONTENT_TRANSITION = { delay: 0.45, duration: 0.7, ease: "easeOut" } as const;

interface PlanetModalProps {
  readonly section: PlanetSection;
  readonly onClose: () => void;
}

/**
 * Popup that springs open from its planet while spinning, with a pastel header and floating decorations.
 * The shared layoutId links it to the planet button, so closing spins it back into place.
 */
export function PlanetModal({ section, onClose }: PlanetModalProps) {
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { id, label, title, palette, content } = section;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={BACKDROP_TRANSITION}
    >
      <motion.div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-canvas/70 backdrop-blur-sm"
      />

      <motion.section
        layoutId={`planet-${id}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={reduceMotion ? { opacity: 0 } : { rotate: -270, scale: 0.2, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={
          reduceMotion
            ? { opacity: 0, transition: CLOSE_TRANSITION }
            : { rotate: 270, scale: 0.2, opacity: 0, transition: CLOSE_TRANSITION }
        }
        transition={OPEN_SPRING}
        className="relative flex max-h-[85dvh] w-full max-w-xl flex-col overflow-hidden rounded-[2.5rem] border-2 border-line bg-raised shadow-[0_24px_80px_-20px_rgba(255,160,205,0.5)]"
      >
        <header
          className="relative shrink-0 overflow-hidden px-6 pb-7 pt-8 md:px-8"
          style={{
            background: `linear-gradient(135deg, ${palette.light} 0%, ${palette.dark} 150%)`,
          }}
        >
          <Heart
            className="absolute left-[8%] top-[18%] h-4 w-4 animate-float fill-rose text-rose-strong/80"
            aria-hidden="true"
          />
          <Star
            className="absolute right-[22%] top-[14%] h-5 w-5 animate-wiggle fill-butter text-butter"
            aria-hidden="true"
          />
          <Star
            className="absolute bottom-[16%] left-[42%] h-3 w-3 animate-glow fill-white text-white"
            aria-hidden="true"
          />

          <div className="relative flex items-center gap-5">
            <Planet palette={palette} className="h-16 w-16 shrink-0 animate-float" />
            <div className="min-w-0 pr-12">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#7a5a8a]">{label}</p>
              <h2 id={titleId} className="mt-1 font-serif text-3xl font-semibold text-[#3d2a52]">
                {title}
              </h2>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-[#3d2a52] shadow-sm transition hover:scale-110 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d2a52]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={CONTENT_TRANSITION}
          className="min-h-0 overflow-y-auto px-6 py-6 md:px-8 md:py-8"
        >
          {content}
        </motion.div>
      </motion.section>
    </motion.div>
  );
}