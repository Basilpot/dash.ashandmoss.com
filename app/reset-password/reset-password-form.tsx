"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@repo/ui";

type State = { error?: string; done?: boolean };

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(async (_: State, formData: FormData): Promise<State> => {
    const password = String(formData.get("password") ?? "");
    if (password !== formData.get("confirm")) return { error: "Passwords do not match" };
    const response = await fetch("/api/platform/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const payload = await response.json().catch(() => ({}));
    return response.ok ? { done: true } : { error: payload.message ?? "Could not reset password" };
  }, {});

  if (!token)
    return <Card className="w-full max-w-md"><CardHeader><CardTitle>Invalid link</CardTitle></CardHeader><CardContent><Link href="/forgot-password" className="text-sm underline underline-offset-4">Request a new reset link</Link></CardContent></Card>;
  if (state.done)
    return <Card className="w-full max-w-md"><CardHeader><CardTitle>Password updated</CardTitle></CardHeader><CardContent><Link href="/login" className="text-sm underline underline-offset-4">Sign in</Link></CardContent></Card>;
  return (
    <Card className="w-full max-w-md">
      <CardHeader><CardTitle>Choose a new password</CardTitle></CardHeader>
      <CardContent>
        <form action={action}>
          <FieldGroup>
            <Field><FieldLabel htmlFor="password">New password</FieldLabel><Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} /></Field>
            <Field><FieldLabel htmlFor="confirm">Confirm password</FieldLabel><Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} /></Field>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Update password"}</Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
