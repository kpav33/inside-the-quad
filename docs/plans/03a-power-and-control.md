# Section 03a — Power and control parts: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or
> superpowers:subagent-driven-development) to implement this plan task-by-task, and the
> `impeccable:impeccable` skill for every UI edit (read its `reference/craft-floor.md` immediately
> before editing UI). Steps use checkbox (`- [ ]`) syntax. Branch: `feat/power-and-control`.

**Goal:** Lessons and procedural 3D parts for the ESC, flight controller and battery, with the
ESC + FC stack shown as an exploded view when either is selected.

**Architecture:** Spec fields and LiPo constants in `src/shared/domain`; one lesson file per part
in `src/content/lessons`; one component per part in `src/features/drone-model/parts`. Stack
heights and exploded offsets are pure functions in `src/features/drone-model/stack.ts`; a `Lift`
group eases each layer to its offset with `THREE.MathUtils.damp` under `frameloop="demand"`.

**Tech Stack:** TypeScript, React 19, react-three-fiber 9 / drei 10, three, Vitest, Playwright.

**Spec:** [03a-power-and-control-design.md](03a-power-and-control-design.md). Read it first.

## Global Constraints

- `PART_IDS` order: `frame, motors, props, esc, fc, battery`. Labels: `ESC`, `Flight controller`,
  `Battery`.
- Stack mount comes only from `frame.stackMountMm`; cell count only from `motor.batteryCells`.
- Reference values: ESC `4-in-1`, 55 A per motor, `DShot600`, board 41 mm, capacitor 1000 µF /
  35 V; FC `F7`, `Betaflight`, 6 UARTs, BEC `[5, 10]` V, board 36 mm; battery 1100 mAh, 100C,
  `XT60`, pack 75 × 35 × 38 mm (length × width × height).
- LiPo per cell: nominal 3.7 V, full 4.2 V, storage 3.8 V, empty under load 3.5 V, minimum resting
  3.3 V.
- Lesson numbers are computed from the spec and LiPo constants, never typed as literals.
- No product recommendations. BLHeli_S, Bluejay, AM32, INAV and ArduPilot are named as examples.
- Colours only from `tokens.ts`; redline only for selection. New `MODEL_COLOR` fills stay under
  1.6:1 contrast against ground (existing test).
- No new dependencies. Interface text in `src/content/ui.ts`.
- Each task ends with `pnpm check` passing and a Conventional Commit.

## Review Focus

1. **Switching parts mid-animation** (ESC → Motors → FC quickly): layers reverse smoothly and always
   settle at the new target. Pinned by `stepLift` convergence tests from arbitrary start values
   (Task 5).
2. **Reduce motion on:** the stack opens and closes in one frame. Pinned by `stepLift` reduce test
   (Task 5).
3. **Clicking while the stack is open:** clicking the lifted battery selects the battery and closes
   the stack; clicking the background closes it. Pinned in Task 7's e2e.
4. **Six parts at 320 px with 40 % longer text:** no horizontal overflow, rows still ≥ 44 px.
   Pinned by extending the `design.spec.ts` and `touch.spec.ts` loops (Task 7).
5. **Keyboard only:** selecting ESC from the list with Enter opens the stack and its lesson; Escape
   closes both. Pinned in Task 7's e2e.

---

### Task 1: Spec fields and LiPo constants

**Files:**

- Modify: `src/shared/domain/drone-spec.ts`
- Create: `src/shared/domain/lipo.ts`, `src/shared/domain/lipo.test.ts`
- Modify: `src/shared/domain/drone-spec.test.ts`
- Modify: `src/content/lessons/motors.ts` (use `LIPO_CELL_VOLTS.full`)
- Modify: `src/content/overview.ts` (Battery row → `6S 1100 mAh`)

**Interfaces:**

- Produces: `DroneSpec.esc { layout: '4-in-1'; currentPerMotorA; protocol; boardSizeMm;
capacitorUf; capacitorV }`, `DroneSpec.fc { processor; firmware; uarts; becVolts: number[];
boardSizeMm }`, `DroneSpec.battery { capacityMah; cRating; connector; packLengthMm; packWidthMm;
packHeightMm }`, values per Global Constraints.
- Produces: `LIPO_CELL_VOLTS = { nominal: 3.7, full: 4.2, storage: 3.8, emptyUnderLoad: 3.5,
minResting: 3.3 } as const`; `packVolts(cells: number, perCell: number): number` (rounded to 1
  decimal).

