# Section 05c — What if: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or
> superpowers:subagent-driven-development) to implement this plan task-by-task, and the
> `impeccable:impeccable` skill for every UI edit (read its `reference/craft-floor.md` immediately
> before editing UI). Steps use checkbox (`- [ ]`) syntax. Branch: `feat/what-if`.

**Goal:** A fifth sheet in "How it works together", **What if**: four common mistakes (link lost,
wrong prop, wrong battery, VTX without antenna) acted out on the 3D drawing with live sticks.

**Architecture:** `what-if` joins the stepped sheets and routing (`/what-if`, `/what-if/n`). The
05b flight model gains `Faults` (link lost, wrong prop on motor 2, 4 or 6 cells, no VTX antenna)
plus a fall to a ground line; behaviour comes out of the same tested model (a body-torque
authority limit makes the controller run out of motor against a wrong prop). The store carries the
faults and a `reset()`. The viewer draws a ground line and a VTX heat gauge and marks the faulty
motor; the explorer gains a `WhatIfPanel` and a `FlightStatus` line, reusing 05b's sticks,
readouts and pinned phone drawing.

**Tech Stack:** React 19, TypeScript strict, react-three-fiber + drei (`Line`), Vitest + Testing
Library (fake timers), Playwright.

**Spec:** [05c-what-if-design.md](05c-what-if-design.md). Its step table and Decisions 1–12 are
binding; Decision 3 (Try it, no Undo, Reset) and 5 (faults in the model) especially.

## Global Constraints

- Node 22: prefix node/pnpm commands with `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
- Addresses `/what-if` (step 1) and `/what-if/n`; sheet 5 of 5 of "How it works together", after
  How a quad moves; Next from it: the overview. The chapter switcher lists it as "What if".
- Steps, in order: `failsafe`, `prop`, `battery`, `vtx`. The wrong prop is on **motor 2** (front
  right, CCW); the reference drone is **6S**.
- Only one fault at a time; opening another step, Reset or leaving the sheet clears it. Nothing
  plays by itself on this sheet.
- `features/flight` stays free of three.js; 3D code imports only **types** from `flight` and never
  `content/` (05b rule). Text in `src/content/what-if.ts` and `ui.ts`.
- Tokens only, no new colours; redline only for selection, the current sheet/step, the current
  mistake's part, focus. Hot/damaged said in words, never °C.
- The 05b sheet behaves as before (faults off); 05b's tests keep passing.
- 02d holds: no sideways scroll at 320 px with 200 % text; every step readable below the pinned
  drawing; reduced motion live (falls still play: the user asked).
- Each task ends with `pnpm check` passing and a Conventional Commit (header ≤ 72 chars, body
  lines ≤ 100).

## Review Focus

1. **Reset at any moment** (mid-guard, mid-fall, on the ground, VTX damaged): back to level, hover,
   link OK, 6S, no heat, armed. Pinned in Task 2's and Task 3's tests.
2. **A long frame during a fall** (hidden tab, `dt` 5 s): the drone lands on the ground line, never
   below it. Pinned in Task 2's tests.
3. **Changing step while a fault runs** (VTX heating, link lost): the fault and its effects clear.
   Pinned in Task 5's tests.
4. **Faults never leak into the moves sheet:** each sheet has its own flight. Pinned in Task 5's
   tests.
5. **Sticks during failsafe:** they move and report their values, but the drone ignores them.
   Pinned in Task 2 (model) and Task 6 (e2e).

---

### Task 1: The what-if sheet in the set and the address

**Files:** `src/shared/domain/what-if.ts` (create), `sheets.ts`, `routes.ts`, `usePartRoute.ts`,
`progress.ts`, `content/ui.ts`, `app/App.tsx`, `part-explorer/ids.ts`, `PartExplorer.tsx` (title
id only), their tests, `e2e/navigation.spec.ts`, `docs/roadmap.md`.

**Interfaces:**

- Produces: `WHAT_IF_SHEET = 'what-if' as const`, `type WhatIfSheet`, `WHAT_IF_STEP_IDS =
['failsafe', 'prop', 'battery', 'vtx'] as const`, `type WhatIfStepId`. `SteppedSheet` includes
  `WhatIfSheet`; `CHAPTER_SHEETS.paths = [...PATH_IDS, MOVES_SHEET, WHAT_IF_SHEET]`. `Route` /
  `PageRoute` gain `{ kind: 'what-if'; step: number }`; `steppedPath('what-if', n)`.
  `UI.whatIf.title = 'What if'`; `sheetName('what-if')`; `WHAT_IF_TITLE_ID = 'what-if-title'`.

- [ ] **Step 1: Failing tests.** routes: `/what-if` → step 1, `/what-if/3` → 3, `/what-if/0` → 1,
      `/what-if/x` and `/what-if/2/3` unknown, `steppedPath('what-if', 2) === '/what-if/2'`.
      sheets: `sheetNeighbours('moves').next === 'what-if'`, `sheetNeighbours('what-if')` next null,
      `sheetNumber('what-if') === 5`, `chapterCount('control') === 5`. progress keeps `"what-if"`.
      App: masthead "How it works together" current at `/what-if`. ui: `sheetName('what-if') ===
