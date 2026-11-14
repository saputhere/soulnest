"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const GROUP: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

/** The shared "bloom" entrance: rise, sharpen from a soft blur, and settle in scale. */
export const bloomItem: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

interface StaggerGroupProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: "div" | "ul" | "ol";
}

/** Animates its children one after another when it mounts. */
export function StaggerGroup({ children, className, as = "div" }: StaggerGroupProps) {
  const reduceMotion = useReducedMotion();
  const Component = as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div;

  return (
    <Component
      className={className}
      variants={GROUP}
      initial={reduceMotion ? "show" : "hidden"}
      animate="show"
    >
      {children}
    </Component>
  );
}

interface StaggerItemProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: "div" | "li" | "article";
}

/** One item inside a StaggerGroup. Must be a direct child of a group. */
export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const Component = as === "li" ? motion.li : as === "article" ? motion.article : motion.div;

  return (
    <Component variants={bloomItem} className={className}>
      {children}
    </Component>
  );
}