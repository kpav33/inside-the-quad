# Review: section 02b — The model that teaches

- Branch: `feat/model-that-teaches` · Reviewed commit: `1bbd67d` · Base: `main` (`5626c3a`) · Date: 2026-11-14

## Summary

The four planned features are implemented, the dependency boundaries hold, and the requested
checks pass locally. One should-fix defect remains: resizing a settled rear view can leave the
drone persistently cropped. Two nits concern brief clipping during automatic turns and hover
state being restored after a sheet opens; the section needs the resize correction before merging.

## Checks

| Command        | Result                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| pnpm check     | Passed: typecheck, lint, formatting and 376 tests in 38 files.                                                 |
| pnpm test:e2e  | Passed: 99 tests; four production-server tests skipped as expected against Vite preview.                       |
| pnpm build     | Passed: TypeScript and Vite production build.                                                                  |
| docker build . | Not run by this reviewer: Docker is unavailable in the sandbox. The executor runs the image build and its e2e. |

Every Node/pnpm invocation used the requested nvm prefix and Node 22.23.4. E2e artifacts, logs,
review scripts and screenshots are under `/tmp/codex-review-02b`. No code, tests or configuration
were edited. Docker/nginx behaviour and green CI have not been established by these local results.

## Review Focus

| Behaviour                                         | Verified result                                                                                                                                                                                                                           |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tall phone, default/front/rear, closed/lifted     | Fresh views fit at 390 × 844. Inspected overview, ESC, FC, Camera, VTX, Propellers and Frame; also opened FC after Camera and VTX to inspect the lifted stack from both turned views.                                                     |
| Resize refits while retaining the visitor's angle | The direction survives, including crossing the stacked/wide layout switch. The distance is wrong after resizing a settled rear view: finding 1.                                                                                           |
| Faded parts remain clickable                      | The real-browser Propellers → faded Battery click opens `/parts/battery`. The lifted FC and Battery click tests also pass.                                                                                                                |
| Hover clears on exit, touch and sheet opening     | Exiting the canvas cleared the row in three repeated mouse sequences; touch e2e passes. Opening a sheet restores the old mouse hover through the model callback: finding 3.                                                               |
| Faded fills do not hide the open part             | ESC and FC remain visibly redline through the faded parts at 390, 768 and 1280px, including the lifted stack. Faded mesh materials have transparency enabled and depth writes disabled. No opaque fill hiding the selection was observed. |

## Rendered behaviour and accessibility

Inspected the overview and `/parts/esc`, `/parts/fc`, `/parts/props`, `/parts/camera`,
`/parts/vtx` and `/parts/frame` at 390 × 844, 768 × 800 and 1280 × 800. Both complete viewport
screenshots and canvas details were inspected. Fresh settled views have drawing inside the
canvas border. At 1280px the overview drawing spans about 85% of the canvas width, exceeding the
75% e2e threshold. The ink spin arrows are visible, turn with the drone, and use the layout's
props-in directions. The connected frame remains visually prominent, as the design anticipates.

The persistent crop is reproducible without a drag or zoom: open VTX at 390 × 844, wait for the
turn to finish, then resize to 1280 × 800. The lower prop and motor are cut off. The camera's
azimuth remains 35° and elevation 45°, but its distance becomes 0.364899m rather than the new
rear fit of about 0.434521m. Actual mesh vertices reach vertical NDC 1.19972; the screenshot's
drawing reaches the bottom border. Opening the same rear view fresh at the wide size fits.

Automatic turns have a separate, temporary issue. Sampled actual mesh vertices during overview
→ VTX and VTX → Camera, without manual orbiting or zooming. At 768px the former reaches
vertical NDC 1.07560 and the latter 1.15402 before settling inside the canvas. Overview → VTX
also clips at 1280px. A browser-only pause at an attained animation frame confirms the cut prop
tip in a screenshot. The checked 390px turns stayed inside. Sampling excluded three.js fat-line
helper geometry, whose shader-expanded template vertices are not world-space drone vertices.

The drawing-sheet palette, fonts, hairlines and square controls remain intact. Added colours
come from design tokens; spin arcs use ink; row hover uses the existing neutral hover rule.
Redline remains confined to the chosen part/current sheet and focus, plus the existing wordmark.

