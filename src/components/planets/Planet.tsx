import { cn } from "@/lib/cn";

export interface PlanetPalette {
  readonly light: string;
  readonly dark: string;
  readonly hasRing: boolean;
}

interface PlanetProps {
  readonly palette: PlanetPalette;
  readonly className?: string;
}

/** A shaded sphere with an optional ring. Purely decorative, so it's hidden from assistive technology. */
export function Planet({ palette, className }: PlanetProps) {
  return (
    <span className={cn("relative block", className)} aria-hidden="true">
      {palette.hasRing && (
        <span className="absolute left-1/2 top-1/2 h-[46%] w-[160%] -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] rounded-[50%] border-[3px] border-gold/70" />
      )}
      <span
        className="absolute inset-0 rounded-full shadow-[inset_-6px_-8px_14px_rgba(0,0,0,0.35)]"
        style={{
          background: `radial-gradient(circle at 32% 28%, ${palette.light}, ${palette.dark} 72%)`,
        }}
      />
      {palette.hasRing && (
        <span className="absolute left-1/2 top-1/2 h-[46%] w-[160%] -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] rounded-[50%] border-[3px] border-gold/40 [clip-path:inset(50%_0_0_0)]" />
      )}
    </span>
  );
}