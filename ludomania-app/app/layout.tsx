import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import KeepAliveProvider from "@/components/KeepAliveProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ludomania - Play Ludo, Win Real Money",
  description: "Challenge your friends to classic Ludo games with real money stakes. Secure, fast, and exciting multiplayer gaming platform.",
  keywords: "ludo, online ludo, real money games, multiplayer ludo, ludo with friends",
  authors: [{ name: "Ludomania" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <KeepAliveProvider />
        {children}
      </body>
    </html>
  );
}