'What if'`. Update the 05b tests that assert "of 4" and the moves sheet's "Next: Back to
      overview" (now "Next: What if · sheet 5").
- [ ] **Step 2: Run** `pnpm exec vitest run src/shared src/features/progress src/content/ui.test.ts
src/app src/features/part-explorer` → FAIL on the new cases.
- [ ] **Step 3: Implement**, generalising the moves parsing so both `/moves` and `/what-if` use one
      rule. The e2e sheet walk ends on "What if"; overview count text "… · How it works y of 5".
      Roadmap: 05b `done`, 05c `in progress` (`feat/what-if`).
- [ ] **Step 4: Run** `pnpm check` → PASS. **Commit** `feat(routing): add the what-if sheet to the
drawing set`.

### Task 2: Faults in the flight model

**Files:** `src/features/flight/faults.ts` (create), `model.ts`, `model.test.ts`,
`faults.test.ts`, `index.ts`.

**Interfaces:**

- Produces: `interface Faults { linkLost: boolean; wrongProp: boolean; cells: 4 | 6; vtxNoAntenna:
boolean }`, `NO_FAULTS: Faults` (`cells: 6`). `FlightState` gains `armed: boolean`,
  `linkLostS: number` (time since the link was lost, 0 when OK), `fallSpeed: number` (m/s down),
  `onGround: boolean`, `vtxHeat: number` (0–1+), `vtxLevel: 0 | 1 | 2 | 3` (none, Warm, Hot,
  Damaged). `stepFlight(state, sticks, dtS, faults = NO_FAULTS)`. Constants exported:
  `FAILSAFE_GUARD_S = 1`, `GROUND_M = -0.12` (the height the drone rests at), `VTX_DAMAGE_S = 30`.
  `isSettled(state, sticks, faults = NO_FAULTS)`.

- [ ] **Step 1: Failing tests** (`faults.test.ts`, 1/60 s steps):
  - `link lost: sticks are ignored` — roll 1 for 0.5 s with `linkLost` → roll angle < 2°.
  - `link lost: safe values, then disarmed` — at 0.5 s `armed` true and every motor < hover; at
    1.5 s `armed` false and every motor 0.
  - `link lost: falls to the ground and stays` — after 4 s `onGround`, `height === GROUND_M`; the
    link returning (`NO_FAULTS`) for 2 s more leaves `armed` false and `onGround` true.
  - `wrong prop flips the drone` — from hover with sticks centred, within 3 s the up axis
    (`rotatePoint(att, [0,1,0])[1]`) is < 0, motor 2 is the fastest motor, and it ends `onGround`.
  - `4S tops out lower` — throttle 1, roll 1 for 1 s: max motor on 4S ≈ 4/6 of 6S's (±0.03).
  - `4S is slower to reach the rate` — rate after 0.15 s of full roll is lower on 4S than 6S.
  - `VTX heats through Warm and Hot to Damaged` — `vtxLevel` 1 at 1 s, 2 at 20 s, 3 at 31 s; with
    faults off it stays 0.
  - `long frame during a fall` — link lost, step 2 s, then one `dt` of 5 s → `height === GROUND_M`.
  - `not settled while falling or heating`; settled on the ground with nothing heating.
  - All existing `model.test.ts` tests unchanged and passing (faults off).
- [ ] **Step 2: Run** `pnpm exec vitest run src/features/flight` → FAIL.
- [ ] **Step 3: Implement.** Clamp the turning effort to an **authority** of `MAX_MIX / MIX_SCALE`
      × `cells / 6` per axis (that is what the motors can do; check the 05b tests still pass and
      tune if a gust test needs it). Wrong prop: the front-right corner's thrust acts down, which
      adds `2 × PROP_TORQUE × motor2Speed` to both roll (right side down) and pitch (nose down) in
      the body's response, with `PROP_TORQUE` large enough that at hover it exceeds the authority
      (so the controller, driving motor 2 up, runs out of motor). Link lost: for
      `FAILSAFE_GUARD_S` use `{ ...CENTRED, throttle: 0 }`, then `armed = false`. Disarmed or
      tilted past 90° (up axis below the horizon) → falling: `fallSpeed` grows by 9.8 m/s² capped
      at 3 m/s, height drops until `GROUND_M`, then `onGround` (rate 0, motors 0, attitude kept,
      `armed` false). 4S: motor speeds × 4/6 and authority × 4/6. VTX: `vtxHeat += dt /
