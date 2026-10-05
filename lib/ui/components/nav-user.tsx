"use client"

import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar"
import { logout } from "../lib/logout"

export function NavUser({
  user,
  placement = "sidebar",
}: {
  user: {
    name: string
    email: string
    avatar?: string
  }
  /**
   * `header` renders a trigger sized for the top bar — a fixed 32px control with
   * no name/email column. A `SidebarMenuButton` is h-12 and w-full, which
   * stretches to the full width of the header and doubles its height.
   */
  placement?: "sidebar" | "header"
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const avatar = (
    <Avatar className="size-8 shrink-0 rounded-lg">
      {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
      <AvatarFallback className="rounded-lg">{initials || "A"}</AvatarFallback>
    </Avatar>
  )

  const menu = (
    <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {placement === "header" ? (
              <button
                type="button"
                className="flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors hover:bg-accent"
              >
                {avatar}
                <span className="max-w-32 truncate font-medium">{user.name}</span>
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ) : (
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {avatar}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile || placement === "header" ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {avatar}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/account">
                  <BadgeCheck />
                  Account
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await logout()
                router.push("/")
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    </>
  )

  // The sidebar wrappers are `w-full` list semantics; in the header they would
  // claim the remaining width of the row and push the create button left.
  if (placement === "header") return menu

  return (
    <SidebarMenu>
      <SidebarMenuItem>{menu}</SidebarMenuItem>
    </SidebarMenu>
  )
}
