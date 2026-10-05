import * as React from "react";

/**
 * The page's name on the left, its actions on the right.
 *
 * The description line under the title is gone: every one of them restated the
 * page in a full sentence ("Manage your store inventory", "Track and update
 * product and variant stock") and none of them told you anything the screen
 * does not already show. The name stays because it is the one thing the tab,
 * the URL and the sidebar all agree on.
 */
export function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl tracking-tight">{title}</h1>
      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}