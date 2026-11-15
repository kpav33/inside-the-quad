# Section 05b — How a quad moves: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or
> superpowers:subagent-driven-development) to implement this plan task-by-task, and the
> `impeccable:impeccable` skill for every UI edit (read its `reference/craft-floor.md` immediately
> before editing UI). Steps use checkbox (`- [ ]`) syntax. Branch: `feat/moves`.

**Goal:** A fourth sheet in "How it works together", **How a quad moves**: five guided steps
(Throttle, Roll, Pitch, Yaw, Gyro loop), two virtual sticks, per-motor speeds, and the 3D drone
turning in place like an acro quad.

**Architecture:** `moves` joins the numbered sheets and the routing hook (`/moves`, `/moves/n`). A
new feature `features/flight/` holds everything without three.js: the mixer, the flight model (a
rate controller on a rotating body), a small mutable store the sticks write and the canvas reads,
the demo scripts and the `Sticks` component. `drone-viewer` gains a `flight` prop: a rig inside the
canvas advances the model each frame, rotates the drone, draws speed arcs and projects motor
readouts, asking for frames only while something moves. The explorer gains a `MovesPanel`.

**Tech Stack:** React 19, TypeScript strict, react-three-fiber + drei (`Line`), Vitest + Testing
Library (fake timers), Playwright.

**Spec:** [05b-moves-design.md](05b-moves-design.md). Its physics table and Decisions 1–12 are
binding.

## Global Constraints

- Node 22: prefix node/pnpm commands with `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
- Addresses `/moves` (step 1) and `/moves/n`; sheet 4 of 4 in "How it works together", after
  Video. Masthead "How it works together" is current on it.
- Motor layout (from `motorPlacements`): 1 rear-right CW, 2 front-right CCW, 3 rear-left CCW,
  4 front-left CW; front is −z, right is +x, up is +y.
- Mixer signs (spec table): roll right → 3, 4 up, 1, 2 down; pitch forward (stick up) → 1, 3 up,
  2, 4 down; yaw right → 2, 3 up, 1, 4 down; throttle → all four.
- Acro: stick sets rotation rate, capped at **90°/s**; centred sticks hold the current angle.
- Tokens only, no new colours; redline only for selection, current sheet, current step, focus.
- Text in `src/content/` (`src/content/moves.ts`, interface words in `ui.ts`); claims agree with
  the motor, props, FC and intro lessons.
- `features/flight` never imports three.js (it is in the first-load bundle); three.js stays in
  lazy `drone-viewer`/`drone-model`.
- 02d holds: no sideways scroll at 320 px with 200 % text; focus visible; reduced motion live.
- Canvas stays `frameloop="demand"`: frames only while the flight is unsettled or a demo runs.
- Each task ends with `pnpm check` passing and a Conventional Commit (header ≤ 72 chars, body
  lines ≤ 100).

## Review Focus

1. **A drag that ends badly** (pointer leaves the window, `pointercancel` from a touch scroll):
   the stick springs back, never stays deflected. Pinned in Task 4's tests.
2. **A key held when focus leaves** (Tab away, window blur, no `keyup`): the stick springs back.
   Pinned in Task 4's tests.
3. **A long frame** (hidden tab, slow phone; `dt` of 5 s): the model stays finite and stable.
   Pinned in Task 2's tests.
4. **Leaving the sheet mid-demo or mid-rotation**, then Back: no timer fires on a disposed store,
   no console errors, the sheet comes back level with throttle at hover. Pinned in Task 3's
   tests and Task 7's e2e.
5. **Thousands of steps of rotation** (a long held roll): the attitude stays a unit quaternion and
   readouts stay in range. Pinned in Task 2's tests.

---

### Task 1: The moves sheet in the set and the address

**Files:**

- Modify: `src/shared/domain/sheets.ts`, `src/shared/domain/sheets.test.ts` (or create)
- Create: `src/shared/domain/moves.ts`
- Modify: `src/shared/routing/routes.ts`, `routes.test.ts`, `usePartRoute.ts`,
  `usePartRoute.test.tsx`
- Modify: `src/features/progress/progress.ts` (+ test), `src/content/ui.ts` (+ test),
  `src/app/App.tsx` (+ test), `src/features/part-explorer/OverviewStart.tsx`,
  `src/features/part-explorer/SheetFooter.tsx`, `e2e/navigation.spec.ts`

**Interfaces:**

- Produces: in `shared/domain/moves.ts`: `MOVES_SHEET = 'moves' as const`,
  `type MovesSheet = typeof MOVES_SHEET`, `MOVE_STEP_IDS = ['throttle', 'roll', 'pitch', 'yaw',
'gyro'] as const`, `type MoveStepId`. In `sheets.ts`: `SheetId` and `NumberedSheet` include
  `MovesSheet`; `CHAPTER_SHEETS.paths = [...PATH_IDS, MOVES_SHEET]` (the chapter key stays
  `'paths'`); `type SteppedSheet = PathId | MovesSheet`; `isSteppedSheet(v): v is SteppedSheet`.
  In `routes.ts`: `Route` gains `{ kind: 'moves'; step: number }`; `steppedPath(sheet:
SteppedSheet, step = 1): string` (replaces `pathSheetPath`; keep `pathSheetPath` as an alias
  only if callers outside routing need it); `pagePath('moves', step)`. `usePartRoute`:
  `PageRoute` gains the moves kind; `replaceStep(sheet: SteppedSheet, step: number)`.
  `UI.moves.title = 'How a quad moves'`; `sheetName('moves')` returns it.

- [ ] **Step 1: Write failing tests.** `routes.test.ts`: `parseRoute('/moves')` →
      `{kind:'moves', step:1}`; `'/moves/3'` → step 3; `'/moves/0'` → step 1; `'/moves/x'` and
      `'/moves/2/3'` → unknown; `steppedPath('moves', 1) === '/moves'`, `steppedPath('moves', 4)
