"use client";

import { Check, ChevronsUpDown, Store } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export type StoreOption = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

export function StoreSwitcher({ stores, currentStoreId }: { stores: StoreOption[]; currentStoreId: string }) {
  const [pending, setPending] = useState(false);
  const current = stores.find((store) => store.id === currentStoreId) ?? stores[0];

  async function selectStore(storeId: string) {
    if (storeId === currentStoreId || pending) return;
    setPending(true);
    const response = await fetch("/api/store-selection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId }),
    });
    if (response.ok) window.location.assign("/dashboard");
    else setPending(false);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg" disabled={pending}>
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Store className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{current?.name ?? "Store"}</span>
            <span className="truncate text-xs text-muted-foreground">{current?.slug}</span>
          </div>
          {stores.length > 1 ? <ChevronsUpDown className="ml-auto size-4" /> : null}
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      {stores.length > 1 ? (
        <DropdownMenuContent className="min-w-56" align="start" side="right">
          {stores.map((store) => (
            <DropdownMenuItem key={store.id} onSelect={() => void selectStore(store.id)}>
              <span className="flex-1 truncate">{store.name}</span>
              {store.id === current?.id ? <Check className="size-4" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      ) : null}
    </DropdownMenu>
  );
}
