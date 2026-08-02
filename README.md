# Expentra Web

React frontend for Expentra — expense management for modern teams. Built with Vite, React 19, TypeScript, Tailwind CSS, and React Router.

## Requirements

- Node.js ≥ 20.19
- pnpm 9+ (enable via `corepack enable`)

## Local development

```bash
pnpm install
cp .env.example .env
pnpm dev
```

App runs at [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server with HMR |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript project build (no emit) |
| `pnpm test` | Run Vitest unit tests |
| `pnpm build` | Typecheck + production build to `dist/` |
| `pnpm preview` | Serve the production build locally |

## Environment variables

Copy [`.env.example`](.env.example) to `.env`. All `VITE_*` variables are embedded in the client bundle and are publicly visible — never put secrets there.
