# Section 01 — First slice: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking. Work on branch `feat/first-slice`; follow
> `CLAUDE.md` and `docs/workflow/`.

**Goal:** A beginner can open the app, see a 3D 5" quad, select the frame, the motors or the props
(by clicking the model or with the keyboard), and read a lesson answering the four questions
for that part.

**Architecture:** One typed spec of the reference drone drives both a procedural react-three-fiber
model (ADR 0002) and the lesson numbers. Pure layout functions turn the spec into part positions,
so they can be unit-tested. A `part-explorer` feature owns the selection state and composes the
3D viewer, an accessible part list and a lesson panel. Lessons are typed data in `src/content/`.

**Tech Stack:** React 19, TypeScript (strict), three.js via @react-three/fiber 9 and
@react-three/drei 10, Vitest + Testing Library, Playwright.

**Spec:** `docs/product/scope.md` (reference drone table; Module 2 sections 2.1 Frame, 2.2
Motors, 2.3 Propellers) and the section 01 summary in `docs/roadmap.md`.

**Not in this section:** other parts (ESC, FC, battery, ...), wire and link highlighting in 3D
(needs the ESC, so section 03), animation (spinning props), exploded views, routing/URLs per
lesson, visual design (section 02; keep CSS structural).

## Global Constraints

- Reference drone values, verbatim from the spec: wheelbase ~220–230 mm (use **225 mm**), stack
  mount **30.5 × 30.5 mm**, motors **2207**, **1950 KV** on **6S** (spec range ~1750–1950 KV),
  motor mount **16 × 16 mm**, **M5** shaft, **3 wires** per motor, props **5 × 4.3 × 3**.
- Part ids are exactly `'frame' | 'motors' | 'props'`. Selecting `motors` or `props` selects all
  four of them.
- Motor numbering and spin directions follow Betaflight's default Quad X, **props in**:
  M1 rear-right CW, M2 front-right CCW, M3 rear-left CCW, M4 front-left CW.
- Scene units are metres; convert from the spec's millimetres with one helper. Y is up, the
  drone's front points to −Z, its right side to +X.
- Lesson text is plain language for complete beginners: explain every term the first time it
  appears. No product recommendations, tuning or flying technique (scope "Out of scope").
- Everything the 3D view offers must also work without it: keyboard and screen reader through
  the part list and lesson panel, and when WebGL fails.
- three.js stays in the lazily loaded viewer chunk: outside `drone-viewer` and `drone-model`,
  `three` and `@react-three/*` may only be imported with `import type`.
- Every commit passes `pnpm check`; Conventional Commits per `docs/workflow/git.md`.

## Review Focus

1. **Orbit drag ending over a part** must not select it: rotating the camera is the most common
   gesture. Pinned by `isDeliberateClick` tests (Task 5).
2. **WebGL unavailable:** the part list and lessons still work with the viewer's error fallback
   in place. Pinned in `PartExplorer.test.tsx` (Task 5).
3. **Pressing the selected part's button again** deselects it and closes the lesson; clicking the
   empty 3D background also clears. Pinned in `PartList.test.tsx` and the e2e test (Tasks 4–5).
4. **Phone-width screens (390 px):** after selecting a part, the lesson is visible without
   horizontal scrolling and the canvas keeps a usable height. Pinned in `e2e/explorer.spec.ts`.
5. **Escape** closes the lesson from anywhere in the explorer and leaves focus on the part
   button, so keyboard users aren't stranded. Pinned in `PartExplorer.test.tsx` (Task 5).

---

## File structure

