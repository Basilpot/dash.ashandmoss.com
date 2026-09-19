"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type State = { error?: string; sent?: boolean };

async function signup(_: State, formData: FormData): Promise<State> {
  const response = await fetch("/api/platform/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(formData)),
  });
  const payload = await response.json().catch(() => ({}));
  return response.ok ? { sent: true } : { error: payload.message ?? "Signup failed" };
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, {});
  if (state.sent) return <Card className="w-full max-w-md"><CardHeader><CardTitle>Check your email</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Verification link expires in 30 minutes.</p></CardContent></Card>;
  return <Card className="w-full max-w-md"><CardHeader><CardTitle>Create your store</CardTitle></CardHeader><CardContent><form action={action}><FieldGroup>
    <Field><FieldLabel htmlFor="ownerName">Your name</FieldLabel><Input id="ownerName" name="ownerName" required minLength={2} /></Field>
    <Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" name="email" type="email" required /></Field>
    <Field><FieldLabel htmlFor="password">Password</FieldLabel><Input id="password" name="password" type="password" required minLength={8} /></Field>
    <Field><FieldLabel htmlFor="storeName">Store name</FieldLabel><Input id="storeName" name="storeName" required minLength={2} /></Field>
    <Field><FieldLabel htmlFor="storeSlug">Store address</FieldLabel><Input id="storeSlug" name="storeSlug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="my-store" /><p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens.</p></Field>
    {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
    <Button disabled={pending}>{pending ? "Sending…" : "Create account"}</Button>
    <p className="text-center text-sm text-muted-foreground">Already registered? <Link href="/login" className="text-foreground underline">Log in</Link></p>
  </FieldGroup></form></CardContent></Card>;
}
