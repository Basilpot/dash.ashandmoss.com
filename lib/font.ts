import { Livvic } from "next/font/google";

// Livvic for the whole UI — body included. It is not a variable face, so the
// weights the app actually uses are requested explicitly: 400 body, 500 the
// `font-medium` on nav items and labels, 600 `font-semibold`, 700 headings.
// `variable` points at a name globals.css composes into --font-sans, which keeps
// the platform stack as the fallback rather than replacing it.
export const livvic = Livvic({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-livvic",
});