```
src/shared/domain/
  parts.ts                            PartId, PART_IDS, PART_LABELS (used by every feature)
  drone-spec.ts                       DroneSpec, REFERENCE_5_INCH, mm(), size codes (no three.js)
  drone-spec.test.ts
src/features/drone-model/
  layout.ts                           motorPlacements(): pure positions and spin directions
  layout.test.ts
  materials.ts                        partColor(): base vs highlighted colours
  parts/Frame.tsx                     arms, bottom/top plates, standoffs
  parts/Motor.tsx                     base, bell, shaft
  parts/Propeller.tsx                 hub + 3 blades, twist mirrored by spin direction
  DroneModel.tsx                      composes parts from a spec; selection/hover events
  index.ts                            public API: DroneModel, REFERENCE_5_INCH, types
src/features/drone-viewer/DroneViewer.tsx   Canvas, camera, controls; renders DroneModel
src/content/lessons/
  types.ts                            Lesson, LessonSpecRow, LessonConnection
  frame.ts · motors.ts · props.ts     one Lesson each
  index.ts                            LESSONS: Record<PartId, Lesson>
  lessons.test.ts
src/features/part-explorer/
  PartList.tsx (+ test)               toggle buttons, one per part
  LessonPanel.tsx (+ test)            renders one Lesson as the four questions
  clicks.ts (+ test)                  isDeliberateClick()
  PartExplorer.tsx (+ test)           selection state; composes viewer, list, panel
  index.ts
e2e/explorer.spec.ts
```

---

### Task 1: Part ids, drone spec and motor layout

**Files:**

- Create: `src/shared/domain/parts.ts`, `src/shared/domain/drone-spec.ts`,
  `src/features/drone-model/layout.ts`
- Test: `src/shared/domain/drone-spec.test.ts`, `src/features/drone-model/layout.test.ts`

**Interfaces:**

- Produces:
  - `parts.ts`: `export const PART_IDS = ['frame', 'motors', 'props'] as const;`
    `export type PartId = (typeof PART_IDS)[number];`
    `export const PART_LABELS: Record<PartId, string>` = `Frame`, `Motors`, `Propellers`.
  - `drone-spec.ts` (shared because lessons need the numbers without loading three.js):
    ```ts
    export interface DroneSpec {
      name: string; // 'Reference 5" freestyle quad'
      frame: {
        wheelbaseMm: number; // 225
        stackMountMm: number; // 30.5
        armWidthMm: number; // 13
        armThicknessMm: number; // 5
        bodyLengthMm: number; // 90
        bodyWidthMm: number; // 40
        topPlateThicknessMm: number; // 2
        standoffHeightMm: number; // 25
      };
      motor: {
        statorWidthMm: number; // 22
        statorHeightMm: number; // 7
        kv: number; // 1950
        batteryCells: number; // 6
        mountPatternMm: number; // 16
        shaftThread: string; // 'M5'
        bellDiameterMm: number; // 27.5
        bellHeightMm: number; // 13
        wires: number; // 3
      };
      prop: { diameterIn: number; pitchIn: number; blades: number }; // 5, 4.3, 3
    }
    export const REFERENCE_5_INCH: DroneSpec;
    export function mm(value: number): number; // millimetres → metres
    export const INCH_MM = 25.4;
    export function propSizeCode(spec: DroneSpec): string; // '5 × 4.3 × 3'
    export function motorSizeCode(spec: DroneSpec): string; // '2207'
    ```
  - `layout.ts`:
    ```ts
    export type SpinDirection = 'cw' | 'ccw'; // as seen from above
    export interface MotorPlacement {
      number: 1 | 2 | 3 | 4; // Betaflight motor number
      corner: 'rear-right' | 'front-right' | 'rear-left' | 'front-left';
      position: [x: number, y: number, z: number]; // metres; y = top of the arm
      spin: SpinDirection;
    }
    export function motorPlacements(spec: DroneSpec): MotorPlacement[]; // ordered M1..M4
    ```

