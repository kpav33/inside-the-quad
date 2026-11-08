# Testing

| Layer      | Tool                     | Location            | What it covers                                    |
| ---------- | ------------------------ | ------------------- | ------------------------------------------------- |
| Unit       | Vitest                   | `src/**/*.test.ts`  | Pure logic: physics, specs, compatibility rules   |
| Component  | Vitest + Testing Library | `src/**/*.test.tsx` | React UI outside the 3D canvas: panels, controls  |
| End-to-end | Playwright (Chromium)    | `e2e/*.spec.ts`     | Real browser on the production build, incl. WebGL |

## Guidelines

- Put tests next to the code they test (`Thing.tsx` → `Thing.test.tsx`).
- Query by role and accessible name (`getByRole('button', { name: 'Motors' })`), not by class or
  test id, unless there is no accessible handle (e.g. a WebGL canvas).
- jsdom has no WebGL: mock 3D components in component tests (see `src/app/App.test.tsx`) and cover
  3D behaviour in e2e tests. Keep 3D logic (positions from specs, selection state) in plain
  functions so it can be unit-tested.
- Bug fixes start with a failing test that reproduces the bug.
- Coverage (`pnpm test:coverage`) is reported in CI. There's no hard threshold yet; logic modules
  are expected to be close to fully covered.
