# Section 02b — The model that teaches: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or
> superpowers:subagent-driven-development) to implement this plan task-by-task, and the
> `impeccable:impeccable` skill for every UI edit (read its `reference/craft-floor.md` immediately
> before editing UI). Steps use checkbox (`- [ ]`) syntax. Branch: `feat/model-that-teaches`.

**Goal:** The open part stands out in 3D with the parts it connects to, the drone fills the drawing
field, the Propellers sheet shows spin arcs, and hovering a part in 3D lights up its list row.

**Architecture:** A part's look (`open | connected | faded | normal`) is a pure function in
`drone-model`; the connected set comes from the lessons through a `content/lessons` helper and
reaches the viewer as a prop from the part explorer. A pure `fitDistance` in `drone-viewer`
replaces drei `Bounds` + `FitBox`. Hover travels viewer → explorer → `PartList` as state.

**Tech Stack:** TypeScript, React 19, react-three-fiber/drei, three.js, Vitest + Testing Library,
Playwright.

**Spec:** [02b-model-that-teaches-design.md](02b-model-that-teaches-design.md). Read it first.

## Global Constraints

- Node 22: prefix node/pnpm commands with `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
- ADR 0002: procedural model, one component per part, no model files.
- Colours only from `src/shared/design/tokens.ts`; redline only for selection, the current sheet
  and focus. Hover never uses redline.
- `features/drone-model` and `features/drone-viewer` never import `content/`. three.js stays
  behind the lazy `DroneViewer`.
- Each task ends with `pnpm check` passing and a Conventional Commit (header ≤ 72 chars, body
  lines ≤ 100).

## Review Focus

1. **Tall phone screens (390 × 844) and the open stack:** the fitted drone is never cropped in the
   default, front or rear view, closed or lifted. Pinned in Task 2's unit test (aspect 0.46) and
   e2e at 390 px.
2. **Resizing the window or crossing the wide/stacked layout switch** refits the distance but keeps
   the angle the user turned to. Pinned in Task 2's e2e.
3. **Clicking a faded part still opens it** (transparent fills must not lose raycasts). Pinned in
   Task 1's e2e.
4. **Hover never sticks:** leaving the canvas, a touch tap, or the hovered part's sheet opening
   leaves no row in the hover look. Pinned in Task 4's tests.
5. **Faded fills never hide the open part** behind them (transparent sort / depth writes), including
   the lifted ESC and flight controller. Pinned by Task 1's visual check at the lifted stack and
   the e2e click on the lifted flight controller (existing test, kept green).

---

### Task 1: Open, connected, faded

**Files:** Modify `src/shared/design/tokens.ts` (+ `src/styles/tokens.css` only if CSS needs it),
`src/features/drone-model/materials.ts`, `materials.test.ts`, `parts/PartMaterial.tsx`, every part
component that passes `highlighted`, `DroneModel.tsx`, `src/features/drone-viewer/DroneViewer.tsx`,
`src/features/part-explorer/PartExplorer.tsx`. Create `src/content/lessons/connections.ts`,
`connections.test.ts`, export from `src/content/lessons/index.ts`. Add to `e2e/explorer.spec.ts`.

**Interfaces:**

- Produces (`drone-model`): `type PartLook = 'open' | 'connected' | 'faded' | 'normal'`;
  `partLook(part: PartId, open: PartId | null, connected: ReadonlySet<PartId>): PartLook` (no open
  part → `normal`; the open part → `open`; in `connected` → `connected`; else `faded`);
  `partAppearance(part: PartId, look: PartLook): { color: string; edgeColor: string; opacity: number }`.
  Part components take `look: PartLook` instead of `highlighted: boolean`.
- Produces (tokens): `MODEL_LOOK = { connected: '#4a525a', fadedOpacity: 0.25 }` (tune by eye;
  values recorded in `DESIGN.md`).
- Produces (content): `connectedParts(part: PartId): ReadonlySet<PartId>` from
  `LESSONS[part].connections`, without duplicates and without `part`.
- Produces (viewer): `DroneViewer` and `DroneModel` take `connectedParts: ReadonlySet<PartId>`.

- [ ] **Step 1: Failing tests.** `materials.test.ts`: `partLook` for each case above;
      `partAppearance(id, 'open')` is `{ color: COLOR.accent, edgeColor: COLOR.ground, opacity: 1 }`;
      `'normal'` is `{ MODEL_COLOR[id], COLOR.ink, 1 }`; `'connected'` is
      `{ MODEL_LOOK.connected, COLOR.ink, 1 }` and its fill is lighter than every `MODEL_COLOR`
      (contrast against ground greater) but `contrastRatio(MODEL_LOOK.connected, COLOR.ground)`
      < 3; `'faded'` has `color: COLOR.ground`, `edgeColor: COLOR.ruleStrong`, opacity
      `MODEL_LOOK.fadedOpacity` (< 1). `connections.test.ts`: `connectedParts('esc')` equals
      `{battery, motors, fc, frame}`; `connectedParts('extras')` has `fc` once; for every part the
      set never contains the part itself and every id is in `PART_IDS`; `connectedParts('frame')`
      lacks `props` and `extras`.
- [ ] **Step 2:** Run; fail. Implement. `PartMaterial` sets `transparent` and `depthWrite={false}`
      only for `faded`; faded meshes keep their raycast (no `raycast` override). `PartExplorer`
      passes `selectedPart ? connectedParts(selectedPart) : EMPTY_SET` (a module-level constant).
- [ ] **Step 3:** e2e in `e2e/explorer.spec.ts`: open `/parts/props`, click the battery point
      (faded on that sheet) → the URL is `/parts/battery` and the Battery heading is shown.
- [ ] **Step 4:** Look with impeccable at `/parts/esc`, `/parts/fc` (lifted stack), `/parts/props`
      and `/parts/frame` at 1280 px: the open part is never hidden behind a faded fill; tune the two
      token values; `pnpm check`.
- [ ] **Step 5:** `feat(drone-model): fade parts unrelated to the open sheet`

### Task 2: Fit the camera to the drone's outline

**Files:** Modify `src/features/drone-model/extents.ts`, `extents.test.ts`, `index.ts`; delete
`FitBox.tsx`. Create `src/features/drone-viewer/fit.ts`, `fit.test.ts`, `FitCamera.tsx`. Modify
`DroneViewer.tsx`, `e2e/explorer.spec.ts` (`POINTS`). Add `e2e/fit.spec.ts`.

**Interfaces:**

- Produces (`drone-model`): `droneOutlineMm(spec: DroneSpec): Vec3[]`: points whose hull holds the
  drone closed and lifted (each prop disc sampled every 15° at prop height, antenna tips and bar
  ends and the GPS top, the closed top corners of the battery, and the same points raised by
  their lifts from `explodedOffsets(spec, true)`: battery by `topPlate`, rear-bay points by
  `rearBay`). `Vec3 = [x, y, z]` in mm.
- Produces (`drone-viewer`): `fitDistance(points: Vec3[], centre: Vec3, view: View, aspect: number,
fovDeg: number, margin: number): number` (metres in, metres out): the smallest distance from
  `centre` along `view` at which every point projects inside `±(1 − margin)` in both NDC axes.
  Binary search over distance is fine. `FIT_VIEWS = [DEFAULT_VIEW, FRONT_VIEW, REAR_VIEW]`
  (export the two from `part-views.ts`); the drone's distance is the max over them.
  `FIT_MARGIN = 0.04`; `ZOOM_RANGE = { min: 0.5, max: 2 }` (factors of the fitted distance).
- `FitCamera` (inside the Canvas): sets the controls target to the outline's centre, places the
  camera at the fitted distance along the default view on mount, and on canvas resize rescales the
  current offset to the new fitted distance (keeping the user's direction); sets
  `minDistance`/`maxDistance` from `ZOOM_RANGE`.

- [ ] **Step 1: Failing tests.** `extents.test.ts`: `droneOutlineMm` includes a point at
      `motorOffset + propRadius` from the centre in x and z, and its highest point is at least the
      lifted battery top (closed battery top + the `topPlate` lift). `fit.test.ts`: for aspects 1.6 and 0.46 and each of `FIT_VIEWS`, every
      point projected from `fitDistance(...)` lies within `±(1 − FIT_MARGIN)` and at least one
      lies beyond `±(1 − FIT_MARGIN − 0.02)` (tight); at aspect 1.6 the default-view distance is
      at least 12 % smaller than with today's fit (a box of `closedExtentsMm` fitted by its largest
      side with margin 1.08, as drei `Bounds` does; compute it in the test).
- [ ] **Step 2:** Run; fail. Implement; remove `Bounds`/`FitBox` and the fixed 0.15/0.8 limits.
- [ ] **Step 3:** e2e `e2e/fit.spec.ts`: at 1280 × 800 on `/`, the drone's drawn pixels (canvas
      pixels differing from the ground colour) span at least 75 % of the canvas width. At 390 × 844
      on `/parts/fc` (lifted) and `/parts/camera` (front view, after the turn settles) no drawn pixel
      touches the canvas's outer 2 px border. Turn the drone by a drag, resize to 900 × 800, and
      the canvas screenshot is not the default view (the angle survived) while no drawn pixel
      touches the border.
- [ ] **Step 4:** Re-find `POINTS` in `e2e/explorer.spec.ts` for the larger drone (grid of clicks,
      one fresh page per point, as the comment says) and update the comment's viewport; run
      `e2e/explorer.spec.ts`, `e2e/touch.spec.ts`, `e2e/design.spec.ts`; all pass. Look at
      1280, 768 and 390 px with impeccable; `pnpm check`.
- [ ] **Step 5:** `feat(drone-viewer): fit the camera to the drone's real outline`