- [ ] **Step 1: Write the failing tests** in `layout.test.ts` and `drone-spec.test.ts`:
  - `motorPlacements(REFERENCE_5_INCH)` returns numbers `[1, 2, 3, 4]` with corners
    `rear-right, front-right, rear-left, front-left` and spins `cw, ccw, ccw, cw`.
  - Diagonal motor-to-motor distance (M2 ↔ M3 and M1 ↔ M4, in the XZ plane) equals
    `mm(225)` (`toBeCloseTo(…, 6)`).
  - Front motors have `z < 0`, right motors have `x > 0`; all four share the same `y`
    (`mm(armThicknessMm)`).
  - Diagonal pairs spin the same way and adjacent motors spin opposite ways.
  - `propSizeCode(REFERENCE_5_INCH) === '5 × 4.3 × 3'`, `motorSizeCode(...) === '2207'`.
  - `mm(1000) === 1`.
- [ ] **Step 2: Run** `pnpm test src/features/drone-model src/shared` — expected FAIL (modules
      missing).
- [ ] **Step 3: Implement** `parts.ts`, `drone-spec.ts` and `layout.ts`. Each motor sits at
      `wheelbase / 2` from the centre along the 45° diagonals, so `|x| = |z| = mm(wheelbase) / (2·√2)`.
      Size codes are built from the spec (motor: two-digit width + two-digit height).
- [ ] **Step 4: Run** `pnpm test src/features/drone-model src/shared` — expected PASS; then
      `pnpm check`.
- [ ] **Step 5: Commit** `feat(drone-model): add reference drone spec and motor layout`.

---

### Task 2: Lesson content for frame, motors and props

**Files:**

- Create: `src/content/lessons/types.ts`, `frame.ts`, `motors.ts`, `props.ts`, `index.ts`
- Test: `src/content/lessons/lessons.test.ts`

**Interfaces:**

- Consumes: `PartId`, `PART_IDS`, `REFERENCE_5_INCH`, `motorSizeCode`, `propSizeCode` from
  `@/shared/domain/*` (Task 1). Content never imports from `features/`.
- Produces:

  ```ts
  export interface LessonSpecRow {
    label: string;
    value: string;
    meaning: string;
  }
  export interface LessonConnection {
    text: string;
    partId?: PartId;
  } // partId: links to that lesson
  export interface Lesson {
    partId: PartId;
    title: string; // e.g. 'Frame'
    whatItDoes: string; // one plain-language sentence
    howItWorks: string[]; // short paragraphs
    specs: LessonSpecRow[]; // 'What do the numbers mean?'
    connections: LessonConnection[];
  }
  export const LESSONS: Record<PartId, Lesson>;
  ```

- [ ] **Step 1: Write the failing tests** in `lessons.test.ts`:
  - Every id in `PART_IDS` has a lesson whose `partId` matches its key.
  - Every lesson has a non-empty `title`, `whatItDoes` (one sentence: ends with `.` and has no
    other `. `), at least one `howItWorks` paragraph, at least two `specs` rows with non-empty
    fields, and at least one connection.
  - Every `connection.partId`, when present, is in `PART_IDS` and is not the lesson's own id.
  - Spec values come from the spec object, not retyped: the motors lesson has a row whose
    `value` contains `motorSizeCode(REFERENCE_5_INCH)` and one containing `'1950'`; the props
    lesson has a row containing `propSizeCode(REFERENCE_5_INCH)`; the frame lesson has rows
    containing `'225'` and `'30.5 × 30.5'`.
- [ ] **Step 2: Run** `pnpm test src/content` — expected FAIL.
- [ ] **Step 3: Write the three lessons** from scope sections 2.1–2.3, covering every bullet of
      each section. Build spec `value` strings from `REFERENCE_5_INCH` and the size-code helpers.
      Connections: frame → motors (screwed to the arms, 16 × 16 mm), frame → stack, camera,
      battery (text only, no `partId` yet); motors → frame, props (on the M5 shaft), ESC via 3 wires
      (text only); props → motors. Mention props-in/out and that the direction must match the flight
      controller setting.
- [ ] **Step 4: Run** `pnpm test src/content` — expected PASS; then `pnpm check`.
- [ ] **Step 5: Commit** `feat(content): add frame, motor and propeller lessons`.