=== '/moves/4'`. `sheets.test.ts`: `sheetNeighbours('video').next === 'moves'`,
      `sheetNeighbours('moves').next === null`, `sheetNumber('moves') === 4`,
      `chapterCount('control') === 4`, `chapterOf('moves') === 'paths'`. `progress.test.ts`:
      `parseReadSheets('["moves","fc"]')` keeps both. `App.test.tsx`: at `/moves` the masthead's
      "How it works together" link has `aria-current`. `ui.test.ts`: `sheetName('moves') === 'How
a quad moves'`.
- [ ] **Step 2: Run them:** `pnpm test -- routes sheets progress App ui` → FAIL on the new cases.
- [ ] **Step 3: Implement.** Moves parsing reuses the path step rule (whole number, clamped 1..999).
      `usePartRoute` canonicalises moves addresses like path ones. Progress accepts `'moves'`.
      Overview count text becomes `` `Parts ${parts} of ${partTotal} · How it works ${n} of
${total}` `` (rename the `count` parameters accordingly) and `allRead` becomes `'Every sheet
read. Open any sheet to look something up.'`. `SheetFooter`/`SheetRef` already key on
      `chapterOf`; check the moves sheet gets "How it works together, sheet 4: How a quad moves"
      when named from the parts chapter. Until Task 6 the explorer shows the overview for
      `/moves`; that is fine between commits.
