"use client";

import { UserCog } from "lucide-react";
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
    <div
      className={cn("flex w-full max-w-sm flex-col", className)}
      {...props}
    >
      {/* No card. The reference sets the form straight on the page: a bordered
          panel around two inputs and a button is a container drawn around the
          only thing on screen, which it then has to compete with. */}
      <div className="flex flex-col items-center text-center">
        <Link href="/" aria-label="Ash and Moss home" className="flex flex-col items-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UserCog className="size-5" />
          </span>
          <span className="sr-only">Ash &amp; Moss</span>
        </Link>
        <h1 className="mt-5 text-2xl tracking-tight">Sign in to Ash &amp; Moss</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                  {...register("password")}
                />
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <Link href="/signup" className="hover:text-foreground">
          Create your store
        </Link>
        <Link href="/verify-email" className="hover:text-foreground">
          Verify email
        </Link>
      </div>
    </div>
  );
}