---

### Task 3: Procedural drone model in the viewer

**Files:**

- Create: `src/features/drone-model/materials.ts`, `parts/Frame.tsx`, `parts/Motor.tsx`,
  `parts/Propeller.tsx`, `DroneModel.tsx`, `index.ts`
- Modify: `src/features/drone-viewer/DroneViewer.tsx` (replace the placeholder box)
- Test: `src/features/drone-model/materials.test.ts`; visual check below; existing
  `e2e/smoke.spec.ts` must stay green

**Interfaces:**

- Consumes: `DroneSpec`, `mm`, `INCH_MM`, `PartId` (`@/shared/domain`, Task 1);
  `motorPlacements` (Task 1).
- Produces:

  ```ts
  // materials.ts
  export const PART_COLORS: Record<PartId, string>; // frame '#2b2b2b', motors '#8a8f98', props '#3a7bd5'
  export const HIGHLIGHT_EMISSIVE = '#ff8a00';
  export function partEmissive(highlighted: boolean): {
    emissive: string;
    emissiveIntensity: number;
  };
  //   highlighted → { HIGHLIGHT_EMISSIVE, 0.6 }; otherwise → { '#000000', 0 }

  // index.ts exports DroneModel and its props type only.

  // DroneModel.tsx
  export interface DroneModelProps {
    spec: DroneSpec;
    selectedPart: PartId | null;
    onPartClick?: (part: PartId, event: ThreeEvent<MouseEvent>) => void;
  }
  export function DroneModel(props: DroneModelProps): JSX.Element;

  // DroneViewer.tsx (default export, still lazy-loaded via drone-viewer/index.ts)
  export interface DroneViewerProps {
    selectedPart: PartId | null;
    onPartClick: (part: PartId, event: ThreeEvent<MouseEvent>) => void;
    onBackgroundClick: () => void; // Canvas onPointerMissed
  }
  ```

  `drone-viewer/index.ts` keeps exporting the lazy `DroneViewer`, now typed with these props.

- [ ] **Step 1: Write the failing test** `materials.test.ts`: `partEmissive(true)` returns the
      highlight colour with intensity `0.6`; `partEmissive(false)` returns intensity `0`;
      `PART_COLORS` has an entry for every `PART_IDS` value.
- [ ] **Step 2: Run** `pnpm test src/features/drone-model/materials` — expected FAIL.
- [ ] **Step 3: Implement `materials.ts`**, then the parts, all sized from the spec:
  - **Frame:** four arms (boxes `armWidthMm × armThicknessMm`, from the centre to each motor
    placement, rotated ±45°), a bottom body plate (`bodyWidthMm × bodyLengthMm`), a top plate
    (`topPlateThicknessMm`) raised by `standoffHeightMm`, and four standoffs (radius 2.5 mm) at
    the corners of the `stackMountMm` square scaled up to the body plate's inner corners.
  - **Motor** (at each placement): base disc and bell (cylinders of `bellDiameterMm`, bell
    height `bellHeightMm`), shaft (cylinder radius 2.5 mm, 10 mm tall) on top.
  - **Propeller** (on top of each motor): hub (radius 7 mm, 8 mm tall) and `blades` blades
    (boxes reaching `diameterIn × INCH_MM / 2` from the centre, 12 mm wide, 1.5 mm thick), evenly
    spaced; blade twist of 12° whose sign is mirrored for `ccw`.
  - **DroneModel:** wraps each part kind in a `<group>` whose `onClick` calls
    `onPartClick(partId, event)` after `event.stopPropagation()`, and uses drei `useCursor` for a
    pointer cursor on hover. Highlighted = `selectedPart === partId`.
  - **DroneViewer:** camera at `[0.22, 0.18, 0.28]` with fov 40, `OrbitControls` target at the
    origin, `minDistance` 0.15, `maxDistance` 0.8, pan disabled; `onPointerMissed` →
    `onBackgroundClick`. Wrapper is a `<div className="drone-viewer">` with **no** `role="img"`;
    the `<canvas>` gets `aria-hidden="true"` because the part list is the accessible equivalent
    (resolves review 00, finding 17).
  - Update `App.tsx` temporarily to pass `selectedPart={null}` and no-op handlers (Task 5 replaces
    it).
