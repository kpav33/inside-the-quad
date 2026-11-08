# Architecture overview

A static single-page app (SPA). No backend. Built by Vite and served by nginx from a Docker image.

## Source layout

```
src/
  app/            App shell: layout, top-level composition, (later) routing
  features/       One folder per feature; owns its components, hooks, logic and tests
    drone-viewer/ The 3D viewport (react-three-fiber Canvas, camera, controls)
  shared/         Code used by two or more features (UI primitives, utilities)
  styles/         Global CSS
  test/           Test setup and helpers
e2e/              Playwright end-to-end tests
```

Planned as the app grows (create them when first needed, not before):

- `src/features/drone-model/`: procedural 3D parts, one component per part, driven by a spec
  object so other sizes (whoop, 3", 7") are new specs rather than new models.
- `src/content/`: lesson content as typed TypeScript data, kept out of components so content can
  be edited and reviewed on its own.

## Rules

- **Feature folders are self-contained.** A feature imports from `shared/` and from another
  feature's `index.ts` only, never from its internal files.
- **Import with the `@/` alias** (`@/features/...`), not long relative paths.
- **Keep three.js lazy.** Anything importing three.js is reached through `React.lazy`, so the
  first page load stays small.
- **Logic out of components.** Calculations (motor speeds, voltage sag, compatibility checks) are
  plain TypeScript functions with unit tests; components only render.
- **Accessibility.** Everything the 3D view offers is also reachable without it (keyboard, screen
  reader): the 3D view is an enhancement, not the only way in.
- **Content is data.** Strings that teach go in `src/content/`, not inline in JSX.

## Testing layers

See [../workflow/testing.md](../workflow/testing.md).
