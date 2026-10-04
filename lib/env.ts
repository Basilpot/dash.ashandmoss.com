/**
 * Required configuration, resolved once at module load.
 *
 * These values used to be read inline as `process.env.X ?? "http://localhost:3000"`
 * or `process.env.X!`. Both patterns turn a missing env var into either a green
 * build that 404s every request in production, or a schema error about
 * `images.remotePatterns` that names nothing useful. `.env.production` is not
 * committed (see .gitignore), so a fresh clone genuinely does not have these set
 * and must be told so loudly, by name.
 *
 * Localhost lives in `.env`, which is gitignored and filled in from
 * `.env.example`, so `pnpm dev` still works with no production config present.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `[config] ${name} is not set. Copy .env.example to .env.local (dev) or ` +
        `.env.production (deploy) and fill it in. Refusing to fall back to a ` +
        `default, because a wrong default fails silently.`,
    );
  }
  return value;
}

/** The API this dashboard proxies to. Server-side only; never exposed to the browser. */
export const API_BASE_URL = required("API_BASE_URL").replace(/\/$/, "");

/**
 * Tenant used when there is no store cookie — i.e. before login, and for a
 * brand-new admin who has not picked a store yet.
 *
 * Defaults to `ashandmoss` because this database has exactly one tenant and the
 * storefront needs *some* tenant before anyone logs in. It is a real fallback,
 * not a cover for a missing value: set it explicitly when a second store exists.
 */
export const DEFAULT_STORE_SLUG = process.env.DEFAULT_STORE_SLUG?.trim() || "ashandmoss";

/**
 * next/image refuses to optimise any host not listed in remotePatterns, and it
 * reports a missing one as a schema error about remotePatterns rather than about
 * the env var. Required here so the message names the variable instead.
 *
 * Read only at build time (next.config.ts), never inlined into a client bundle.
 */
export const NEXT_PUBLIC_IMAGE_DOMAIN = required("NEXT_PUBLIC_IMAGE_DOMAIN");
export const NEXT_PUBLIC_WEBSITE_DOMAIN = required("NEXT_PUBLIC_WEBSITE_DOMAIN");

/**
 * The two below are read inside client components, so they must stay literal
 * `process.env.NEXT_PUBLIC_*` expressions for Next to inline them at build.
 * Routing them through required() above would pass the name as a variable, which
 * defeats the substitution and leaves `process` undefined in the browser.
 *
 * Optional by design: they only decorate links in admin tables, and a blank
 * prefix degrades to a relative link rather than breaking the page.
 */
export const NEXT_PUBLIC_API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");
export const NEXT_PUBLIC_FRONTEND_BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || "";