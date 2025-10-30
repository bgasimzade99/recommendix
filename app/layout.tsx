import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { ToastProvider } from "@/components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "RGR-RECO - Hybrid Recommender System",
  description: "A lightweight recommender system for small businesses using Rule-based, Graph-based, and Reinforcement Learning approaches",
  keywords: ["recommender system", "hybrid AI", "machine learning", "collaborative filtering"],
  authors: [{ name: "RGR Research Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-white`}
      >
        <ToastProvider />
        <Nav />
        {children}
      </body>
    </html>
  );
}
