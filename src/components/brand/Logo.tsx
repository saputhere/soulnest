import Image from "next/image";
import { cn } from "@/lib/cn";

interface LogoProps {
  readonly className?: string;
  /** Pixel height of the logo. Width follows the image's own proportions. */
  readonly height?: number;
}

/**
 * SoulNest logo from /public/soulnest-logo.png with a gentle floating motion.
 * The float uses the animate-float class, which is disabled for reduced-motion visitors.
 */
export function Logo({ className, height = 52 }: LogoProps) {
  return (
    <Image
      src="/soulnest-logo.png"
      alt="SoulNest"
      width={height * 3}
      height={height}
      priority
      className={cn(
        "animate-float drop-shadow-[0_0_18px_rgba(255,183,210,0.35)] transition duration-700 hover:drop-shadow-[0_0_28px_rgba(255,200,230,0.55)]",
        className,
      )}
      style={{ height, width: "auto" }}
    />
  );
}

/** Kept for existing imports. Renders the same logo. */
export function LogoMark({ className }: { readonly className?: string }) {
  return (
    <Image
      src="/soulnest-logo.png"
      alt="logo"
      aria-hidden="true"
      width={44}
      height={44}
      className={cn("h-11 w-11 object-contain", className)}
    />
  );
}