- [ ] **Step 4: Run** `pnpm test` and `pnpm test:e2e` — expected PASS.
- [ ] **Step 5: Visual check:** `pnpm dev`, open the app with Playwright (or the browser), take a
      screenshot, and confirm: an X-shaped quad, four motors at the arm tips, four three-bladed
      props on the motors, front pointing away-left from the default camera, nothing clipping.
- [ ] **Step 6: Commit** `feat(drone-model): build procedural frame, motors and propellers`.

---

### Task 4: Part list and lesson panel

**Files:**

- Create: `src/features/part-explorer/PartList.tsx`, `LessonPanel.tsx`
- Test: `PartList.test.tsx`, `LessonPanel.test.tsx` (same folder)

**Interfaces:**

- Consumes: `PART_IDS`, `PART_LABELS`, `PartId` (Task 1); `Lesson`, `LESSONS` (Task 2).
- Produces:

  ```ts
  export interface PartListProps {
    selectedPart: PartId | null;
    onToggle: (part: PartId) => void; // parent decides select vs deselect
  }
  export function PartList(props: PartListProps): JSX.Element;
  // <nav aria-label="Drone parts"><ul> of <button aria-pressed aria-controls="lesson-panel">

  export interface LessonPanelProps {
    lesson: Lesson;
    onClose: () => void;
    onSelectPart: (part: PartId) => void; // connection links
  }
  export function LessonPanel(props: LessonPanelProps): JSX.Element;
  // <section id="lesson-panel" aria-labelledby=…> with h2 = lesson.title and four h3s:
  // 'What does it do?', 'How does it work?', 'What do the numbers mean?', 'What is it connected to?'
  ```

- [ ] **Step 1: Write the failing tests:**
  - `PartList`: renders one button per part with names `Frame`, `Motors`, `Propellers`;
    `aria-pressed="true"` only on the selected one; clicking a button calls
    `onToggle('motors')`; pressing Enter and Space on a focused button calls `onToggle` too
    (`userEvent`).
  - `LessonPanel` with `LESSONS.motors`: heading level 2 `Motors`; the four level-3 headings in
    order; spec rows rendered as a table (`role="table"`) with the `2207` value present; a
    connection with `partId: 'props'` renders as a button that calls `onSelectPart('props')`;
    a text-only connection renders as plain text; the `Close lesson` button calls `onClose`.
- [ ] **Step 2: Run** `pnpm test src/features/part-explorer` — expected FAIL.
- [ ] **Step 3: Implement** both components. Spec rows: a `<table>` with columns Spec, Value,
      What it means. No inline styles beyond structure; class names only.
- [ ] **Step 4: Run** `pnpm test src/features/part-explorer` — expected PASS; `pnpm check`.
- [ ] **Step 5: Commit** `feat(part-explorer): add part list and lesson panel`.

---

### Task 5: Explorer wiring, click handling and end-to-end tests

**Files:**

- Create: `src/features/part-explorer/clicks.ts`, `PartExplorer.tsx`, `index.ts`,
  `e2e/explorer.spec.ts`
- Modify: `src/app/App.tsx`, `src/app/App.test.tsx`, `src/styles/global.css`,
  `docs/architecture/overview.md`
- Test: `clicks.test.ts`, `PartExplorer.test.tsx`, `e2e/explorer.spec.ts`

**Interfaces:**

- Consumes: everything from Tasks 1–4; lazy `DroneViewer` from `@/features/drone-viewer`;
  `ErrorBoundary` from `@/shared/ui/ErrorBoundary`.
