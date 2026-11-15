# Review: section 05a — Paths

- Branch: `feat/paths` · Reviewed commit: `39d3f2cb681ebe2bf4462c0b032106968fd488ab` · Date: 2026-11-15
- Compared with `fcdd388` (main); nine commits. Independent review against the binding design, implementation plan and all 13 executor rulings. No implementation changes made.

## Summary

The three sheets, reading order, saved progress, navigation and step playback are substantially implemented. Live reduced motion and navigation resets work in the browser, but overlapping balloons hide stop identities and the Power lesson incorrectly turns an ESC rating into motor consumption. Fix those before merging, and address the off-drone presentation and current-link playback issues below.

## Checks

| Command        | Result                                                                                                                                                                                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm check     | Repeat passed: typecheck, lint, formatting; 519 tests in 47 files. Initial concurrent run failed one existing explorer test while waiting for the lazy viewer mock (518 passed); recorded in `check.log`.                                                               |
| pnpm test:e2e  | Repeat passed with `--workers=2`: 114 passed, five Docker-only server tests skipped. Initial default-worker run: 113 passed, five skipped, one 30 s timeout on the final Next link in the 14-sheet navigation test. All eleven path-specific tests passed in both runs. |
| pnpm build     | Passed: TypeScript and Vite production build.                                                                                                                                                                                                                           |
| docker build . | Not run: there is no Docker in this sandbox. Docker-image e2e and CI are unverified.                                                                                                                                                                                    |

