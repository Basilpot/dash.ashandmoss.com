import { Inter, Livvic } from "next/font/google";

// Two faces, two jobs. Livvic carries the body; Inter carries headings and
// titles, which is where its tighter fit and smaller counters earn their keep —
// a heading set in a body face reads as body copy that got bigger.
//
// Livvic is not a variable font, so the weights the app actually uses are
// requested explicitly: 400 body, 500 the `font-medium` on nav items and labels,
// 600 `font-semibold`, 700 headings. Inter is variable, so one file covers it.
//
// Both are exposed as variables rather than applied directly, so globals.css can
// compose each one ahead of the platform stack it falls back to.
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const livvic = Livvic({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-livvic",
});