"use client";

import { usePathname } from "next/navigation";

// Segments whose slug is not a readable label.
const LABELS: Record<string, string> = {
  "info-pages": "Pages",
  "info-page-category": "Categories",
  "store-setup": "Store Setup",
};

// React owns `<head>`, so the title has to be *rendered*, not assigned — an
// effect that sets document.title gets overwritten by the metadata title on the
// next head reconciliation. React 19 hoists this into <head> and it updates on
// navigation like any other node.
export function PageTitle() {
  const segment = usePathname()?.split("/")[1] ?? "";
  const title =
    LABELS[segment] ??
    (segment
      ? segment.replaceAll("-", " ").replace(/^./, (c) => c.toUpperCase())
      : "Ash & Moss");

  return <title>{title}</title>;
}