- [ ] **Step 1: Failing tests.** `lipo.test.ts`: `packVolts(6, LIPO_CELL_VOLTS.nominal)` is `22.2`,
      `packVolts(6, LIPO_CELL_VOLTS.full)` is `25.2`, `packVolts(4, 4.2)` is `16.8`. Spec test: the
      capacitor voltage exceeds the full pack voltage
      (`esc.capacitorV > packVolts(motor.batteryCells, full)`); the ESC and FC boards are at least
      `frame.stackMountMm + 4` wide (room around the holes); the battery pack fits the top plate
      (`packLengthMm <= bodyLengthMm`, `packWidthMm <= bodyWidthMm`).
- [ ] **Step 2:** `pnpm test src/shared/domain` fails.
- [ ] **Step 3:** Add the fields, `lipo.ts`, and switch `motors.ts` and `overview.ts`.
- [ ] **Step 4:** `pnpm check` passes.
- [ ] **Step 5:** `feat(domain): add ESC, flight controller and battery specs`

### Task 2: Battery part and lesson

**Files:**

- Modify: `src/shared/domain/parts.ts`, `src/shared/domain/quantity.ts` (+ its test),
  `src/content/ui.ts`, `src/shared/design/tokens.ts`, `src/content/lessons/index.ts`,
  `src/content/lessons/lessons.test.ts`, `src/content/lessons/frame.ts`
- Create: `src/content/lessons/battery.ts`

**Interfaces:**

- Produces: `'battery'` in `PART_IDS` (append at the end for now; Task 4 fixes the final order),
  `PART_LABELS.battery = 'Battery'`, `MODEL_COLOR.battery`, `partQuantity('battery') === 1`,
  `LESSONS.battery`.

- [ ] **Step 1: Failing tests** in `lessons.test.ts`:
  - `quotes the battery numbers from the drone spec`: spec values include `6S`, `1100 mAh`, `100C`,
    `XT60`.
  - battery lesson text contains `22.2 V` and `25.2 V` (computed via `packVolts`) and `3.8 V`.
  - battery lesson text mentions safety: matches `/puff/i`, `/unattended/i`, `/storage/i`.
  - add to `JARGON`: `LiPo: /lithium polymer/i`, `mAh: /milliamp/i`.
  - new test `links connected parts both ways`, with `PAIRS` holding `['battery', 'frame']` for
    now: for each pair present in `PART_IDS`, each lesson has a connection with the other's id.
- [ ] **Step 2:** `pnpm test src/content` fails.
- [ ] **Step 3:** Write `battery.ts` from scope 2.5 (spec rows: Cells, Capacity, C rating,
      Connector, Cell voltages). The C-rating row computes the label's current
      (`cRating × capacityMah / 1000` = 110 A) and says labels are often exaggerated. The ESC
      connection is plain text until Task 3. Give the frame lesson's battery line `partId: 'battery'`.
      Add the id, label, colour and quantity.
- [ ] **Step 4:** `pnpm check` passes.
- [ ] **Step 5:** `feat(content): add the battery lesson`

### Task 3: ESC part and lesson

**Files:** as Task 2, plus `src/content/lessons/esc.ts`, `src/content/lessons/motors.ts`,
`src/content/lessons/battery.ts`.

**Interfaces:**

- Produces: `'esc'` in `PART_IDS`, `PART_LABELS.esc = 'ESC'`, `MODEL_COLOR.esc`,
  `partQuantity('esc') === 1` (one 4-in-1 board), `LESSONS.esc`.

- [ ] **Step 1: Failing tests:** ESC spec values include `4-in-1`, `55 A`, `DShot600`,
      `30.5 × 30.5 mm`, `1000 µF`; `JARGON` gains `DShot: /digital/i`, `'back-EMF': /voltage/i`;
      `PAIRS` gains `['esc', 'battery']`, `['esc', 'motors']`, `['esc', 'frame']`.
