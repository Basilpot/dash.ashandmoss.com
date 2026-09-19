"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type State = { error?: string };

async function createStore(_: State, formData: FormData): Promise<State> {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const templateKey = String(formData.get("templateKey") ?? "furniture");
  if (name.length < 2 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: "Enter a name and lowercase hyphenated slug." };
  }

  const response = await fetch("/api/admin/stores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, slug, templateKey }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return { error: payload.message ?? "Store creation failed." };

  const storeId = payload.data?.id;
  if (!storeId) return { error: "Store creation returned no ID." };
  await fetch("/api/store-selection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storeId }),
  });
  window.location.assign("/store-setup");
  return {};
}

export function StoreForm() {
  const [state, action, pending] = useActionState(createStore, {});

  return (
    <form action={action}>
      <Card>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Store name</FieldLabel>
              <Input id="name" name="name" required minLength={2} placeholder="Acme Technology" />
            </Field>
            <Field>
              <FieldLabel htmlFor="slug">Store slug</FieldLabel>
              <Input id="slug" name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="acme-technology" />
            </Field>
            <Field>
              <FieldLabel htmlFor="templateKey">Template</FieldLabel>
              <Select name="templateKey" defaultValue="furniture">
                <SelectTrigger id="templateKey"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="furniture">Furniture</SelectItem></SelectContent>
              </Select>
            </Field>
            {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create store"}</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
