import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@repo/ui";
import { SidebarProvider, SidebarInset } from "@repo/ui";
import { Toaster } from "sonner";
import { redirect } from "next/navigation";

import { API_BASE_URL, DEFAULT_STORE_SLUG } from "@/lib/env";

const FALLBACK_NAME = "Store";

const AdminDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const cookieStore = await cookies();

  const authToken = cookieStore.get("admin_auth_token")?.value;
  const storeId = cookieStore.get("store_id")?.value;

  if (!authToken) {
    redirect("/login");
  }

  const apiBase =
    API_BASE_URL;
  const meRes = await fetch(`${apiBase}/admin/me`, {
    headers: {
      Cookie: cookieStore.toString(),
      ...(storeId ? { "X-Store-Id": storeId } : { "X-Store-Slug": DEFAULT_STORE_SLUG }),
    },
    cache: "no-store",
  });

  if (!meRes.ok) {
    redirect("/login");
  }

  const me = await meRes.json();
  const admin = me?.data?.admin;
  if (!admin) {
    redirect("/login");
  }

  let companyName: string | null = null;
  try {
    const tenantHeaders = {
      Cookie: cookieStore.toString(),
      ...(storeId ? { "X-Store-Id": storeId } : { "X-Store-Slug": DEFAULT_STORE_SLUG }),
    };
    const configRes = await fetch(`${apiBase}/site-config`, { headers: tenantHeaders, cache: "no-store" });
    if (configRes.ok) {
      const config = await configRes.json();
      companyName = config?.data?.name ?? null;
    }
  } catch {
    // non-fatal — sidebar falls back to the placeholder name
  }

  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        user={{ name: admin.username, email: admin.email }}
        currentStore={me?.store ?? { id: "", name: FALLBACK_NAME, slug: "" }}
        stores={me?.stores ?? []}
      />
      <SidebarInset className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="min-w-0 flex-1 p-4">{children}</div>
        <div className="border-t border-border">
          <div className="flex items-center justify-center px-4 py-3 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {companyName ?? FALLBACK_NAME}
          </div>
        </div>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminDashboardLayout;
