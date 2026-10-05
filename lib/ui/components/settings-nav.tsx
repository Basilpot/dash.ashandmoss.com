"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";

export type SettingsTab = { title: string; href: string; description?: string };

/**
 * The furniture dashboard's sections. Each is a real route under
 * app/(dash)/settings, and the title and description live here rather than in
 * each page so the shell can put the heading above the tabs without any page
 * having to repeat itself.
 */
export const SETTINGS_TABS: SettingsTab[] = [
  {
    title: "Brand",
    href: "/settings/brand",
    description:
      "Your business name, logo and short introduction shown on the storefront.",
  },
  {
    title: "Contact",
    href: "/settings/contact",
    description:
      "How customers reach you, and the social profiles linked from the storefront.",
  },
  {
    title: "Homepage",
    href: "/settings/homepage",
    description: "Edit announcement, hero slides, benefits, and about content.",
  },
  {
    title: "Navigation",
    href: "/settings/sidebar",
    description:
      "Choose which items appear in the dashboard sidebar. Changes apply immediately.",
  },
  {
    title: "Reviews",
    href: "/settings/reviews",
    description:
      "Review counts and links shown as social proof on the storefront.",
  },
  {
    title: "Documents",
    href: "/settings/documents",
    description:
      "Downloadable brochures and policy files shown in the storefront documents route.",
  },
  {
    title: "API keys",
    href: "/settings/api-keys",
    description: "Authenticate a custom storefront against this store.",
  },
];

/**
 * The settings chrome: the tab's name, then the tab bar, then the page.
 *
 * The name comes from the active tab, so a page cannot drift out of sync with
 * its own tab label. The sentence that used to sit under it is gone — it
 * described the tab you had just clicked.
 */
export function SettingsShell({
  tabs = SETTINGS_TABS,
  children,
}: {
  tabs?: SettingsTab[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = tabs.find((tab) => pathname === tab.href) ?? tabs[0];

  return (
    <>
      <h1 className="mb-6 text-2xl tracking-tight">{active?.title}</h1>

      <nav
        aria-label="Settings sections"
        className="mb-8 -mb-px flex gap-1 overflow-x-auto border-b border-border"
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                // The underline sits on the bar's own border rather than as a
                // separate element, so it lines up with the rule below it.
                "border-b-2 px-3 py-2 text-sm whitespace-nowrap transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.title}
            </Link>
          );
        })}
      </nav>

      {children}
    </>
  );
}