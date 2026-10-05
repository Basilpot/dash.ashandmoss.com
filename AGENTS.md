# Admin dashboard (Ash & Moss admin)

Next.js 16 App Router, React 19, Tailwind CSS 4, TypeScript, shadcn/ui (new-york, `@/*` → package root).

## `@repo/ui`

Shared components are **vendored into `lib/ui`**, not installed from a package
registry or linked from a sibling checkout. `@repo/ui` resolves to
`lib/ui/index.ts` via the tsconfig path mapping, so components import by name
rather than `@/`. This repository builds and deploys with nothing checked out
beside it.

Two constraints that fail *silently* — check both before concluding a change works:

- **Tailwind picks up `lib/ui` on its own.** v4 scans from the project root, so
  the vendored copy is covered with no `@source` line. If a shared component ever
  renders completely unstyled while the build stays green, that assumption broke —
  verify by checking a `lib/ui`-only utility (`animate-in`, `fade-in-0`) appears in
  the emitted CSS, not by whether the build passed.
- **`next.config.ts` needs `transpilePackages: ["@repo/ui"]`**, since `lib/ui`
  ships raw TSX and would otherwise be treated as an external package.

CSS is the exception to the alias: `globals.css` cannot use `@repo/ui/styles/...`
because a CSS import is not a TypeScript import and does not go through the
tsconfig mapping. It uses a relative path.

`shadcn add` writes new primitives to `components/ui/`, but 9 stock ones
(`accordion`, `alert-dialog`, `breadcrumb`, `card`, `checkbox`, `field`,
`scroll-area`, `switch`, `tabs`) still live there because no shared component
uses them. **If a shared component starts using a local primitive, that file must
move into `lib/ui` too** — vendored code cannot import from its consumer.

```sh
pnpm dev              # next dev
pnpm build            # next build
pnpm lint             # eslint (next/core-web-vitals + typescript); no-explicit-any is warn
```

- API proxy: dev proxies `POST /api/*` → `http://localhost:3000/api/v1/*`; production uses `API_PROXY_URL`. All API calls use `fetch` with `credentials: "include"`.
- Admin login at `/login`, dashboard in `app/(dash)/`. Signup at `/signup`, verify at `/verify-email?token=`. `/admin` redirects to `/login`.
- The dashboard proxies every API call through `app/api/[...path]/route.ts`, which attaches the store headers the API resolves tenancy from — it reads the `store_id` cookie and sends `X-Store-Id` (or `X-Store-Slug` as fallback). It only ever selects among stores the admin is a member of; the API re-checks `store_membership` on every request.
- Sidebar menu is `components/app-sidebar.tsx` (`navGroups`, `QUICK_ACTIONS`, `SECONDARY_NAV`) — add new pages there.
- API client pattern: plain functions in `app/actions/index.ts`.
- `/team` = marketing team members CRUD, NOT staff accounts. There is no billing/plans page yet (SaaS feature pending).
- Design system is the **global `frontend-design` skill** (`~/.config/opencode/skills/frontend-design/`), which takes precedence over anything in this repo. Read real values out of `app/globals.css`, `lib/font.ts` and `app/(dash)/layout.tsx`.
- MCP: `next-devtools` via `.mcp.json`.
