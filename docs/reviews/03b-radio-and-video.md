# Review: section 03b — Radio and video parts

- Branch: feat/radio-and-video · Reviewed commit: e020761 · Date: 2026-11-11

## Summary

The section delivers what the spec and plan promised: spec fields for the receiver, camera, VTX,
strap and extras; five new four-question lessons whose numbers come from the spec; one procedural
component per part; and a rear bay laid out by plain, tested functions (`rear.ts`, plus the
unplanned but well-made `front.ts`). `isInsidePart` replaces `isStackPart`, and the receiver and
VTX open the frame exactly like the stack. All gates are green, including e2e against the Docker
image, and the eleven-row list fits every viewport I measured. Nothing is blocking. There are
three should-fix items. First, the new front three-quarter default view hides the rear bay, so
selecting the receiver shows almost no redline in 3D. Second, the buzzer paragraph says an
FC-powered buzzer starts when the drone loses power. Third, "Band" means two different things in
the VTX spec table. Ready to merge once these are fixed or given a written reason.

## Checks

| Command                                       | Result                                                      |
| --------------------------------------------- | ----------------------------------------------------------- |
| pnpm check                                    | pass (typecheck, lint, format; 21 files, 194 unit tests)    |
| pnpm test:e2e                                 | pass (58 passed, 4 nginx-only tests skipped)                |
| pnpm build                                    | pass (entry 260.5 kB / 83.1 kB gzip; viewer chunk separate) |
| docker build .                                | pass                                                        |
| e2e against the Docker image (`E2E_BASE_URL`) | pass (62 passed)                                            |

I also checked things by hand with Playwright scripts (kept outside the repo) against the Docker
image: the five Review Focus items, canvas screenshots at 1280×720, 900×700 and 390×844 with
nothing, the VTX, the receiver, the camera, the extras and the strap selected, a count of redline
pixels in each, layout measurements at 18 viewports (with and without 40 % longer text), a
click-probe grid over the canvas with the frame closed and open, and keyboard-only use. For
comparison I built `main` in a temporary worktree. I stopped the container, removed the image and
the worktree afterwards.

## Review Focus results

1. **Rear-bay parts selected while the frame is open:** verified. At 1280×720 I selected the VTX,
   waited for a still picture, then selected the receiver. Five canvas samples taken 40 ms apart
   right after the switch were all pixel-identical to the settled picture, so nothing moves (only
   the redline changes part). Selecting the camera next settled pixel-identical to selecting the
   camera on a fresh page, so the frame closes. `isInsidePart` is unit-tested for all four inside
   parts and for camera, battery, strap, extras, frame and `null`.
2. **Overlapping geometry in the rear bay:** verified by the box test and by hand. I recomputed the
   boxes from the spec. The VTX, receiver, capacitor, ESC board and rear standoffs are 0.5 to 1 mm
   apart, which is tight but tested. Both antennas and the GPS clear the top plate, the XT60 plug
   and the battery. The VTX antenna passes 3 mm under the receiver's rear edge. The click probe
   never selected the wrong part. One intersection exists outside the rear bay: the tilted camera
   dips into the bottom plate (finding 4).
3. **Camera framing with antennas:** verified at 1280×720 and 900×700. No ink pixel touches the
   canvas edge in any of the six selection states. The antennas and the GPS fall inside the existing
   extents (prop discs and battery top), so the fit only grew by the 1 mm pad. At 390×844 a prop
   blade touches the right edge. That is pre-existing: `main` touches the left edge at the same
   size (finding 12).
4. **11 rows at 320 px and 900–1100 × 700:** verified. No vertical or horizontal page scroll, and no
   overflowing row, column heading or title-block cell at 320×568, 320×640, 390×844, 600×900,
   768×1024, 897/900/960/1000/1100/1150/1200×700, 1024×768, 1280×720, 1280×800, 1366×768,
   1440×900 or 1920×1080, with normal and 40 % longer text. Three columns at 1280×720 (canvas
   319 px, up from 237 px with two). Two columns in the 897–1200 × 700 band (canvas 217 px, 194 px
   with longer text).
