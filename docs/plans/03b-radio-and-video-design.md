# Section 03b — Radio and video parts: Design

Agreed design for section 03b. The implementation plan is
[03b-radio-and-video.md](03b-radio-and-video.md). Branch: `feat/radio-and-video`.

## Goal

Add the lessons and 3D parts for the **receiver**, **camera**, **VTX** (video transmitter, with its
antenna), **battery strap** and **extras** (GPS, buzzer, LEDs). This completes Module 2: a beginner
can name every part of the reference drone, say what it does, read its numbers and explain what it
connects to (the success test in `PRODUCT.md`).

## Decisions

- **Analog video.** The reference drone has a separate analog camera and VTX on 5.8 GHz. The
  lessons explain digital systems (DJI, Walksnail, HDZero, OpenIPC named as examples, not
  recommendations) as the sharper, more expensive alternative.
- **Extras.** The battery strap and pad are their own part (every 5" has them). GPS, buzzer and LEDs
  are one "Extras" part with one lesson.
- **Antennas** are drawn as part of the VTX and the receiver, not as separate parts.
- **Rear parts open the frame.** The VTX and receiver sit under the top plate, so selecting either
  opens the frame like the stack does.

## Not in this section

- Wires, animated paths, the "what if" mode (section 05).
- Labels, dimension lines or callouts in 3D (02b).
- Part URLs, next/previous, progress (02c).
- The radio and goggles on the pilot's side (section 06).

## Parts, spec and lessons

### Part list

`PART_IDS` becomes, in this order: `frame, motors, props, esc, fc, battery, strap, receiver,
camera, vtx, extras` (11 parts, 6 rows per column in the two-column list). Labels: Frame, Motors,
Propellers, ESC, Flight controller, Battery, Battery strap, Receiver, Camera, VTX, Extras.

### Spec

New fields in `DroneSpec`. Lessons compute their numbers from them.

| Group      | Field                      | Reference value                           | Notes                                           |
| ---------- | -------------------------- | ----------------------------------------- | ----------------------------------------------- |
| `receiver` | `system`                   | `'ExpressLRS'`                            |                                                 |
|            | `frequencyGhz`             | 2.4                                       |                                                 |
|            | `protocol`                 | `'CRSF'`                                  | Receiver → FC serial protocol.                  |
|            | `packetRateHz`             | 500                                       | Stick updates per second.                       |
|            | `antenna`                  | `'T dipole'`                              |                                                 |
| `camera`   | `sizeClass`                | `'micro'`                                 | Full 28, mini 21, micro 19, nano 14 mm.         |
|            | `widthMm`                  | 19                                        | Must equal the size class's width.              |
|            | `tiltDeg`                  | 30                                        |                                                 |
|            | `signal`                   | `'analog'`                                |                                                 |
| `vtx`      | `frequencyGhz`             | 5.8                                       |                                                 |
|            | `bands`, `channelsPerBand` | 6, 8                                      | 48 channels.                                    |
|            | `powerLevelsMw`            | `[25, 200, 400, 800]`                     |                                                 |
|            | `powerSettingMw`           | 25                                        | One of the levels; the limit in much of the EU. |
|            | `mountMm`                  | 20                                        | 20 × 20 mm.                                     |
|            | `antennaPolarization`      | `'RHCP'`                                  |                                                 |
| `strap`    | `widthMm`, `lengthMm`      | 20, 250                                   |                                                 |
| `extras`   | `gpsSystems`               | `['GPS', 'Galileo', 'GLONASS', 'BeiDou']` | Satellite systems the module uses.              |
|            | `buzzerVolts`, `ledVolts`  | 5, 5                                      | Powered from the FC's 5 V pads.                 |
|            | `ledCount`                 | 8                                         | Addressable LEDs on the strip.                  |

Board, puck and body sizes used only for the model live in `src/features/drone-model/dimensions.ts`
or the part component, not in the spec.

### Lessons

New files in `src/content/lessons/`: `receiver.ts`, `camera.ts`, `vtx.ts`, `strap.ts`,
`extras.ts`, written from scope sections 2.7–2.10 in the existing plain voice. Every term is
explained the first time a lesson uses it (ELRS, CRSF, telemetry, failsafe, mW, RHCP, OSD).

- **Receiver:** receives stick commands and passes them to the FC; ExpressLRS on 2.4 GHz
  (900 MHz for long range); binding; CRSF over a UART; telemetry back to the radio; failsafe;
  antenna away from carbon and motors.
- **Camera:** captures the live view; latency matters more than picture quality; size classes;
  tilt angle; separate from an HD action camera.
- **VTX:** sends the camera image to the goggles; analog vs digital; bands and channels (each pilot
  needs their own); power in mW, more range and heat, legal limits vary (25 mW in much of the EU);
  the FC adds the OSD on analog; antenna polarization must match the goggles; never power a VTX
  without its antenna.
- **Battery strap:** holds the battery down; the grippy pad stops it sliding; a lost battery is a
  crash.
- **Extras:** GPS (speed, distance, GPS Rescue), buzzer (finding a crashed drone), LEDs (visibility
  and fun). Each of the four questions covers the three in turn.

Connections link both ways: receiver ↔ FC, VTX ↔ FC, camera ↔ VTX, camera ↔ frame,
strap ↔ battery, strap ↔ frame, extras ↔ FC, receiver ↔ frame, VTX ↔ frame. The FC lesson's
receiver and VTX lines and the frame lesson's camera line gain their links.

## 3D model

One component per part (ADR 0002), sized from the spec:

- **Camera:** a micro body and lens tilted up `tiltDeg`, at the front of the frame between two new
  camera side plates (drawn as part of the frame).
- **VTX:** a 20 × 20 mm board on the bottom plate behind the stack; its antenna leaves the rear and
  angles up and back.
- **Receiver:** a small board at the rear beside the VTX, with a T dipole antenna on a rear standoff.
- **Strap:** a band around the battery and top plate, plus a thin pad under the battery. It lifts
  with the top plate.
- **Extras:** GPS puck on a small rear mount, buzzer on the bottom plate, LED strip on the rear arms.
  Selected together.

Fills come from new `MODEL_COLOR` entries in the existing dark family; redline only for selection.

### Opening the frame

- `STACK_PARTS` becomes `INSIDE_PARTS = ['esc', 'fc', 'receiver', 'vtx']`, and `isStackPart`
  becomes `isInsidePart`. Selecting any inside part opens the frame; anything else closes it.
- The open state is unchanged from 03a (ESC, FC and top plate lifts); the receiver and VTX stay on
  the bottom plate and are uncovered when the top plate lifts.
- `closedExtentsMm` grows to include the antennas and the GPS mount, so the camera fit still
  contains the whole closed drone. Screenshots at 390, 900 and 1280 px confirm it.

## Testing

**Unit:** spec fields (VTX power setting is one of its levels; camera width matches its size
class; channel count is bands × channels); lessons quote spec numbers; new jargon is explained;
connection pairs link both ways; `isInsidePart`; `closedExtentsMm` reaches the antenna tips; colour
tokens.

**End-to-end:** `PART_NAMES` grows to 11, so the list, layout (320 px with 40 % longer text, touch
targets) and lesson loops cover every part; 3D hit points for the camera and for the VTX in the
open frame (one fresh page per point); no page scroll at 900, 1000 and 1100 × 700.

## Docs and workflow

- `docs/roadmap.md`: 03b in progress, then done.
- `PRODUCT.md`: "Built so far" lists every Module 2 part.
- `DESIGN.md` and the surface brief: rear parts open the frame; the camera side plates.
- `docs/architecture/overview.md`: inside parts instead of stack parts.
- Independent review in `docs/reviews/03b-radio-and-video.md`, then PR, green CI, merge with the
  user's OK.
