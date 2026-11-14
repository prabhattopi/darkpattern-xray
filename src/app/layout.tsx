import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DarkPattern X-Ray | AI Consumer Protection & Deceptive UI Auditor",
  description:
    "Expose hidden subscription traps, drip pricing, confirmshaming, and roach motels in any checkout or UI screenshot using Multimodal Gemini Vision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-rose-500/30 selection:text-rose-200`}
      >
        {children}
      </body>
    </html>
  );
}