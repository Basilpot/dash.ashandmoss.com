import * as React from "react";

/**
 * The action row at the top of a page.
 *
 * There is no heading here. Every screen used to print its own name and a
 * sentence about it, which said the same thing the tab, the sidebar and the URL
 * already said. The name is still in `<title>`, and the row stays because it
 * holds the page's actions — which now sit on the right, where a `justify-
 * between` used to push them once the left-hand side of that row was empty.
 */
export function PageHeader({
  children,
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  if (!children) return null;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
  );
}