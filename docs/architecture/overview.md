# Architecture overview

A static single-page app (SPA). No backend. Built by Vite and served by nginx from a Docker image.

## Source layout

```
src/
  app/              App shell: layout, top-level composition
  content/          Teaching content as typed data
    lessons/        One Lesson per part, answering the four scope questions
    intro.ts        The intro sheet's copy, scene and size labels
    photos/         One real photo per part: caption, alt text and credit (credits.json is generated)
  features/         One folder per feature; owns its components, hooks, logic and tests
    drone-model/    Procedural 3D parts (one component per part), built from a DroneSpec
    drone-viewer/   The 3D viewport: Canvas, camera fit to the outline, orbit controls (lazy loaded)
    flight/         The moves sheet's drone without three.js: mixer, acro model, store, demos,
                    the virtual sticks
    intro/          The intro's flat SVG drawings: the system scene and the size comparison
    part-explorer/  The open sheet (from the URL); composes the viewer, part list, lesson, intro
                    and overview
    progress/       Parts and the intro marked as read, kept in localStorage
  shared/           Code used by two or more features
    design/         Design tokens: the single source of colour for CSS and the 3D materials
    domain/         Part ids, sheet order, the drone spec, size classes and part quantities: plain
                    data, no React or three.js
    routing/        Page URLs over the History API (ADR 0004): routes, usePartRoute, PartLink
    ui/             Generic UI building blocks (ErrorBoundary, drawn icons,
                    usePrefersReducedMotion: follows the reduced-motion setting live)
  styles/           tokens.css (mirrors design/tokens.ts) and global.css
  test/             Test setup and helpers
e2e/                Playwright end-to-end tests
nginx/              Production server config (copied into the Docker image)
```

### How the pieces fit

- `shared/domain/drone-spec.ts` holds the reference drone's numbers. The 3D model is sized from
  it, and lessons quote it, so the two can't disagree. Other drone sizes (whoop, 3", 7") will be
  new `DroneSpec` objects.
- The URL is the open sheet: `shared/routing` reads `/`, `/intro` or `/parts/<id>` (ADR 0004),
  and `part-explorer` shows the intro or that part's lesson in the sheet column.
  `shared/domain/sheets.ts` orders the sheets (the intro, then the parts) for previous/next. The 3D view, the part list and
  the links in a lesson all navigate, so Back and Forward retrace the learner's steps. Links are
  real `<a href>` elements (`PartLink`), so they also open in a new tab.
- `features/progress` keeps the parts marked as read, and separately the intro, in `localStorage`
  (versioned keys; blocked storage just means nothing is saved). The parts list ticks parts, and
  the overview offers the intro to a newcomer, then sheet 1, the first unread sheet, or a fresh
  start.
- Parts under the top plate (`INSIDE_PARTS`: ESC, flight controller, receiver, VTX) are shown by
  opening the frame as an exploded view. `drone-model/stack.ts` holds the stack heights, the lift
  offsets and the easing step; `drone-model/rear.ts` and `front.ts` lay out the rear bay (VTX,
  receiver, capacitor, antennas, GPS) and the camera with its plates, with tests that nothing
  overlaps. All are plain functions of the spec. `drone-model/Lift.tsx` eases a group to its
  offset and only asks for new frames while it moves (the canvas draws on demand).
- Parts the starting view hides are shown by turning the view: `drone-viewer/part-views.ts` picks
  an angle per part, and `TurnToPart.tsx` eases the camera there (and to that view's fitted
  distance) until the user drags.
- The camera is fitted, not tuned: `drone-model/extents.ts` gives the drone's outline points
  (closed and lifted), `drone-viewer/fit.ts` finds the smallest distance that keeps them inside the
  canvas for a view and aspect ratio, and `FitCamera.tsx` applies it on load and resize.
- What the open part connects to comes from its lesson: `content/lessons/connections.ts` derives
  the set, the part explorer passes it to the viewer as a prop, and `drone-model/materials.ts`
  turns (part, open part, connected set) into a look. The 3D code never imports `content/`.
