import Link from "next/link";
import {
  Boxes,
  FileText,
  Folder,
  Images,
  Newspaper,
  Plus,
  Tags,
  Users,
} from "lucide-react";
import { NavUser } from "../nav-user";
import { SidebarTrigger } from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

/**
 * The shell's utility bar.
 *
 * The reference dashboard puts its page title here with a search field, a
 * notification bell and a filled circular create button on the right. Only the
 * create affordance transfers honestly: this dashboard has no notifications
 * feature and no global search, so a bell or a magnifier would be decoration
 * that goes nowhere. Page titles stay in the body, where they already live, and
 * the store name already sits at the top of the sidebar.
 *
 * The create button opens a menu rather than acting directly. A bare "+" in a
 * global position has no obvious target — product, brand, post and page are all
 * plausible — so it names them instead of guessing.
 */
const CREATE_ACTIONS = [
  { title: "Product", href: "/products", icon: Boxes },
  { title: "Category", href: "/categories", icon: Folder },
  { title: "Brand", href: "/brands", icon: Tags },
  { title: "Tag", href: "/tags", icon: Tags },
  { title: "Author", href: "/authors", icon: Users },
  { title: "Collection", href: "/info-page-category", icon: Newspaper },
  { title: "Post", href: "/posts", icon: FileText },
  { title: "Page", href: "/info-pages", icon: FileText },
  { title: "Media", href: "/media", icon: Images },
];

export function SiteHeader({
  actions,
  user,
}: {
  /**
   * Rendered immediately before the create button. A slot rather than a fixed
   * set of controls, because the two dashboards do not have the same features -
   * the restaurant one has notifications and this one has none.
   */
  actions?: React.ReactNode;
  /** Rendered after the create button: who is signed in. */
  user?: { name: string; email: string };
} = {}) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />

        <div className="ml-auto flex items-center gap-1">
          {actions}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Create"
                className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Create new</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CREATE_ACTIONS.map((action) => (
                <DropdownMenuItem key={action.title} asChild>
                  <Link href={action.href}>{action.title}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {user ? <NavUser user={user} placement="header" /> : null}
      </div>
    </header>
  );
}