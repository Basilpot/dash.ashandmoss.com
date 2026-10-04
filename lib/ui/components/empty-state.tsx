import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * A first-run empty state: heading, two lines of explanation, one action,
 * centred in generous space.
 *
 * The reference composes this vertically in the middle of the viewport with no
 * container around it — a bordered box floating in whitespace competes with the
 * heading it is supposed to introduce. The action is the only filled thing on
 * screen, so it reads as the next step without being told to.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-20 text-center",
        className,
      )}
    >
      {Icon ? <Icon className="mb-4 size-8 text-muted-foreground opacity-40" aria-hidden /> : null}
      <p className="text-lg tracking-tight">{title}</p>
      {description ? (
        <div className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</div>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