- Real part photos are fetched by hand, not at build time: `scripts/photos/fetch-photos.mjs` reads
  `manifest.json`, checks each Commons licence against the allowed free set, crops and writes WebP
  files to `src/assets/photos/` and their credits to `content/photos/credits.json`. Both are
  committed; `content/photos` joins them with captions and alt text, and the part explorer shows
  them as hashed Vite assets, so a visitor's browser never contacts Wikimedia.
- Path sheets (05a): `shared/domain/paths.ts` names the paths and the anchors a path can touch;
  `content/paths/` holds each path's stops (parts lit, anchors, which stops each feeds, text);
  `drone-model/path-anchors.ts` turns anchors into points from the model's own layout functions
  and joins stops into leader segments, `PathLeader.tsx` draws the lines, and the viewer draws the
  numbered balloons as DOM over the canvas, moved to their projected points each frame
  (`drone-viewer/PathPins.tsx`). The step is in the address (`/paths/<id>/<n>`, replaced, not pushed);
  the explorer clamps it and `usePathStep` adds Play. `shared/domain/sheets.ts` splits the set into
  two chapters (parts, paths), each numbered from 1.
- The gear (06): a third chapter (`/gear/<id>`, `shared/domain/gear.ts`: radio, goggles,
  charger), after What if. `shared/domain/sheets.ts` now has three chapters; the footer names the
  chapter it crosses into or back to, and the chapter switcher lists the open sheet's chapter.
  Gear copy is typed data in `content/gear/` (the four questions, the drawn parts, what each switch
  setting does), with numbers from the drone spec and `lipo.ts`. `features/gear` draws the three
  flat SVGs from plain props (`GearState`: the switches) and holds the charger maths; it never
  imports three.js. The explorer renders `GearDrawing` in the drawing field instead of mounting the
  lazy 3D viewer (its chunk is still preloaded with the app, as on every sheet), and `GearPanel` in the sheet column; `useGearSheet` keeps the switches and the
  highlighted part, starting afresh when a gear sheet opens. Gear photos use the 03c pipeline
  (`scripts/photos/manifest.json`, keyed by part or gear id); an `own` entry reads the app's own
  photo from `scripts/photos/own/` (committed without metadata) and credits it to the app, CC0.
- What if (05c): sheet 5 of the second chapter (`/what-if/<n>`, `shared/domain/what-if.ts`). The
  mistakes are `Faults` in `features/flight` (`faults.ts`), acted out by the same model: a lost
  link swaps in safe stick values, then disarms; a wrong prop on motor 2 pushes its corner down
  while the controller's turning effort is capped by what the motors can do (`AUTHORITY`, × cells
  / 6 on 4S), so it runs out of motor and the drone flips; a disarmed or flipped drone falls to
  `GROUND_M` and rests; the VTX heat climbs on the sheet's clock. The store carries the faults and
  `reset()`. The viewer takes the ground depth as a prop (3D code still imports only types from
  `flight`), draws the ground square and the VTX gauge, and marks the faulty motor; the explorer
  adds `FlightStatus` and `WhatIfPanel`. `useFlightSheet` gives each flight sheet its own drone.
- How a quad moves (05b): sheet 4 of the second chapter (`/moves/<n>`, `shared/domain/moves.ts`).
  `features/flight` is plain TypeScript, so it stays out of the lazy 3D chunk: `mixer.ts` turns
  throttle and per-axis effort into four motor speeds for this drone's Quad X, props-in layout;
  `model.ts` is an acro rate controller (feed-forward, P, I) on a body with air drag, stepped in
  fixed substeps; `store.ts` is the mutable `Flight` the sticks write, the canvas advances each
  frame (`drone-viewer/FlightRig.tsx`) and the sheet reads; `demos.ts` holds each step's demo.
  The 3D code imports only types from `flight` (it never imports `content/`), so the explorer
  renders `Sticks` over the canvas inside the viewer's error boundary. The rig turns the drone
  about its middle, `drone-model/MotorArcs.tsx` draws each prop's arc at its motor's speed, motor
  balloons are DOM over the canvas, and the camera uses a sphere fit so any attitude fits. The
  canvas asks for frames only until the flight settles.
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
