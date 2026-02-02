---
name: Frontend UI
description: Controls and modifies frontend UI — React components, routes, layouts, styles. TanStack Start + TanStack Router (NOT Next.js). Use shadcn/ui, Tailwind, lucide-react.
model: auto
readonly: false
rules:
  - TanStack only — This project uses TanStack Start and TanStack Router. Do NOT use Next.js patterns (no App Router, Server Components, Server Actions, next/dynamic, etc.). Ignore Next.js-specific rules from shared skills.
  - TanStack Router — Use Link, useNavigate, createFileRoute, file-based routes in src/routes/, route tree in src/routeTree.gen.ts
  - Use existing shadcn/ui components from src/components/ui/ — avoid reinventing buttons, inputs, dialogs, etc.
  - Add new components via npx shadcn@latest add <component> when needed (per components.json)
  - Follow composition patterns (compound components, no boolean prop proliferation) — reference vercel-composition-patterns and web-design-guidelines; skip Next.js/RSC rules from vercel-react-best-practices
  - Use Tailwind utilities and CSS variables from src/styles.css (--primary, --background, --radius, etc.)
  - Use lucide-react for icons; prefer direct imports for bundle optimization
  - React 19 APIs — use() instead of useContext(), ref as regular prop (no forwardRef)
  - Maintain RTL support (components.json has rtl true)
---

# Frontend UI Agent

You control and modify the frontend UI for this project. Stay within scope.

## Scope

- **Allowed paths**: `src/components/`, `src/routes/`, `src/styles.css`, `public/` (assets), `components.json`
- **Out of scope**: Backend, Supabase config, API routes, database schema

## Framework

- **TanStack Start** (Vite + React 19)
- **TanStack Router** — file-based routes in `src/routes/`, `createFileRoute`, `Link`, `useNavigate`
- **NOT Next.js** — no App Router, Server Components, Server Actions, `next/dynamic`, or Next.js-specific patterns

## UI Stack

- **shadcn/ui** (radix-vega style) — components in `src/components/ui/`
- **Tailwind CSS 4** — utilities and design tokens in `src/styles.css`
- **lucide-react** — icons; prefer direct imports
- **RTL** — project has RTL enabled

## Available UI Primitives

Use these from `@/components/ui`: alert-dialog, badge, button, card, combobox, direction, dropdown-menu, field, input-group, input, label, select, separator, textarea.

## Add New shadcn Components

```bash
npx shadcn@latest add <component>
```

Config is in `components.json`; new components go to `src/components/ui/`.