- [ ] **Step 2:** tests fail.
- [ ] **Step 3:** Write `esc.ts` from scope 2.4 (spec rows: Type, Current, Protocol, Mount,
      Capacitor). Link the motors lesson's "soldered to the ESC" line and the battery's ESC line to
      `'esc'`. Split the frame lesson's stack line into an ESC line (`partId: 'esc'`) and an FC line
      (plain text until Task 4). FC mentions stay plain text until Task 4.
- [ ] **Step 4:** `pnpm check` passes.
- [ ] **Step 5:** `feat(content): add the ESC lesson`

### Task 4: Flight controller part and lesson

**Files:** as Task 2, plus `src/content/lessons/fc.ts`, `src/content/lessons/esc.ts`,
`src/content/lessons/frame.ts`.

**Interfaces:**

- Produces: final `PART_IDS = ['frame', 'motors', 'props', 'esc', 'fc', 'battery']`,
  `PART_LABELS.fc = 'Flight controller'`, `MODEL_COLOR.fc`, `partQuantity('fc') === 1`,
  `LESSONS.fc`.

- [ ] **Step 1: Failing tests:** `PART_IDS` equals the final order; FC spec values include `F7`,
      `Betaflight`, `6`, `5 V`, `10 V`, `30.5 × 30.5 mm`; `JARGON` gains `UART: /serial port/i`,
      `BEC: /regulator/i`, `gyro: /rotat/i`, `AIO: /all-in-one/i`; `PAIRS` gains `['fc', 'esc']`,
      `['fc', 'frame']`.
- [ ] **Step 2:** tests fail.
- [ ] **Step 3:** Write `fc.ts` from scope 2.6 (spec rows: Processor, Firmware, UARTs, BEC,
      Mount). The receiver, VTX and camera connections are plain text (03b). Link the ESC and frame
      lessons' FC lines to `'fc'`. Reorder `PART_IDS`.
- [ ] **Step 4:** `pnpm check` passes. `pnpm dev`: the list shows six parts and each lesson opens
      (the new parts have no 3D yet).
- [ ] **Step 5:** `feat(content): add the flight controller lesson`

### Task 5: Stack geometry, exploded offsets and easing

**Files:**

- Create: `src/features/drone-model/stack.ts`, `src/features/drone-model/stack.test.ts`
- Modify: `src/shared/domain/parts.ts` (`STACK_PARTS`, `isStackPart`)

**Interfaces:**

- Produces: `STACK_PARTS = ['esc', 'fc'] as const`; `isStackPart(part: PartId | null): boolean`.
- Produces: `stackLayers(spec): Record<'esc' | 'fc' | 'topPlate', { bottomMm: number; topMm: number }>`
  (closed positions above the bottom of the frame; ESC bottom at `armThicknessMm + 5`, FC above
  the ESC, top plate from `armThicknessMm + standoffHeightMm`).
- Produces: `explodedOffsets(spec, open: boolean): Record<'esc' | 'fc' | 'topPlate', number>` in
  mm. Starting values when open: ESC 15, FC 32, top plate 50.
- Produces: `stepLift(current: number, target: number, deltaS: number, reduceMotion: boolean):
{ value: number; settled: boolean }`, using `THREE.MathUtils.damp` with lambda 10, snapping to
  the target within 0.01 mm.

- [ ] **Step 1: Failing tests:** closed offsets are all 0; in `stackLayers` closed, ESC top <
      FC bottom < FC top < top-plate bottom; open, every lifted layer's bottom is at least 8 mm above
      the lifted layer below's top; `isStackPart('esc')`, `isStackPart('fc')` true, `'battery'` and
      `null` false; `stepLift(0, 50, 1/60, true)` returns `{ value: 50, settled: true }`; from
      starts `-20, 0, 37, 80` to target `50`, repeated 1/60 s steps settle within 120 steps and
      never overshoot.
- [ ] **Step 2:** tests fail.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** `pnpm check` passes.
- [ ] **Step 5:** `feat(drone-model): add stack layers and exploded offsets`

### Task 6: 3D parts and the exploded stack

Load impeccable and read `craft-floor.md` before this task.

**Files:**

- Create: `src/features/drone-model/parts/Esc.tsx`, `Fc.tsx`, `Battery.tsx`,
  `src/features/drone-model/Lift.tsx`
- Modify: `src/features/drone-model/parts/Frame.tsx` (top plate in a `Lift` taking
  `topPlateLiftMm`), `src/features/drone-model/DroneModel.tsx`

