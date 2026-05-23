import type { Metadata } from "next";
import { IBM_Plex_Mono, Syne } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const syne = Syne({
  weight: ["700", "800"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Outreach Pipeline",
  description: "AI Automation Outreach Tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ibmPlexMono.variable} ${syne.variable}`}>
      <body>{children}</body>
    </html>
  );
}
