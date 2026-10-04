"use client"

import { useRouter } from "next/navigation"

import * as React from "react"
import { Check, ChevronsUpDown, LucideBadgeCheck, LucideBoxes, LucideColumnsSettings, LucideContact2, LucideFolder, LucideForm, LucideGaugeCircle, LucideImage, LucideLayers, LucideNewspaper, LucidePackage, LucideReceipt, LucideRedo2, LucideSettings, LucideStars, LucideTag, LucideWallet, type LucideIcon } from "lucide-react";

import { NavMain } from "@repo/ui"
import { NavSecondary } from "@repo/ui"
import { NavUser } from "@repo/ui"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui"
import { useSidebarStore } from "@repo/ui"

const SIDEBAR_MENU_API = `/api/sidebar-menu`

export const navGroups: {
  label: string
  defaultOpen?: boolean
  items: { title: string; url: string; icon: LucideIcon }[]
}[] = [
  {
    label: "Content",
    defaultOpen: true,
    items: [
      { title: "Media", url: "/media", icon: LucideImage },
      { title: "Pages", url: "/info-pages", icon: LucideLayers },
      { title: "Posts", url: "/posts", icon: LucideNewspaper },
      { title: "Authors", url: "/authors", icon: LucideContact2 },
      { title: "Categories", url: "/info-page-category", icon: LucideFolder },
      { title: "Testimonials", url: "/testimonials", icon: LucideStars },
      // { title: "Newsletter", url: "/newsletter", icon: LucideMail },
      { title: "Redirects", url: "/redirects", icon: LucideRedo2 },
    ],
  },
  {
    label: "Navigation",
    items: [
      { title: "Navbar", url: "/navbar", icon: LucideForm },
      { title: "Footer", url: "/footer", icon: LucideColumnsSettings },
    ],
  },
]

const QUICK_ACTIONS = [
  { title: "Dashboard", url: "/dashboard", icon: LucideGaugeCircle },
  { title: "Products", url: "/products", icon: LucidePackage },
  { title: "Categories", url: "/categories", icon: LucideFolder },
  { title: "Brands", url: "/brands", icon: LucideBadgeCheck },
  { title: "Tags", url: "/tags", icon: LucideTag },
  { title: "Orders", url: "/orders", icon: LucideReceipt },
  { title: "Stock", url: "/stock", icon: LucideBoxes },
  { title: "Payments", url: "/payments", icon: LucideWallet },
  // Lands on the API tab; the rest of settings is one click away in the tab bar.
  { title: "Settings", url: "/settings/api-keys", icon: LucideSettings },
]

const SECONDARY_NAV: {
  title: string
  url: string
  icon: LucideIcon
}[] = []

function initials(name?: string) {
  if (!name) return "—";
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "—"
  );
}

export function AppSidebar({
  user,
  currentStore,
  stores = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: { name: string; email: string }
  currentStore?: { id: string; name: string; slug: string }
  stores?: { id: string; name: string; slug: string }[]
}) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)

  // Persist the choice, then reload so every server-rendered screen re-resolves
  // against the new tenant rather than keeping stale rows from the old one.
  const switchTo = async (storeId: string) => {
    setBusy(true)
    try {
      await fetch("/api/store-selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      })
      router.push("/dashboard")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }
  const hidden = useSidebarStore((s) => s.hidden)
  const setHidden = useSidebarStore((s) => s.setHidden)

  React.useEffect(() => {
    fetch(SIDEBAR_MENU_API)
      .then((res) => res.json())
      .then((data) => {
        const items: { url: string; visible: boolean }[] =
          data?.data?.items ?? []
        setHidden(items.filter((i) => i.visible === false).map((i) => i.url))
      })
      .catch(() => {})
  }, [setHidden])

  const navMain = [
    ...QUICK_ACTIONS,
    ...navGroups.map((group) => ({
      title: group.label,
      url: "#",
      isActive: group.defaultOpen,
      items: group.items.filter((item) => !hidden.includes(item.url)),
    })).filter((group) => group.items.length > 0),
  ]

  return (
    <Sidebar variant="inset" {...props}>
      {/* Workspace switcher. This dashboard is multi-store, so this is the one
          control that decides which tenant every screen below is pointed at -
          it was a static label naming whichever store resolved first, which is
          how a restaurant owner ended up looking at their menu items here. */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip={currentStore?.name ?? "Select a store"}
                  className="h-auto gap-2.5 px-2 py-2"
                >
                  <span
                    aria-hidden
                    className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] leading-none font-medium text-primary-foreground"
                  >
                    {initials(currentStore?.name)}
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block truncate text-sm leading-tight">
                      {currentStore?.name ?? "Select a store"}
                    </span>
                    <span className="block truncate text-xs leading-tight text-muted-foreground">
                      {stores.length > 1 ? `${stores.length} stores` : "Store"}
                    </span>
                  </span>
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                <DropdownMenuLabel>Switch store</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {stores.map((s) => (
                  <DropdownMenuItem
                    key={s.id}
                    disabled={busy || s.id === currentStore?.id}
                    onSelect={() => switchTo(s.id)}
                    className="gap-2"
                  >
                    <span
                      aria-hidden
                      className="flex size-5 shrink-0 items-center justify-center rounded bg-primary text-[9px] leading-none font-medium text-primary-foreground"
                    >
                      {initials(s.name)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{s.name}</span>
                    {s.id === currentStore?.id ? <Check className="size-4 shrink-0" /> : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={SECONDARY_NAV} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? "Admin",
            email: user?.email ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
