import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * A band of figures with nothing boxing any of them.
 *
 * The reference dashboards rule between every column. This one does not: the
 * numbers are separated by space, and a single hairline separates one section of
 * the page from the next. Ruling each cell turns a section into a grid of boxes
 * — six edges competing with the one line that actually does structural work.
 *
 * The rules used to live on `Stat` as a `[&>*]:` variant on the row. That is
 * gone now, but the reason to keep any layout class here on the cell itself
 * stays true: Tailwind v4 scans sources upward from app/globals.css, which does
 * not reach components/, so an arbitrary child variant written in this file is
 * silently dropped with no build error.
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
        "grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3",
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
    <div className={cn("py-1", className)}>
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