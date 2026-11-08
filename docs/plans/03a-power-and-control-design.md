# Section 03a — Power and control parts: Design

Agreed design for section 03a. The implementation plan is
[03a-power-and-control.md](03a-power-and-control.md). Branch: `feat/power-and-control`.

## Goal

Add the lessons and 3D parts for the **ESC**, **flight controller** and **battery**, so a beginner
can name each one, say what it does, read its numbers and explain what it connects to (the success
test in `PRODUCT.md`). The ESC and flight controller sit inside the frame, so selecting either one
opens the stack as an **exploded view**.

Section 03 was split in two: 03a (power and control: ESC, FC, battery) and 03b (radio and video:
receiver, camera, VTX and antennas, extras). 03a also settles how parts inside the frame are shown,
before 03b adds more of them.

## Not in this section

- Wires between parts and the animated control, power and video paths (section 05, simulator).
- The battery voltage-sag slider (section 05).
- Labels, dimension lines or callouts on the 3D parts (02b).
- Part URLs, next/previous, progress (02c).
- The capacitor and XT60 as separately selectable parts: they are drawn as part of the ESC and
  the battery, and explained in those lessons.
- The battery strap (03b, extras).
- A manual "open the stack" control: the stack opens only when a stack part is selected.

## Parts, spec and lessons

### Part list

`PART_IDS` becomes `frame, motors, props, esc, fc, battery`, in that order. Labels: Frame, Motors,
Propellers, ESC, Flight controller, Battery (in `src/content/ui.ts`).

### Spec

New fields in `DroneSpec` (`src/shared/domain/drone-spec.ts`), values from the scope's reference
drone. Lessons compute their numbers from these fields, never from literals.

| Group     | Field                                         | Reference value | Notes                                                      |
| --------- | --------------------------------------------- | --------------- | ---------------------------------------------------------- |
| `esc`     | `layout`                                      | `'4-in-1'`      |                                                            |
|           | `currentPerMotorA`                            | 55              | Continuous rating per motor.                               |
|           | `protocol`                                    | `'DShot600'`    | FC → ESC signal.                                           |
|           | `boardSizeMm`                                 | 41              | Square board on the 30.5 mm mount (model only).            |
|           | `capacitorUf`, `capacitorV`                   | 1000, 35        | Low-ESR capacitor on the battery pads, rated above 25.2 V. |
| `fc`      | `processor`                                   | `'F7'`          | F4 / F7 / H7 explained in the lesson.                      |
|           | `firmware`                                    | `'Betaflight'`  |                                                            |
|           | `uarts`                                       | 6               | Serial ports for receiver, VTX, GPS.                       |
|           | `becVolts`                                    | `[5, 10]`       | Onboard regulator outputs.                                 |
|           | `boardSizeMm`                                 | 36              | Model only.                                                |
| `battery` | `capacityMah`                                 | 1100            |                                                            |
|           | `cRating`                                     | 100             | Label value; lesson says labels are often exaggerated.     |
|           | `connector`                                   | `'XT60'`        |                                                            |
|           | `packLengthMm`, `packWidthMm`, `packHeightMm` | 75, 35, 38      | Model only.                                                |

- The stack mount stays one value, `frame.stackMountMm` (30.5); ESC and FC read it from there.
- The cell count stays one value, `motor.batteryCells` (6); the battery reads it from there.
- Per-cell voltages become named constants in the domain (`src/shared/domain/lipo.ts`): nominal
  3.7 V, full 4.2 V, storage 3.8 V, empty under load about 3.5 V, minimum resting 3.3 V. The motors
  lesson's own `FULL_CELL_VOLTS` moves there.

### Lessons

Three new files in `src/content/lessons/` (`esc.ts`, `fc.ts`, `battery.ts`), using the existing
`Lesson` type and the four questions, written from scope sections 2.4–2.6 in the existing plain
voice. Every term is explained the first time it is used.

- **ESC:** turns the FC's "spin at X %" into high-current three-phase power; 4-in-1 board under the
  FC; current rating per motor; its own processor and firmware (BLHeli_S, Bluejay, AM32 named as
  examples, not recommendations); sensorless back-EMF; DShot; the battery connects here first,
  through the capacitor.
