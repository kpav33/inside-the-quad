# Architecture overview

A static single-page app (SPA). No backend. Built by Vite and served by nginx from a Docker image.

## Source layout

```
src/
  app/              App shell: layout, top-level composition, (later) routing
  content/          Teaching content as typed data
    lessons/        One Lesson per part, answering the four scope questions
  features/         One folder per feature; owns its components, hooks, logic and tests
    drone-model/    Procedural 3D parts (one component per part), built from a DroneSpec
    drone-viewer/   The 3D viewport: Canvas, camera fitting, orbit controls (lazy loaded)
    part-explorer/  Selection state; composes the viewer, the part list and the lesson panel
  shared/           Code used by two or more features
    design/         Design tokens: the single source of colour for CSS and the 3D materials
    domain/         Part ids, the drone spec and part quantities: plain data, no React or three.js
    ui/             Generic UI building blocks (e.g. ErrorBoundary)
  styles/           tokens.css (mirrors design/tokens.ts) and global.css
  test/             Test setup and helpers
e2e/                Playwright end-to-end tests
nginx/              Production server config (copied into the Docker image)
```

### How the pieces fit

- `shared/domain/drone-spec.ts` holds the reference drone's numbers. The 3D model is sized from
  it, and lessons quote it, so the two can't disagree. Other drone sizes (whoop, 3", 7") will be
  new `DroneSpec` objects.
- `part-explorer` owns which part is selected. The 3D view and the part list both change it; the
  lesson panel shows the selected part's lesson from `content/lessons`.
- Parts under the top plate (`INSIDE_PARTS`: ESC, flight controller, receiver, VTX) are shown by
  opening the frame as an exploded view. `drone-model/stack.ts` holds the stack heights, the lift
  offsets and the easing step; `drone-model/rear.ts` and `front.ts` lay out the rear bay (VTX,
  receiver, capacitor, antennas, GPS) and the camera with its plates, with tests that nothing
  overlaps. All are plain functions of the spec. `drone-model/Lift.tsx` eases a group to its
  offset and only asks for new frames while it moves (the canvas draws on demand).
- Parts the starting view hides are shown by turning the view: `drone-viewer/part-views.ts` picks
  an angle per part, and `TurnToPart.tsx` eases the camera there, keeping the zoom, until the user
  drags.
- The part list is the accessible equivalent of clicking in 3D, so the canvas is hidden from
  assistive technology and everything still works if WebGL fails.

## Rules

- **Dependencies point inwards.** `features/` may import `content/` and `shared/`; `content/` may
  import `shared/`; `content/` and `shared/` never import from `features/`.
- **Feature folders are self-contained.** Each feature has an `index.ts` that is its public API.
  Code outside a feature imports from that `index.ts` only, never from its internal files
  (tests that mock an internal module are the exception).
- **Import with the `@/` alias** (`@/features/...`), not long relative paths.
- **Keep three.js lazy.** Anything importing three.js is reached through `React.lazy`, so the
  first page load stays small.
- **Contain failures.** Anything that can fail at runtime (WebGL, lazily loaded chunks) sits
  inside an `ErrorBoundary` with a useful fallback, so one failure doesn't blank the page.
- **Logic out of components.** Calculations (motor speeds, voltage sag, compatibility checks) are
  plain TypeScript functions with unit tests; components only render.
- **Accessibility.** Everything the 3D view offers is also reachable without it (keyboard, screen
  reader): the 3D view is an enhancement, not the only way in.
- **Content is data.** Strings that teach go in `src/content/`, not inline in JSX.

## Testing layers

See [../workflow/testing.md](../workflow/testing.md).

## Design system

- `DESIGN.md` (repo root) documents the visual world; `.impeccable/surfaces/` holds the direction
  contract for the part explorer.
- Colours live in `src/shared/design/tokens.ts`. `src/styles/tokens.css` mirrors them as custom
  properties, and a unit test keeps the two identical and checks WCAG AA contrast.
- Fonts (Barlow Condensed for labels, Atkinson Hyperlegible for reading) are bundled from
  `@fontsource`, because the Content-Security-Policy only allows same-origin fonts.
- The 3D canvas renders on demand (`frameloop="demand"`); anything that animates must request
  frames itself.
