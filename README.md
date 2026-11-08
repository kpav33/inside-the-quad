# Inside the Quad

An interactive web app that teaches beginners how an FPV drone works, part by part, using a 3D model
of a typical 5" freestyle quad.

## Getting started

Requirements: Node 22 (see `.nvmrc`) and pnpm 11 (`corepack enable` installs the pinned version).

```sh
pnpm install
pnpm dev        # http://localhost:5173
```

## Scripts

| Script               | What it does                                 |
| -------------------- | -------------------------------------------- |
| `pnpm dev`           | Start the dev server                         |
| `pnpm build`         | Typecheck and build to `dist/`               |
| `pnpm preview`       | Serve the production build locally           |
| `pnpm check`         | Typecheck, lint, format check and unit tests |
| `pnpm test`          | Unit and component tests (Vitest)            |
| `pnpm test:coverage` | Unit tests with a coverage report            |
| `pnpm test:e2e`      | End-to-end tests (Playwright, Chromium)      |
| `pnpm lint:fix`      | Fix lint problems where possible             |
| `pnpm format`        | Format all files with Prettier               |

First e2e run: `pnpm exec playwright install chromium`.

## Tech stack

Vite · React 19 · TypeScript (strict) · three.js via react-three-fiber and drei · Vitest + Testing
Library · Playwright · ESLint + Prettier · husky, lint-staged and commitlint · Docker + nginx,
deployed on Coolify.

## Contributing

Read [CLAUDE.md](CLAUDE.md) and [docs/workflow/git.md](docs/workflow/git.md). Commits follow
[Conventional Commits](https://www.conventionalcommits.org/) and are checked by a git hook.

## Deployment

The `Dockerfile` builds a static site served by nginx on port 80, with a health check at
`/healthz`. See [ADR 0003](docs/decisions/0003-hosting-coolify-docker.md).
