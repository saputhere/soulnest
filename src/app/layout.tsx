import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { HelpChat } from "@/components/help/HelpChat";
import { SiteGuard } from "@/components/security/SiteGuard";
import { siteContent } from "@/content/siteContent";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteContent.brand.name}: ${siteContent.brand.tagline}`,
    template: `%s | ${siteContent.brand.name}`,
  },
  description: siteContent.hero.subheadline,
  openGraph: {
    title: siteContent.brand.name,
    description: siteContent.hero.subheadline,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1638" },
  ],
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="bg-canvas font-sans text-ink antialiased">
        <SiteGuard />
        {children}
        <HelpChat />
      </body>
    </html>
  );
}