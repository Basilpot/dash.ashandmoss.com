import Link from "next/link";
import { Armchair } from "lucide-react";
import { Toaster } from "sonner";
import { LoginForm } from "./login-form";

export const metadata = { title: "Ash & Moss" };

/**
 * Split sign-in after shadcn's login-02 block: brand mark top-left, the form
 * centred in the left column, and a brand panel that fills the full viewport
 * height on the right.
 *
 * The panel states what the product is rather than quoting a customer — a
 * testimonial here would be invented, and it would be shown to everyone who
 * signs in.
 */
export default function LoginPage() {
  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Armchair className="size-4" />
            </span>
            Ash &amp; Moss
          </Link>
          <div className="flex flex-1 items-center justify-center">
            <LoginForm />
          </div>
        </div>

        <div
          aria-hidden
          className="relative hidden overflow-hidden bg-[#0d1f16] lg:block"
        >
          {/* Soft shapes, clipped by the panel; positioned rather than drawn so
              they cost no image request and stay crisp at any size. */}
          <div className="absolute -top-24 -left-20 size-[30rem] rounded-full bg-[#29591d]" />
          <div className="absolute top-1/3 -left-32 size-[26rem] rounded-full bg-[#1d3d26]" />
          <div className="absolute -right-24 -bottom-28 size-[32rem] rounded-full bg-[#14301f]" />
          <div className="absolute right-1/4 -bottom-40 size-[22rem] rounded-full bg-[#0f2a1b]" />

          <div className="relative flex h-full flex-col justify-end p-12">
            <p className="max-w-md text-3xl leading-snug font-medium tracking-tight text-white">
              Run your store, your catalogue and your checkout from one place.
            </p>
            <p className="mt-3 max-w-sm text-sm text-white/60">
              Ash &amp; Moss is the platform behind ashandmoss.com.
            </p>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
