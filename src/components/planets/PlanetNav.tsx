"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Planet } from "./Planet";
import { PlanetModal } from "./PlanetModal";
import { planetSections, type PlanetSection } from "./planetCatalog";

const SPIN_IN_TRANSITION = { type: "spring", stiffness: 120, damping: 12 } as const;

interface PlanetCardProps {
  readonly section: PlanetSection;
  readonly isOpen: boolean;
  /** Changing this value remounts the button, which replays the spin-in animation. */
  readonly spinKey: number;
  readonly onOpen: (id: string) => void;
}

function PlanetCard({ section, isOpen, spinKey, onOpen }: PlanetCardProps) {
  const { id, label, palette } = section;

  return (
    <li className="flex flex-col items-center gap-2">
      {isOpen ? (
        <span className="block h-16 w-16 sm:h-20 sm:w-20" aria-hidden="true" />
      ) : (
        <motion.button
          key={spinKey}
          id={`planet-${id}`}
          layoutId={`planet-${id}`}
          type="button"
          aria-haspopup="dialog"
          aria-label={`Open ${label}`}
          onClick={() => onOpen(id)}
          initial={{ rotate: -220, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.92 }}
          transition={SPIN_IN_TRANSITION}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-transparent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage-strong sm:h-20 sm:w-20"
        >
          <Planet palette={palette} className="h-12 w-12 animate-float sm:h-14 sm:w-14" />
        </motion.button>
      )}
      <span className="text-xs tracking-wide text-ink-muted sm:text-sm">{label}</span>
    </li>
  );
}

/**
 * Row of planets that open their section in an animated popup.
 * MotionConfig("user") skips transform animations for visitors with reduced motion
 * and keeps the same markup on the server and in the browser, which avoids hydration mismatches.
 */
export function PlanetNav() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [spinKeys, setSpinKeys] = useState<Record<string, number>>({});
  const lastOpenedIdRef = useRef<string | null>(null);

  const activeSection = planetSections.find((section) => section.id === activeId) ?? null;

  const handleOpen = useCallback((id: string) => {
    lastOpenedIdRef.current = id;
    setActiveId(id);
  }, []);

  const handleClose = useCallback(() => {
    const closedId = lastOpenedIdRef.current;
    setActiveId(null);
    if (closedId) {
      setSpinKeys((previous) => ({ ...previous, [closedId]: (previous[closedId] ?? 0) + 1 }));
    }
  }, []);

  // Return keyboard focus to the planet that opened the popup.
  useEffect(() => {
    if (activeId === null && lastOpenedIdRef.current) {
      document.getElementById(`planet-${lastOpenedIdRef.current}`)?.focus();
    }
  }, [activeId]);

  return (
    <MotionConfig reducedMotion="user">
      <nav aria-label="Sections">
        <ul className="flex items-end justify-center gap-4 sm:gap-8">
          {planetSections.map((section) => (
            <PlanetCard
              key={section.id}
              section={section}
              isOpen={section.id === activeId}
              spinKey={spinKeys[section.id] ?? 0}
              onOpen={handleOpen}
            />
          ))}
        </ul>
      </nav>

      <AnimatePresence>
        {activeSection && (
          <PlanetModal key={activeSection.id} section={activeSection} onClose={handleClose} />
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}