5. **Lesson links to parts that now exist:** verified. The new test passes for all eleven lessons,
   and in the browser the receiver lesson links to the flight controller and the frame. Its
   allowlist is reasoned. The test only matches part labels, so it can't see one-way links that
   name no label. The extras → frame link has no way back (finding 7).

**Keyboard:** verified. Tab runs Frame, Motors … Receiver, Camera, VTX in item order (DOM order
matches the column-first fill). Enter on VTX opens its lesson and the frame. Escape restores a
canvas pixel-identical to the closed drone and returns focus to the VTX row.

## Rulings in progress.md

- **Tasks 2–6 briefs taken from the table; parts order updated per task:** sound.
- **Task 6, `INCIDENTAL` allowlist (fc → battery, battery → motors):** sound. Those are mentions,
  not wiring. Linking them would teach the wrong connection.
- **Task 6, FC on-screen-text line links the camera:** sound.
- **Task 7, `rearBay` returns antenna start/tip/bar ends and a GPS post box:** sound. The extents
  and the components need them.
- **Task 7, capacitor at x = 8 and receiver at x = −7:** sound. The plan's values overlapped the
  standoffs, and the test caught it.
- **Task 7, e2e fallout handled early:** sound. It also means the e2e suite was probably red
  between 4e63af1 and 8129d40 (not verified). git.md only requires `pnpm check` per commit.
- **Task 7, camera "Sizes" row dropped, GPS value "4 systems":** sound. The widths and the system
  names moved into the meanings, and tests pin them.
