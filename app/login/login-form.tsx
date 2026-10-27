"use client";

import { Eye, EyeOff } from "lucide-react";
import { cn } from "@repo/ui";
import { Button } from "@repo/ui";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@repo/ui";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

type FormValues = {
  email: string;
  password: string;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { register, handleSubmit } = useForm<FormValues>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/platform/login`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
    // This dashboard only serves furniture stores. Saying so at login stops a
      // restaurant owner being handed their restaurant store, whose menu items would then
      // appear under this dashboard's /products.
      body: JSON.stringify({ ...data, businessType: "furniture" }),
          cache: "no-store",
        },
      );

      const payload = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("Login successful");
        sessionStorage.setItem("tab_session_active", "true");
        const data = payload.data;
        if (data?.token) {
          try {
            localStorage.setItem("admin_token", data.token);
          } catch {
            throw new Error("Could not save login session");
          }
        }
        await fetch("/api/store-selection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Use the store the API validated rather than picking out of the array
          // ourselves - order is not something the client should be guessing at.
          body: JSON.stringify({ storeId: data?.store?.id ?? data?.stores?.[0]?.id }),
        });
        router.push("/dashboard");
      } else {
        const msg = payload?.message || "Login failed";
        toast.error(msg);
      }
    } catch (err) {
      console.error("Admin login error:", err);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex w-full max-w-xs flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Sign in to manage your store.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              {...register("email")}
            />
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link href="/forgot-password" className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="pr-10"
                required
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>
          <Field>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        New here?
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
        <p>
          <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
            Create your store
          </Link>
        </p>
        <p>
          <Link href="/verify-email" className="underline underline-offset-4 hover:text-foreground">
            Verify your email
          </Link>
        </p>
      </div>
    </div>
  );
}
