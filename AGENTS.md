# Admin dashboard (Ash & Moss admin)

Next.js 16 App Router, React 19, Tailwind CSS 4, TypeScript, shadcn/ui (new-york, `@/*` → package root).

## Workspace

This app is a member of the pnpm workspace at the repo root. Shared components
live in `@repo/ui` (`packages/ui`) and are imported by name, not via `@/`.

Two constraints that fail *silently* — check both before concluding a change works:

- **Tailwind cannot see the package.** v4 auto-detects sources by walking up from
  `app/globals.css`, so `app/globals.css` must keep its
  `@source "../../packages/ui/src"`. Without it, shared components render
  completely unstyled and the build still passes. Verify by checking a
  package-only class appears in the emitted CSS, not that the build is green.
- **`next.config.ts` needs `transpilePackages: ["@repo/ui"]`** and an explicit
  `turbopack.root`. The repo root has a stray `dashboard/package-lock.json`
  alongside the root `pnpm-lock.yaml`; without `turbopack.root`, Turbopack picks
  the wrong workspace root and `next/font/google` fails to resolve.

`shadcn add` writes new primitives here, but 9 stock ones (`accordion`,
`alert-dialog`, `breadcrumb`, `card`, `checkbox`, `field`, `scroll-area`,
`switch`, `tabs`) still live in `components/ui/` because no shared component
uses them. **If a shared component starts using a local primitive, that file must
move into `packages/ui` too** — a package cannot import from its consumer.

```sh
pnpm dev              # next dev (localhost:3001 in this stack)
pnpm build            # next build
pnpm lint             # eslint (next/core-web-vitals + typescript); no-explicit-any is warn
```

- API proxy: dev proxies `POST /api/*` → `http://localhost:3000/api/v1/*`; production uses `API_PROXY_URL`. All API calls use `fetch` with `credentials: "include"`.
- Admin login at `/login`, dashboard in `app/(dash)/`. Signup at `/signup`, verify at `/verify-email?token=`. `/admin` redirects to `/login`.
- The dashboard proxies every API call through `app/api/[...path]/route.ts`, which attaches the store headers the API resolves tenancy from — it reads the `store_id` cookie and sends `X-Store-Id` (or `X-Store-Slug` as fallback). It only ever selects among stores the admin is a member of; the API re-checks `store_membership` on every request.
- Sidebar menu is `components/app-sidebar.tsx` (`navGroups`, `QUICK_ACTIONS`, `SECONDARY_NAV`) — add new pages there.
- API client pattern: plain functions in `app/actions/index.ts`.
- `/team` = marketing team members CRUD, NOT staff accounts. There is no billing/plans page yet (SaaS feature pending).
- Design system is the **global `frontend-design` skill** (`~/.config/opencode/skills/frontend-design/`), which takes precedence over anything in this repo. `DESIGN.md` is only a pointer to it — read real values out of `app/globals.css`, `lib/font.ts` and `app/(dash)/layout.tsx`.
- MCP: `next-devtools` via `.mcp.json`.
