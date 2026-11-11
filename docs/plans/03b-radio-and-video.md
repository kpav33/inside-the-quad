# Section 03b — Radio and video parts: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or
> superpowers:subagent-driven-development) to implement this plan task-by-task, and the
> `impeccable:impeccable` skill for every UI edit (read its `reference/craft-floor.md` immediately
> before editing UI). Steps use checkbox (`- [ ]`) syntax. Branch: `feat/radio-and-video`.

**Goal:** Lessons and procedural 3D parts for the receiver, camera, VTX, battery strap and extras,
completing Module 2; the VTX and receiver open the frame like the stack.

**Architecture:** Spec fields in `drone-spec.ts`; one lesson file per part; one component per part.
The crowded rear bay (VTX, receiver, the ESC's capacitor, antennas, GPS) is laid out by a pure,
tested `src/features/drone-model/rear.ts`, the same way `stack.ts` lays out the stack.
`isStackPart` becomes `isInsidePart`.

**Tech Stack:** TypeScript, React 19, react-three-fiber 9 / drei 10, three, Vitest, Playwright.

**Spec:** [03b-radio-and-video-design.md](03b-radio-and-video-design.md). Read it first.

## Global Constraints

- `PART_IDS` order: `frame, motors, props, esc, fc, battery, strap, receiver, camera, vtx,
extras`. Labels: `Battery strap`, `Receiver`, `Camera`, `VTX`, `Extras`.
- Reference values: receiver `ExpressLRS`, 2.4 GHz, `CRSF`, 500 Hz, `T dipole`; camera `micro`,
  19 mm, 30°, `analog`; VTX 5.8 GHz, 6 bands × 8 channels, levels `[25, 200, 400, 800]` mW,
  setting 25 mW, 20 mm mount, `RHCP`; strap 20 × 250 mm; extras GPS systems `['GPS', 'Galileo',
'GLONASS', 'BeiDou']`, buzzer 5 V, LEDs 5 V, 8 LEDs.
- Camera size classes: full 28, mini 21, micro 19, nano 14 mm.
- Lesson numbers come from the spec, never literals. No product recommendations; DJI, Walksnail,
  HDZero, OpenIPC are examples only.
- Colours only from `tokens.ts`; redline only for selection; new `MODEL_COLOR` fills under 1.6:1
  against ground (existing test).
- No new dependencies. Interface text in `src/content/ui.ts`.
- Each task ends with `pnpm check` passing and a Conventional Commit (header ≤ 72 chars, body
  lines ≤ 100).

## Review Focus

1. **Rear-bay parts selected while the frame is open:** selecting the VTX, then the receiver, keeps
   the frame open without movement (same open state); selecting the camera closes it. Pinned in
   Task 7's `isInsidePart` test and Task 9's e2e.
2. **Overlapping geometry in the rear bay:** VTX, receiver, capacitor, standoffs and the ESC board
   must not intersect, or clicks hit the wrong part. Pinned by Task 7's box-overlap test.
3. **Camera framing with antennas:** the closed drone, antennas and GPS included, stays inside the
   view on phone and laptop. Pinned by Task 7's extents test and Task 8's screenshots.
4. **11 rows at 320 px and 900–1100 × 700:** no overflow or page scroll. Pinned by Task 9 (loops
   over `PART_NAMES`, existing mid-width test).
5. **Lesson links to parts that now exist:** a lesson whose connections name another part links to
   it. Pinned by Task 6's `links every part its connections name` test.

---

### Task 1: Spec fields

**Files:** Modify `src/shared/domain/drone-spec.ts`, `src/shared/domain/drone-spec.test.ts`.

**Interfaces:**

- Produces: `DroneSpec.receiver { system; frequencyGhz; protocol; packetRateHz; antenna }`,
  `DroneSpec.camera { sizeClass: CameraSizeClass; widthMm; tiltDeg; signal: 'analog' |
'digital' }`, `DroneSpec.vtx { frequencyGhz; bands; channelsPerBand; powerLevelsMw: number[];
powerSettingMw; mountMm; antennaPolarization: 'RHCP' | 'LHCP' }`, `DroneSpec.strap { widthMm;
lengthMm }`, `DroneSpec.extras { gpsSystems: string[]; buzzerVolts; ledVolts; ledCount }`.
- Produces: `CAMERA_SIZE_CLASS_MM = { full: 28, mini: 21, micro: 19, nano: 14 } as const`,
  `type CameraSizeClass = keyof typeof CAMERA_SIZE_CLASS_MM`, `vtxChannelCount(spec): number`.

- [x] **Step 1: Failing tests:** the reference values above (`toMatchObject`); the VTX setting is
      one of its levels; `camera.widthMm === CAMERA_SIZE_CLASS_MM[camera.sizeClass]`;
      `vtxChannelCount(REFERENCE_5_INCH) === 48`.
- [x] **Step 2:** `pnpm test src/shared/domain` fails.
- [x] **Step 3:** Implement.
- [x] **Step 4:** `pnpm check` passes.
- [x] **Step 5:** `feat(domain): add receiver, camera, VTX, strap and extras specs`

### Tasks 2–6: One lesson per part

Each task follows the 03a lesson tasks: add the id to `PART_IDS` (before `extras`'s final order
lands in Task 6, append in task order), a label in `PART_LABELS`, a fill in `MODEL_COLOR` (dark
family, e.g. `#1f2327`, `#212529`, `#23272b`, `#1d2125`, `#25292d`), a quantity in `partQuantity`,
the lesson file, its `LESSONS` entry, and tests in `lessons.test.ts` / `quantity.test.ts`. Tests
first; `pnpm test src/content src/shared` fails, then passes; `pnpm check` passes; one commit
`feat(content): add the <part> lesson`.

| Task | Part             | Quantity | Spec rows (label: value)                                                                                                     | JARGON additions                                                                                                                       | PAIRS added                                           | Other lessons gaining a link                   |
| ---- | ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------- |
| 2    | `receiver` (2.7) | 1        | System: `ExpressLRS`; Band: `2.4 GHz`; Protocol: `CRSF`; Packet rate: `500 Hz`; Antenna: `T dipole`                          | `ELRS: /ExpressLRS/`, `CRSF: /serial/i`, `telemetry: /back to (your\|the) radio/i`, `failsafe: /signal is lost\|loses (the )?signal/i` | `['receiver','fc']`, `['receiver','frame']`           | FC's receiver line; frame gets a receiver line |
| 3    | `camera` (2.8)   | 1        | Size: `micro, 19 mm`; Tilt: `30°`; Signal: `Analog`; plus a Sizes row listing all four classes from `CAMERA_SIZE_CLASS_MM`   | `latency: /delay/i`                                                                                                                    | `['camera','frame']`                                  | frame's camera line                            |
| 4    | `vtx` (2.9)      | 1        | Band: `5.8 GHz`; Channels: `48` (6 × 8); Power: `25 mW` (levels listed in the meaning); Mount: `20 × 20 mm`; Antenna: `RHCP` | `mW: /milliwatt/i`, `RHCP: /right-hand/i`, `OSD: /on-screen/i`                                                                         | `['vtx','fc']`, `['vtx','camera']`, `['vtx','frame']` | FC's VTX lines; camera's VTX line              |
| 5    | `strap` (2.10)   | 1        | Size: `20 × 250 mm`; Pad: `rubber` (grippy pad under the battery)                                                            | —                                                                                                                                      | `['strap','battery']`, `['strap','frame']`            | battery's and frame's strap mentions           |
| 6    | `extras` (2.10)  | 4        | GPS: the four systems joined; Buzzer: `5 V`; LEDs: `8 × 5 V`                                                                 | `GPS Rescue: /fl(y\|ies) (back\|home)/i`                                                                                               | `['extras','fc']`                                     | FC gains an extras line                        |

Task-specific test cases:

- **Task 2:** receiver text mentions `binding`, `telemetry`, `failsafe` and `900 MHz`.
- **Task 3:** camera text contains `action camera` and explains why it is tilted (`/tilt/i`).
- **Task 4:** VTX text contains `antenna` with `/never .*without/i`, `/analog/i`, `/digital/i`,
  `/channel/i`; the 25 mW row's meaning mentions the EU and that limits vary by country.
- **Task 5:** strap text explains that a lost battery means a crash (`/crash/i`).
- **Task 6:** `PART_IDS` equals the final order (Global Constraints); `extras` quantity 4 (GPS,
  buzzer, two LED strips); new test `links every part its connections name`: for each lesson, every
  other part whose label appears as a whole word (case-insensitive) in its connection texts has at
  least one connection in that lesson with that `partId` (Review Focus 5). Fix any lesson it flags
  by adding the link.

### Task 7: Inside parts, rear bay layout and extents

**Files:**

- Modify: `src/shared/domain/parts.ts` (+ test), `src/features/drone-model/DroneModel.tsx`,
  `src/features/drone-model/extents.ts` (+ test), `src/features/drone-model/dimensions.ts`
- Create: `src/features/drone-model/rear.ts`, `src/features/drone-model/rear.test.ts`

**Interfaces:**

- Produces: `INSIDE_PARTS = ['esc', 'fc', 'receiver', 'vtx'] as const`,
  `isInsidePart(part: PartId | null): boolean` (replaces `STACK_PARTS` / `isStackPart`).
- Produces: `type Box = { centre: [x, y, z]; size: [x, y, z] }` (mm, frame coordinates as in
  `stackLayers`); `rearBay(spec): { vtx: Box; receiver: Box; capacitor: Box; vtxAntennaTip:
[x, y, z]; receiverAntennaTip: [x, y, z]; gps: Box }`; `boxesOverlap(a: Box, b: Box): boolean`.
  Starting values: capacitor moves to x = +10 (z 24.5–40.5, y 10–20); VTX 20 × 4 × 20 at
  (−8, 7, 28) under the ESC's rear edge; receiver 12 × 3 × 18 at (−8, 11.5, 30) on the VTX;
  VTX antenna from the VTX's rear edge 45 mm back and 30° up; receiver T antenna on the right-rear
  standoff, 20 mm stem up and back, 30 mm cross bar; GPS puck 20 × 7 × 20 on a post at x −14 on
  the top plate's rear, clear of the battery and its XT60 lead.
- Produces: `BATTERY_PAD_MM = 1` in `dimensions.ts`; the battery sits on the pad.
- `closedExtentsMm` takes the max of the battery top (with pad), prop top, both antenna tips and
  the GPS top.

- [x] **Step 1: Failing tests:** `isInsidePart` true for `esc`, `fc`, `receiver`, `vtx`, false for
      `camera`, `battery`, `null`; no two of {VTX, receiver, capacitor, ESC board box, each rear
      standoff box} overlap; VTX, receiver and capacitor lie inside the body outline
      (`|x| ≤ bodyWidthMm/2`, `|z| ≤ bodyLengthMm/2`) and below the top plate; the GPS box does not
      overlap the battery or the XT60 box; `closedExtentsMm` top ≥ both antenna tips and the GPS top,
      and half-width ≥ the antenna tips' `|x|` and `|z|`.
- [x] **Step 2:** tests fail.
- [x] **Step 3:** Implement; switch `DroneModel` to `isInsidePart`; Esc reads the capacitor
      position from `rearBay`; Battery adds `BATTERY_PAD_MM`.
- [x] **Step 4:** `pnpm check` passes; e2e still green (`pnpm test:e2e`), since nothing new is
      drawn yet.
- [x] **Step 5:** `feat(drone-model): lay out the rear bay and open the frame for it`

### Task 8: 3D parts

Load impeccable and read `craft-floor.md` before this task.

**Files:** Create `parts/Receiver.tsx`, `parts/Camera.tsx`, `parts/Vtx.tsx`, `parts/Strap.tsx`,
`parts/Extras.tsx`; modify `parts/Frame.tsx` (camera side plates: two 2 mm plates at
x = ±(widthMm/2 + 2), from the bottom plate to the top plate, front 18 mm of the body),
`DroneModel.tsx`.

**Interfaces:** Consumes `rearBay`, `stackLayers`, `explodedOffsets`, `isInsidePart`,
`BATTERY_PAD_MM`.

- [x] **Step 1:** Components from `rearBay` and the spec: Camera (body cube of `widthMm`, lens
      cylinder, tilted `tiltDeg` about x, at the front between the side plates); Vtx (board, a few
      components, antenna stalk to `vtxAntennaTip` with a small disc at the tip); Receiver (board,
      stem and cross bar to `receiverAntennaTip`); Strap (pad under the battery plus a band of
      `widthMm` around the battery and top plate); Extras (GPS post and puck, buzzer on the rear-left
      arm about 35 mm from the centre, an LED strip with `ledCount / 2` LEDs on each rear arm 55–80 mm
      out).
- [x] **Step 2:** `DroneModel`: add `partGroup` for each; Strap and the GPS ride in the top-plate
      `Lift`; open state from `isInsidePart`.
- [x] **Step 3:** `pnpm check` passes.
- [x] **Step 4: Seen working.** Build, preview, screenshots at 1280 × 720, 900 × 700 and
      390 × 844: nothing selected, VTX selected, receiver selected, camera selected, extras selected.
      Confirm nothing intersects visibly, the whole drone stays in view, rear parts are visible and
      redline when the frame is open, the camera sits between its plates.
- [x] **Step 5:** `feat(drone-model): add receiver, camera, VTX, strap and extras`

### Task 9: End-to-end coverage for eleven parts

**Files:** `e2e/parts.ts`, `e2e/explorer.spec.ts`.

- [x] **Step 1:** `PART_NAMES` gains `Battery strap`, `Receiver`, `Camera`, `VTX`, `Extras` in
      list order.
- [x] **Step 2:** Re-probe every `POINTS` entry (the framing may move) with one fresh page per
      point; add `camera` (closed) and `openVtx` (with Receiver selected).
- [x] **Step 3:** New test `mouse: the rear bay opens and stays clickable`: select Receiver from
      the list, click `openVtx`, expect the VTX lesson; click `camera`, expect the Camera lesson.
- [x] **Step 4:** `pnpm test:e2e` passes (run the explorer spec three times).
- [x] **Step 5:** `test(e2e): cover the radio and video parts`

### Task 10: Docs

**Files:** `docs/roadmap.md`, `PRODUCT.md`, `docs/architecture/overview.md`, `DESIGN.md`,
`.impeccable/design.json`, `.impeccable/surfaces/src-features-part-explorer-partexplorer-tsx.md`.

- [x] **Step 1:** Roadmap 03b in progress; PRODUCT.md "Built so far" lists all Module 2 parts and
      "Planned" drops the remaining parts; architecture: `rear.ts`, inside parts; DESIGN.md and the
      sidecar: new model fills, camera side plates, rear parts opening the frame; brief: one line.
- [x] **Step 2:** `pnpm check` passes.
- [x] **Step 3:** `docs: describe the radio and video parts`

## Acceptance

- All eleven parts are selectable from the list and in 3D, each with a four-question lesson whose
  numbers come from the spec; Module 2 is complete.
- Selecting the ESC, FC, receiver or VTX opens the frame; anything else closes it.
- `pnpm check`, `pnpm test:e2e` and CI are green.
- Independent review saved to `docs/reviews/03b-radio-and-video.md`, findings fixed, PR merged with
  the user's OK.
