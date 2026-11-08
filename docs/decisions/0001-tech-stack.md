# 0001. Tech stack

- Status: accepted
- Date: 2026-11-08

## Context

The app is an interactive teaching tool centred on a 3D model, with no user accounts or server
data. It needs fast iteration, strong typing for agent-written code, and good 3D support.

## Decision

- **Vite + React 19 + TypeScript** (strict, including `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes`), as a static SPA.
- **three.js through react-three-fiber and drei** for 3D, so 3D parts are React components.
- **pnpm** as the only package manager.
- **Vitest + Testing Library** for unit and component tests; **Playwright** for end-to-end tests.
- **ESLint** (typescript-eslint strict type-checked, react-hooks, jsx-a11y-x) and **Prettier**.
- **husky + lint-staged + commitlint** (Conventional Commits) for local quality gates.
- **GitHub Actions** for CI.

Version notes: TypeScript is held at 6.0 because typescript-eslint does not support 7.x yet.
`eslint-plugin-jsx-a11y-x` (the maintained es-tooling fork) replaces `eslint-plugin-jsx-a11y`,
which does not support ESLint 10.

## Consequences

- No server-side rendering; fine for this app, and SEO needs can be met with static meta tags.
- When typescript-eslint supports TypeScript 7, upgrade both together.