- **Flight controller:** the brain; gyro (IMU) as the most important sensor; F4/F7/H7;
  Betaflight (INAV and ArduPilot for GPS/autonomous flying); UARTs; BEC; soft-mounted on grommets;
  AIO boards on small drones.
- **Battery:** cells and "S" (6S = 22.2 V nominal, 25.2 V full); key per-cell voltages; capacity;
  C rating; voltage sag; XT60 and balance lead; safety (puffed means retire, never charge
  unattended, charge on a fireproof surface, storage-charge between sessions).

Connections link both ways where both parts exist: battery ↔ ESC, ESC ↔ motors, ESC ↔ FC,
ESC/FC ↔ frame (stack mount), battery ↔ frame (sits on the top plate). Links to parts that come in
03b (receiver, VTX, camera) are plain text for now. The motors lesson's "soldered to the ESC" line
gains its link.

## 3D model

One component per part (ADR 0002), sized from the spec, in `src/features/drone-model/parts/`:

- **Esc:** square board on the stack mount, low above the bottom plate, with blocky components on
  top; a capacitor (cylinder) on two short leads at the back. All one part.
- **Fc:** smaller square board above the ESC on the same four mount points, with grommet rings at
  the holes.
- **Battery:** block lying lengthwise on the top plate, with an XT60 plug at the back.

Each new part gets a fill in `MODEL_COLOR` (`tokens.ts`): dark tones from the existing family, ink
linework, redline only when selected. `tokens.css` mirrors any new CSS-facing tokens.

### Exploded stack

- `STACK_PARTS = ['esc', 'fc']`. Selecting either (from the list or in 3D) opens the stack;
  selecting any other part or clearing the selection closes it.
- Open, the layers separate in order: the ESC lifts a little, the FC more, and the frame's top
  plate (with the battery riding on it) most. Standoffs and the bottom plate stay put. Both stack
  parts produce the same open state, so switching between them does not move anything.
- A pure function `explodedOffsets(spec, open)` returns the lift for `esc`, `fc` and `topPlate`.
  Unit-tested: closed is all zeros; open keeps the order with a clear gap between each layer and
  nothing overlapping.
- Each moving layer eases to its target in `useFrame` with `THREE.MathUtils.damp` (no new
  dependency) and calls `invalidate()` only while still moving (`frameloop="demand"`).
- With `prefers-reduced-motion: reduce` the layers jump straight to their target.
- The camera does not re-fit when the stack opens. Screenshots on phone and desktop confirm the
  open stack stays in view; if it doesn't, the lift gets smaller, the camera does not move.
- Clicking and hovering work as for the existing parts: each new part is one clickable group, and a
  lifted board can be clicked.

To lift the top plate separately, `Frame` renders it in its own group that takes a lift offset;
the battery's position adds the same offset.

## Testing

**Unit (Vitest):** new spec fields and LiPo constants; lesson numbers derived from the spec (e.g.
6S gives 22.2 V nominal and 25.2 V full); every part has a lesson and a label; connections point at
existing parts, with both directions present for the pairs listed above; `explodedOffsets`; new
`MODEL_COLOR` entries and token parity.

**End-to-end (Playwright):** selecting ESC, FC and battery from the list opens the right lesson;
clicking a lifted board in 3D selects it; existing tests that assume three parts are updated; no
page scroll on a phone with six parts. Screenshots of the open stack on phone and desktop are
checked by eye.

## Docs and workflow

- `docs/roadmap.md`: 03 becomes 03a (this section) and 03b (radio and video).
- `PRODUCT.md`: "Built so far" lists the new parts and the exploded stack.
- `docs/architecture/overview.md`: a note on the exploded view and where its offsets live.
- `DESIGN.md` and the surface brief: one line on how the exploded stack looks; UI edits go through
  the impeccable skill.
- Independent review in `docs/reviews/03a-power-and-control.md`, then PR, green CI, merge with the
  user's OK.
