# Testing

| Layer      | Tool                     | Location            | What it covers                                    |
| ---------- | ------------------------ | ------------------- | ------------------------------------------------- |
| Unit       | Vitest                   | `src/**/*.test.ts`  | Pure logic: physics, specs, compatibility rules   |
| Component  | Vitest + Testing Library | `src/**/*.test.tsx` | React UI outside the 3D canvas: panels, controls  |
| End-to-end | Playwright (Chromium)    | `e2e/*.spec.ts`     | Real browser on the production build, incl. WebGL |

## End-to-end targets

- **Locally**, `pnpm test:e2e` builds the app and serves it with `vite preview`.
- **In CI**, the same tests run against the production Docker image (nginx), by setting
  `E2E_BASE_URL`. Tests in `e2e/server.spec.ts` check nginx behaviour (headers, caching, SPA
  fallback, health check) and only run in that mode. To run them locally:

  ```sh
  docker build -t inside-the-quad . && docker run -d --rm --name itq -p 8080:80 inside-the-quad
  E2E_BASE_URL=http://localhost:8080 pnpm test:e2e
  docker stop itq
  ```

- The smoke test fails on any page or console error, which includes Content-Security-Policy
  violations. If a new feature needs a looser CSP, change `nginx/security-headers.conf`
  deliberately and say why in the commit body.

## Guidelines

- Put tests next to the code they test (`Thing.tsx` → `Thing.test.tsx`).
- Query by role and accessible name (`getByRole('button', { name: 'Motors' })`), not by class or
  test id, unless there is no accessible handle (e.g. a WebGL canvas).
- jsdom has no WebGL: mock 3D components in component tests (see `src/app/App.test.tsx`) and cover
  3D behaviour in e2e tests. Keep 3D logic (positions from specs, selection state) in plain
  functions so it can be unit-tested.
- Bug fixes start with a failing test that reproduces the bug.
- Vitest globals are off: import `describe`, `it`, `expect` and `vi` from `vitest`. Mocks are
  restored after each test (`restoreMocks`).
- Coverage (`pnpm test:coverage`) is printed in the CI log. There's no hard threshold yet; logic
  modules are expected to be close to fully covered.
