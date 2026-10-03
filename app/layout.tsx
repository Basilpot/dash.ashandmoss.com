import { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { interTight } from "@/lib/font";

export const metadata: Metadata = {
  title: "Ash & Moss — Admin",
  icons: "/icon.svg",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={interTight.className}>
      <body className={`${interTight.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}