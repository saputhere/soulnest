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

/** A cute shaded planet with a face, blush, and an optional ring. Decorative, so hidden from assistive technology. */
export function Planet({ palette, className }: PlanetProps) {
  return (
    <span className={cn("relative block", className)} aria-hidden="true">
      {palette.hasRing && (
        <span className="absolute left-1/2 top-1/2 h-[38%] w-[175%] -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] rounded-[50%] border-[3px] border-butter" />
      )}

      <span
        className="absolute inset-0 rounded-full shadow-[inset_-5px_-7px_12px_rgba(120,70,130,0.22),0_0_18px_rgba(255,200,230,0.35)]"
        style={{
          background: `radial-gradient(circle at 32% 28%, ${palette.light}, ${palette.dark} 75%)`,
        }}
      />

      <span className="absolute left-[34%] top-[42%] h-[10%] w-[10%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4a3560]" />
      <span className="absolute left-[66%] top-[42%] h-[10%] w-[10%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4a3560]" />

      <span className="absolute left-1/2 top-[56%] h-[12%] w-[18%] -translate-x-1/2 rounded-b-full border-b-2 border-[#4a3560]" />

      <span className="absolute left-[22%] top-[55%] h-[10%] w-[14%] -translate-x-1/2 rounded-full bg-rose/70" />
      <span className="absolute left-[78%] top-[55%] h-[10%] w-[14%] -translate-x-1/2 rounded-full bg-rose/70" />
    </span>
  );
}