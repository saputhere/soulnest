"use client";

import { useEffect, useState } from "react";

/**
 * Renders the current year in the visitor's browser.
 *
 * Reading the date during server rendering would make the page depend on the build time,
 * which Next.js refuses to prerender. Reading it after mount avoids that.
 * The server and first client render both show an empty value, so they match.
 */
export function CopyrightYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <span suppressHydrationWarning>{year ?? ""}</span>;
}