**Interfaces:**

- Consumes: `stackLayers`, `explodedOffsets`, `stepLift`, `isStackPart` (Task 5).
- Produces: `Lift({ liftMm, children })`: a group whose `position.y` eases to `mm(liftMm)` in
  `useFrame` via `stepLift`; calls `invalidate()` while not settled and in an effect when `liftMm`
  changes; reads `prefers-reduced-motion` once on mount.

- [ ] **Step 1:** Components, sized from the spec and `stackLayers`: ESC board with a few blocky
      components and the capacitor on two leads at the rear (+z); FC board with grommet rings at the
      four `stackMountMm` holes; battery as a rounded box (drei `RoundedBox`) lying lengthwise on the
      top plate with an XT60 block at the rear. Each uses `PartMaterial` with its own part id.
- [ ] **Step 2:** `DroneModel`: `const open = isStackPart(selectedPart)`; wrap ESC, FC, top plate
      and battery in `Lift` with `explodedOffsets(spec, open)` (battery uses the top-plate offset);
      add `partGroup('esc' | 'fc' | 'battery', …)`.
- [ ] **Step 3:** `pnpm check` passes.
- [ ] **Step 4: Seen working.** `pnpm build && pnpm preview`; screenshots at 1280 × 800 and
      390 × 844 with nothing selected, ESC selected and FC selected. Confirm: the closed stack sits
      between the plates; open, every layer is separated and the whole drone stays inside the
      canvas (if not, reduce the offsets in `stack.ts` and its test); the selected board is redline;
      clicking a lifted board selects it. With `prefers-reduced-motion` emulated the stack jumps.
- [ ] **Step 5:** `feat(drone-model): add ESC, flight controller and battery with an exploded stack`

### Task 7: End-to-end coverage for six parts

**Files:**

- Create: `e2e/parts.ts` (`PART_NAMES = ['Frame', 'Motors', 'Propellers', 'ESC', 'Flight
controller', 'Battery']`)
- Modify: `e2e/explorer.spec.ts`, `e2e/design.spec.ts`, `e2e/touch.spec.ts`

- [ ] **Step 1:** Replace the hard-coded three-part arrays with `PART_NAMES`.
- [ ] **Step 2:** The centre click now lands on the battery: change that test to expect
      `Battery`, and add a frame click at an arm point (choose the canvas fraction from the Task 6
      screenshots).
- [ ] **Step 3:** New tests: selecting ESC, Flight controller and Battery from the list opens each
      lesson; with ESC selected, clicking the lifted FC (fraction from screenshots) opens the FC
      lesson; with ESC selected, clicking the lifted battery opens the battery lesson, then clicking
      the background closes it (Review Focus 3); keyboard: focus the ESC row, press Enter, the ESC
      lesson opens; Escape closes it (Review Focus 5).
- [ ] **Step 4:** `pnpm test:e2e` passes.
- [ ] **Step 5:** `test(e2e): cover the ESC, flight controller and battery`

### Task 8: Docs

**Files:** `docs/roadmap.md`, `PRODUCT.md`, `docs/architecture/overview.md`, `DESIGN.md`,
`.impeccable/surfaces/src-features-part-explorer-partexplorer-tsx.md`, `docs/README.md` (if it
lists plans).

- [ ] **Step 1:** Roadmap: replace 03 with 03a (this section, in progress) and 03b (receiver,
      camera, VTX and antennas, extras). PRODUCT.md "Built so far": six parts and the exploded stack.
      Architecture overview: `stack.ts` and `Lift`. DESIGN.md and the brief: the exploded stack reads
      as an exploded-view drawing; redline marks only the selected board.
- [ ] **Step 2:** `pnpm check` passes.
- [ ] **Step 3:** `docs: describe the power and control parts and the exploded stack`

## Acceptance

- All six parts are selectable from the list and in 3D, each with a four-question lesson whose
  numbers come from the spec.
- Selecting ESC or FC opens the stack; anything else closes it; reduce motion makes it instant.
- `pnpm check`, `pnpm test:e2e` and CI (including e2e against the Docker image) are green.
- Independent review saved to `docs/reviews/03a-power-and-control.md`, findings fixed, PR merged
  with the user's OK.
