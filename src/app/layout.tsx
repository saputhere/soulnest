import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
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

/**
 * Runs before paint to apply the saved or system theme, which prevents a flash
 * of the wrong theme. This is a constant string, so it's safe to inline.
 */
const themeScript = `
(function () {
  try {
    var saved = localStorage.getItem("soulnest-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = saved ? saved === "dark" : prefersDark;
    if (isDark) document.documentElement.classList.add("dark");
  } catch (error) {}
})();
`;

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
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1a18" },
  ],
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-canvas font-sans text-ink antialiased">{children}</body>
    </html>
  );
}