The canvas remains beneath `aria-hidden="true"`, has `tabIndex=-1`, and its hidden subtree has
no focusable controls. The parts navigation still contains all eleven named buttons. Hover does
not alter the existing live announcer or the row's accessible name; arcs add no DOM controls or
announcements. Keyboard opening/closing and the list equivalent pass the existing e2e checks.
These are DOM and browser checks, not a claim of testing a physical screen reader.

## Design, plan and architecture

All five tasks have corresponding implementation, tests or documentation. The procedural model
and teaching content remain in scope; no model assets, dimension lines, callout balloons or
front marker were introduced. Blade geometry constants were shared with outline calculations;
the shape and twist of the rendered props were preserved. The plan checkboxes remain unchecked,
while the executor ledger records completion; the roadmap correctly says `in review`.

Connections flow from lesson data through the explorer into the viewer/model. Production
cross-feature imports use public entry points. Neither 3D feature imports `content/`; shared and
content dependencies continue to point inward. The lesson registry move avoids the helper/index
cycle without changing its public export. Three.js remains behind the lazy viewer; the production
build emits the viewer separately from the application entry. No new strings need relocating
into `src/content/ui.ts`.

All seven commits use Conventional Commit headers within 72 characters and bodies within 100.
The design, implementation plan, looks, fit, spin arcs, hover and documentation are coherent
separate changes. Prop geometry extraction belongs with the fit calculation that consumes it.
No commit-history finding.

## Tests test behaviour

The new fit tests project the outline through an independent three.js `PerspectiveCamera`,
rather than checking `fitDistance` against itself. They cover the three preset views at aspects
1.6 and 0.46, tightness and improvement over the installed drei Bounds calculation. The outline
tests cover blade-tip reach and lifted height; appearance tests cover priority, opacity and
contrast; connection tests cover lesson-derived membership, duplicates and self-exclusion.
Spin tests check signed travel, radius/sweep, arrowhead geometry and front-motor props-in motion.

The pixel e2e decodes real canvas screenshots, excludes the hint/zone overlays, requires something
to be drawn and checks both occupancy and the border. Its difference threshold includes faint
drafting edges. It is useful endpoint coverage, but waits for settling and never visits the rear
phone view or resizes a settled rear preset. The resize test compares a dragged view against a
fresh one; image inequality alone does not measure angle preservation. The independent camera
measurements above establish that angles survive and expose the untested distance failure.

All five updated `POINTS` participate in passing real raycast/navigation tests, including the
lifted-stack sequence; they are not assertions against mocked selection state. The faded-click
case is correctly described by the executor as a regression guard: it need not fail before
fading existed.

The mouse hover e2e checks actual raycasts, the row attribute and clearing over empty canvas.
The component test for clearing on sheet opening uses a stub that never replays the hover when
its callback changes; the real model does, so that test misses finding 3. The touch e2e verifies
the final cleared state, but cannot prove that no transient touch hover happened: as the ledger
notes, pointer exit also clears it. The production mouse-only filter is present.

## Rulings in progress.md

- **Move LESSONS to lessons.ts:** sound. The index preserves the public API and the connection
  helper can import the registry without a cycle.
- **Keep connected grey #4a525a and fade opacity 0.25:** acceptable in the inspected views.
  The large connected frame is a deliberate consequence of the lesson connections, not an
  unexplained colour or scope change.
- **Fit drawn blade-tip corners instead of full discs:** reasonable for these stationary props.
  The constants come from the same geometry and the sampled views fit. Future spinning props
  would require revisiting the envelope; that future work is not a current defect.
- **Per-view fits with eased distance instead of a single maximum:** a reasonable way to retain
  the size gain at the settled views, but incompletely integrated. Resize and zoom limits still
  use the default fit (finding 1), and easing endpoint distances does not guarantee a fit through
  the turn (finding 2). The cost extends beyond a slight zoom during the turn.
- **Look at the closed drone's middle:** acceptable. The overview is centred and the checked
  lifted stacks fit; no separate usability defect was observed from this choice.
