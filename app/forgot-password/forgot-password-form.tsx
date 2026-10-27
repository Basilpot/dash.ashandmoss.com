"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@repo/ui";

type State = { error?: string; sent?: boolean };

async function request(_: State, formData: FormData): Promise<State> {
  const response = await fetch("/api/platform/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(formData)),
  });
  const payload = await response.json().catch(() => ({}));
  return response.ok ? { sent: true } : { error: payload.message ?? "Something went wrong" };
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(request, {});
  if (state.sent)
    return (
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Check your email</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">If that account exists, a reset link is on its way. It expires in 30 minutes.</p>
          <Link href="/login" className="mt-4 inline-block text-sm underline underline-offset-4">Back to sign in</Link>
        </CardContent>
      </Card>
    );
  return (
    <Card className="w-full max-w-md">
      <CardHeader><CardTitle>Reset your password</CardTitle></CardHeader>
      <CardContent>
        <form action={action}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" disabled={pending}>{pending ? "Sending..." : "Send reset link"}</Button>
            <Link href="/login" className="text-center text-sm text-muted-foreground underline underline-offset-4">Back to sign in</Link>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