- **Task 7, three-column list (the user's decision):** a good result. See focus item 4. Rows are
  2.5rem (40 px) with a fine pointer, which is still well above the 24 px WCAG 2.2 minimum. Touch
  keeps 48 px.
- **Task 8, `front.ts` and `Rod`:** sound and in the spirit of the architecture rules. The test
  checks the camera's top but not its bottom (finding 4).
- **Task 8, default camera on the front three-quarter:** it shows the new FPV camera, but it hides
  the rear bay that this section adds (finding 1). The trade-off needs another look.
- **Task 9, no 3D click test on the VTX or receiver:** I agree that a test at today's hit spots
  would be flaky. My probe at 0.02 steps found 2 VTX cells and 2 receiver cells out of 644 with the
  frame open, and none with it closed. That is a symptom of finding 1, not just a testing problem.
  Once the parts are visible, a click test becomes practical.

## Findings

| #   | Severity   | Area                                                                                      | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Resolution |
| --- | ---------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | should-fix | src/features/drone-viewer/DroneViewer.tsx:32; src/features/drone-model/rear.ts            | **The default view hides the rear bay, so selecting the receiver gives almost no feedback in 3D.** Since the camera moved to the front three-quarter, the camera, its plates and the lifted ESC/FC sit between the viewer and the rear bay. Measured on 2× screenshots (reddish pixels): receiver 9–12 device pixels at 1280×720, 900×700 and 390×844 (about 3 CSS px², only a sliver of the T antenna). VTX 110–300 (a small patch under the lifted boards plus the antenna head). Extras 15 at 900×700 (only the LED strip; the GPS is behind the battery). Camera 786, strap 2950 for comparison. Task 8 Step 4 asked that "rear parts are visible and redline when the frame is open". A beginner who picks Receiver from the list sees the frame open but can't see what was selected. The same occlusion makes the VTX and receiver nearly unclickable (see the Task 9 ruling). Options: a default angle that shows both ends (e.g. more from the side and higher), placing the receiver where the lifted boards don't cover it, or lifting the rear bay a little when it is selected. Then add the planned `openVtx` click test. |            |
| 2   | should-fix | src/content/lessons/extras.ts:17                                                          | **The buzzer "starts by itself when the drone loses power": wrong for this drone's buzzer.** The spec and the Buzzer row say it runs from the flight controller's 5 V pad, so it goes silent when the battery is lost. An FC-driven buzzer starts by itself when the flight controller loses the radio signal (for example, after a crash when you switch the radio off), or when you switch it on from a radio switch. Only self-powered buzzers, which the next sentence describes, beep on power loss. Suggest: "…you switch it on from your radio, or it starts by itself when the flight controller loses the radio signal, and you follow the sound. Some buzzers have their own small battery, so they keep beeping even if the main battery was thrown off."                                                                                                                                                                                                                                                                                                                                                                    |            |
| 3   | should-fix | src/content/lessons/vtx.ts:17, 25; src/content/lessons/receiver.ts:27                     | **"Band" means two things in the VTX lesson.** The first spec row is "Band: 5.8 GHz", and the next is "Channels: 48 (6 × 8)" with the meaning "Bands × channels per band". The text says "The band is split into channels: this VTX offers 6 bands of 8 channels". So a beginner reads that the 5.8 GHz band holds six bands. FPV uses "band" for the lettered channel groups (A, B, E, F, R…), so keep that meaning and rename the frequency rows. For example, label them "Frequency" (5.8 GHz / 2.4 GHz) and write "The 5.8 GHz range is split into channels, grouped in bands: this VTX offers 6 bands of 8 channels…". This matters for the product's success test (reading the part's numbers).                                                                                                                                                                                                                                                                                                                                                                                                                                   |            |
| 4   | nit        | src/features/drone-model/front.ts:5, 15; src/features/drone-model/front.test.ts:27        | **The tilted camera dips about 1.2 mm into the bottom plate.** The centre is at y = 5 + 2 + 9.5 = 16.5 mm. Tilted 30°, the body's rear-bottom edge (local y −9.5, z +9) lands at 16.5 − (9.5 cos 30° + 9 sin 30°) ≈ 3.8 mm, below the plate top at 5 mm. The test checks `centre + reach` against the top plate but not `centre − reach` against `armThicknessMm`. It's hidden inside the plate, so it's only visible as a test gap. Lifting the camera doesn't fix it: a 19 × 19 × 18 mm body tilted 30° is 19 cos 30° + 18 sin 30° ≈ 25.5 mm tall, more than the 25 mm between the plates. Shorten `BODY_DEPTH_MM` (16 mm gives about 24.5 mm) and add the bottom assertion.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |            |
| 5   | nit        | src/content/lessons/receiver.ts:51; src/content/lessons/vtx.ts:52                         | **Two connection lines blur signal and power wires.** "It plugs into one of the flight controller's UARTs, which also powers it" reads as if the UART powers the receiver (power comes from a 5 V pad beside it). "It plugs into a UART … which sets its channel and power and passes on the camera's video" can read as if the video travels over the UART. Suggest "It plugs into one of the flight controller's UARTs and takes 5 V from a pad beside it." and "Its control wire plugs into a UART, so the flight controller can set its channel and power; its video wire brings the camera's picture, with the on-screen text added."                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |            |
| 6   | nit        | src/content/lessons/vtx.ts:18                                                             | **The EU limit covers frequencies as well as power.** The licence-free 25 mW allowance in the EU applies to 5725–5875 MHz. Several of the 48 analog channels (e.g. the low RaceBand and E-band channels, and the L band) fall outside it. A beginner could read the lesson as "any channel at 25 mW is legal". One clause would fix it: "…in much of the EU it is 25 mW, and only on some of the channels." The scope only asks for the power limit, so this is optional.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |            |
| 7   | nit        | src/content/lessons/extras.ts:48; src/content/lessons/frame.ts                            | **Extras → frame is a one-way link.** The extras lesson links the frame ("GPS sits on a small mount at the back of the frame…"), but the frame lesson never mentions or links the extras. The `PAIRS` list is hand-written, and the label test can't see it because the frame text doesn't name "Extras". (Props → frame is also one-way, from before this section.) Add a frame line for the GPS mount, buzzer and LEDs, or a generic test that every `partId` link has a link back.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |            |
| 8   | nit        | src/features/drone-model/parts/Extras.tsx:16-60; src/features/drone-model/parts/Strap.tsx | **Extras and strap geometry stayed in the components.** The buzzer, LED-strip and band positions are computed inline (arm directions, angles, LED spacing), while the rear bay and camera moved into tested pure functions. Nothing checks, for example, that the buzzer and LED strip stay on the arm and clear of each other and the VTX (I computed that they do). Moving them into `rear.ts` (or an `extras.ts`) would follow the "logic out of components" rule and let the overlap test cover them.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |            |
| 9   | nit        | src/shared/domain/quantity.test.ts:24                                                     | **The battery assertion ended up in the extras test.** "counts the extras: GPS, buzzer and two LED strips" also asserts that there is one battery. Move that line back to the "counts one battery, …" test above.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |            |
| 10  | nit        | docs/plans/03b-radio-and-video-design.md:36, 103; docs/architecture/overview.md:37        | **Docs lag the rulings.** The design doc still says "6 rows per column in the two-column list" and "buzzer on the bottom plate" (it sits on the rear-left arm). It doesn't mention `front.ts`, the three-column list or the front three-quarter view. In 03a the design doc was updated for a similar deviation. `overview.md:37` is one unwrapped line of about 130 characters (Prettier preserves prose, so `pnpm check` doesn't flag it).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |            |
| 11  | nit        | src/features/drone-model/extents.test.ts:24                                               | **The extents test got weaker.** "runs from the bottom of the frame to the highest closed part" changed from `toBe(max(battery, prop))` to `toBeGreaterThanOrEqual`. It no longer catches extents that grow too large (which would shrink the drone in the view). Assert the exact max of battery top, prop top, GPS top and antenna points instead.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |            |
| 12  | nit        | src/features/drone-viewer/DroneViewer.tsx                                                 | **On a 390 px phone a prop blade touches the canvas edge.** With nothing selected at 390×844, ink reaches the right edge of the canvas. `main` touches the left edge at the same size, so this is pre-existing and probably comes from fitting the square extents into a tall canvas. Recorded for 02b ("drone fills the drawing field").                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |            |

