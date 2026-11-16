# Review: section 05c — What if

- Branch: `feat/what-if` · Reviewed commit: `94ac761e0f97ca370828d78b82acf9690c24d1a4` · Date: 2026-11-16
- Compared with `09ba3ad15fcdc8c9601954dd8877e5fc8e9f1dad` (main); ten commits. Independent review of the supplied whole-branch diff, binding design, implementation plan and all 15 executor rulings. Read `CLAUDE.md` first, the architecture rules, and the 05b design, plan and review. No implementation changes made.

## Summary

**Request changes.** The four mistakes have the intended causes, the teaching text agrees with the linked lessons, and the fault/reset/step lifecycle is sound in the exercised cases. All available automated checks passed. Three Important findings affect the drawing at enlarged phone text, elapsed-time handling on slow frames, and accessible feedback. Three Minor findings concern controls after viewer failure, ground contact and identifying the faulty VTX. No Critical finding was established.

## Checks

| Command                                                                | Result                                                                                                                           |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`                                                           | Passed: typecheck, lint, formatting and 685 tests in 64 files. The three.js CommonJS deprecation notices did not fail the run.   |
| `pnpm build`                                                           | Passed: TypeScript and Vite production build. Entry JavaScript: 324.08 kB; separate viewer chunk: 987.12 kB, before compression. |
| `pnpm test:e2e --workers=2 --output=/tmp/codex-review-05c/e2e-results` | Passed: 143 tests, five Docker-only tests skipped, 3.3 minutes. All eight what-if tests passed.                                  |
| `docker build .`                                                       | Not run: there is no Docker in this sandbox. Docker-image acceptance and nginx behaviour were not independently verified.        |

Every direct Node/pnpm command used `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
Logs, browser scripts, screenshots, generated comparison modules and measurements are under
`/tmp/codex-review-05c`. Principal evidence: `check.log`, `build.log`, `e2e.log`,
`browser-results.json`, `edge-results.json`, `timing-fallback.json`, `model-compare.json`,
`drawing-focus.json` and `phone-reading.json`. Chromium probes used the Vite dev app with
StrictMode; the e2e suite used the production preview. The review report is the only repository
file changed. The dev server and Playwright preview are stopped; ports 5187 and 4173 were
verified closed (`servers.json`).

## Review Focus

| Failure mode from the plan        | Verified result                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Reset at any moment            | Passed the exercised cases. Independent store probes and clicks on the real panel reset during the failsafe guard, during a genuine fall (`onGround=false`, positive fall speed), on the ground and with a damaged VTX. State returns to identity attitude, hover height/throttle, armed, centred sticks, Link OK, 6S and no heat/faults. The drawing wakes and then settles. Code also cancels any running demo through the user-input listeners.                 |
| 2. A long frame during a fall     | **Fails the landing requirement: finding 2.** After 65 frames at 60 Hz with link lost, height is −0.035826 m and the drone is falling. One `stepFlight(..., 5, ...)` reaches only −0.062909 m, still airborne, rather than `GROUND_M` (−0.12 m). It remains finite and never goes below the ground. The committed test starts at 2 seconds, after landing, so it does not exercise this failure mode. The rig further replaces a five-second gap with 1/60 second. |
| 3. Change step while a fault runs | Passed. Browser probes changed away from a lost link, wrong prop and heating VTX. Each destination starts level, armed, with centred sticks, 6S, no fault and no heat; the gauge hides. `useWhatIfSheet` resets in the previous step effect's cleanup. The battery switch changes cells within its own step. Clicking another mistake never leaves two faults active.                                                                                              |
| 4. Faults never leak into moves   | Passed. Each hook owns a separate flight. Switching from 4S to moves produced `NO_FAULTS`, hover and identity attitude. Leaving a running VTX fault disposed the old store; explicit subsequent advances and fault writes to that store had no effect. Browser Back created a fresh healthy flight.                                                                                                                                                                |
| 5. Sticks during failsafe         | Passed. The browser suite moves Roll to “100 % right” while no motor is driven harder, then observes four zero readouts and a working Reset. Model code replaces all radio axes and throttle with safe values while the link is lost; disarm is latched until reset, including if the link returns. Grounded state ignores subsequent motion commands.                                                                                                             |

## Content, drawing and accessibility