- **Add startRad to spinArcPoints:** sound. It positions the arcs away from the body without
  changing the spin direction, and the tests exercise that parameter.
- **Touch e2e also passes without the filter:** an accurate limitation, explicitly recorded.
  The final-state assertion remains useful; the source supplies the defensive pointer filter.

## Findings

| #   | Severity   | Area                                                                                        | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Resolution |
| --- | ---------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | should-fix | src/features/drone-viewer/FitCamera.tsx:54                                                  | **Resizing a settled rear view persistently crops the drone.** Open VTX at 390 × 844, let it settle, then resize to 1280 × 800. The angle is preserved, but scaling by the default view's fit ratio leaves the camera at 0.364899m; the rear view needs about 0.434521m. The lower prop/motor leave the canvas (vertical NDC 1.19972). `FitCamera` also derives zoom limits from the default fit after `TurnToPart` has chosen a different one: wide rear limits are 0.185179–0.740715m instead of approximately 0.217260–0.869041m. Refit using the retained direction and preserve zoom relative to that direction's old/new fits; keep the limits consistent. Add a settled rear-view resize across the layout switch. | Open.      |
| 2   | nit        | src/features/drone-viewer/TurnToPart.tsx:66                                                 | **Automatic turns briefly clip prop tips.** At 768 × 800, overview → VTX reaches vertical NDC 1.07560 and VTX → Camera reaches 1.15402, although both endpoints fit. It also occurs on overview → VTX at 1280px. Distance is eased between endpoint fits without checking the intermediate direction's envelope. Allow enough distance for that direction during the turn and cover an intermediate frame. Graded nit because the clip is temporary, selection remains usable and the settled view is complete.                                                                                                                                                                                                           | Open.      |
| 3   | nit        | src/features/drone-model/DroneModel.tsx:49; src/features/part-explorer/PartExplorer.tsx:123 | **Opening a sheet replays the previous hover.** Hover Battery at the shipped point and click without moving: Battery still has `data-hovered="true"` after its sheet opens, reproduced three times. The selected style masks this on Battery itself; keeping the pointer there and opening Motors with the keyboard visibly leaves the unselected Battery row in the hover look. Changing `openSheet` changes `onPartHover`, so the model effect reports its unchanged local `hovered` value into the new sheet. Clear the model hover or report fresh pointer changes without replaying stale state; cover the real callback lifecycle. Leaving the canvas does clear it.                                                | Open.      |

## Strengths

- The lesson data remains the single source for connections, with a small explicit interface
  between content and 3D rendering.
- Faded parts retain real raycasts and the open boards remain readable in the exploded stack.
- Projection and pixel tests provide complementary mathematical and rendered checks.
- New visual information stays in the enhancement canvas; the full parts-list equivalent remains
  available to keyboard and assistive-technology users.

## Declined to judge

- **Full prop discs versus stationary blade tips:** no current prop rotation requires a swept
  disc. The recorded substitution fits the rendered shape; future animation is outside this review.
- **Closed-drone centre versus lifted-outline centre:** the inspected overview and lifted views
  remain usable. No user-facing harm was verified from the changed target alone.
- **Per-view zoom as a design choice, including resetting zoom on a preset turn:** explicitly
  recorded and documented. Findings concern its verified integration defects, not the choice itself.
- **Cropping after deliberate manual rotation or zoom-in:** off-preset orbit clipping is explicitly
  accepted, and zooming in reasonably allows details to leave the frame. Findings 1 and 2 need neither.
- **The prominent connected frame, and Frame not connecting to Props or Extras:** connections
  intentionally follow the lessons. Changing teaching relationships or adding another hierarchy
  would be a separate content/design decision.
- **Proving the mouse-only filter from the touch e2e alone:** that test observes the final state,
  and the executor already records the limitation. No touch hover defect was verified.
- **Docker/nginx and CI readiness:** unavailable or not inspected here. The executor's subsequent
  image build and image-targeted e2e must supply that evidence.

## Verdict

Fix finding 1 before merging. Findings 2 and 3 are nits that may be explicitly deferred; no blocking
finding was verified. The local checks are green, but Docker-image checks and CI remain outstanding
from this reviewer's perspective.
