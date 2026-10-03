import type { LucideIcon } from "lucide-react";
import { cn } from "@repo/ui";

/**
 * A band of figures divided by vertical rules rather than a grid of cards.
 *
 * The reference dashboards set a metric row as one continuous ruled band: a
 * horizontal rule above, one before each column, and nothing boxing any single
 * figure. The columns read as columns of a table because they are columns of a
 * table — no per-cell container, no shadow, no radius. A `gap-4` grid of bordered
 * cards fragments the same numbers into separate objects and gives the eye six
 * competing edges instead of three shared ones.
 *
 * The rules live on `Stat` rather than as a `[&>*]:` variant here. Tailwind v4
 * scans sources upward from app/globals.css, which does not reach dashboard/
 * components/, so an arbitrary child variant written in this file is silently
 * dropped and the band loses its dividers with no error. Plain utilities on the
 * cell itself always compile.
 */
export function StatRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 border-t border-border sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Stat({
  title,
  value,
  description,
  icon: Icon,
  className,
}: {
  title: string;
  value: string | number | undefined;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // A rule before every column, including the first — the reference
        // aligns each column to the same left edge. Stacked, cells separate
        // horizontally instead.
        "border-l border-border px-5 py-4 max-sm:border-t",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        {Icon ? <Icon className="size-3.5 text-muted-foreground" aria-hidden /> : null}
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      {/* The figure is the loudest thing in the column; tabular figures keep
          digits from shifting as counts change. */}
      <p className="mt-2 text-3xl tabular-nums">{value ?? "—"}</p>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}