### Task 3: Spin arcs on the Propellers sheet

**Files:** Create `src/features/drone-model/spin-arc.ts`, `spin-arc.test.ts`, `SpinArcs.tsx`.
Modify `DroneModel.tsx`.

**Interfaces:**

- Consumes: `motorPlacements(spec)` (`position`, `spin`), `motorTopMm`, `PROP_HUB_HEIGHT_MM`.
- Produces: `spinArcPoints(spin: SpinDirection, radiusMm: number, sweepRad: number,
segments: number): [x: number, z: number][]` around the origin, in travel order, and
  `arrowHead(points): [left, tip, right]` at the last point. Angles are `atan2(z, x)`; `cw` (seen
  from above, +y) runs with increasing angle, `ccw` with decreasing.

- [ ] **Step 1: Failing tests.** For `cw` every consecutive pair has `x1·z2 − z1·x2 > 0`; for
      `ccw` < 0; all points lie at `radiusMm`; the arc spans `sweepRad`; the arrowhead's tip is the
      last point and its two wings point back along the arc. One test ties it to the model: on
      `motorPlacements(REFERENCE_5_INCH)` the two front motors' arcs move their front-most point
      towards the centre line (props in).
- [ ] **Step 2:** Run; fail. Implement `SpinArcs` with drei `Line` in `COLOR.ink`, one arc + head
      per prop just above the prop disc, rendered by `DroneModel` only when `selectedPart ===
'props'`; radius, sweep and arrowhead size by eye (spec leaves them to the builder).
- [ ] **Step 3:** Look at `/parts/props` at 1280 and 390 px with impeccable (arcs legible, not
      clashing with the redline props); `pnpm check`.
