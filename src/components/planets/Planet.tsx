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

/**
 * A glossy, atmospheric planet with an optional ring. Decorative, so hidden from assistive technology.
 * The ring is drawn in two halves so the planet appears to sit inside it.
 */
export function Planet({ palette, className }: PlanetProps) {
  const ringStyle = "absolute left-1/2 top-1/2 h-[34%] w-[176%] -translate-x-1/2 -translate-y-1/2 -rotate-[16deg] rounded-[50%] border-[3px]";

  return (
    <span className={cn("relative block", className)} aria-hidden="true">
      <span
        className="absolute -inset-[20%] rounded-full blur-md"
        style={{ background: `radial-gradient(circle, ${palette.light}40 35%, transparent 70%)` }}
      />

      {palette.hasRing && (
        <span className={cn(ringStyle, "border-white/25")} />
      )}

      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 26%, ${palette.light} 0%, ${palette.dark} 55%, #1b1433 130%)`,
          boxShadow: `inset -8px -12px 20px rgba(10, 6, 25, 0.55), 0 0 26px ${palette.light}55`,
        }}
      />

      <span className="absolute inset-0 rounded-full bg-[linear-gradient(120deg,rgba(255,255,255,0.45)_0%,transparent_38%)] mix-blend-soft-light" />

      {palette.hasRing && (
        <span className={cn(ringStyle, "border-white/45 [clip-path:inset(50%_0_0_0)]")} />
      )}
    </span>
  );
}