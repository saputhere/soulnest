"use client";

import { useEffect } from "react";

const DEV_TOOLS_LETTERS = new Set(["i", "j", "c", "k"]);

/** Text fields keep normal right-click, paste, and selection so users can still type and edit. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA"
  );
}

function isDevToolsShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();
  const modifier = event.ctrlKey || event.metaKey;

  if (key === "f12") return true;
  if (modifier && event.shiftKey && DEV_TOOLS_LETTERS.has(key)) return true;
  if (event.metaKey && event.altKey && DEV_TOOLS_LETTERS.has(key)) return true;
  return false;
}

function isViewSourceOrSaveShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();
  const modifier = event.ctrlKey || event.metaKey;
  return modifier && (key === "u" || key === "s");
}

/**
 * Blocks right-click, devtools shortcuts, view-source, and save shortcuts in production builds only.
 * This is a deterrent for casual copying, not real security. Anyone can still open the page source
 * or disable JavaScript, so never put private data in the browser that you wouldn't show to the visitor.
 */
export function SiteGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const handleContextMenu = (event: MouseEvent): void => {
      if (!isEditableTarget(event.target)) event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isDevToolsShortcut(event) || isViewSourceOrSaveShortcut(event)) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}