import { ReactNode } from "react";
import type { Metadata } from "next";
import { inter, livvic } from "@/lib/font";
import "./globals.css";

export const metadata: Metadata = {
  // No `title` here on purpose: a metadata title and a rendered <title> are two
  // writers on <head>, and the metadata one wins on hydration. Each route sets
  // its own title instead — the dashboard through <PageTitle>.
  icons: "/icon.svg",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${livvic.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}