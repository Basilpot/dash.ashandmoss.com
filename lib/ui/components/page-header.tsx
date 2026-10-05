import * as React from "react";

/**
 * The action row at the top of a page.
 *
 * There is no heading here. Every screen used to print its own name and a
 * sentence about it, which said the same thing the tab, the sidebar and the URL
 * already said. The title is still in `<title>` — that is where a name is
 * useful — and the row stays because it holds the page's actions.
 */
export function PageHeader({
  description,
  children,
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  if (!children && !description) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}