- [ ] **Step 4: Update `e2e/navigation.spec.ts`** progress text expectations ("Parts 1 of 11 · How
      it works 0 of 4").
- [ ] **Step 5: Run** `pnpm check` → PASS.
- [ ] **Step 6: Commit** `feat(routing): add the moves sheet to the drawing set`. Also mark 05a
      `done` and 05b `in progress` (`feat/moves`) in `docs/roadmap.md` in this commit.

### Task 2: Mixer and flight model

**Files:**

- Create: `src/features/flight/{mixer,model,index}.ts`, `mixer.test.ts`, `model.test.ts`

**Interfaces:**

- Produces (all exported from `features/flight/index.ts`):
  - `interface StickInput { throttle: number /* 0..1 */; yaw: number; pitch: number; roll: number
/* −1..1; + = right / forward (stick up) / right */ }`; `CENTRED: StickInput` (throttle
    `HOVER_THROTTLE = 0.5`, others 0).
  - `type MotorSpeeds = readonly [m1: number, m2: number, m3: number, m4: number]` (0..1).
  - `IDLE = 0.1`; `mixMotors(throttle: number, effort: Axes): MotorSpeeds`, clamped to IDLE..1.
  - `interface Axes { roll: number; pitch: number; yaw: number }`.
  - `MAX_RATE_DPS = 90`.
  - `interface FlightState { attitude: [x, y, z, w]; rate: Axes /* rad/s, body */; held: Axes /*
I-term */; height: number /* m, scene */; motors: MotorSpeeds; wanted: Axes }`.
  - `initialFlight(): FlightState` (level, at rest, hover); `stepFlight(state, sticks, dtS):
FlightState` (pure); `gust(state, n: number): FlightState` (n alternates the knock's sign);
    `level(state): FlightState`; `isSettled(state, sticks): boolean`;
    `rotatePoint(attitude, p: [x,y,z]): [x,y,z]` (for tests and pins).

- [ ] **Step 1: Write failing tests.** `mixer.test.ts`: one test per spec table row asserting which
      motors rise and fall (by index 0..3 = motors 1..4) for `effort` +0.2 on that axis at
      throttle 0.5; zero effort gives four equal speeds; throttle 0 with any effort stays ≥
      IDLE; throttle 1 stays ≤ 1. `model.test.ts`:
  - `rolls right while the stick is held`: roll 1 for 1 s (dt 1/60) → `rotatePoint(att, [1,0,0])`
    has y < 0; roll angle between 60° and 95°.
  - `pitches forward`: pitch 1 for 0.5 s → nose `[0,0,-1]` has y < 0.
  - `yaws right, clockwise from above`: yaw 1 for 0.5 s → nose has x > 0.
  - `throttle up raises the drone a little`: throttle 1 for 2 s → 0 < height ≤ 0.05.
  - `centred stick holds the angle`: roll 1 for 0.5 s, then CENTRED 3 s → |rate| < 0.5°/s and
    the angle changes < 2° over the last 2 s.
  - `a held stick keeps the motors apart`: roll 1 held 2 s → motors 3,4 exceed 1,2 by ≥ 0.03.
  - `gust returns to the held angle`: from a 30° roll held, `gust` then CENTRED 3 s → within 2°
    of 30°.
  - `level resets attitude and rate`; `settles`: `isSettled` false right after a gust, true 4 s
    later.
  - `long frame`: `stepFlight(state, roll 1, 5)` → all values finite, rate ≤ 90°/s + 10 %.
  - `stays a unit quaternion`: 20 000 steps of roll+yaw → |q| within 1e-6 of 1; motors in range.
- [ ] **Step 2: Run** `pnpm test -- flight` → FAIL (module missing).
- [ ] **Step 3: Implement.** Body axes: roll about −z (right side down is positive), pitch about
      +x (nose down positive), yaw about +y (clockwise from above positive). Per axis:
      `wanted = stick·MAX_RATE`; `error = wanted − rate`; I-term `held += error·dt` **only while
      that axis' stick is centred** (I-term relax), clamped; `effort = KP·error + KI·held`;
      `rate += (effort·AUTHORITY − DRAG·rate)·dt`. Integrate in fixed substeps of 1/240 s, at
      most 0.1 s per call (longer `dt` is cut). Attitude: multiply by the body-rate rotation each
      substep, normalise. Motors: `mixMotors(throttleBase, effort scaled to ±0.25)`. Height eases
      toward `(throttle − HOVER)·0.06` m. Gust: adds ±(120°/s roll, 60°/s pitch) to `rate`.
      Tune KP/KI/DRAG/AUTHORITY until the tests pass with little overshoot (< 10 %).
- [ ] **Step 4: Run** `pnpm test -- flight` → PASS; then `pnpm check` → PASS.
- [ ] **Step 5: Commit** `feat(flight): add the motor mixer and acro flight model`.

### Task 3: Flight store and demos

**Files:**

- Create: `src/features/flight/{store,demos,useFlightReadout}.ts` + tests; export from `index.ts`

**Interfaces:**

- Consumes: Task 2.
- Produces:
  - `interface Flight { readonly state: FlightState; readonly sticks: StickInput; setSticks(p:
Partial<StickInput>, by: 'user' | 'demo'): void; gust(): void; level(): void; advance(dtS:
number): void /* called by the canvas rig */; settled(): boolean; onWake(fn: () => void): () =>
void /* rig registers invalidate */; subscribe(fn: () => void): () => void /* after each
advance */; onUserInput(fn: () => void): () => void; dispose(): void }`.
  - `createFlight(): Flight` — starts `initialFlight()` and `CENTRED`.
  - `DEMOS: Record<MoveStepId, readonly DemoKey[]>`, `interface DemoKey { atMs: number; sticks?:
Partial<StickInput>; gust?: true }`; `runDemo(flight, step, schedule = setTimeout):
() => void` (returns cancel; any `'user'` input cancels it).
  - `useFlightReadout(flight: Flight | null, everyMs = 100): { wanted: Axes; measured: Axes } |
null` (°/s, rounded).

- [ ] **Step 1: Write failing tests** (Vitest fake timers): `setSticks` and `gust` call the wake
      listeners; `advance` notifies subscribers; `runDemo('roll')` sets roll right then centre
      by its last key; a `'user'` `setSticks` during a demo cancels the rest; `dispose` cancels
      a running demo and no later timer touches the store; `runDemo('gyro')` gusts;
      `useFlightReadout` updates at most every 100 ms and returns null for a null flight.
- [ ] **Step 2: Run** `pnpm test -- flight` → FAIL.
- [ ] **Step 3: Implement.** Demo scripts (≈2–3 s each): throttle up to 0.8 then back to hover;
      roll right 1 s, centre; pitch forward 1 s, centre; yaw right 1.5 s, centre; gyro: one gust.
      Store holds state in a closure; `advance` = `stepFlight` with the current sticks.
- [ ] **Step 4: Run** `pnpm check` → PASS.
- [ ] **Step 5: Commit** `feat(flight): add the flight store and step demos`.

### Task 4: The sticks

**Files:**

- Create: `src/features/flight/Sticks.tsx`, `Sticks.test.tsx`; export from `index.ts`
- Modify: `src/content/ui.ts` (`UI.moves.sticks…`), `src/styles/global.css`

**Interfaces:**

- Consumes: `Flight`, `StickInput` (Task 3).
- Produces: `Sticks({ flight }: { flight: Flight })` — two pads, `.stick-pad[data-side="left" |
"right"]`, for the drawing field's lower corners.

- [ ] **Step 1: Write failing tests.** Four native `<input type="range">` named "Throttle", "Yaw",
      "Pitch", "Roll" (`getByRole('slider', { name })`), each with `aria-valuetext` like `"Roll
40 % right"`, `"Throttle 50 %"`; ArrowRight on Roll raises roll (`flight.sticks.roll > 0`);
      `keyUp` returns roll to 0; `blur` with a deflected Yaw returns it to 0; Throttle keeps its
      value after `keyUp` and `blur`; a pointer drag on the right pad to its right edge sets roll
      ≈ 1, `pointerup` springs back, `pointercancel` springs back, `lostpointercapture` springs
      back; every user change is reported as `'user'`.
- [ ] **Step 2: Run** `pnpm test -- Sticks` → FAIL.
- [ ] **Step 3: Implement.** Ranges: −100..100 step 10 (throttle 0..100 step 5); inputs are
      visually hidden and the pad shows focus with `:has(:focus-visible)` and marks the focused
      axis. Pointer: `setPointerCapture` on the pad, position → −1..1 from the pad's rect; the
      thumb follows `flight.sticks` (subscribe, or read on change). Look: drawing-sheet style
      (hairline square, crosshair, ink thumb, labels in caps), tokens only. Size ≈ 88 px, 72 px
      under 30em.
- [ ] **Step 4: Run** `pnpm check` → PASS.
- [ ] **Step 5: Commit** `feat(flight): add the virtual sticks`.

### Task 5: The drone flies in the viewer

**Files:**

- Create: `src/features/drone-viewer/FlightRig.tsx`, `MotorPins.tsx`, `motor-pins.ts` (+ test)
- Create: `src/features/drone-model/MotorArcs.tsx`, `src/features/drone-model/motor-arc.ts`
  (+ test); export from `drone-model/index.ts`
- Modify: `src/features/drone-viewer/DroneViewer.tsx`, `FitCamera.tsx`/`fit.ts` (+ test),
  `src/styles/global.css`

**Interfaces:**

- Consumes: `Flight` (Task 3), `Sticks` (Task 4), `motorPlacements`, `spinArcPoints`.
- Produces: `DroneViewerProps.flight: Flight | null`. When set: the drone (with `MotorArcs`) sits
  in a group rotated by `flight.state.attitude` about the drone's fit centre and raised by
  `state.height`; `Sticks` and `MotorPins` render over the canvas; the camera uses
  `sphereFitDistance`. `arcSweep(speed: number): number` (rad; IDLE → 30°, 1 → 200°).
  `motorPinState(speeds: MotorSpeeds, i: number): 'up' | 'down' | 'even'` (±0.03 of the mean).
  `sphereFitDistance(radius: number, fovDeg: number, aspect: number, fill = 0.8): number`.

- [ ] **Step 1: Write failing tests:** `arcSweep` endpoints and monotonic; `motorPinState` for
      a roll-right mix gives motors 3, 4 `'up'` and 1, 2 `'down'`, equal speeds all `'even'`;
      `sphereFitDistance` keeps the sphere inside both the vertical and horizontal FOV for
      aspect 0.5, 1 and 2.
- [ ] **Step 2: Run** them → FAIL.
- [ ] **Step 3: Implement.** `FlightRig` (inside Canvas): registers `invalidate` with
      `flight.onWake`; in `useFrame` calls `flight.advance(delta)`, applies attitude and height to
      the group, and calls `invalidate()` again unless `flight.settled()`. `MotorArcs`: one arc
      per prop, updated each frame with `setPositions` (as `LeaderLine` does), sweep from
      `arcSweep`. `MotorPins`: DOM overlay (`aria-hidden`), one balloon per motor ("2 · 64 %"),
      placed each frame at the projected rotated motor point pushed outward ~28 px from the
      projected centre, clamped inside the field; `data-state` from `motorPinState`, `'up'`
      gets the redline ring. With a flight: closed frame, `openParts`/`connectedParts` empty,
      `turnTo` null, `SpinArcs` off (the arcs replace them), orbit as usual, clicks ignored by the
      explorer (Task 6).
- [ ] **Step 4: Look at it** (dev server, desktop and 375×667): the drone fills the field without
      touching the sticks at any attitude; pins stay inside; idle canvas stops drawing (no
      `invalidate` loop when settled — check with a frame counter in devtools).
- [ ] **Step 5: Run** `pnpm check` → PASS.
- [ ] **Step 6: Commit** `feat(drone-viewer): fly the drone from the flight store`.

### Task 6: The sheet

**Files:**

- Create: `src/content/moves.ts` (+ `moves.test.ts`), `src/features/part-explorer/MovesPanel.tsx`
  (+ test), `src/features/part-explorer/useStepScroll.ts`
- Modify: `PathPanel.tsx` (use `useStepScroll`), `PartExplorer.tsx` (+ test), `ids.ts`,
  `src/content/ui.ts`, `src/styles/global.css`

**Interfaces:**

- Consumes: Tasks 1–5.
- Produces: `MOVES: { title; lead; facts: { label; value }[]; steps: Record<MoveStepId, {
name: string; text: string; lessons: readonly PartId[] }> }`; `MovesPanel(props: { flight:
Flight | null; step: number; read: boolean; onStep; onClose; onToggleRead; onFollowLink? })`;
  `useStepScroll(list, controls, key, step)` (the 05a scroll-into-view effect, extracted);
  `movesTitleId()`.

- [ ] **Step 1: Write failing tests.** `moves.test.ts`: five steps in `MOVE_STEP_IDS` order; the
      roll text names the left motors speeding up, the yaw text the clockwise/counter-clockwise
      pairs; the facts mention acro and the slowed-down rate. `MovesPanel.test.tsx`: five step
      buttons in order, the current has `aria-current="step"`; Next/Previous call `onStep`; a
      step name calls `onStep(i)`; Show me, Level and Gust buttons exist and call the flight;
      the gyro step shows wanted and measured °/s rows when current; announcer text on step
      change; title block shows "How it works together" and "4 of 4". `PartExplorer.test.tsx`:
      `/moves/2` renders the sheet at Roll; `/moves/9` is replaced by `/moves/5`; opening a step
      runs its demo unless reduced motion (mock `matchMedia`); clicking the drawing does nothing;
      with the viewer failing, the five steps still render and no sticks show.
- [ ] **Step 2: Run** them → FAIL.
- [ ] **Step 3: Implement.** Write the step texts (plain words, checked against the lessons;
      the yaw text explains the twist; the gyro text "thousands of times a second"; the facts
      say "Acro" and that the sheet turns about 7× slower than a real quad). `PartExplorer`: the
      flight store lives while the moves sheet is open (`createFlight` on open, `dispose` on
      leave); step from the address as for paths, through `replaceStep('moves', n)`; a step
      change runs `runDemo` unless reduced motion; Show me always runs it. If `PartExplorer.tsx`
      passes ~430 lines, extract the stepped-sheet plumbing into `useSheetStep`. **Phones** (the
      `max-width: 55.9375em` layout): on the moves sheet (`.part-explorer[data-sheet="moves"]`)
      the drawing canvas is `position: sticky; top: 0`, about 40svh tall, the parts list is not
      shown in the pinned area, and `.path-controls` stick just below it. Gust and Level sit in
      the controls row with Previous/Next and Show me (wrap on narrow screens).
- [ ] **Step 4: Look at it** with impeccable's craft floor: desktop, 375×667, 320 px at 200 %
      text, dark mode, reduced motion.
- [ ] **Step 5: Run** `pnpm check` → PASS.
- [ ] **Step 6: Commit** `feat(part-explorer): add the How a quad moves sheet`.

### Task 7: End to end and docs

**Files:**

- Create: `e2e/moves.spec.ts`
- Modify: `e2e/reflow.spec.ts`, `DESIGN.md`, `PRODUCT.md`, `.impeccable/design.json`, the
  surface brief in `.impeccable/surfaces/`, `docs/architecture/overview.md`,
  `docs/product/scope.md`, `docs/roadmap.md`

- [ ] **Step 1: Write the e2e tests:** Next from Video opens "How a quad moves"; dragging the right
      stick right shows motors 3 and 4 higher than 1 and 2 in the pins; keyboard: focus Roll,
      hold ArrowRight, release → value back to 0; Level; the step address follows Next; at
      375×667 after scrolling to step 5 the canvas and both sticks are in the viewport; reduced
      motion: no demo starts on opening a step, Show me runs it; leave mid-demo and come back
      with browser Back → no console errors. `reflow.spec.ts` includes `/moves`.
- [ ] **Step 2: Run** `pnpm test:e2e` (and against the Docker image, `E2E_BASE_URL`) → PASS.
- [ ] **Step 3: Docs.** DESIGN.md: Stick pad and Motor readout components; architecture
      overview: `features/flight`; scope: 05b built; roadmap: 05b `in review`; PRODUCT.md and
      the surface brief: the moves sheet and the pinned phone drawing.
- [ ] **Step 4: Run** `pnpm check` → PASS.
- [ ] **Step 5: Commit** `test(e2e): cover the How a quad moves sheet` and `docs: record the moves
sheet` (two commits).