- [ ] **Step 4:** `feat(drone-model): show which way each propeller spins`

### Task 4: 3D hover lights the parts-list row

**Files:** Modify `DroneModel.tsx`, `DroneViewer.tsx`, `src/features/part-explorer/PartExplorer.tsx`,
`PartList.tsx`, `PartList.test.tsx`, `PartExplorer.test.tsx`, `src/styles/global.css`. Add to
`e2e/explorer.spec.ts`.

**Interfaces:**

- Produces: `DroneViewer`/`DroneModel` prop `onPartHover: (part: PartId | null) => void`, called
  with the part on a mouse `pointerover` (`event.pointerType === 'mouse'`) and `null` on its
  `pointerout` and on the canvas's `pointerleave`. `PartList` prop `hoveredPart: PartId | null`
  → that row gets `data-hovered="true"`, styled exactly like `.part-list-row:hover` (same rule).

- [ ] **Step 1: Failing tests.** `PartList`: with `hoveredPart="esc"` only the ESC row has
      `data-hovered="true"`; with `null` none does. `PartExplorer` (3D stub as in its other tests):
      a stub hover of `motors` marks the Motors row; a stub hover with `null` clears it; a stub
      hover of `motors` then a click on motors (sheet opens) leaves no row with `data-hovered`.
- [ ] **Step 2:** Run; fail. Implement; the explorer clears hover whenever the route changes.
- [ ] **Step 3:** e2e: at 1280 × 720 move the mouse to `POINTS.battery` → the Battery row has
      `data-hovered="true"`; move to the canvas corner → no row has it. In `e2e/touch.spec.ts`, a
      tap on a part leaves no row with `data-hovered`.
- [ ] **Step 4:** Look with impeccable; `pnpm check`.
- [ ] **Step 5:** `feat(part-explorer): light up a part's row when it is hovered in 3D`

### Task 5: Docs

**Files:** `docs/roadmap.md` (02b line rewritten to the agreed scope, `in review`, branch
`feat/model-that-teaches`), `DESIGN.md` (the four looks and their values, spin arcs, 3D hover
mirrored, camera fit; remove anything claiming dimension lines or callouts are coming),
`.impeccable/surfaces/…` brief, `.impeccable/design.json` via `/impeccable document` if it reports
stale, `docs/architecture/overview.md` (connected set flows content → explorer → viewer).

- [ ] **Step 1:** Update; `pnpm check`.
- [ ] **Step 2:** `docs: describe the 02b model looks, fit and spin arcs`

## Acceptance

- `pnpm check`, `pnpm test:e2e` and CI (including e2e against the Docker image) are green.
- Every Review Focus item has its test or recorded check.
- The independent review (Codex gpt-6.1-sol) is written to `docs/reviews/02b-model-that-teaches.md`,
  each finding resolved or deferred, before the PR is opened.
