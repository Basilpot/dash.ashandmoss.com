"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ProductEditor } from "@/components/product/product-editor";

/**
 * The full-page editor: all eight groups, one at a time, with the rail and the
 * Save/Cancel pair living in the layout above.
 *
 * The same form also renders inside a sheet, one click away from the product
 * list, so everything but the route plumbing lives in the editor.
 */
function Editor() {
  const searchParams = useSearchParams();
  return <ProductEditor productId={searchParams?.get("id") ?? null} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Editor />
    </Suspense>
  );
}