Every direct Node/pnpm command used `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
Logs, scripts, screenshots and measurements are under `/tmp/codex-review-05a`. Browser checks used
Chromium against Vite dev and production preview. The review report is the only repository
source/document changed; no branch change or commit was made. Both review servers are stopped;
ports 5185 and 4173 were checked and no longer accept connections.

## Review Focus

| Behaviour                                          | Verified result                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Leave mid-play: another path, a part, Back, Escape | Passed browser checks: switching paths stops play immediately and opens stop 1; waiting beyond the old interval causes no advance. Following Camera into its lesson, returning, and closing with Escape also stop/reset. The hook associates state with its path during render, preventing a previous path's index from reaching a shorter path. Clicking the already-open path is a separate failure: finding 5. |
| Old progress and junk values                       | Passed parser tests for legacy part arrays, malformed JSON, wrong shapes, unknown values and duplicates. Browser-loaded eleven part ids plus `power` and junk: the overview offered Control, counted 12 of 14, and marking Control saved thirteen valid ids in reading order without losing old parts. The same storage key is retained.                                                                          |
| Reduced motion switched on during play             | Passed live browser check: moving dash offsets became zero, remained zero, and the render counter stayed at 132 across two samples. Playback still advanced to the flight controller. The existing camera/lift hooks also consume the live preference.                                                                                                                                                            |
| 390 px marker/end bounds                           | Passed for every step of all three paths at 390 × 900, also 768 × 900 and 1280 × 900: 51 settled views, no marker/label outside the drawing and no horizontal page overflow. Committed tests additionally pass at 390 × 844 and 1280 × 720. Containment does not establish readability: findings 1 and 3.                                                                                                         |
| Back/Forward between path sheets                   | Passed both directions while leaving a playing sheet: the destination heading received focus, stop 1 was current and Play was stopped. Both `path-title-control` and `path-title-video` were observed as the active element.                                                                                                                                                                                      |

## Content, drawing and accessibility

Every one of the 17 stops was compared with its corresponding part lessons and
`REFERENCE_5_INCH`, including the branch topology and multi-part lesson links.

| Path                   | Assessment                                                                                                                                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Control: all six stops | Radio's 500 updates/s, receiver/antenna and CRSF UART, FC/gyro comparison, DShot600, motor response and propeller thrust agree with the lessons. Radio links to Intro as specified.                                           |
| Power: all six stops   | 6S/22.2 V nominal, XT60, 1000 µF capacitor, ESC supplying motors and FC, 5 V/10 V BECs and regulated receiver/camera/VTX power agree with the reference lessons. Stop 4's claimed full-throttle amperage does not: finding 2. |
| Video: all five stops  | Analog camera → FC/OSD → 5.8 GHz VTX → antenna → goggles agrees with the reference build and lessons; channel/power control remains consistent with the VTX lesson. Goggles link to Intro as specified.                       |

Power fan-out is correct. Live scene geometry at stop 3 contained five dashed segments sharing
the ESC source: four motor destinations and the FC, simultaneously. At stop 5 it contained three
segments from the FC to receiver, camera and VTX. Motors have no outgoing segment; power never
passes through them to reach the FC. The pure helper also correctly handles equal-count pairing
and nearest-source selection for unequal counts. The battery's two targets and capacitor-to-ESC
selection follow those rules.

The leader uses the fully open offsets, while the existing `Lift` groups ease separately. Browser
sampling confirmed the initial separation and eventual alignment; software-rendered opening took
longer than the ledger's approximate 200 ms. This is a transient presentation compromise, not a
steady incorrect anchor. The receiver antenna stays on its arm while its board lifts, and its
anchor respects that distinction. No persistent lift/anchor mismatch was found.

The canvas remains `frameloop="demand"`. Each current segment subscribes to frames and invalidates
while motion is allowed; stopping Play intentionally leaves the current dashes moving. There are
at most five current segments on these paths. `ProjectPins` updates DOM transforms on rendered
frames without React state updates or per-pin roots. With reduced motion, renders settled; at
Power's motor branch end without reduced motion, the frame counter also remained 59 across
samples 400 ms apart. Continuous drawing while a current stretch is shown is real rendering work,
as required by the spec, rather than an idle canvas.

The sheet has native buttons and real lesson links, one `aria-current="step"`, a current switcher
link, and a polite live region containing the current stop's name and text. Keyboard Enter moved
the stop and updated the announcement. Tab skipped disabled Previous at the start; Next was
disabled at the end. Heading focus was observed on navigation. Decorative canvas/pins are hidden
from assistive technology, avoiding duplicate stop announcements. Multi-part Power stops expose
every lesson link. The viewer-failure component test preserves the numbered list and links.
These are DOM, accessibility-tree and keyboard checks, not a physical screen-reader trial.

## Plan, rulings and test coverage

The seven tasks have corresponding implementation and documentation. Shared domain/routing
stays independent of content/features; content holds teaching text and topology; model geometry
uses existing layout functions; viewer projection and explorer playback remain in their features.
No dependency or external model was added. PRODUCT, DESIGN, surface brief, architecture overview,
scope split and roadmap were updated; the roadmap correctly says in review. The nine commits have
focused Conventional Commit subjects within the documented length limit.

Each `Ruling:` in `.superpowers/sdd/05a-paths/progress.md` was weighed individually:

- **Line 7 — `anchorPoints` delegates off-drone ends to `endPoint`: agree.** One geometry entry point is appropriate; delegation and tests are present.
- **Line 10 — move end-of-set focus coverage from Extras to Video: agree.** Both Extras → Control and Video → focused overview are covered.
- **Line 12 — progress copy says sheets; add `isPartId` and `sheetName`: agree.** The count now includes paths, and these helpers respect the layer boundary.
- **Line 15 — receiver antenna midpoint and ESC front-corner anchor: agree.** The antenna midpoint matches model geometry; the corner keeps the ESC connection distinct from the FC. Marker crowding is a separate screen-space problem, finding 1.
- **Line 17 — draw at final lift during opening: accept with a limitation.** The mismatch is visible and can last longer on a slow renderer; it settles correctly. The spec does not prescribe transition synchronization, so this does not become a separate finding.
- **Line 18 — show end labels from step 1: agree.** Showing the destination aids orientation and does not reveal future stretches. Placement still needs finding 3 addressed.
- **Line 19 — omit spin arcs on the Control path: agree.** The leader teaches order here; extra motion arrows would compete with it. Propellers' own sheet retains its arcs.
- **Line 20 — keep `TurnToPart`'s `part` prop: agree.** The supplied turn target is correct; renaming the internal prop provides no learner benefit.
- **Line 22 — replace drei `Html` with projected DOM pins: agree with the final technique.** Pins render and follow the built-in camera views in one DOM tree. Direct centering still needs collision handling, finding 1; this is not a reason to restore `Html`.
- **Line 23 — move ends to the left tip line and accept overlap with the drone: disagree with accepting the overlap.** The binding spec calls for labelled ends just outside the drone. Even Control's opening view places its radio balloon over the body and its label over the lifted assembly, weakening the off-drone distinction: finding 3. Staying inside the fit hull alone is insufficient.
- **Line 24 — put controls above the list: agree.** They remain before the lesson links in a sensible keyboard order, and are readily reachable on desktop. No fixed below-list placement is necessary for the teaching behaviour.
- **Line 25 — “Close sheet” and replay from stop 1 at the end: agree.** The label matches the shared sheet concept and replay is a reasonable end-state action; reset/replay is unit-tested.
- **Line 26 — update 14-sheet navigation and split pin e2e cases by width/path: agree.** These reflect the new reading set and preserve the intended assertions. They do not address collisions or live media changes by themselves.

The new tests cover route parsing/canonicalization, sheet order, progress migration, stop topology,
geometry, pin visibility, step clamping/reset/play, panel semantics and browser navigation/reflow.
However, the committed pin e2e only checks the last stop and rectangle containment. The reduced
motion e2e enables the preference before loading and checks stepping, not dash motion; the pure
offset test cannot establish live integration. Back is tested between paths, Forward is not.
Independent browser checks above fill those review gaps, but the fixes should retain regression
coverage for the actual failures, especially overlapping balloons and a current-sheet link during
Play. The content adjacency test validates connections, not the meaning of numeric claims.

## Findings

### Blocking

| #   | Severity | Area                                                                                    | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Resolution                                                                                                                                                                                                                                                                                         |
| --- | -------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | blocking | src/features/drone-model/leader-points.ts:38; src/features/drone-viewer/PathPins.tsx:27 | **Balloons obscure other numbered stops.** Each marker is centered directly on its first anchor with no clearance handling. On Control stop 6, balloon 6 covers balloon 5 at 390, 768 and 1280 px; at 390 px their 24 px boxes overlap by about 23.8 × 19.6 px, and the motor number is unreadable. Power stop 6 and several Video steps also have overlapping balloons at phone width. A learner cannot reliably match all reached stops to the list, contrary to the clean-drawing anti-goal. **Suggested fix:** retain exact leader anchors but offset balloons with short callouts/collision-aware placement; ensure all reached numbers remain readable inside the field. Add overlap/readability coverage at every built-in step/view, not only final bounds. Evidence: `390-control-6.png`, `390-power-6.png`, `browser-results.json`. | Fixed in `f309f91`: balloons are laid out on screen each frame (`spreadPins`), current first; a moved balloon keeps a tail to its stop. `screen-layout.test.ts`; e2e "no … balloon or label covers another" at every step of every path at 390 and 1280 px, confirmed red with spreading disabled. |
| 2   | blocking | src/content/paths/power.ts:41                                                           | **An ESC capacity is taught as motor consumption.** The learner reads “up to 55 A each at full throttle,” but `esc.currentPerMotorA` is the output's continuous rating (`drone-spec.ts:46` and `content/lessons/esc.ts:34`), not a measured motor/prop load or a current limiter. Neither the reference nor the motor lesson supplies that consumption figure. This teaches a false quantitative rule despite the spec's explicit precision constraint. **Suggested fix:** remove the unsupported amperage claim, or explicitly describe it as the ESC output rating and explain that actual draw depends on the motor/prop load. Check the revised sentence against both lessons.                                                                                                                                                            | Fixed in `830a109`: "The ESC is rated for 55 A per motor; how much they actually draw depends on the throttle and the props." Guarded in `paths.test.ts`.                                                                                                                                          |

### Should fix

| #   | Severity   | Area                                                                                         | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Resolution                                                                                                                                                                                                               |
| --- | ---------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3   | should-fix | src/features/drone-model/path-anchors.ts:24; src/features/drone-model/path-anchors.ts:32     | **The “off-drone” radio is drawn over the drone in the opening view.** Control stop 1's numbered radio end sits over the central body/stack and its opaque label covers part of the lifted assembly at all three inspected widths. Learners are told the radio is in their hands, but its visual location suggests another onboard stop. The left-tip interpolation guarantees containment, not separation from the projected drone. **Suggested fix:** choose endpoints/label placement that clear the projected drone in the built-in views, accounting for the complete label box and updating fitting if necessary. Add a visual check for separation as well as field bounds. Evidence: `390-control-1.png`, `1280-control-1.png`.       | Fixed in `f309f91`: ends sit beside the drone's projected outline (`placeEnd`: left, right, above, below) and the leader's end follows them each frame. `screen-layout.test.ts`; screenshots checked at 390 and 1280 px. |
| 4   | should-fix | src/features/drone-model/materials.ts:15; src/features/part-explorer/PartExplorer.tsx:64     | **Off-drone steps lose path filtering.** Control's radio and Video's goggles have no open parts, so `partLook` returns `normal` for every part even though a path and its connected-part set are active. Browser inspection at the radio confirmed all mesh opacities were 1; screenshots show the entire drone becoming prominent again at the goggles. The learner loses the promised distinction between path parts and unrelated hardware. **Suggested fix:** distinguish an overview from an active path with no onboard current part; retain connected grey for path parts and fade unrelated parts. Test both off-drone steps and the unchanged overview. This follows a plan oversight, but conflicts with binding design decision 6. | Fixed in `a8af9ef`: `partLook` is plain only when nothing is open and nothing is connected. `materials.test.ts` covers an off-drone stop; the overview is unchanged.                                                     |
| 5   | should-fix | src/features/part-explorer/PartExplorer.tsx:190; src/features/part-explorer/PathPanel.tsx:90 | **Following the current path link does not stop Play.** Reproduce: open Control, press Play, click Control in the switcher. Stop remains visible and the receiver becomes current after the interval. `followLink` never stops playback, and navigation to the already-current URL is a no-op, so relying on path-change reset misses this case. Design decision 5 says any link stops play. **Suggested fix:** explicitly stop before following sheet links, including current-sheet links, and cover this case with a timer/component test. Also account for the masthead's same-destination Control link.                                                                                                                                  | Fixed in `3ddac74`: any link click stops Play. `PartExplorer.test.tsx` covers the switcher and an outside (masthead-like) link with timers.                                                                              |

### Nits

No separate nit with a verified learner effect was identified.

## Strengths

- Path-owned step state prevents cross-path index leakage; browser history and lesson navigation reset playback without coupling steps to URLs.
- Old progress survives without a storage migration, while the overview and footers consistently use fourteen numbered sheets.
- Power branches are explicit content data and render simultaneously from the correct sources; layout-based anchors retain the procedural model architecture.
- Real lesson links, native controls, heading focus, live announcements and a usable 3D-less list preserve accessible teaching behaviour.
- Live reduced motion stops dash animation and recurring draws while keeping manual and automatic stepping available.

## Declined to judge

- **Virtual sticks, gyro-loop simulation, faults, flight training, tuning and buying advice:** expressly outside 05a's scope.
- **Literal wiring routes, solder-pad precision and photorealistic radio/goggles models:** the leader is explicitly a drawing convention; the prescribed stops and reference lessons were reviewed instead.
- **Preference for below-list controls, path spin arcs or dedicated radio/goggles lessons:** the rulings are reasonable within this section, and the spec explicitly postpones the off-drone lessons to 06.
- **The original drei `Html` failure:** it is absent from the final implementation; the replacement was judged directly, without claiming to reproduce the abandoned failure.
- **Exact synchronized leader/lift easing or a fixed 200 ms wall-clock transition:** not promised by the binding spec; the visible transient and final alignment were checked and recorded above.
- **A broader visual redesign, arbitrary user-selected orbit/zoom extremes or hardware performance budgets:** no such acceptance matrix or budget is defined; the review examined every built-in step at the three planned widths.
- **Physical screen-reader speech and browsers other than Chromium:** unavailable here; DOM semantics, accessibility snapshots and keyboard operation were checked.
- **Docker/nginx execution, remote CI status and prior user approval of the drawings:** cannot be established from this sandbox; these remain external acceptance requirements.

## Verdict

Do not merge until findings 1 and 2 are fixed. Address findings 3–5 to restore the specified
off-drone presentation and link interruption behaviour, then rerun the relevant browser checks.
The successful repeat local checks do not establish Docker-image e2e, green CI or user sign-off.
