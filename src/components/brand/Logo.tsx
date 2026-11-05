import Image from "next/image";
import { cn } from "@/lib/cn";

interface LogoProps {
  readonly className?: string;
  /** Pixel height of the logo image. Width follows the image's own proportions. */
  readonly height?: number;
}

/**
 * SoulNest logo from /public/soulnest-logo.png, shown on a soft pastel pill
 * so it stays visible on the dark night-sky background.
 */
export function Logo({ className, height = 44 }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-white/90 px-4 py-2 shadow-[0_8px_30px_-10px_rgba(255,183,210,0.6)] ring-2 ring-rose/60",
        className,
      )}
    >
      <Image
        src="/soulnest-logo.png"
        alt="SoulNest"
        width={height * 3}
        height={height}
        priority
        style={{ height, width: "auto" }}
      />
    </span>
  );
}

/** Kept for existing imports. Renders the same logo. */
export function LogoMark({ className }: { readonly className?: string }) {
  return (
    <Image
      src="/soulnest-logo.png"
      alt=""
      aria-hidden="true"
      width={44}
      height={44}
      className={cn("h-11 w-11 object-contain", className)}
    />
  );
}