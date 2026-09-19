import { StoreForm } from "./store-form";
import { PageHeader } from "@/components/page-header";

export default function StoresPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader title="Add store" description="Create a tenant and assign yourself as owner." />
      <StoreForm />
    </div>
  );
}
