import { Toaster } from "sonner";
import { LoginForm } from "./login-form";

/**
 * Split sign-in: the form on white at the left, a brand panel filling the right
 * half.
 *
 * The reference divides the viewport and floats a quote card over large organic
 * shapes. The composition is worth taking; the content is not. It carries a
 * named customer and a link to their site, and inventing one would be putting a
 * fabricated testimonial in front of every person who signs in. So the panel
 * does the one thing that is honest — it states what the product is — and the
 * shapes are drawn in the brand's greens rather than copied from the reference's
 * purples.
 */
export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10">
        <div className="mx-auto flex w-full max-w-sm flex-col">
          <LoginForm />
        </div>
      </div>

      <div
        aria-hidden
        className="relative hidden overflow-hidden bg-[#0d1f16] lg:block"
      >
        {/* Large soft shapes, clipped by the panel. Positioned rather than
            drawn so they cost no image request and stay crisp at any size. */}
        <div className="absolute -top-24 -left-20 size-[30rem] rounded-full bg-[#29591d]" />
        <div className="absolute top-1/3 -left-32 size-[26rem] rounded-full bg-[#1d3d26]" />
        <div className="absolute -right-24 -bottom-28 size-[32rem] rounded-full bg-[#14301f]" />
        <div className="absolute right-1/4 -bottom-40 size-[22rem] rounded-full bg-[#0f2a1b]" />

        <div className="relative flex h-full flex-col justify-end p-12">
          <p className="max-w-sm text-2xl leading-snug tracking-tight text-white">
            Run your store, your catalogue and your checkout from one place.
          </p>
          <p className="mt-3 max-w-sm text-sm text-white/60">
            Ash &amp; Moss is the platform behind ashandmoss.com.
          </p>
        </div>
      </div>

      <Toaster />
    </div>
  );
}