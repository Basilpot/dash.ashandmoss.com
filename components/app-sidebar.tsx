"use client"

import * as React from "react"
import {
  LucideBadgeCheck,
  LucideColumnsSettings,
  LucideContact2,
  LucideFolder,
  LucideForm,
  LucideGaugeCircle,
  LucideSettings,
  LucideImage,
  LucideLayers,
  LucideNewspaper,
  LucidePackage,
  LucideReceipt,
  LucideRedo2,
  LucideStars,
  LucideTag,
  LucideBoxes,
  LucideWallet,
  type LucideIcon,
} from "lucide-react"

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

export function AppSidebar({
  user,
  storeName,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: { name: string; email: string }
  storeName?: string
}) {
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
      <SidebarHeader>
        <SidebarMenu><SidebarMenuItem className="px-2 py-1 font-medium truncate">{storeName ?? "Store dashboard"}</SidebarMenuItem></SidebarMenu>
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
