"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

interface FaqListProps {
  readonly items: readonly { readonly question: string; readonly answer: string }[];
}

const OPEN_EASE = [0.22, 1, 0.36, 1] as const;

/** Accordion where questions bloom in, and answers slide open and closed. One answer is open at a time. */
export function FaqList({ items }: FaqListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  return (
    <StaggerGroup className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;

        return (
          <StaggerItem key={item.question}>
            <div
              className={`overflow-hidden rounded-2xl border transition-colors duration-500 ${
                isOpen ? "border-[#b5f5da]/40 bg-white/[0.06]" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-white"
              >
                <span className="font-semibold text-white">{item.question}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.45, ease: OPEN_EASE }}
                  className="shrink-0"
                >
                  <ChevronDown className="h-5 w-5 text-white/60" aria-hidden="true" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    key="panel"
                    id={panelId}
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: OPEN_EASE }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-white/70">{item.answer}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}