## Strengths

- **One truth for the numbers:** every value in the five lessons comes from `DroneSpec` or
  `CAMERA_SIZE_CLASS_MM`. Spec tests pin the physical rules (the VTX setting is one of its levels,
  the camera width matches its class, channels are bands × channels). The polarization wording is
  derived from the spec, so LHCP would read correctly.
- **Content:** the plain voice holds, every new term is explained on first use (the jargon test
  covers ELRS, CRSF, telemetry, failsafe, latency, mW, RHCP, OSD, GPS Rescue), and DJI, Walksnail,
  HDZero and OpenIPC are named only as examples. Checked against the scope and FPV practice:
  ExpressLRS on 2.4 GHz with a 900 MHz long-range variant, binding with a bind phrase, CRSF over a
  UART, telemetry, failsafe drop vs GPS Rescue, carbon blocking RF, camera widths (28/21/19/14 mm)
  and the 25–45° tilt, analog OSD added by the FC, RHCP matching, "never power a VTX without its
  antenna", 25 mW in much of the EU, the strap and pad, the four GNSS systems, the satellite-fix
  wait, and addressable LEDs. Apart from findings 2, 3, 5 and 6, all of it is correct for
  beginners.
- **Layout as tested functions:** `rearBay`, `cameraPlacement`, `cameraPlates` and `boxesOverlap`
  are pure and tested. The overlap test caught two plan values that would have collided, and the
  extents now include the antennas and the GPS.
- **Selection model:** the four inside parts share one open state, so switching between them moves
  nothing. The strap and the GPS ride with the top plate, and the rear bay stays put. Verified
  pixel for pixel.
- **Parts list:** still one `<ul>` in item order with `aria-hidden` duplicate headings. The column
  split is pure CSS driven by two data attributes, and it measured clean everywhere.
- **Commits:** clean Conventional Commits, one logical change each. The two unplanned visible
  changes (three columns, front view) explain why in their bodies.

## Declined to judge

- Failsafe timing: the receiver lesson says the motors stop and it drops. Betaflight first holds for
  a short guard time before dropping. The scope uses the same simplification, so I left it.
- Whether the 897–1200 × 700 band should also get three columns (canvas 217 px there): this is the
  user's threshold decision, and nothing overflows or scrolls.
- 40 px rows on touch-capable laptops that report a fine primary pointer: within WCAG 2.2 AA, and
  a design choice.
- Visual quality of the new procedural shapes: I only judged them from screenshots. They read as a
  drawing and the camera sits between its plates.
- The receiver antenna stands on the right-rear standoff while the board sits on the left. There is
  no visible coax, but wires belong to section 05.
- Whether every intermediate commit passes `pnpm test:e2e`: git.md only requires `pnpm check`.
- Real-device touch and GPU performance: only checked in headless Chromium.