- Produces:

  ```ts
  // clicks.ts — R3F reports how far the pointer moved between down and up as event.delta (px)
  export const MAX_CLICK_MOVEMENT_PX = 4;
  export function isDeliberateClick(delta: number): boolean; // delta <= MAX_CLICK_MOVEMENT_PX

  // PartExplorer.tsx
  export function PartExplorer(): JSX.Element;
  ```

  Selection rules: list toggle selects, or deselects if already selected; a deliberate 3D click
  selects (never deselects); background click clears; connection link selects; close button
  and Escape clear. Escape is handled by `onKeyDown` on the explorer root.

- [ ] **Step 1: Write the failing tests:**
  - `clicks.test.ts`: `isDeliberateClick(0)` and `(4)` are true; `(5)` and `(40)` are false.
  - `PartExplorer.test.tsx` (mock `@/features/drone-viewer/DroneViewer` with a stub exposing
    buttons `stub: click motors (delta 0)`, `stub: drag ending on motors (delta 30)` and
    `stub: background`, which call the props it receives):
    - no lesson is shown initially, and the page invites the user to pick a part;
    - clicking `Motors` in the list shows the `Motors` lesson; clicking it again hides it;
    - stub click (delta 0) selects motors; stub drag (delta 30) leaves the selection unchanged;
    - stub background clears the selection;
    - clicking the `Propellers` connection link in the motors lesson switches to the props lesson;
    - with focus on the `Frame` button and the frame lesson open, pressing Escape closes the lesson
      and focus stays on the `Frame` button;
    - when the stub viewer throws, the error fallback is shown **and** selecting `Frame` in the
      list still shows the frame lesson.
  - `e2e/explorer.spec.ts`:
    - keyboard: Tab to `Frame`, press Enter → heading `Frame` (level 2) visible; Escape → hidden;
    - mouse in 3D: click the centre of the canvas (the frame body is there with the default
      camera) → `Frame` lesson visible; then click the canvas's top-left corner (background) →
      lesson hidden;
    - at viewport 390 × 844: select `Motors` → its lesson heading is in the viewport after
      scrolling into view, `document.documentElement.scrollWidth <= 390`, and the canvas's
      bounding box height is at least 250 px.
- [ ] **Step 2: Run** `pnpm test` — expected FAIL for the new tests.
- [ ] **Step 3: Implement** `clicks.ts`, `PartExplorer.tsx` (owns `selectedPart` state; viewer
      inside `ErrorBoundary` + `Suspense` as in today's `App.tsx`; list and panel outside it) and
      `index.ts`. `App.tsx` renders the header and `<PartExplorer />`; move the viewer-failure test
      from `App.test.tsx` into `PartExplorer.test.tsx`. CSS: two columns (viewer | list + lesson)
      above 900 px, stacked below with the canvas at `min-height: 50vh`; structural only.
- [ ] **Step 4: Run** `pnpm check` and `pnpm test:e2e` — expected PASS. Also run the e2e suite
      against the Docker image (`docs/workflow/testing.md`) to confirm no CSP violations.
- [ ] **Step 5: Update** `docs/architecture/overview.md`: add `drone-model`, `part-explorer`,
      `src/content/` and `src/shared/domain/` to the layout (removing them from "planned"), and
      add the rule that `src/content/` and `src/shared/` never import from `src/features/`.
- [ ] **Step 6: Commit** `feat(part-explorer): select parts in 3d or by keyboard and show lessons`.

---

## Acceptance

Beyond the [definition of done](../workflow/definition-of-done.md):

- With the mouse: clicking a frame arm, a motor or a prop highlights that part (all four motors or
  props together) and opens its lesson; dragging to orbit never changes the selection.
- With the keyboard only: every part's lesson can be opened, its connection links followed and
  closed again.
- With WebGL disabled: the fallback message shows and all three lessons are still readable.
- Lesson numbers match `docs/product/scope.md`'s reference drone table and sections 2.1–2.3.
