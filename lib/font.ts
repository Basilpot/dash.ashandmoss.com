import { Inter_Tight } from "next/font/google";

// Variable weight, so the 500 headings and 400 body both come out of one file.
// `variable` points at a name globals.css composes into --font-sans, which keeps
// the native stack as the fallback rather than replacing it.
export const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
});