Failsafe is presented as a deliberate stop, with re-arming required and a brief GPS Rescue
alternative. The simplified one-second guard follows the agreed design. It should be understood
as this sheet's example, rather than an exact firmware default: Betaflight documents signal
validation, configurable fallback values and guard duration, and recovery before disarm.
The central stop/re-arm explanation agrees with its
[failsafe documentation](https://betaflight.com/docs/wiki/guides/current/Failsafe).

The prop step distinguishes a prop made for the other rotation direction from a correctly
handed prop installed upside down; the props lesson was tightened consistently. Motor 2 is the
front-right CCW motor, its rotation arrow is unchanged, and its reversed thrust adds positive
roll and pitch. The controller responds by increasing that motor, reaches the authority limit,
and the drone tips and falls. This is model-driven behaviour, rather than a competing animation.
The takeoff/runaway caveat agrees with
[Betaflight's runaway takeoff prevention guide](https://betaflight.com/docs/wiki/guides/current/Runaway-Takeoff-Prevention).

Battery text uses the reference 6S cell count and `lipo.ts` voltages (22.2 V and 14.8 V nominal).
It explains the approximately two-thirds speed ceiling relative to the 6S reference, reduced
turning authority, and why the reverse substitution can overheat motors or exceed electronics'
ratings. This agrees with the battery, motors and ESC lessons. The model scales motor speeds
and the effort ceiling by 4/6, without pretending to calculate current, thrust or temperature.
The text qualifies the reverse electrical-rating risk with “can”; it does not claim every 4S
build has a 4S-only ESC.

VTX text explains reflected power, possible permanent amplifier damage, protection on some
units and the fact that cooling does not repair damage. The caution about variation is justified:
[Team BlackSheep's manufacturer guidance](https://www.team-blacksheep.com/new-support/kb/4000095446/)
describes substantial differences between its transmitters. The 12-second ladder is an
illustration, not a measured failure time for all VTXs. Reset replaces the damaged state;
merely removing a fault flag does not cool or repair it in the model. Identifying the affected
part before damage is weaker than the binding direction: finding 6.

The battery control is a named group with two native toggle buttons and mutually exclusive
`aria-pressed` values. Keyboard Space selected 4S, retained focus, drew a solid focus outline
and changed the status. Try it becomes natively disabled while active; with the viewer loaded,
keyboard activation retained the button as the active element and the next Tab reached Reset.
Step changes update `aria-current` and the polite step announcer. Dynamic fault outcomes lack
equivalent announcements: finding 3. The WebGL fallback preserves all four readable steps but
leaves misleading active simulation controls: finding 4.

Nothing starts automatically on what-if, including after a live reduced-motion preference
change. Explicit Try it remains effective under reduced motion, as the design requires.
At 375 × 667 the drawing and separate sticks remain pinned above the reading area. At
320 × 667 and 200% text, both sticks remain separate, there is no horizontal page overflow,
and independent first/last-character probes could reveal every one of the twelve explanatory
paragraphs below the 354.8 px pinned field. This reading success does not make the drawing
usable: its status, gauge and motor balloons collide (finding 1).

## Architecture and test quality

Flight calculations and the store remain plain TypeScript with no three.js dependency. Runtime
3D files import no `content/` and only types from `features/flight`; ground depth arrives through
the explorer. New cross-feature imports use public indexes. The existing type import from
`drone-viewer/DroneViewer` in `PartExplorer.tsx:10` still breaks the literal index-only rule, but
predates this branch and introduces no runtime dependency. The build preserves the lazy viewer
boundary. There is no new runtime package or external model. New interface strings live in
`content/ui.ts`, and the new colours use existing tokens. Product, surface, architecture, scope
and roadmap documents were updated; the older “Planned” bullet in `PRODUCT.md` still mentions
the now-built moves/what-if work.

The existing 05b model tests were retained. An independent comparison against the actual main
model found 79.128° versus 79.126° roll after one second, and gust-recovery errors of −0.831°
versus −0.841° after three seconds; both settled by four seconds. The held-roll motor split was
effectively identical. A 100,000-step mixed-axis/gust run, including zero, tiny, ordinary,
0.1-second and five-second deltas, kept inspected values finite, speeds within 0.1–1 and
quaternion-length error at or below `3.33e-16`. No meaningful authority-limit regression was
established in these cases. The timing policy still affects both sheets: finding 2.

Demand rendering woke for faults and Reset, and stopped at idle, after landing and after VTX
damage. WebGL draw-call counts stayed unchanged across paired idle samples: 181 initially,
3,620 after failsafe landing, 3,801 after Reset, 5,611 after the prop crash and 32,761 after VTX
damage. No browser page error, surviving route timer or duplicate StrictMode animation loop was
observed. Listener subscriptions have cleanup, disposal is idempotent, and the gauge lookup is
scoped to the viewer's own root. These probes establish bounded activity, not a long-duration
GPU-memory guarantee.

The new tests establish routes/order, content presence, fault mechanisms, basic toggles,
reset, heat milestones and step cleanup. Several acceptance claims exceed their assertions:

- The “long frame during a fall” input is already grounded (`faults.test.ts:63`).
- The browser prop test checks a fault marker and zero motor text, not attitude or contact with
  the ground (`e2e/what-if.spec.ts:51`). The failsafe test similarly does not establish landing.
- The 4S browser test accepts any maximum ≤70, including stale hover readouts, zero or an empty
  readout list; it does not require four readings near 67 (`e2e/what-if.spec.ts:66`). The unit
  test provides the stronger speed-ratio check.
- Reflow checks paragraph visibility and stick separation, but never the status/gauge/readout
  collisions. The fallback component test never asserts Try it or Reset are unavailable.
- Status tests check text after updates, not live semantics or announcements. The store reset
  test combines grounded/damaged faults in one case; the independent probes supplied the
  missing mid-guard and mid-fall cases.

## Rulings

Each `Ruling:` in `.superpowers/sdd/05c-what-if/progress.md` was weighed separately:

| #   | Ledger line / ruling                                                    | Verdict and reason                                                                                                                                                                                                                                        |
| --- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 4 — slow the fall to 2 m/s², cap at 1 m/s, initially use 0.2 m depth    | **Stands.** The design leaves fall constants to the builder; a visible slowed drop is appropriate. The provisional depth was subsequently replaced by ruling 9.                                                                                           |
| 2   | 5 — only a wrong-prop inversion triggers falling                        | **Stands.** This preserves 05b's explicit rotation-only behaviour, including intentional inverted flight, while the mistake can crash.                                                                                                                    |
| 3   | 6 — continue falling until landing                                      | **Stands.** Positive fall speed latches descent, so passing upright mid-tumble cannot cancel the crash. Reset clears it.                                                                                                                                  |
| 4   | 7 — check unsettled falling state at 1.2 s                              | **Stands.** This time is genuinely during the fall with the final constants. It does not repair the separate long-frame test that starts at 2 s.                                                                                                          |
| 5   | 10 — pass ground depth as a prop                                        | **Stands.** It keeps runtime flight imports out of 3D code and uses the model's actual datum.                                                                                                                                                             |
| 6   | 11 — find the VTX gauge through a callback and scoped DOM query         | **Stands.** The lookup stays within this viewer, tolerates absent/unmounted elements and adds no timer or independent render loop.                                                                                                                        |
| 7   | 12 — defer the visual look until the sheet is wired                     | **Stands as sequencing.** Integration is necessary for a meaningful look. It does not establish that the final enlarged-text drawing passed acceptance.                                                                                                   |
| 8   | 14 — draw a hairline ground square                                      | **Stands.** It is a restrained perspective datum consistent with the drawing sheet. Ground-contact correctness is a separate problem (finding 5), not a reason to reject the square itself.                                                               |
| 9   | 15 — restore 0.12 m fall depth                                          | **Stands.** It is within the builder's framing choices and leaves a visible drop. The model and viewer receive the same value.                                                                                                                            |
| 10  | 16 — disable Try it while active; use a battery switch instead          | **Stands.** It prevents repeated activation and preserves Reset as the way back; the battery exception is explicit in the design. Viewer failure still needs to disable the whole simulation control surface (finding 4).                                 |
| 11  | 17 — accept the small phone drone inherited from moves                  | **Does not stand as acceptance of the final phone drawing.** A smaller fitted model is a legitimate tradeoff, but status/readout overlap prevents using it at the required 320 px/200% text size (finding 1).                                             |
| 12  | 18 — key shared flight CSS on `data-flight`                             | **Stands.** It consistently applies the same pinned layout to both flight sheets without changing the moves selectors' intended reach.                                                                                                                    |
| 13  | 20 — use 12 s rather than 30 s for illustrative VTX damage              | **Stands.** Damage time is a builder constant, and the copy acknowledges variation/protection. This is not a measured thermal model. Elapsed-time handling must still deliver the chosen illustration consistently (finding 2).                           |
| 14  | 21 — wait in real time for the VTX e2e                                  | **Stands.** The test observes real rendered milestones and passed. A roughly 14-second case is reasonable evidence after the attempted fake-clock approach failed; it does not verify slow-frame timing.                                                  |
| 15  | 22 — step real elapsed time, treating only gaps over 0.25 s as wake-ups | **Does not stand as implemented.** The model still discards time above 0.1 s, and the rig cannot infer rest from a delta threshold. A slow active frame over 0.25 s becomes 1/60 s; the throttled browser demonstrated a twentyfold slowdown (finding 2). |

## Findings

Severity reflects shipped user impact. **Important** findings should be fixed before merging;
**Minor** findings affect degraded behaviour or the clarity of the drawing. No Critical finding
was found. Resolution entries are intentionally left open.

| #   | Severity  | Area                                                                                                                                                   | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Resolution                                                                                                                                                                                                                                                                                                                                     |
| --- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Important | `src/styles/global.css:286`; `src/styles/global.css:1562`; `src/features/drone-viewer/FlightRig.tsx:77`                                                | **At 320 px and 200% text, status, gauge and motor readouts obscure one another and the drone.** On `/what-if/4` at 320 × 667, the drawing viewport is 238 × 92 px, the wrapped status occupies 85.3 px of its height, and each of the four motor balloons is 126 × 50 px. The balloons overlap; the heat gauge crosses them and the status. The drawing is unreadable even though the sticks remain separate and the paragraphs reflow. Status and gauge boxes are absent from the motor-pin avoidance list, and the available area is insufficient for the enlarged balloons even with a better search. The 800 px-tall case also collides. **Suggested fix:** allocate separate readable space for status and motor values, adapt the pinned drawing to the actual enlarged text dimensions, and include the gauge/status in placement constraints. Preserve room to read below it. Assert legible, disjoint indicators at both phone heights with an active fault. Evidence: `phone-320-667-200%.png`, `phone-320-800-200%.png`, `browser-results.json`.                                      | Fixed in `204380f`: on phones the stick band and the drawing's labels are sized in px, the balloons avoid the status line and the VTX gauge and fall back to the spot that covers least. e2e “at 320 × 667 with 200 % text the drawing’s labels don’t cover one another”; motor-pins “when nothing is free, takes the spot that covers least”. |
| 2   | Important | `src/features/drone-viewer/FlightRig.tsx:67`; `src/features/flight/model.ts:256`; `src/features/flight/faults.test.ts:63`                              | **Slow active frames are mistaken for idle wake-ups, and elapsed fault time is discarded.** The rig replaces every gap over 0.25 s with 1/60 s, including a continuously running slow device; the model additionally caps every call at 0.1 s. In a browser with 300 ms frame delays, 2.411 seconds advanced VTX heating by only 0.117 seconds. At that pace the nominal 12-second example takes roughly four minutes, and the failsafe guard/turns also slow drastically. At 150 ms delays, 2.496 seconds advanced only 1.417 seconds. A genuine mid-fall five-second model call fails to land, as detailed in Review Focus; the committed test misses it because it starts grounded. **Suggested fix:** track actual resting/waking state separately from slow active frames, preserve elapsed fault/fall time with bounded integration or analytic updates, and retain safe rotational substeps. Add real mid-fall and multiple-frame-rate tests, including the rig, and verify both sheets after an idle wake. Evidence: `timing-fallback.json`, `browser-results.json`, `edge-results.json`. | Fixed in `0a40436`: the rig tracks when the canvas went to rest, so only the first frame after a rest is short; slow running frames keep their time (model cap 0.5 s). Tests: flight-frame `frameStep`; faults “advance by the full time of a slow frame”; the long-frame landing test now starts mid-fall.                                    |
| 3   | Important | `src/features/flight/FlightStatus.tsx:23`; `src/features/flight/FlightStatus.tsx:29`; `src/features/part-explorer/WhatIfPanel.tsx:191`                 | **Trying a mistake provides no announced outcome for screen-reader users.** The dynamic status is an ordinary paragraph with no live semantics; the polite region announces only step changes. Try it leaves the step unchanged, so Link lost, Warm, Hot, Damaged and Reset's recovery are silent. The canvas, motor balloons and gauge are hidden from assistive technology. Failsafe disarming/landing and the prop crash are not represented in accessible status at all: its snapshot watches only link/cells/heat. A learner can read the predicted consequence but cannot follow the running experiment. **Suggested fix:** provide polite, atomic, discrete outcome announcements for activation, disarm/landing, heat milestones and Reset, with an accessible current state. Keep frame-by-frame numbers out of live regions. Test the actual outcome sequence and live semantics. Evidence: `edge-results.json` (`liveRegions`), `browser-results.json` (`vtx.aria`), source inspection.                                                                                                | Fixed in `c6cd324`: a polite live region announces link lost, wrong prop, battery, disarmed, on the ground, VTX heat levels and Reset. Test: FlightStatus “tells assistive technology what happens”.                                                                                                                                           |
| 4   | Minor     | `src/features/part-explorer/PartExplorer.tsx:335`; `src/features/part-explorer/PartExplorer.tsx:371`; `src/features/part-explorer/WhatIfPanel.tsx:118` | **Simulation controls remain active after the 3D viewer fails.** With Chromium WebGL disabled, the normal fallback appears and sticks/status disappear, but Try it and Reset remain enabled. Try it changes the hidden store and disables itself without any simulation or feedback; the battery toggle likewise changes a flight that cannot advance. The panel receives the live flight regardless of the error boundary's state, and even a null flight would not disable its controls. This contradicts design decision 12 and gives users nonworking actions in the supported fallback. **Suggested fix:** propagate viewer availability to the panel and hide or disable all simulation-only controls while retaining step navigation and reading. Test actual fallback interactions. Evidence: `timing-fallback.json` (`fallback`), `fallback.png`.                                                                                                                                                                                                                                        | Deferred (Minor): controls stay enabled only when WebGL has failed; recorded for later.                                                                                                                                                                                                                                                        |
| 5   | Minor     | `src/features/drone-viewer/vtx-gauge.ts:26`; `src/features/drone-viewer/FlightRig.tsx:183`; `src/features/flight/model.ts:215`                         | **A flipped drone comes to rest through the ground plane.** Ground height is derived from the upright bottom, while landing clamps the body's translation to the same value regardless of attitude. After the normal motor-2 mistake, actual model geometry extends to y=−0.2493 m while the ground square is at y=−0.12 m: about 13 cm of the drawing is below its floor. The user sees the floor cut through the stopped, tilted quad, rather than the crash resting on it. The unit framing test only establishes containment, and zero motor text in e2e cannot establish contact. **Suggested fix:** derive a simple contact offset from the posed closed outline so its lowest point meets the fixed ground datum, keeping the crash attitude and camera fit. A physics engine is unnecessary. Verify upright and flipped contacts in the rendered scene. Evidence: `prop-desktop.png`, `drawing-focus.json` (`geometry`).                                                                                                                                                                  | Fixed in `0a40436` (re-graded Important: everyone trying the prop step sees it): the drawn height lifts the crashed drone so its lowest outline point rests on the floor. Test: flight-frame `restingLift`.                                                                                                                                    |
| 6   | Minor     | `src/features/part-explorer/PartExplorer.tsx:95`; `src/features/drone-viewer/FlightRig.tsx:111`; `src/styles/global.css:397`                           | **The faulty VTX is not marked as the current mistake while it heats.** The flight drawing always passes an empty selected-part set. Try it adds an unlabelled, neutral-coloured gauge; its redline appears only at Damaged. During Warm and Hot, a beginner sees a small grey gauge among the frame/battery lines without the binding design's redline identification of the affected VTX. This uses redline as a damage threshold rather than consistently identifying the current fault from activation. **Suggested fix:** mark the VTX or its clearly identified anchored indicator as the current fault as soon as Try it activates it, retaining words/segments for heat severity. Clear that selection on Reset/step change, and test it before damage. Evidence: `FlightRig.tsx`, the empty `FLIGHT_DRAWING.openParts`, and the gauge CSS.                                                                                                                                                                                                                                               | Fixed in `204380f` (re-graded Important: design decision 7): the VTX gauge is redline from the moment it appears. e2e “the VTX is marked as the current mistake from the moment it is tried”.                                                                                                                                                  |

## Declined to judge

- Docker/nginx execution, Docker-image e2e and remote CI. The executor's Docker claim was not
  independently reproduced in this sandbox.
- Actual screen-reader speech, physical touch/OS focus behaviour and non-Chromium browsers.
  Accessibility conclusions use markup, Chromium's accessibility tree and keyboard probes.
- Long-duration GPU/heap profiling and performance on particular phones. Frame delays were
  deliberately injected to establish timing behaviour, not measured on physical hardware.
- Decimal-accurate aerodynamics, electrical current, RF temperatures, universal VTX damage times
  and firmware tuning. This review judged the agreed teaching mechanisms and their honest
  qualifications, rather than treating the illustrative model as a physical simulator.

## Resolutions (executor, 2026-11-16)

Findings 1, 2, 3, 5 and 6 were fixed in one pass, each with a test that failed first (5 and 6
re-graded Important by what every user sees): `0a40436` (2, 5), `c6cd324` (3), `204380f` (1, 6).
Finding 4 is deferred as Minor. After the pass: `pnpm check` 692 tests passed; `pnpm test:e2e`
145 passed; Docker image e2e (`E2E_BASE_URL=http://localhost:8089`) 150 passed.