VTX_DAMAGE_S` while `vtxNoAntenna`; levels at > 0, ≥ 0.6, ≥ 1.
- [ ] **Step 4: Run** `pnpm check` → PASS. **Commit** `feat(flight): act out failsafe, a wrong prop,
4S and a VTX without antenna`.

### Task 3: Faults in the store

**Files:** `src/features/flight/store.ts`, `store.test.ts`.

**Interfaces:**

- Consumes: Task 2. Produces on `Flight`: `readonly faults: Faults`; `setFaults(change:
Partial<Faults>): void` (wakes the drawing); `reset(): void` (`initialFlight()`, `NO_FAULTS`,
  sticks centred, any demo stopped; wakes). `advance` passes the faults; `settled()` uses them.

- [ ] **Step 1: Failing tests:** `setFaults` wakes and is read back; `advance` with `linkLost`
      disarms after the guard; `reset` from the ground with link lost and VTX damaged gives level,
      armed, `NO_FAULTS`, `vtxLevel` 0, centred sticks; a disposed flight ignores `setFaults`.
- [ ] **Step 2–4:** run (FAIL), implement, `pnpm check` → PASS. **Commit** `feat(flight): carry
faults and a reset in the flight store`.

### Task 4: The drawing shows the mistakes

**Files:** `drone-viewer/DroneViewer.tsx`, `FlightRig.tsx`, `useDroneFit.ts`, `FitCamera.tsx`,
`fit.ts` (+ test), `drone-viewer/vtx-gauge.ts` (+ test), `drone-model/index.ts` (export the VTX
anchor point if needed), `styles/global.css`.

**Interfaces:**

- Consumes: `Flight.faults`, `FlightState.onGround/vtxLevel` (types only).
- Produces: `DroneViewerProps.ground?: boolean` (what-if sheet): draws a hairline ground line
  across the field under the drone at `GROUND_M` (rule-strong, like a datum line) and widens the
  sphere fit so drone and ground both fit (`sphereFitDistance` with radius + |GROUND_M|, camera
  target lowered by |GROUND_M| / 2). Motor 2's balloon gets `data-fault="true"` while
  `faults.wrongProp` (redline ring, as `up`). A VTX gauge balloon (`.vtx-gauge`, `aria-hidden`,
  three segments, `data-level` 1–3, redline when 3) placed each frame at the projected, posed VTX
  point while `faults.vtxNoAntenna`. `vtxGaugeSegments(level): boolean[]` pure helper.

- [ ] **Step 1: Failing tests:** `vtxGaugeSegments(0)` all off, `(2)` two on, `(3)` three on;
      `sphereFitDistance` with the ground margin keeps both the drone sphere and the ground line's
      ends inside the view at aspect 0.5 and 2.
- [ ] **Step 2–3:** run (FAIL), implement. **Step 4: Look** (dev server, desktop and 375×667) with
      a temporary wiring or after Task 5: the fall lands on the line, a flipped drone rests upside
      down on it, the gauge sits by the VTX, nothing covers the sticks.
- [ ] **Step 5:** `pnpm check` → PASS. **Commit** `feat(drone-viewer): draw the ground, the VTX heat
and the faulty motor`.

### Task 5: The sheet

**Files:** `src/content/what-if.ts` (+ test), `src/content/lessons/props.ts` (one line),
`src/features/flight/FlightStatus.tsx` (+ test), `part-explorer/WhatIfPanel.tsx` (+ test),
`part-explorer/useFlightSheet.ts` (extracted from `useMovesSheet.ts`), `useWhatIfSheet.ts`
(+ test), `PartExplorer.tsx` (+ test), `content/ui.ts`, `styles/global.css`.

**Interfaces:**

- Consumes: Tasks 1–4.
- Produces: `WHAT_IF: { title; lead; facts; steps: Record<WhatIfStepId, { name; happens; why;
avoid; lessons: readonly PartId[] }> }`. `FlightStatus({ flight })`: a caps line in the drawing
  field, e.g. "Link OK · 6S", "Link lost · 6S", "VTX: Hot"; the lost link and Damaged in redline.
  `useFlightSheet(open, addressStep, stepCount, sheet, replaceStep): { flight, step, goTo }`
  (flight lifetime and step clamping; `useMovesSheet` uses it and adds demos).
  `useWhatIfSheet(...)`: on step change and on leaving, `flight.reset()`. `WhatIfPanel({ flight,
step, read, onStep, onClose, onToggleRead, onFollowLink? })`.

- [ ] **Step 1: Failing tests.** content: four steps in order, each with non-empty happens/why/
      avoid; the failsafe text says it must be re-armed; the battery text names 4S and 6S from the
      spec; the VTX text says cooling doesn't undo damage; lessons are real parts. WhatIfPanel:
      title block "5 of 5"; switcher lists five sheets with What if current; Try it on step 1
      sets `linkLost`; on the battery step a 6S / 4S toggle (`aria-pressed`) sets `cells`, no Try
      it; Reset calls `flight.reset()`. useWhatIfSheet: changing step from VTX (heating) clears
      `vtxNoAntenna` and `vtxLevel`. PartExplorer: `/what-if/2` opens Prop on backwards; the moves
      sheet's flight has `NO_FAULTS` after visiting what-if with 4S set; clicks on the drawing do
      nothing; the 3D-fail fallback still lists the steps. FlightStatus: shows "Link lost" when
      lost.
- [ ] **Step 2:** run → FAIL. **Step 3: Implement.** Write the step texts from the design's table
      (numbers from the spec and `lipo.ts`); tighten the props lesson line (a prop for the other
      direction pushes air the wrong way; one mounted upside down makes little thrust). The sheet
      reuses the path/moves sheet frame and classes, the chapter switcher, the sticks, the pinned
      phone drawing (generalise the `data-sheet='moves'` CSS to both flight sheets), and the
      readouts; the status line sits in the drawing's top-left inside the viewer's error boundary.
- [ ] **Step 4: Look** with impeccable's craft floor: desktop, 375×667, 320 px at 200 % text.
- [ ] **Step 5:** `pnpm check` → PASS. **Commit** `feat(part-explorer): add the What if sheet`.

### Task 6: End to end and docs

**Files:** `e2e/what-if.spec.ts` (create), `e2e/reflow.spec.ts`, `DESIGN.md`, `PRODUCT.md`,
`.impeccable/design.json`, the surface brief, `docs/architecture/overview.md`,
`docs/product/scope.md`, `docs/roadmap.md`.

- [ ] **Step 1: e2e:** the switcher and Next from How a quad moves open What if; Link lost: "Link
      lost" shows, dragging the right stick changes no motor readout, after ~2 s every readout
      reads 0 %, Reset brings "Link OK" and non-zero readouts; Prop on backwards: within 3 s
      motor 2 is marked and the readouts read 0 % (on the ground); 4S: full throttle readouts
      ≤ 70 %; VTX: the gauge reaches level 3 and the status reads Damaged (speed up with
      `page.clock` or a test hook, never a 30 s wait); 320 × 667 with 200 % text: sticks apart and
      every step readable (as 05b); leaving mid-fall and Back: no console errors. Reflow covers
      `/what-if`.
- [ ] **Step 2: Run** `pnpm test:e2e`, and against the Docker image (`E2E_BASE_URL`) → PASS.
- [ ] **Step 3: Docs.** DESIGN.md: What If Sheet, Ground Line, VTX Gauge, Flight Status; the
      chapter switcher now five sheets. Architecture overview: faults in `features/flight`.
      Scope: 05c done, Module 3 complete. Roadmap: 05c `in review`. PRODUCT.md and the surface
      brief: the sheet.
- [ ] **Step 4:** `pnpm check` → PASS. **Commit** `test(e2e): cover the What if sheet` and
      `docs: record the What if sheet` (two commits).
