import { cn } from "@/lib/cn";

interface LogoMarkProps {
  readonly className?: string;
}

/**
 * Temporary heart-shaped nest with a star. Replace the body with your
 * SoulNest logo file once it's added (for example, as an inline SVG component).
 */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      <path d="M24 40C16 35 8 29 8 20a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 9-8 15-16 20z" />
      <path d="M14 36c3 1 6 2 10 2s7-1 10-2" />
      <path
        d="M24 14l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

interface LogoProps {
  readonly className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-serif text-2xl font-semibold text-ink", className)}>
      <LogoMark className="h-7 w-7 text-sage-strong" />
      SoulNest
    </span>
  );
}