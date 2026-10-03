# Design

**The design system for this app is the global `frontend-design` skill, not
this file.**

Read `~/.config/opencode/skills/frontend-design/SKILL.md` and its
`references/` (especially `stripe.md`) before any UI work here. That skill
takes precedence over anything written in this repository.

The real, verifiable values live in the code:

| What | Where |
|------|-------|
| Colour tokens, radius, fonts | `app/globals.css` (`:root` + `@theme inline`) |
| Font loading | `lib/font.ts`, applied in `app/layout.tsx` |
| Page shell, sidebar width, padding | `app/(dash)/layout.tsx` |
| Nav structure | `components/app-sidebar.tsx` |
| Primitives | `packages/ui/src/components/ui/` |

Do not document a token, size or colour here unless you have read it out of
those files. Previous versions of this file described a hunter-green primary
(`#3a5a40`), an 18px root font size, `p-8` page padding, 2.75rem controls and a
`[data-slot]` size-up block — none of which existed in the code.