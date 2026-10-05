"use client";

import { useRouter } from "next/navigation";

import { Button } from "@repo/ui";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/ui";

import { ProductEditor } from "./product-editor";

/**
 * The product form in a sheet, over the product list.
 *
 * All eight groups are mounted here, FAQ and SEO included — collapsing a panel
 * unmounts nothing, because react-hook-form keeps values for unregistered fields
 * and the field arrays live in form state, not the DOM. No step rail, no
 * accordion-only subset: the sheet is the whole product, and "open the full
 * editor" is a shortcut, not a hand-off.
 *
 * `sm:max-w-md` overrides the sheet's default `sm:max-w-sm`. The step grids use
 * container queries, so they stack here and go multi-column on the full page
 * without a second set of markup.
 */
export function ProductSheet({
  productId,
  open,
  onOpenChange,
}: {
  /** null opens the form to create a product. */
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md" showCloseButton={false}>
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <SheetTitle className="truncate text-lg">
                {productId ? "Edit product" : "New product"}
              </SheetTitle>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-sm"
                onClick={() => {
                  onOpenChange(false);
                  router.push(
                    productId ? `/products/edit?id=${productId}` : "/products/edit",
                  );
                }}
              >
                Open the full editor
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4">
          <ProductEditor
            key={productId ?? "new"}
            productId={productId}
            mode="accordion"
            onSaved={() => {
              onOpenChange(false);
              router.refresh();
            }}
            onCancel={() => onOpenChange(false)}
          />
        </div>

        <SheetFooter className="border-t border-border">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="productform">
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
